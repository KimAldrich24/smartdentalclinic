import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const PendingAccounts = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [pendingUsers, setPendingUsers] = useState([]);

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/users/pending`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      const data = await res.json();
      if (res.ok) setPendingUsers(data);
      else toast.error(data.message);
    } catch (err) {
      toast.error("Failed to fetch pending users");
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Approve user
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/users/approve/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${aToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchPendingUsers();
      } else toast.error(data.message);
    } catch (err) {
      toast.error("Failed to approve user");
    }
  };

  // Reject user
  const handleReject = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/users/reject/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${aToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchPendingUsers();
      } else toast.error(data.message);
    } catch (err) {
      toast.error("Failed to reject user");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending Accounts</h2>
      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Submitted At</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingUsers.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4">
                No pending accounts
              </td>
            </tr>
          ) : (
            pendingUsers.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">{new Date(user.createdAt).toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    onClick={() => handleApprove(user._id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleReject(user._id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PendingAccounts;
