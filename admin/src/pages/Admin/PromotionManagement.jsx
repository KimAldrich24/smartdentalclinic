import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../config";
import Swal from "sweetalert2";

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    discountPercentage: 0,
    startDate: "",
    endDate: "",
    isActive: true,
    serviceIds: [],
  });
  const [editingId, setEditingId] = useState(null);

  const promotionsUrl = backendUrl + "/api/promotions";
  const servicesUrl = backendUrl + "/api/services";

  const fetchPromotions = async () => {
    try {
      const res = await axios.get(promotionsUrl);
      setPromotions(res.data);
    } catch (err) {
      console.error("Failed to fetch promotions:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(servicesUrl);
      setServices(res.data.services);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${promotionsUrl}/${editingId}`, form);
        setEditingId(null);
      } else {
        await axios.post(promotionsUrl, form);
      }

      setForm({
        title: "",
        description: "",
        discountPercentage: 0,
        startDate: "",
        endDate: "",
        isActive: true,
        serviceIds: [],
      });

      fetchPromotions();
    } catch (err) {
      console.error("Error saving promotion:", err);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this promotion?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${promotionsUrl}/${id}`);
      fetchPromotions();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
      });
    }
  };

  const handleEdit = (promo) => {
    setForm({
      title: promo.title,
      description: promo.description,
      discountPercentage: promo.discountPercentage,
      startDate: promo.startDate.split("T")[0],
      endDate: promo.endDate.split("T")[0],
      isActive: promo.isActive,
      serviceIds: promo.serviceIds || [],
    });
    setEditingId(promo._id);
  };

  const getServiceNames = (ids = []) =>
    ids
      .map((id) => services.find((s) => s._id === id)?.name)
      .filter(Boolean)
      .join(", ") || "None";

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold mb-4">Promotion Management</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <div>
          <input
            type="number"
            placeholder="Discount %"
            value={form.discountPercentage}
            onChange={(e) =>
              setForm({
                ...form,
                discountPercentage: Math.min(
                  50,
                  Math.max(0, Number(e.target.value))
                ),
              })
            }
            className="border p-2 rounded w-full"
            min={0}
            max={50}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Max discount is 50%
          </p>
        </div>

        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <input
          type="date"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <select
          value={form.isActive}
          onChange={(e) =>
            setForm({ ...form, isActive: e.target.value === "true" })
          }
          className="border p-2 rounded"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <select
          multiple
          value={form.serviceIds}
          onChange={(e) =>
            setForm({
              ...form,
              serviceIds: Array.from(
                e.target.selectedOptions,
                (o) => o.value
              ),
            })
          }
          className="border p-2 rounded md:col-span-2 h-32"
        >
          {services.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded md:col-span-2"
        >
          {editingId ? "Update Promotion" : "Add Promotion"}
        </button>
      </form>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-300 bg-white rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Title</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Discount</th>
              <th className="border p-2">Dates</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Services</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p._id}>
                <td className="border p-2">{p.title}</td>
                <td className="border p-2">{p.description}</td>
                <td className="border p-2">{p.discountPercentage}%</td>
                <td className="border p-2">
                  {p.startDate.split("T")[0]} →{" "}
                  {p.endDate.split("T")[0]}
                </td>
                <td className="border p-2">
                  {p.isActive ? "Active" : "Inactive"}
                </td>
                <td className="border p-2">
                  {getServiceNames(p.serviceIds)}
                </td>
                <td className="border p-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {promotions.map((p) => (
          <div
            key={p._id}
            className="bg-white p-4 rounded shadow border"
          >
            <p className="font-bold text-lg">{p.title}</p>
            <p className="text-sm text-gray-600">{p.description}</p>

            <div className="text-sm mt-2 space-y-1">
              <p><b>Discount:</b> {p.discountPercentage}%</p>
              <p>
                <b>Dates:</b>{" "}
                {p.startDate.split("T")[0]} →{" "}
                {p.endDate.split("T")[0]}
              </p>
              <p><b>Status:</b> {p.isActive ? "Active" : "Inactive"}</p>
              <p><b>Services:</b> {getServiceNames(p.serviceIds)}</p>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(p)}
                className="flex-1 bg-yellow-500 text-white py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="flex-1 bg-red-500 text-white py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionManagement;
