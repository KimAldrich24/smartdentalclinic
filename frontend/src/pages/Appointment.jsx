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
  const [promotions, setPromotions] = useState([]);

  const [selectedPromotion, setSelectedPromotion] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // ================= FETCH DOCTOR =================
  const fetchDoctor = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors/${docId}`);
      if (!data?.success || !data?.doctor) {
        toast.error("Doctor not found");
        return;
      }
      setDocInfo(data.doctor);
      setDoctorSchedule(Array.isArray(data.doctor.schedule) ? data.doctor.schedule : []);
    } catch (err) {
      toast.error("Failed to load doctor");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH PROMOTIONS =================
  const fetchPromotions = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/promotions`);
      if (Array.isArray(data)) {
        setPromotions(data.filter((p) => p.isActive));
      }
    } catch (err) {
      console.error("Promo fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDoctor();
    fetchPromotions();
  }, [docId]);

  // ================= AVAILABLE SLOTS =================
  const getAvailableSlots = () => {
    if (!selectedDate || !Array.isArray(doctorSchedule)) return [];

    const day = doctorSchedule.find((d) => d.date === selectedDate);
    if (!day || !Array.isArray(day.slots)) return [];

    const bookedTimes = Array.isArray(docInfo?.slots_book?.[selectedDate])
      ? docInfo.slots_book[selectedDate]
      : [];

    return day.slots.filter((slot) => {
      if (!slot) return false;
      const time = typeof slot === "string" ? slot : slot.time;
      const status = typeof slot === "string" ? "available" : slot.status;
      return status === "available" && !bookedTimes.includes(time);
    });
  };

  // ================= BOOK APPOINTMENT =================
  const handleBooking = async () => {
    console.log("Booking clicked:", { selectedDate, selectedTime });
  
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
  
      const { data } = await axios.post(
        `${backendUrl}/api/appointments/book`,
        {
          doctorId: docId,
          date: selectedDate,
          time: selectedTime,
          serviceId: null,        // ✅ IMPORTANT
          promotionId: selectedPromotion || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Booking response:", data);
  
      if (data?.success) {
        toast.success("Appointment submitted for admin approval");
        navigate("/my-appointments");
      } else {
        toast.error(data?.message || "Booking failed");
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };
  

  // ================= RENDER =================
  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!docInfo) return <p className="text-center mt-10 text-red-500">Doctor not found</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 space-y-6">
        {/* HEADER */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
          <p className="text-gray-600 mt-1">Dr. {docInfo.name}</p>
        </div>

        {/* PROMOTIONS */}
        {promotions.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Promotion (optional)</h3>
            <select
              value={selectedPromotion}
              onChange={(e) => setSelectedPromotion(e.target.value)}
              className="border p-3 rounded-lg w-full"
            >
              <option value="">No promotion</option>
              {promotions.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} ({p.discountPercentage}% off)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* DATE */}
        <div>
          <h3 className="font-semibold mb-2">Select Date</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {doctorSchedule.map((d) => (
              <button
                key={d.date}
                type="button"
                onClick={() => {
                  setSelectedDate(d.date);
                  setSelectedTime("");
                }}
                className={`px-4 py-2 rounded-lg border whitespace-nowrap ${
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
              <p className="text-sm text-gray-500">No available slots for this date</p>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {getAvailableSlots().map((slot, i) => {
                  const time = typeof slot === "string" ? slot : slot.time;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg border transition ${
                        selectedTime === time
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
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

        {/* BOOK BUTTON */}
        <button
          onClick={handleBooking}
          disabled={booking}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        >
          {booking ? "Booking..." : "Confirm Appointment"}
        </button>
      </div>
    </div>
  );
};

export default Appointment;
