const Review = require("../models/reviewModel")


exports.createReview = async (req, res) => {
  try {
    const { destination, rating, reviewText } = req.body;

    const review = await Review.create({
      user: req.user.id, 
      destination,
      rating,
      reviewText,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};


exports.getReviews = async (req, res) => {
  try {
    const search = req.query.search || "";
    const destination = req.query.destination || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (destination) query.destination = destination;
    if (search)
      query.$or = [{ reviewText: { $regex: search, $options: "i" } }];

    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .populate("user", "name profileImage")
      .populate("destination", "title location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};


exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};
