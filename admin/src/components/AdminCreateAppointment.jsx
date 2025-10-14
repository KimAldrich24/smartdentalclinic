import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const AdminCreateAppointment = ({ backendUrl }) => {
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    doctorId: "",
    userId: "",
    serviceId: "",
    date: "",
    time: "",
    finalPrice: "",
    status: "booked",
  });

  const [msg, setMsg] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);

  // Fetch doctors, patients, and services for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, patientsRes, servicesRes] = await Promise.all([
          axios.get(`${backendUrl}/api/doctors`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${backendUrl}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${backendUrl}/api/services`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setDoctors(doctorsRes.data);
        setPatients(patientsRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [backendUrl, token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${backendUrl}/api/appointments/admin`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("Appointment created: " + res.data._id);
    } catch (err) {
      setMsg(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">Create Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
          <option value="">Select Doctor</option>
          {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>

        <select name="userId" value={form.userId} onChange={handleChange}>
          <option value="">Select Patient (optional)</option>
          {patients.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>

        <select name="serviceId" value={form.serviceId} onChange={handleChange} required>
          <option value="">Select Service</option>
          {services.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        <input type="date" name="date" value={form.date} onChange={handleChange} required />
        <input type="time" name="time" value={form.time} onChange={handleChange} required />
        <input type="number" name="finalPrice" value={form.finalPrice} onChange={handleChange} placeholder="Final Price" required />

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="booked">booked</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Appointment
        </button>
      </form>
      {msg && <p className="mt-2">{msg}</p>}
    </div>
  );
};

export default AdminCreateAppointment;
