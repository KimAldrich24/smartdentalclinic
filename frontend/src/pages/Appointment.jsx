import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useContext(AuthContext);

  const [docInfo, setDocInfo] = useState(null);
  const [doctorSchedule, setDoctorSchedule] = useState([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // ================= FETCH DOCTOR =================
  const fetchDoctor = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/doctors/${docId}`);
      console.log("🧑 Doctor response:", res.data);

      if (!res.data?.success || !res.data.doctor) {
        toast.error("Doctor not found");
        return;
      }

      setDocInfo(res.data.doctor);
      setDoctorSchedule(res.data.doctor.schedule || []);
    } catch (err) {
      console.error("Doctor fetch error:", err);
      toast.error("Failed to load doctor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [docId]);

  // ================= AVAILABLE SLOTS =================
  const getAvailableSlots = () => {
    if (!selectedDate) return [];

    const day = doctorSchedule.find((d) => d.date === selectedDate);
    if (!day || !Array.isArray(day.slots)) return [];

    const bookedTimes = Array.isArray(docInfo?.slots_book?.[selectedDate])
      ? docInfo.slots_book[selectedDate]
      : [];

    return day.slots.filter((slot) => {
      const time = typeof slot === "string" ? slot : slot.time;
      const status = typeof slot === "string" ? "available" : slot.status;
      return status === "available" && !bookedTimes.includes(time);
    });
  };

  // ================= BOOK APPOINTMENT =================
  const handleBooking = async () => {
    console.log("🚀 BOOKING CLICKED");
    console.log("📦 Payload:", {
      doctorId: docId,
      date: selectedDate,
      time: selectedTime,
    });

    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (!selectedDate) {
      toast.error("Select a date");
      return;
    }

    if (!selectedTime) {
      toast.error("Select a time");
      return;
    }

    try {
      setBooking(true);

      const res = await axios.post(
        `${backendUrl}/api/appointments/book`,
        {
          doctorId: docId,
          date: selectedDate,
          time: selectedTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Booking response:", res.data);

      if (res.data.success) {
        toast.success("Appointment submitted for admin approval");
        navigate("/my-appointments");
      } else {
        toast.error(res.data.message || "Booking failed");
      }
    } catch (err) {
      console.error("❌ Booking error:", err);
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  // ================= RENDER =================
  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!docInfo) return <p className="text-center mt-10 text-red-500">Doctor not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 space-y-6">

        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">Book Appointment</h2>
          <p className="text-gray-600">Dr. {docInfo.name}</p>
        </div>

        {/* DATE */}
        <div>
          <h3 className="font-semibold mb-2">Select Date</h3>
          <div className="flex gap-2 overflow-x-auto">
            {doctorSchedule.map((d) => (
              <button
                key={d.date}
                onClick={() => {
                  setSelectedDate(d.date);
                  setSelectedTime("");
                }}
                className={`px-4 py-2 rounded-lg border ${
                  selectedDate === d.date
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                {new Date(d.date).toLocaleDateString()}
              </button>
            ))}
          </div>
        </div>

        {/* TIME */}
        {selectedDate && (
          <div>
            <h3 className="font-semibold mb-2">Select Time</h3>
            {getAvailableSlots().length === 0 ? (
              <p className="text-sm text-gray-500">No available slots</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {getAvailableSlots().map((slot, i) => {
                  const time = typeof slot === "string" ? slot : slot.time;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg border ${
                        selectedTime === time
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleBooking}
          disabled={booking}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {booking ? "Booking..." : "Confirm Appointment"}
        </button>
      </div>
    </div>
  );
};

export default Appointment;
