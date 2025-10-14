import React, { useEffect, useState } from "react";
import axios from "axios";

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

  const backendUrl = import.meta.env.VITE_BACKEND_URL + "/api/promotions";
  const servicesUrl = import.meta.env.VITE_BACKEND_URL + "/api/services";

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      const res = await axios.get(backendUrl);
      setPromotions(res.data);
    } catch (err) {
      console.error("Failed to fetch promotions:", err);
    }
  };

  // Fetch services
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

  // Add / Update promotion
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${backendUrl}/${editingId}`, form);
        setEditingId(null);
      } else {
        await axios.post(backendUrl, form);
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

  // Delete promotion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/${id}`);
      fetchPromotions();
    } catch (err) {
      console.error("Error deleting promotion:", err);
    }
  };

  // Edit promotion
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Promotion Management</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2 items-end">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-1"
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-1"
          required
        />
        <input
          type="number"
          placeholder="Discount %"
          value={form.discountPercentage}
          onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
          className="border p-1 w-24"
          min={0}
          max={100}
          required
        />
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="border p-1"
          required
        />
        <input
          type="date"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          className="border p-1"
          required
        />
        <select
          value={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
          className="border p-1"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {/* Multi-select for services */}
        <select
          multiple
          value={form.serviceIds}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (option) => option.value);
            setForm({ ...form, serviceIds: selected });
          }}
          className="border p-1 w-full md:w-1/2"
        >
          {services.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500">
          Hold Ctrl (Windows) or Cmd (Mac) to select multiple services
        </p>

        <button type="submit" className="bg-blue-500 text-white px-4 py-1">
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      <table className="table-auto border-collapse border border-gray-400 w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Title</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Discount</th>
            <th className="border p-2">Start Date</th>
            <th className="border p-2">End Date</th>
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
              <td className="border p-2">{p.startDate.split("T")[0]}</td>
              <td className="border p-2">{p.endDate.split("T")[0]}</td>
              <td className="border p-2">{p.isActive ? "Active" : "Inactive"}</td>
              <td className="border p-2">
                {p.serviceIds && p.serviceIds.length > 0
                  ? p.serviceIds.map((id) => {
                      const svc = services.find((s) => s._id === id);
                      return svc ? svc.name : id;
                    }).join(", ")
                  : "None"}
              </td>
              <td className="border p-2 flex gap-1">
                <button
                  className="bg-yellow-500 text-white px-2"
                  onClick={() => handleEdit(p)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2"
                  onClick={() => handleDelete(p._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PromotionManagement;
