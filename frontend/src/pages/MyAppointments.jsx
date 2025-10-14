import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const MyAppointments = () => {
  const { token } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [appointments, setAppointments] = useState([]);

  // ✅ Fetch user's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) setAppointments(data.appointments);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };
    if (token) fetchAppointments();
  }, [token, backendUrl]);

  // ✅ Cancel appointment
  const handleCancel = async (id) => {
    try {
      await axios.put(
        `${backendUrl}/api/appointments/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, status: "cancelled" } : a
        )
      );
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <p className="text-2xl font-semibold text-gray-800 mb-6">
        My Appointments
      </p>

      {appointments.length === 0 ? (
        <p className="text-gray-500 text-center">No appointments yet.</p>
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
                  {appt.doctor?.name}
                </p>
                <p className="text-gray-600">{appt.doctor?.speciality}</p>

                {/* ✅ Show booked service */}
                {appt.service && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Service:</span>{" "}
                    {appt.service.name} — ₱{appt.service.price} (
                    {appt.service.duration})
                  </p>
                )}

                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold text-gray-700">
                    Date & Time:
                  </span>{" "}
                  {appt.date} | {appt.time}
                </p>
                <p className="text-sm text-gray-500">Status: {appt.status}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-4 md:mt-0">
                
                {appt.status === "booked" && (
                  <button
                    onClick={() => handleCancel(appt._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
