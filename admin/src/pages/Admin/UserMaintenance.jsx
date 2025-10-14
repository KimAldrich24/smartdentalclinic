    // src/pages/Admin/UserMaintenance.jsx
    import React, { useEffect, useState, useContext } from "react";
    import axios from "axios";
    import { AdminContext } from "../../context/AdminContext";

    const UserMaintenance = () => {
    const { aToken } = useContext(AdminContext); // ✅ admin token
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
          const res = await axios.get(`${backendUrl}/api/users`, {
            headers: { Authorization: `Bearer ${aToken}` },
          });
      
          // ✅ Only keep non-admin users
          const nonAdminUsers = (res.data.users || []).filter(
            (user) => user.role !== "admin"
          );
      
          setUsers(nonAdminUsers);
        } catch (err) {
          console.error("Error fetching users:", err.response?.data || err.message);
        }
      };
      

    const deleteUser = async (id) => {
        try {
        await axios.delete(`${backendUrl}/api/users/${id}`, {
            headers: { Authorization: `Bearer ${aToken}` },
        });
        setUsers(users.filter((user) => user._id !== id));
        } catch (err) {
        console.error("Error deleting user:", err);
        }
    };

    useEffect(() => {
        if (aToken) {
        fetchUsers();
        }
    }, [aToken]);

    return (
        <div className="p-6">
        <h2 className="text-xl font-bold mb-4">User Maintenance</h2>
        <table className="min-w-full border">
            <thead>
            <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Actions</th>
            </tr>
            </thead>
            <tbody>
            {users.length > 0 ? (
                users.map((user) => (
                <tr key={user._id}>
                    <td className="p-2 border">{user.name}</td>
                    <td className="p-2 border">{user.email}</td>
                    <td className="p-2 border">{user.role}</td>
                    <td className="p-2 border">
                    <button
                        onClick={() => deleteUser(user._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                        Delete
                    </button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="4" className="p-2 text-center border">
                    No users found
                </td>
                </tr>
            )}
            </tbody>
        </table>
        </div>
    );
    };

    export default UserMaintenance;
