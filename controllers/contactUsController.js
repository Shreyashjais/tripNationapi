const Contact = require("../models/contactUsModel");

exports.postContactUs = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required.",
      });
    }

    // Create contact document
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Contact Form submitted successfully.",
      data: contact,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.getAllContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

 
    const totalMessages = await Contact.countDocuments();

   
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: contacts.length, 
      total: totalMessages, 
      page,
      totalPages: Math.ceil(totalMessages / limit),
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


exports.getContactMessageById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const contact = await Contact.findById(id);
  
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact form not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        data: contact,
      });
    } catch (error) {
      console.error("Error retrieving contact form:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };

exports.deleteContactMessageById = async (req, res) => {
    try {
      const { id } = req.params;
      const contact = await Contact.findById(id);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact form not found",
        });
      }
  
      await Contact.findByIdAndDelete(id);
  
      return res.status(200).json({
        success: true,
        message: "Contact form deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting contact form:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };


exports.updateContactFormStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact form not found" });
    }

    if (contact.status === status) {
      return res.status(400).json({ message: `Form is already marked as ${status}` });
    }

    contact.status = status;
    await contact.save();

    res.status(200).json({
      success:true,
      message: `Contact form status updated to ${status}`,
      contact,
    });
  } catch (error) {
    console.error("Error updating contact form status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
