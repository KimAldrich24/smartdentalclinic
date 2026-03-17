import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // get backendUrl from context

const Reviews = () => {
  const { backendUrl } = useContext(AuthContext); // ✅ must use context
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/reviews");
      if (data.success) setReviews(data.reviews);
    } catch (err) {
      console.error("Failed to fetch reviews:", err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Patient Reviews</h2>
      {reviews.length === 0 && <p>No reviews yet.</p>}

      {reviews.map((r) => (
        <div key={r._id} className="border p-3 mb-2 rounded">
          <h3 className="font-semibold">{r.user?.name}</h3>
          <p>⭐ {r.rating}/5</p>
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default Reviews;