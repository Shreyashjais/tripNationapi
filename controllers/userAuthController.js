const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendOtp = require("../helpers/sendOtp");
const { isFileTypeSupported, uploadFileToCloudinary, deleteFileFromCloudinary } = require("../helpers/uploadUtils");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const profile = req.files?.profileImage;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error in hashing password",
      });
    }

    let uploadedImage = null;
    if (profile) {
      const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!isFileTypeSupported(profile.mimetype, supportedTypes)) {
        return res.status(400).json({
          success: false,
          message: "File format not supported",
        });
      }
      uploadedImage = await uploadFileToCloudinary(profile, "profileImages");
    }

    const otp = `${Math.floor(100000 + Math.random() * 900000)}`; // 6-digit
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresIn = new Date(Date.now() + 5 * 60 * 1000); // 5 min validity

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      profileImage: uploadedImage
        ? {
            url: uploadedImage.secure_url,
            publicId: uploadedImage.public_id,
          }
        : null,
      otp: hashedOtp,
      otpExpiresIn,
      isVerified: false,
    });
     await sendOtp(email, otp);
    return res.status(200).json({
      success: true,
      message: "User created Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered, please try again later.",
    });
  }
};


exports.verifyOtp = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      // 1. Validate inputs
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Please provide both email and OTP",
        });
      }
  
      // 2. Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      // 3. Already verified?
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User is already verified",
        });
      }
  
      // 4. Check OTP expiry
      if (!user.otpExpiresIn || user.otpExpiresIn < new Date()) {
        return res.status(400).json({
          success: false,
          message: "OTP has expired",
        });
      }
  
      // 5. Compare OTP with hashed version
      const isOtpValid = await bcrypt.compare(otp, user.otp);
      if (!isOtpValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }
  
      // 6. Mark user as verified
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiresIn = undefined;
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: "User verified successfully",
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong during OTP verification",
      });
    }
  };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields.",
      });
    }

    let registeredUser = await User.findOne({ email });
    if (!registeredUser) {
      return res.status(400).json({
        success: false,
        message: "Please register first",
      });
    }
    if (!registeredUser.isVerified) {
        return res.status(401).json({
          success: false,
          message: "Please verify your email before logging in.",
        });
      }

    const payload = {
      email: registeredUser.email,
      id: registeredUser._id,
      role: registeredUser.role,
    };

    const isPasswordMatch = await bcrypt.compare(
      password,
      registeredUser.password
    );
    if (isPasswordMatch) {
      let token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      registeredUser = registeredUser.toObject();
      registeredUser.token = token;
      registeredUser.password = undefined;
      console.log(registeredUser, "printing registered user");

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.cookie("cookieName", token, options).status(200).json({
        success: true,
        user: registeredUser,
        token,
        message: "User logged in successfully",
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Incorrect Password",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login failed, please try again later.",
    });
  }
};


exports.createAdminBySuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const profile = req.files?.profileImage;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error in hashing password",
      });
    }
    let uploadedImage = null;
    if (profile) {
      const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!isFileTypeSupported(profile.mimetype, supportedTypes)) {
        return res.status(400).json({
          success: false,
          message: "File format not supported",
        });
      }
      uploadedImage = await uploadFileToCloudinary(profile, "profileImages");
    }

    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresIn = new Date(Date.now() + 5 * 60 * 1000); 

    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin", 
      profileImage: uploadedImage
        ? {
            url: uploadedImage.secure_url,
            publicId: uploadedImage.public_id,
          }
        : null,
      otp: hashedOtp,
      otpExpiresIn,
      isVerified: false,
    });

    await sendOtp(email, otp);

    return res.status(200).json({
      success: true,
      message: "Admin created successfully. OTP sent to email.",
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({
      success: false,
      message: "Admin could not be created. Please try again later.",
    });
  }
};

exports.getAllUsersExceptSelf = async (req, res) => {
  try {
    const superAdminId = req.user.id;

    const users = await User.find({ _id: { $ne: superAdminId } }).select(
      "-password -otp -otpExpiresIn"
    );

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
    });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // 🧼 Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🧹 Delete profile image from Cloudinary (if it exists)
    if (user.profileImage && user.profileImage.publicId) {
      await deleteFileFromCloudinary(user.profileImage.publicId);
    }

    
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};