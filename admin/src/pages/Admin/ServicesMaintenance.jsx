import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext.jsx";

const ServicesMaintenance = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [editingId, setEditingId] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, description, price, duration };

      let res;
      if (editingId) {
        res = await axios.put(`${backendUrl}/api/services/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
      } else {
        res = await axios.post(`${backendUrl}/api/services`, payload, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
      }

      if (res.data.success) {
        toast.success(res.data.message);
        setName(""); setDescription(""); setPrice(""); setDuration(""); setEditingId(null);
        fetchServices();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleEdit = (service) => {
    setName(service.name);
    setDescription(service.description);
    setPrice(service.price);
    setDuration(service.duration);
    setEditingId(service._id);
  };

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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Services Maintenance</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-white p-4 shadow rounded-lg">
        <div>
          <input type="text" placeholder="Service Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div>
          <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div>
          <input type="text" placeholder="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{editingId ? "Update Service" : "Add Service"}</button>
      </form>

      <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Duration</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s._id}>
              <td className="border p-2">{s.name}</td>
              <td className="border p-2">{s.description}</td>
              <td className="border p-2">{s.price}</td>
              <td className="border p-2">{s.duration}</td>
              <td className="border p-2 flex gap-2">
                <button onClick={() => handleEdit(s)} className="bg-yellow-400 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(s._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesMaintenance;
