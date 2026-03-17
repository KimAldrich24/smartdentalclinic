import React, { useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // ✅ important

const Reviews = ({ backendUrl }) => {
      const { backendUrl } = useContext(AuthContext); // ✅ important
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await axios.get(backendUrl + "/api/reviews");

    if (data.success) {
      setReviews(data.reviews);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Patient Reviews</h2>

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