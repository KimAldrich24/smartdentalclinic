import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";


const AllAppointments = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/appointments/all`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (data.success) setAppointments(data.appointments);
      else setError(data.message || "Failed to load appointments");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Delete appointment
  const deleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const { data } = await axios.delete(`${backendUrl}/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (data.success) {
        setAppointments(prev => prev.filter(appt => appt._id !== id));
        toast.success("Appointment deleted successfully!");
      } else toast.error(data.message || "Failed to delete appointment");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Mark appointment as done & push to patient history
  const markAsDone = async (appt) => {
    if (!window.confirm("Mark this appointment as completed?")) return;

    try {
      // 1️⃣ Update appointment status in backend
      const { data } = await axios.put(
        `${backendUrl}/api/appointments/${appt._id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        toast.success("Appointment marked as completed!");

        // 2️⃣ Optionally: Refresh appointments to show updated status
        fetchAppointments();
      } else toast.error(data.message || "Failed to mark as done");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (aToken) fetchAppointments();
  }, [aToken, backendUrl]);

  if (!aToken)
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-red-500 font-semibold">
          Please login as admin to view appointments.
        </p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-red-500 font-semibold">Error: {error}</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <p className="text-2xl font-semibold text-gray-800 mb-6">All Appointments</p>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments found.</p>
      ) : (
        <div className="grid gap-6">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="flex flex-col md:flex-row items-start gap-6 bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition"
            >
              {/* Doctor Image */}
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={
                    appt.doctor?.image
                      ? `${backendUrl}/uploads/doctors/${appt.doctor.image}`
                      : "/placeholder-doctor.png"
                  }
                  alt={appt.doctor?.name || "Doctor"}
                  className="w-full h-full rounded-lg object-cover shadow-sm"
                />
              </div>

              {/* Appointment Details */}
              <div className="flex-1 space-y-2">
                <p className="text-xl font-semibold text-gray-800">
                  Dr. {appt.doctor?.name || "Unknown Doctor"}
                </p>
                <p className="text-gray-600">{appt.doctor?.speciality}</p>

                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold text-gray-700">Patient:</span>{" "}
                  {appt.user?.name || "Unknown"} ({appt.user?.email || "No email"})
                </p>

                {appt.service && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Service:</span> {appt.service.name} — ₱{appt.service.price} ({appt.service.duration})
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Date & Time:</span> {appt.date} | {appt.time}
                </p>

                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      appt.status === "cancelled"
                        ? "text-red-500"
                        : appt.status === "completed"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {appt.status}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {appt.status !== "completed" && (
                  <button
                    onClick={() => markAsDone(appt)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Mark as Done
                  </button>
                )}
                <button
                  onClick={() => deleteAppointment(appt._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
