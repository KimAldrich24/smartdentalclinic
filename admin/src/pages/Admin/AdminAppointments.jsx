import React from "react";
import AdminCreateAppointment from "../../components/AdminCreateAppointment.jsx";

const AdminAppointments = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin: Create Appointment</h1>
      <AdminCreateAppointment backendUrl={backendUrl} />
    </div>
  );
};

export default AdminAppointments;
