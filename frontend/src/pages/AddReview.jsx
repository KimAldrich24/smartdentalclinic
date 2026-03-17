import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const AddReview = () => {
  const { token, backendUrl } = useContext(AuthContext);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitReview = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      return toast.error("Please write a comment!");
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // ✅ Await the POST request and destructure the response
      const { data } = await axios.post(
        backendUrl + "/api/reviews/add",
        { rating, comment },
        config
      );

      if (data.success) {
        toast.success("Review submitted!");
        setComment("");
        setRating(5);
      } else {
        toast.error(data.message || "Failed to submit review.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <form onSubmit={submitReview} className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Leave a Review</h2>

      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="border p-2 mb-2 w-full"
      >
        {[1, 2, 3, 4, 5].map((r) => (
          <option key={r} value={r}>
            {r} Stars
          </option>
        ))}
      </select>

      <textarea
        placeholder="Write your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="border p-2 w-full mb-2"
        rows={4}
      />

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Submit Review
      </button>
    </form>
  );
};

export default AddReview;