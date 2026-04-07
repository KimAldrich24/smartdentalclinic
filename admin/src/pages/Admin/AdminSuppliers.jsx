// src/pages/Admin/AdminSuppliers.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { backendUrl } from "../../config";
import Swal from "sweetalert2";

const AdminSuppliers = () => {
  const { aToken } = useContext(AdminContext);

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [editingId, setEditingId] = useState(null);

  /* =========================
     FETCH SUPPLIERS
  ========================= */
  const fetchSuppliers = async () => {
    if (!aToken) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${backendUrl}/api/suppliers`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.suppliers || [];

      setSuppliers(data);
    } catch (err) {
      console.error("Error fetching suppliers:", err.response || err.message);
      setError("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aToken) fetchSuppliers();
  }, [aToken]);

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* =========================
     ADD OR UPDATE SUPPLIER
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aToken) return;

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Swal.fire("Invalid Email", "Please enter a valid email address.", "error");
        return;
      }
    }

    if (formData.phone) {
      if (!/^09\d{9}$/.test(formData.phone)) {
        Swal.fire("Invalid Phone", "Phone number must start with 09 and be exactly 11 digits.", "error");
        return;
      }
    }

    try {
      if (editingId) {
        await axios.put(
          `${backendUrl}/api/suppliers/${editingId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${aToken}` },
          }
        );
      } else {
        await axios.post(
          `${backendUrl}/api/suppliers`,
          formData,
          {
            headers: { Authorization: `Bearer ${aToken}` },
          }
        );
      }

      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });

      setEditingId(null);
      fetchSuppliers();

    } catch (err) {
      console.error(err.response || err.message);
      setError("Failed to save supplier.");
    }
  };

  /* =========================
     EDIT SUPPLIER
  ========================= */
  const handleEdit = (item) => {
    setFormData({
      name: item.name || "",
      contactPerson: item.contactPerson || "",
      email: item.email || "",
      phone: item.phone || "",
      address: item.address || "",
      notes: item.notes || "",
    });

    setEditingId(item._id);
  };

  /* =========================
     DELETE SUPPLIER
  ========================= */
  const handleDelete = async (id) => {
    if (!aToken) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this supplier?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendUrl}/api/suppliers/${id}`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });

      fetchSuppliers();

    } catch (err) {
      console.error(err.response || err.message);
        setError("Failed to delete supplier.");
      }
    }
  };

  const handlePhoneChange = (e) => {
  const value = e.target.value.replace(/\D/g, "").slice(0, 11);
  setFormData({ ...formData, phone: value });
};

  /* =========================
     UI
  ========================= */
  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-4">
        Supplier Management
      </h2>

      {loading && <p>Loading suppliers...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* =========================
         ADD / EDIT FORM
      ========================= */}
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
            name="contactPerson"
            placeholder="Contact Person"
            value={formData.contactPerson}
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
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            className="border px-2 py-1"
            maxLength={11}
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

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          {editingId ? "Update Supplier" : "Add Supplier"}
        </button>

      </form>

      {/* =========================
         SUPPLIER TABLE
      ========================= */}
      <div className="overflow-x-auto">

        {!loading && suppliers.length === 0 && (
          <p>No suppliers added yet.</p>
        )}

        {suppliers.length > 0 && (

          <table className="min-w-full border text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Contact Person</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Phone</th>
                <th className="border px-4 py-2">Address</th>
                <th className="border px-4 py-2">Notes</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((item) => (

                <tr key={item._id} className="text-center">

                  <td className="border px-4 py-2">
                    {item.name}
                  </td>

                  <td className="border px-4 py-2">
                    {item.contactPerson || "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {item.email || "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {item.phone || "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {item.address || "-"}
                  </td>

                  <td className="border px-4 py-2">
                    {item.notes || "-"}
                  </td>

                  <td className="border px-4 py-2 flex gap-1 justify-center">

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