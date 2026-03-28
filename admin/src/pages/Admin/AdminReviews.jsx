import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { backendUrl } from "../../config";

const AdminReviews = () => {
  const { aToken } = useContext(AdminContext); // get token from context
  const [reviews, setReviews] = useState([]);


  useEffect(() => {
    if (aToken) fetchReviews();
  }, [aToken]);

  // Fetch all reviews for admin
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/reviews/admin`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Approve a pending review
const approveReview = async (id) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${aToken}`,
      },
    };

    const { data } = await axios.put(
      `${backendUrl}/api/reviews/approve/${id}`,
      {},
      config 
    );

    if (data.success) {
      toast.success("Review approved!");
      fetchReviews(); // refresh list
    }
  } catch (err) {
    toast.error(err.response?.data?.message || err.message);
  }
};

  // Delete a review
  const deleteReview = async (id) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${aToken}`,
        },
      };

      const { data } = await axios.delete(
        `${backendUrl}/api/reviews/${id}`,
        config
      );

      if (data.success) {
        toast.success("Review deleted!");
        fetchReviews(); // refresh list
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Reviews</h2>

      {reviews.length === 0 && <p>No reviews yet.</p>}

      {reviews.map((r) => (
        <div key={r._id} className="border p-3 mb-2 rounded">
          <p><b>{r.user?.name || r.userName}</b></p>
          <p>⭐ {r.rating}</p>
          <p>{r.comment}</p>

          <p className="text-sm">
            Status: {r.isApproved ? "✅ Approved" : "⏳ Pending"}
          </p>

          {!r.isApproved && (
            <button
              onClick={() => approveReview(r._id)}
              className="bg-green-500 text-white px-3 py-1 mr-2 rounded"
            >
              Approve
            </button>
          )}

          <button
            onClick={() => deleteReview(r._id)}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminReviews;