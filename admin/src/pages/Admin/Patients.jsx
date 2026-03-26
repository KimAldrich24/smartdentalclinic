import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../config";
import Swal from "sweetalert2";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Not Selected",
  });

  const fetchPatients = async () => {
  try {
    const res = await axios.get(`${backendUrl}/api/patients`);
    // Filter only patients by role
    const onlyPatients = res.data.filter(user => user.role === "patient");
    setPatients(onlyPatients);
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message,
    });
  }
};

  useEffect(() => {
    fetchPatients();
  }, []);

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
      await axios.put(
        `${backendUrl}/api/patients/${editingPatient._id}`,
        form
      );
      setEditingPatient(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        dob: "",
        gender: "Not Selected",
      });
      fetchPatients();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this patient?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${backendUrl}/api/patients/${id}`);
      fetchPatients();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
      });
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold mb-4">Patient Maintenance</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 mb-6 bg-white p-4 rounded shadow"
      >
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={form.dob}
          onChange={(e) => setForm({ ...form, dob: e.target.value })}
          className="border p-2 rounded"
        />

        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="Not Selected">Not Selected</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <button className="bg-blue-500 text-white py-2 rounded">
          {editingPatient ? "Update Patient" : "Select a patient"}
        </button>
      </form>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-300 bg-white rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">DOB</th>
              <th className="border p-2">Gender</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No patients found
                </td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p._id}>
                  <td className="border p-2">{p.name}</td>
                  <td className="border p-2">{p.email}</td>
                  <td className="border p-2">{p.phone || "Not Set"}</td>
                  <td className="border p-2">{p.dob || "Not Set"}</td>
                  <td className="border p-2">
                    {p.gender || "Not Selected"}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {patients.length === 0 ? (
          <p className="text-center text-gray-500">No patients found</p>
        ) : (
          patients.map((p) => (
            <div
              key={p._id}
              className="bg-white p-4 rounded shadow border"
            >
              <p className="font-bold text-lg">{p.name}</p>
              <p className="text-sm text-gray-600">{p.email}</p>

              <div className="mt-2 text-sm space-y-1">
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {p.phone || "Not Set"}
                </p>
                <p>
                  <span className="font-semibold">DOB:</span>{" "}
                  {p.dob || "Not Set"}
                </p>
                <p>
                  <span className="font-semibold">Gender:</span>{" "}
                  {p.gender || "Not Selected"}
                </p>
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
          ))
        )}
      </div>
    </div>
  );
};

export default Patients;
