import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const PendingUsers = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/users/pending`, {
        headers: {
          Authorization: `Bearer ${aToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPendingUsers(data.users);
      } else {
        toast.error(data.message || "Failed to fetch pending users");
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching pending users");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Approve user
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/users/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${aToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("User approved successfully!");
        fetchPendingUsers(); // refresh list
      } else {
        toast.error(data.message || "Failed to approve user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error approving user");
    }
  };

  // Reject user
  const handleReject = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/users/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${aToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("User rejected successfully!");
        fetchPendingUsers(); // refresh list
      } else {
        toast.error(data.message || "Failed to reject user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error rejecting user");
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Pending Users</h2>
      {loading ? (
        <p>Loading...</p>
      ) : pendingUsers.length === 0 ? (
        <p>No pending users</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user._id} className="border-b">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => handleApprove(user._id)}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleReject(user._id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingUsers;
