import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Star } from "lucide-react";
import { backendUrl } from "../config";


const Reviews = ({ refreshTrigger = 0 }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); // loading state

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [refreshTrigger]); // re-fetch whenever parent triggers refresh

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/reviews`);
      if (data.success) setReviews(data.reviews);
    } catch (err) {
      console.error("Failed to fetch reviews:", err.response?.data?.message || err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Patient Reviews</h2>
      {reviews.length === 0 && <p>No reviews yet.</p>}

      {reviews.map((r) => (
        <div key={r._id} className="border p-3 mb-3 rounded shadow-sm bg-white">
          <h3 className="font-semibold">{r.user?.name || "Anonymous"}</h3>

          {/* ⭐ Star rating */}
          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={(r.rating || 0) >= star ? "text-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>

          <p className="text-gray-700 mb-1">{r.comment}</p>

          {r.isApproved !== undefined && (
            <p className="text-sm text-gray-500">
              {r.isApproved ? "✅ Approved" : "⏳ Pending Approval"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Reviews;