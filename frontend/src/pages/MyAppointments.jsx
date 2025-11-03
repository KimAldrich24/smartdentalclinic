import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const MyAppointments = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [appointments, setAppointments] = useState([]);

  // ✅ Fetch user's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log("🔍 FETCHING MY APPOINTMENTS:");
        console.log("  URL:", `${backendUrl}/api/appointments/my`);
        console.log("  Token:", token);
        
        const { data } = await axios.get(`${backendUrl}/api/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("📥 MY APPOINTMENTS RESPONSE:");
        console.log("  Success:", data.success);
        console.log("  Appointments:", data.appointments);
        console.log("  Count:", data.appointments?.length);
        
        if (data.success) setAppointments(data.appointments);
      } catch (err) {
        console.error("❌ FETCH APPOINTMENTS ERROR:", err);
        console.error("  Response:", err.response?.data);
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

                {/* Payment Status */}
                {appt.paymentStatus === 'paid_online' && (
                  <p className="text-green-600 font-semibold">✓ Paid Online</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-4 md:mt-0">
                {/* Pay by GCash Button */}
                {appt.paymentStatus === 'pending' && (
                  <button
                    onClick={() => navigate(`/payment/gcash/${appt._id}`)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm"
                  >
                    Pay by GCash
                  </button>
                )}

                {/* Cancel Button */}
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