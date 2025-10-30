const Enquiry = require("../models/enquiryModel");


exports.createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, travelDates, numberOfTravellers, specialRequests } = req.body;

    if (!name || !email || !travelDates || !numberOfTravellers || !phone) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const newEnquiry = await Enquiry.create({
      name,
      email,
      phone,
      travelDates,
      numberOfTravellers,
      specialRequests,
      status:"pending",
    });

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: newEnquiry,
    });
  } catch (error) {
    console.error("Error creating enquiry:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    res.status(200).json({ success: true, message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.toggleEnquiryStatus = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    enquiry.status = enquiry.status === "pending" ? "closed" : "pending";
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: `Enquiry status changed to ${enquiry.status}`,
      data: enquiry,
    });
  } catch (error) {
    console.error("Error updating enquiry status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
