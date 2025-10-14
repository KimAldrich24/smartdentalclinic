import React, { useState } from "react";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patientName, setPatientName] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!patientName) return;

    setAppointments([...appointments, { patientName, id: Date.now() }]);
    setPatientName("");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Doctor Dashboard</h2>

      <form onSubmit={handleAdd} className="mb-4">
        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="border px-3 py-2 rounded mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Appointment
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-2">Appointments:</h3>
      <ul>
        {appointments.map((a) => (
          <li key={a.id} className="border p-2 rounded mb-1">
            {a.patientName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorDashboard;
