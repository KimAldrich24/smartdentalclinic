import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AdminEquipment = () => {
  const { aToken, backendUrl } = useContext(AdminContext);

  const [equipment, setEquipment] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    serialNumber: "",
    supplier: "",
    location: "",
    status: "Available",
    lastMaintenance: "",
    nextMaintenance: "",
    notes: "",
  });

  const [editingId, setEditingId] = useState(null);

  /* ================================
     FETCH EQUIPMENT
  ================================= */
  const fetchEquipment = async () => {
    if (!aToken) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${backendUrl}/api/equipment`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.equipment || [];
      setEquipment(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load equipment.");
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     FETCH SUPPLIERS
  ================================= */
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/suppliers`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      setSuppliers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load suppliers", err);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchEquipment();
      fetchSuppliers();
    }
  }, [aToken]);

  /* ================================
     HANDLE INPUT
  ================================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================================
     SUBMIT EQUIPMENT
  ================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

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
        supplier: "",
        location: "",
        status: "Available",
        lastMaintenance: "",
        nextMaintenance: "",
        notes: "",
      });

      setEditingId(null);
      fetchEquipment();
    } catch (err) {
      console.error(err);
      setError("Failed to save equipment.");
    }
  };

  /* ================================
     EDIT EQUIPMENT
  ================================= */
  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category || "",
      serialNumber: item.serialNumber || "",
      supplier: item.supplier?._id || "",
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

  /* ================================
     DELETE EQUIPMENT
  ================================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this equipment?")) return;

    try {
      await axios.delete(`${backendUrl}/api/equipment/${id}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      fetchEquipment();
    } catch (err) {
      console.error(err);
      setError("Failed to delete equipment.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Clinic Equipment Maintenance</h2>

      {loading && <p>Loading equipment...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* ================= FORM ================= */}
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

          {/* SUPPLIER DROPDOWN */}
          <select
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            required // ✅ required so user must select
            className="border px-2 py-1"
          >
            <option value="" disabled>
              Select Supplier
            </option>
            {suppliers.map((sup) => (
              <option key={sup._id} value={sup._id}>
                {sup.name}
              </option>
            ))}
          </select>

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
            type="date"
            name="lastMaintenance"
            value={formData.lastMaintenance}
            onChange={handleChange}
            className="border px-2 py-1"
          />

          <input
            type="date"
            name="nextMaintenance"
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

        <button className="bg-blue-500 text-white px-4 py-1 rounded">
          {editingId ? "Update Equipment" : "Add Equipment"}
        </button>
      </form>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        {!loading && equipment.length === 0 && <p>No equipment added yet.</p>}

        {equipment.length > 0 && (
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Category</th>
                <th className="border px-4 py-2">Serial</th>
                <th className="border px-4 py-2">Supplier</th>
                <th className="border px-4 py-2">Location</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Last Maintenance</th>
                <th className="border px-4 py-2">Next Maintenance</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {equipment.map((item) => (
                <tr key={item._id} className="text-center">
                  <td className="border px-4 py-2">{item.name}</td>
                  <td className="border px-4 py-2">{item.category || "-"}</td>
                  <td className="border px-4 py-2">{item.serialNumber || "-"}</td>
                  <td className="border px-4 py-2">
                    {item.supplier?.name || "-"}
                  </td>
                  <td className="border px-4 py-2">{item.location || "-"}</td>
                  <td className="border px-4 py-2">{item.status}</td>
                  <td className="border px-4 py-2">
                    {item.lastMaintenance
                      ? new Date(item.lastMaintenance).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border px-4 py-2">
                    {item.nextMaintenance
                      ? new Date(item.nextMaintenance).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border px-4 py-2 flex gap-2 justify-center">
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