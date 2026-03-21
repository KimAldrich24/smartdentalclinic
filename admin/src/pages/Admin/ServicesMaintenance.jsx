import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext.jsx";

const ServicesMaintenance = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState(""); // ✅ Added price
  const [editingId, setEditingId] = useState(null);

  // Fetch all services
  const fetchServices = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/services`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      if (data.success) setServices(data.services);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle add/update service
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for duplicate name
    const duplicate = services.find(
      (s) =>
        s.name.toLowerCase() === name.trim().toLowerCase() &&
        s._id !== editingId
    );

    if (duplicate) {
      toast.error("Service with this name already exists");
      return;
    }

    if (price === "" || Number(price) < 0 || Number(price) > 1000000) {
  toast.error("Price must be a number between 0 and 1,000,000");
  return;
}

    try {
      const payload = { name, description, duration, price: Number(price) };

      const res = editingId
        ? await axios.put(
          `${backendUrl}/api/services/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${aToken}` } }
        )
        : await axios.post(`${backendUrl}/api/services`, payload, {
          headers: { Authorization: `Bearer ${aToken}` },
        });

      if (res.data.success) {
        toast.success(res.data.message);
        setName("");
        setDescription("");
        setDuration("");
        setPrice(""); // ✅ Clear price
        setEditingId(null);
        fetchServices();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Populate form for editing
  const handleEdit = (service) => {
    setName(service.name);
    setDescription(service.description);
    setDuration(service.duration);
    setPrice(service.price || ""); // ✅ Populate price
    setEditingId(service._id);
  };

  // Delete a service
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await axios.delete(`${backendUrl}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchServices();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-4">Services Maintenance</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 space-y-4 bg-white p-4 shadow rounded-lg"
      >
        <input
          type="text"
          placeholder="Service Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        {/* ✅ Price Input */}
        {/* ✅ Price Input with restrictions */}
        <input
          type="number"
          placeholder="Price (PHP)"
          value={price}
          onChange={(e) => {
            // Prevent letters and restrict to max 1,000,000
            const val = e.target.value;
            if (/^\d*$/.test(val)) setPrice(val); // only digits
          }}
          className="w-full border px-3 py-2 rounded"
          required
          min="0"
          max="1000000" // maximum allowed price
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingId ? "Update Service" : "Add Service"}
        </button>
      </form>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-300 bg-white rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Duration</th>
              <th className="border p-2">Price</th> {/* ✅ Added Price */}
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s._id}>
                <td className="border p-2">{s.name}</td>
                <td className="border p-2">{s.description}</td>
                <td className="border p-2">{s.duration}</td>
                <td className="border p-2">₱{s.price}</td> {/* ✅ Show Price */}
                <td className="border p-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="bg-yellow-400 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
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
        {services.map((s) => (
          <div key={s._id} className="bg-white p-4 rounded-lg shadow border">
            <p className="font-bold">{s.name}</p>
            <p className="text-sm text-gray-600">{s.description}</p>
            <p>
              <span className="font-semibold">Duration:</span> {s.duration}
            </p>
            <p>
              <span className="font-semibold">Price:</span> ₱{s.price} {/* ✅ Show Price */}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(s)}
                className="flex-1 bg-yellow-400 text-white py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(s._id)}
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

export default ServicesMaintenance;