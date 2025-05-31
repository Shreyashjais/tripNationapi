const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'afnantariq715@gmail.com',
        pass: ' '
    }
});

// Generate OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Register User and Send OTP
exports.register = async (req, res) => {
    try {
        const { name, email, password , phone, profileImage, role} = req.body;
        let user = await User.findOne({ email });

        if (user) return res.status(400).json({ message: 'User already exists' });

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user = new User({ name, email, password, phone, profileImage, role, otp, otpExpiry });
        await user.save();

        await transporter.sendMail({
            from: 'shreyashjais09@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`
        });

        res.status(201).json({ message: 'User registered. Please verify OTP sent to email.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await transporter.sendMail({
            from: 'shreyashjais09@gmail.com',
            to: email,
            subject: 'Resend OTP Verification',
            text: `Your new OTP is: ${otp}`
        });

        res.json({ message: 'OTP resent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error resending OTP', error });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.password !== password) return res.status(400).json({ message: 'Incorrect password' });

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Email not verified. Please verify OTP.' });
        }

        req.session.user = { id: user._id, email: user.email, name: user.name };
        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Logout User
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Error logging out' });
        res.json({ message: 'Logged out successfully' });
    });
};

// Dashboard (Protected Route)
exports.dashboard = async (req, res) => {
    res.json({ message: `Welcome to the dashboard, ${req.session.user.name}` });
};
 