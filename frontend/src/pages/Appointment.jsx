import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token, user } = useContext(AuthContext);

  const [docInfo, setDocInfo] = useState(null);
  const [doctorServices, setDoctorServices] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [promotions, setPromotions] = useState([]);

  const [selectedService, setSelectedService] = useState("");
  const [selectedPromotion, setSelectedPromotion] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // ================= FETCH DOCTOR =================
  const fetchDoctor = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors/${docId}`);
      if (data.success) {
        setDocInfo(data.doctor);
        setDoctorServices(data.doctor.services || []);
        setDoctorSchedule(data.doctor.schedule || []);
      } else {
        toast.error("Doctor not found");
      }
    } catch (err) {
      toast.error("Failed to load doctor");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH PROMOS =================
  const fetchPromotions = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/promotions`);
      setPromotions(data.filter((p) => p.isActive));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoctor();
    fetchPromotions();
  }, [docId]);

  // ================= AVAILABLE SLOTS =================
  const getAvailableSlots = () => {
    if (!selectedDate || !doctorSchedule) return [];

    const day = doctorSchedule.find((d) => d.date === selectedDate);
    if (!day || !day.slots) return [];

    const booked = docInfo?.slots_book?.[selectedDate] || [];

    return day.slots.filter((slot) => !booked.includes(slot));
  };

  // ================= BOOK APPOINTMENT =================
  const handleBooking = async () => {
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error("Please select service, date, and time");
      return;
    }

    try {
      setBooking(true);

      const { data } = await axios.post(
        `${backendUrl}/api/appointments/book`,
        {
          doctorId: docId,
          serviceId: selectedService,
          date: selectedDate,
          time: selectedTime,
          promotionId: selectedPromotion || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data.success) {
        toast.success("Appointment booked successfully!");
        setSelectedService("");
        setSelectedPromotion("");
        setSelectedDate("");
        setSelectedTime("");
        fetchDoctor();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
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
      <h2 className="text-2xl font-bold mb-4">{docInfo.name}</h2>

      {/* SERVICES */}
      {doctorServices.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Select Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {doctorServices.map((s) => (
              <button
                key={s._id}
                onClick={() => setSelectedService(s._id)}
                className={`p-3 border rounded ${
                  selectedService === s._id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                <p className="font-semibold">{s.name}</p>
                <p>₱{s.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PROMOTIONS */}
      {promotions.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Promotion (optional)</h3>
          <select
            value={selectedPromotion}
            onChange={(e) => setSelectedPromotion(e.target.value)}
            className="border p-2 rounded w-full"
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
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Select Date</h3>
        <div className="flex gap-2 overflow-x-auto">
          {doctorSchedule.map((d) => (
            <button
              key={d.date}
              onClick={() => {
                setSelectedDate(d.date);
                setSelectedTime("");
              }}
              className={`px-4 py-2 border rounded ${
                selectedDate === d.date ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
            >
              {new Date(d.date).toLocaleDateString()}
            </button>
          ))}
        </div>
      </div>

      {/* TIME */}
      {selectedDate && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Select Time</h3>
          <div className="grid grid-cols-3 gap-2">
            {getAvailableSlots().map((t, i) => (
              <button
                key={i}
                onClick={() => setSelectedTime(t)}
                className={`p-2 border rounded ${
                  selectedTime === t ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BOOK BUTTON */}
      <button
        onClick={handleBooking}
        disabled={booking}
        className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700"
      >
        {booking ? "Booking..." : "Book Appointment"}
      </button>
    </div>
  );
};

export default Appointment;
