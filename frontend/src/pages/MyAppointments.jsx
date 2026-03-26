import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { backendUrl } from "../config";
import { socket } from "../socket";

const MyAppointments = () => {
  const { token, user } = useContext(AuthContext); // ✅ get user too
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ add loading state

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/appointments/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setAppointments(data.appointments);
    } catch (err) {
      console.error("Fetch appointments error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch on mount
  useEffect(() => {
    if (token) fetchAppointments();
  }, [token]);

  // ✅ Join socket room so backend can push updates to THIS user
  useEffect(() => {
    if (!socket || !user?._id) return;
    socket.emit("joinUserRoom", user._id);
  }, [user?._id]);

  // ✅ Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("appointmentUpdated", (updatedAppt) => {
      setAppointments(prev =>
        prev.map(a => a._id === updatedAppt._id ? updatedAppt : a)
      );
    });

    socket.on("newAppointment", (newAppt) => {
      setAppointments(prev => {
        const exists = prev.find(a => a._id === newAppt._id);
        if (exists) return prev;
        return [newAppt, ...prev];
      });
    });

    return () => {
      socket.off("appointmentUpdated");
      socket.off("newAppointment");
    };
  }, []);

  const handleCancel = async (id) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/appointments/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setAppointments(prev =>
          prev.map(a => a._id === id ? { ...a, status: "CANCELLED" } : a) // ✅ uppercase matches DB
        );
      }
    } catch (err) {
      console.error("Cancel error:", err.response?.data || err.message);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center mt-20">
      <p className="text-gray-500 text-lg">Loading appointments...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <p className="text-2xl font-semibold text-gray-800 mb-6">My Appointments</p>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <p className="text-gray-600 text-lg">You have no appointments yet.</p>
        </div>
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
                <p className="text-xl font-semibold text-gray-800">{appt.doctor?.name}</p>
                <p className="text-gray-600">{appt.doctor?.speciality}</p>

                {appt.service && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Service:</span>{" "}
                    {appt.service.name} — ₱{appt.service.price} ({appt.service.duration})
                  </p>
                )}

                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold text-gray-700">Date & Time:</span>{" "}
                  {appt.date} | {appt.time}
                </p>

                {/* ✅ Status badge with proper color per status */}
                <p className="text-sm">
                  <span className="font-semibold">Status: </span>
                  <span className={
                    appt.status === "COMPLETED"    ? "text-green-600 font-semibold" :
                    appt.status === "CANCELLED"    ? "text-red-500 font-semibold"   :
                    appt.status === "APPROVED_ADMIN" ? "text-blue-600 font-semibold" :
                    appt.status === "IN_PROGRESS"  ? "text-yellow-600 font-semibold" :
                    "text-gray-500"
                  }>
                    {appt.status}
                  </span>
                </p>

                {/* Services rendered */}
                {appt.services?.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Services: </span>
                    {appt.services.map((s, i) => (
                      <span key={i} className="bg-gray-100 px-2 py-0.5 rounded mr-1">
                        {s.service?.name || "Unknown"} — ₱{s.price}
                      </span>
                    ))}
                  </div>
                )}

                {/* Total price */}
                {appt.totalPrice > 0 && (
                  <p className="text-sm font-semibold text-gray-700">
                    Total: ₱{appt.totalPrice.toLocaleString()}
                  </p>
                )}

                {appt.paymentStatus === "Paid" && (
                  <p className="text-green-600 font-semibold text-sm">✓ Paid</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-4 md:mt-0">
                {appt.status === "PENDING_ADMIN" && ( // ✅ uppercase matches DB
                  <button
                    onClick={() => handleCancel(appt._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
                  >
                    Cancel
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