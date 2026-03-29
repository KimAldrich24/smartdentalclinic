import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Star } from "lucide-react";
import { backendUrl } from "../config";

const AddReview = ({ serviceId }) => {
  const { token } = useContext(AuthContext);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // 🔹 Check if user already reviewed
  useEffect(() => {
    const checkReview = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(
          `${backendUrl}/api/reviews/my-review?service=${serviceId || ""}`,
          config
        );

        if (data.success && data.review) {
          setHasReviewed(true);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (token) checkReview();
  }, [token, serviceId]);

  const submitReview = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      return toast.error("Please write a comment!");
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.post(
        `${backendUrl}/api/reviews/add`,
        { rating, comment, service: serviceId },
        config
      );

      if (data.success) {
        toast.success("Review submitted!");
        setComment("");
        setRating(5);
        setHasReviewed(true); // hide form after submit
      } else {
        toast.error(data.message || "Failed to submit review.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (hasReviewed) {
    return (
      <div className="p-4 border rounded bg-green-100 text-green-700">
        ✅ You already submitted a review. Thank you!
      </div>
    );
  }

  return (
    <form
      onSubmit={submitReview}
      className="p-4 border rounded bg-white shadow-md"
    >
      <h2 className="text-lg font-bold mb-2">Leave a Review</h2>

      {/* ⭐ Star rating */}
      <div className="flex mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={28}
            className={`cursor-pointer ${
              (hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
      </div>

      <textarea
        placeholder="Write your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="border p-2 w-full mb-2"
        rows={4}
        disabled={loading}
      />

      <button
        type="submit"
        className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Review"}
        {loading && (
          <span className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        )}
      </button>
    </form>
  );
};

export default AddReview;