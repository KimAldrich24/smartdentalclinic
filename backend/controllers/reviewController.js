import Review from "../models/reviewModel.js";

// ➕ Add Review (Patient)
export const addReview = async (req, res) => {
  try {
    const { rating, comment, service } = req.body;

    if (!rating || !comment) {
      return res.json({ success: false, message: "All fields required" });
    }

    const review = new Review({
      user: req.user._id, // from auth middleware
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
      .populate("user", "name")
      .populate("service", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};