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
      const contacts = await Contact.find().sort({ createdAt: -1 });
  
      return res.status(200).json({
        success: true,
        count: contacts.length,
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
  


exports.approveContactForm = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact form not found" });
    }

    if (contact.status !== "pending") {
      return res.status(400).json({ message: "Only pending forms can be closed" });
    }

    contact.status = "closed";
    await contact.save();

    res.status(200).json({
      message: "Contact form status updated to closed",
      contact,
    });
  } catch (error) {
    console.error("Error approving contact form:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.revertContactFormStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact form not found" });
    }

    if (contact.status !== "closed") {
      return res.status(400).json({ message: "Only closed forms can be reverted to pending" });
    }

    contact.status = "pending";
    await contact.save();

    res.status(200).json({
      message: "Contact form status reverted to pending",
      contact,
    });
  } catch (error) {
    console.error("Error reverting contact form status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
