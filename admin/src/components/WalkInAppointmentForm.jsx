import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const WalkInAppointmentForm = () => {
  const { token } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    doctorId: "",
    date: "",
    time: "",
    service: "",
  });

  // Fetch doctors for select dropdown
  useEffect(() => {
    axios.get(`${backendUrl}/doctors`)
      .then(res => setDoctors(res.data))
      .catch(err => console.error(err));
  }, []);

  // Set default doctor once fetched
  useEffect(() => {
    if (doctors.length > 0) setForm(prev => ({ ...prev, doctorId: doctors[0]._id }));
  }, [doctors]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/appointments/walk-in`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Walk-in appointment created!");
      setForm({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        doctorId: doctors?.[0]?._id || "",
        date: "",
        time: "",
        service: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating appointment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input name="patientName" placeholder="Patient Name" value={form.patientName} onChange={handleChange} required />
      <input name="patientEmail" placeholder="Patient Email" value={form.patientEmail} onChange={handleChange} required />
      <input name="patientPhone" placeholder="Patient Phone" value={form.patientPhone} onChange={handleChange} required />
      <select name="doctorId" value={form.doctorId} onChange={handleChange}>
        {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
      </select>
      <input type="date" name="date" value={form.date} onChange={handleChange} required />
      <input type="time" name="time" value={form.time} onChange={handleChange} required />
      <input name="service" placeholder="Service (optional)" value={form.service} onChange={handleChange} />
      <button type="submit">Add Walk-in Appointment</button>
    </form>
  );
};

export default WalkInAppointmentForm;