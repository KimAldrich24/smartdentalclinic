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
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data.doctors || res.data); // adjust based on your API response
      } catch (err) {
        console.error("Failed to fetch doctors:", err.message);
        toast.error("Failed to load doctors");
      }
    };
    fetchDoctors();
  }, [backendUrl, token]);

  // Set default doctor once fetched
  useEffect(() => {
    if (doctors.length > 0) {
      setForm(prev => ({ ...prev, doctorId: doctors[0]._id }));
    }
  }, [doctors]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/appointments/walk-in`, // ✅ fixed URL
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      console.error(err);
      toast.error(err.response?.data?.message || "Error creating appointment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          name="patientName"
          placeholder="Patient Name"
          value={form.patientName}
          onChange={handleChange}
          className="border px-3 py-2 rounded-lg flex-1"
          required
        />
        <input
          name="patientEmail"
          placeholder="Patient Email"
          value={form.patientEmail}
          onChange={handleChange}
          className="border px-3 py-2 rounded-lg flex-1"
          required
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          name="patientPhone"
          placeholder="Patient Phone"
          value={form.patientPhone}
          onChange={handleChange}
          className="border px-3 py-2 rounded-lg flex-1"
          required
        />
        <select
          name="doctorId"
          value={form.doctorId}
          onChange={handleChange}
          className="border px-3 py-2 rounded-lg flex-1"
        >
          {doctors.map(d => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.speciality})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col">
          <label className="mb-1 font-semibold">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
            required
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="mb-1 font-semibold">Time</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
            required
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Service (optional)</label>
        <input
          name="service"
          placeholder="Service"
          value={form.service}
          onChange={handleChange}
          className="border px-3 py-2 rounded-lg"
        />
      </div>

      <button
        type="submit"
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full md:w-auto"
      >
        Add Walk-in Appointment
      </button>
    </form>
  );
};

export default WalkInAppointmentForm;