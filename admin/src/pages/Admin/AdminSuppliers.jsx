// src/pages/Admin/AdminSuppliers.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AdminSuppliers = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    if (!aToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${backendUrl}/api/suppliers`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.suppliers || [];
      setSuppliers(data);
    } catch (err) {
      console.error("Error fetching suppliers:", err.response || err.message);
      setError("Failed to load suppliers. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aToken) fetchSuppliers();
  }, [aToken]);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or update supplier
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aToken) return;

    try {
      if (editingId) {
        await axios.put(`${backendUrl}/api/suppliers/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
      } else {
        await axios.post(`${backendUrl}/api/suppliers`, formData, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
      }
      setFormData({ name: "", contact: "", email: "", phone: "", address: "", notes: "" });
      setEditingId(null);
      fetchSuppliers();
    } catch (err) {
      console.error(err.response || err.message);
      setError("Failed to save supplier.");
    }
  };

  // Edit supplier
  const handleEdit = (item) => {
    setFormData({
      name: item.name || "",
      contact: item.contact || "",
      email: item.email || "",
      phone: item.phone || "",
      address: item.address || "",
      notes: item.notes || "",
    });
    setEditingId(item._id);
  };

  // Delete supplier
  const handleDelete = async (id) => {
    if (!aToken) return;
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await axios.delete(`${backendUrl}/api/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      fetchSuppliers();
    } catch (err) {
      console.error(err.response || err.message);
      setError("Failed to delete supplier.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Supplier Management</h2>

      {/* Loading & Error */}
      {loading && <p>Loading suppliers...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <div className="flex gap-2 flex-wrap">
          <input
            name="name"
            placeholder="Supplier Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border px-2 py-1"
          />
          <input
            name="contact"
            placeholder="Contact Person"
            value={formData.contact}
            onChange={handleChange}
            className="border px-2 py-1"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border px-2 py-1"
          />
          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="border px-2 py-1"
          />
          <input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="border px-2 py-1 flex-1"
          />
          <input
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            className="border px-2 py-1 flex-1"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
          {editingId ? "Update Supplier" : "Add Supplier"}
        </button>
      </form>

      {/* Supplier Table */}
      <div className="overflow-x-auto">
        {!loading && suppliers.length === 0 && <p>No suppliers added yet.</p>}
        {suppliers.length > 0 && (
          <table className="min-w-full border border-gray-200 text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Contact</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Address</th>
                <th className="px-4 py-2 border">Notes</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((item) => (
                <tr key={item._id} className="text-center">
                  <td className="px-4 py-2 border">{item.name}</td>
                  <td className="px-4 py-2 border">{item.contact || "-"}</td>
                  <td className="px-4 py-2 border">{item.email || "-"}</td>
                  <td className="px-4 py-2 border">{item.phone || "-"}</td>
                  <td className="px-4 py-2 border">{item.address || "-"}</td>
                  <td className="px-4 py-2 border">{item.notes || "-"}</td>
                  <td className="px-4 py-2 border flex gap-1 justify-center">
                    <button
                      className="bg-yellow-400 px-2 py-1 rounded"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminSuppliers;