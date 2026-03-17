import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const AdminReviews = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/reviews/admin",
        { headers: { aToken } }
      );

      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const approveReview = async (id) => {
    try {
      const { data } = await axios.put(
        backendUrl + "/api/reviews/approve/" + id,
        {},
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success("Approved!");
        fetchReviews(); // refresh
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteReview = async (id) => {
    try {
      const { data } = await axios.delete(
        backendUrl + "/api/reviews/" + id,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success("Deleted!");
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Reviews</h2>

      {reviews.map((r) => (
        <div key={r._id} className="border p-3 mb-2 rounded">
          <p><b>{r.user?.name}</b></p>
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