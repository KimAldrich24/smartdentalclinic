import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AdminEquipment = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    serialNumber: "",
    location: "",
    status: "Available",
    lastMaintenance: "",
    nextMaintenance: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchEquipment = async () => {
    if (!aToken) return;
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${backendUrl}/api/equipment`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      // Support array or object with equipment array
      const data = Array.isArray(res.data) ? res.data : res.data.equipment || [];
      setEquipment(data);
    } catch (err) {
      console.error("Error fetching equipment:", err.response || err.message);
      setError("Failed to load equipment. Check console.");
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever aToken is available
  useEffect(() => {
    if (aToken) fetchEquipment();
  }, [aToken]);

  // Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or Update equipment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aToken) return;

    try {
      if (editingId) {
        await axios.put(`${backendUrl}/api/equipment/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
      } else {
        await axios.post(`${backendUrl}/api/equipment`, formData, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
      }

      setFormData({
        name: "",
        category: "",
        serialNumber: "",
        location: "",
        status: "Available",
        lastMaintenance: "",
        nextMaintenance: "",
        notes: "",
      });
      setEditingId(null);
      fetchEquipment();
    } catch (err) {
      console.error(err.response || err.message);
      setError("Failed to save equipment.");
    }
  };

  // Edit equipment
  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category || "",
      serialNumber: item.serialNumber || "",
      location: item.location || "",
      status: item.status || "Available",
      lastMaintenance: item.lastMaintenance
        ? new Date(item.lastMaintenance).toISOString().split("T")[0]
        : "",
      nextMaintenance: item.nextMaintenance
        ? new Date(item.nextMaintenance).toISOString().split("T")[0]
        : "",
      notes: item.notes || "",
    });
    setEditingId(item._id);
  };

  // Delete equipment
  const handleDelete = async (id) => {
    if (!aToken) return;
    if (!window.confirm("Are you sure you want to delete this equipment?")) return;

    try {
      await axios.delete(`${backendUrl}/api/equipment/${id}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      fetchEquipment();
    } catch (err) {
      console.error(err.response || err.message);
      setError("Failed to delete equipment.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Clinic Equipment Maintenance</h2>

      {/* Loading & Error */}
      {loading && <p>Loading equipment...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <div className="flex gap-2 flex-wrap">
          <input
            name="name"
            placeholder="Equipment Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border px-2 py-1"
          />
          <input
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="border px-2 py-1"
          />
          <input
            name="serialNumber"
            placeholder="Serial Number"
            value={formData.serialNumber}
            onChange={handleChange}
            className="border px-2 py-1"
          />
          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="border px-2 py-1"
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border px-2 py-1"
          >
            <option>Available</option>
            <option>In Use</option>
            <option>Under Maintenance</option>
            <option>Broken</option>
          </select>
          <input
            name="lastMaintenance"
            type="date"
            value={formData.lastMaintenance}
            onChange={handleChange}
            className="border px-2 py-1"
          />
          <input
            name="nextMaintenance"
            type="date"
            value={formData.nextMaintenance}
            onChange={handleChange}
            className="border px-2 py-1"
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
          {editingId ? "Update Equipment" : "Add Equipment"}
        </button>
      </form>

      {/* Equipment Table */}
      <div className="overflow-x-auto">
        {!loading && equipment.length === 0 && <p>No equipment added yet.</p>}
        {equipment.length > 0 && (
          <table className="min-w-full border border-gray-200 text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Category</th>
                <th className="px-4 py-2 border">Serial Number</th>
                <th className="px-4 py-2 border">Location</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Last Maintenance</th>
                <th className="px-4 py-2 border">Next Maintenance</th>
                <th className="px-4 py-2 border">Notes</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr key={item._id} className="text-center">
                  <td className="px-4 py-2 border">{item.name}</td>
                  <td className="px-4 py-2 border">{item.category || "-"}</td>
                  <td className="px-4 py-2 border">{item.serialNumber || "-"}</td>
                  <td className="px-4 py-2 border">{item.location || "-"}</td>
                  <td className="px-4 py-2 border">{item.status}</td>
                  <td className="px-4 py-2 border">
                    {item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2 border">
                    {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : "-"}
                  </td>
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

export default AdminEquipment;
