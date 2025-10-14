import React, { useEffect, useState } from "react";
import axios from "axios";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", dob: "", gender: "" });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/patients`);
      setPatients(res.data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      dob: patient.dob || "",
      gender: patient.gender || "Not Selected",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPatient) return alert("Select a patient to edit");
    try {
      await axios.put(`${backendUrl}/api/patients/${editingPatient._id}`, form);
      setEditingPatient(null);
      setForm({ name: "", email: "", phone: "", dob: "", gender: "" });
      fetchPatients();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${backendUrl}/api/patients/${id}`);
      fetchPatients();
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">Patient Maintenance</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-5">
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2" required />
        <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border p-2" required />
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="border p-2" />
        <input placeholder="DOB" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="border p-2" />
        <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="border p-2">
          <option value="Not Selected">Not Selected</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">{editingPatient ? "Update" : "Select a patient"}</button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Name</th><th>Email</th><th>Phone</th><th>DOB</th><th>Gender</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.length === 0 ? (
            <tr><td colSpan={6} className="text-center p-2">No patients found</td></tr>
          ) : patients.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>{p.phone || "Not Set"}</td>
              <td>{p.dob || "Not Set"}</td>
              <td>{p.gender || "Not Selected"}</td>
              <td className="flex gap-2">
                <button onClick={() => handleEdit(p)} className="bg-yellow-500 text-white px-2 rounded">Edit</button>
                <button onClick={() => handleDelete(p._id)} className="bg-red-500 text-white px-2 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Patients;
