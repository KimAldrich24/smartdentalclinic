import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AdminEquipment = () => {
  const { aToken, backendUrl } = useContext(AdminContext);

  const [equipment, setEquipment] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialForm = {
    name: "",
    category: "",
    serialNumber: "",
    supplier: "",
    location: "",
    status: "Available",
    expirationDate: "",
    notes: "",
    capacity: "",
    quantity: "",
    unit: "mL",
  };

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  /* ==============================
     FETCH EQUIPMENT
  ============================== */
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

  /* ==============================
     FETCH SUPPLIERS
  ============================== */
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

  /* ==============================
     HANDLE INPUT
  ============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "capacity" || name === "quantity") {
      setFormData({ ...formData, [name]: value === "" ? "" : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  /* ==============================
     CHECK IF EXPIRED
  ============================== */
  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date(today);
  };

  
  /* ==============================
     SUBMIT EQUIPMENT
  ============================== */
  const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ prevent past expiration
  if (formData.expirationDate && formData.expirationDate < today) {
    setError("Expiration date cannot be in the past.");
    return;
  }

  // ✅ prevent duplicate name + unit
  const duplicate = equipment.find(
    (eq) =>
      eq.name.toLowerCase() === formData.name.toLowerCase() &&
      eq.unit.toLowerCase() === formData.unit.toLowerCase() &&
      eq._id !== editingId // allow updating same item
  );

  if (duplicate) {
    setError(`Equipment with name "${formData.name}" and unit "${formData.unit}" already exists.`);
    return;
  }

  try {
    const payload = {
      ...formData,
      capacity: Number(formData.capacity) || 0,
      quantity: Number(formData.quantity) || 0,
      supplier: formData.supplier || null,
      expirationDate: formData.expirationDate || null,
    };

    if (editingId) {
      await axios.put(
        `${backendUrl}/api/equipment/${editingId}`,
        payload,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
    } else {
      await axios.post(
        `${backendUrl}/api/equipment`,
        payload,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
    }

    setFormData(initialForm);
    setEditingId(null);
    setError(null);
    fetchEquipment();
  } catch (err) {
    console.error(err);
    setError("Failed to save equipment.");
  }
};

  /* ==============================
     EDIT EQUIPMENT
  ============================== */
  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category || "",
      serialNumber: item.serialNumber || "",
      supplier: item.supplier?._id || "",
      location: item.location || "",
      status: item.status || "Available",
      expirationDate: item.expirationDate
        ? new Date(item.expirationDate).toISOString().split("T")[0]
        : "",
      notes: item.notes || "",
      capacity: item.capacity || "",
      quantity: item.quantity || "",
      unit: item.unit || "mL",
    });

    setEditingId(item._id);
  };

  /* ==============================
     DELETE EQUIPMENT
  ============================== */
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

          {/* SUPPLIER */}
          <select
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="border px-2 py-1"
          >
            <option value="">No Supplier</option>
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
            type="number"
            name="capacity"
            placeholder="Total Capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="border px-2 py-1 w-32"
          />

          <input
            type="number"
            name="quantity"
            placeholder="Remaining Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="border px-2 py-1 w-32"
          />

          <input
            name="unit"
            placeholder="Unit"
            value={formData.unit}
            onChange={handleChange}
            className="border px-2 py-1 w-24"
          />

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Expiration Date</label>
            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              min={today} // prevents past dates
              className="border px-2 py-1"
            />
          </div>

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
                <th className="border px-4 py-2">Capacity</th>
                <th className="border px-4 py-2">Remaining</th>
                <th className="border px-4 py-2">Unit</th>
                <th className="border px-4 py-2">Expiration</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {equipment.map((item) => (
                <tr
                  key={item._id}
                  className={`text-center ${
                    isExpired(item.expirationDate) ? "bg-red-100" : ""
                  }`}
                >
                  <td className="border px-4 py-2">{item.name}</td>
                  <td className="border px-4 py-2">{item.category || "-"}</td>
                  <td className="border px-4 py-2">{item.serialNumber || "-"}</td>
                  <td className="border px-4 py-2">{item.supplier?.name || "-"}</td>
                  <td className="border px-4 py-2">{item.location || "-"}</td>
                  <td className="border px-4 py-2">{item.status}</td>
                  <td className="border px-4 py-2">{item.capacity || "-"}</td>
                  <td className="border px-4 py-2">{item.quantity || "-"}</td>
                  <td className="border px-4 py-2">{item.unit || "-"}</td>

                  <td
                    className={`border px-4 py-2 ${
                      isExpired(item.expirationDate) ? "text-red-600 font-semibold" : ""
                    }`}
                  >
                    {item.expirationDate
                      ? new Date(item.expirationDate).toLocaleDateString()
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