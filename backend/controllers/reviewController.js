import Review from "../models/reviewModel.js";

// ➕ Add Review (Patient) with duplicate check
export const addReview = async (req, res) => {
  try {
    const { rating, comment, service } = req.body;

    if (!rating || !comment) {
      return res.json({ success: false, message: "All fields required" });
    }

    // 🔥 Check if user already reviewed this service
    const existingReview = await Review.findOne({
      user: req.user._id,
      service: service || null, // null if no service provided
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You already submitted a review for this service.",
      });
    }

    const review = new Review({
      user: req.user._id,
      service,
      rating,
      comment,
    });

    await review.save();

    res.json({ success: true, message: "Review submitted for approval" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📥 Get Approved Reviews (Public)
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate("user", "name")
      .populate("service", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 🛠 Admin: Approve Review
export const approveReview = async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, {
      isApproved: true,
    });

    res.json({ success: true, message: "Review approved" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ❌ Delete Review
export const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// get all reviews (including pending)
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({ path: "user", select: "name", options: { lean: true } })
      .populate({ path: "service", select: "name", options: { lean: true } })
      .sort({ createdAt: -1 });

    const safeReviews = reviews.map((r) => ({
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      isApproved: r.isApproved,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: r.user || { name: "Deleted User" },
      service: r.service || { name: "N/A" },
    }));

    res.json({ success: true, reviews: safeReviews });
  } catch (error) {
    console.error("Admin Get Reviews Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 NEW: Get current user's review
export const getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      user: req.user._id,
      service: req.query.service || null, // optional service
    });

    res.json({
      success: true,
      review, // null if not found
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};