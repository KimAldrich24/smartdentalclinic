import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

// SMS helper (replace with your actual API)
const sendSms = async ({ to, message }) => {
  try {
    await axios.post("/api/sms/send", { to, message });
  } catch (err) {
    console.error("SMS Error:", err);
  }
};

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token, user } = useContext(AuthContext);

  const [docInfo, setDocInfo] = useState(null);
  const [doctorServices, setDoctorServices] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceError, setServiceError] = useState(false);
  const [booking, setBooking] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  // Fetch doctor info
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
      console.error("Error fetching doctor:", err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/promotions`);
      setPromotions(data.filter((p) => p.isActive));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchDoctor();
    fetchPromotions();
  }, [docId]);

  // Available slots for selected date
  const getAvailableSlots = () => {
    if (!selectedDate || !docInfo || !doctorSchedule) return [];
    const scheduleForDate = doctorSchedule.find((s) => s.date === selectedDate);
    if (!scheduleForDate || !scheduleForDate.slots.length) return [];
    const bookedSlots = docInfo.slots_book?.[selectedDate] || [];
    return scheduleForDate.slots.filter((slot) => !bookedSlots.includes(slot));
  };

  // Discounted price
  const getDiscountedPrice = (service) => {
    if (!selectedPromotion) return service.price;
    const promo = promotions.find(
      (p) =>
        p._id === selectedPromotion &&
        Array.isArray(p.serviceIds) &&
        p.serviceIds.includes(service._id)
    );
    if (!promo) return service.price;
    return (service.price * (1 - promo.discountPercentage / 100)).toFixed(2);
  };

  // Handle booking
  const handleBooking = async () => {
    if (!token) {
      toast.error("You must be logged in to book an appointment");
      navigate("/login");
      return;
    }

    if (doctorServices.length > 0 && !selectedService) {
      toast.error("Please select a service before booking");
      setServiceError(true);
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error("Please select date & time slot first");
      return;
    }

    try {
      setBooking(true);

      const { data } = await axios.post(
        `${backendUrl}/api/appointments/book`,
        {
          doctorId: docId,
          serviceId: selectedService || null,
          date: selectedDate,
          time: selectedTime,
          promotionId: selectedPromotion || null,
          patientId: user?._id || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        if (user?.phone) {
          await sendSms({
            to: user.phone,
            message: `✅ Appointment confirmed with ${docInfo.name} on ${selectedDate} at ${selectedTime}.`,
          });
        }

        toast.success("Appointment booked successfully!");
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedPromotion("");
        setSuccessAnim(true);
        setTimeout(() => setSuccessAnim(false), 2000);

        // Remove booked slot instantly
        setDoctorSchedule((prev) =>
          prev.map((day) =>
            day.date === selectedDate
              ? { ...day, slots: day.slots.filter((t) => t !== selectedTime) }
              : day
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (!docInfo) return <p className="text-center mt-10 text-red-500">Doctor not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      {successAnim && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg text-xl font-bold animate-bounce">
            🎉 Appointment Confirmed!
          </div>
        </div>
      )}

      {/* Doctor Info */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
        <img
          src={docInfo.image ? `${backendUrl}/uploads/doctors/${docInfo.image}` : "/placeholder-doctor.png"}
          alt={docInfo.name}
          className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover border-4 border-blue-500 shadow-md"
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{docInfo.name}</h2>
          <p className="text-gray-600 mt-1">{docInfo.degree} • {docInfo.speciality || "General"}</p>
          <p className="mt-3 text-gray-500">Experience: {docInfo.experience}</p>
          <p className="mt-3 text-gray-700">{docInfo.about}</p>
        </div>
      </div>

      {/* Services */}
      {doctorServices.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Select Service</h3>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
            {doctorServices.map((service) => {
              const discountedPrice = getDiscountedPrice(service);
              const isDiscounted = discountedPrice !== service.price;
              return (
                <button
                  key={service._id}
                  onClick={() => {
                    setSelectedService(service._id);
                    setSelectedPromotion("");
                    setServiceError(false);
                  }}
                  className={`p-4 border rounded-lg shadow hover:scale-105 transform transition text-left ${
                    selectedService === service._id ? "bg-blue-500 text-white border-blue-600" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <h4 className="font-semibold">{service.name}</h4>
                  {service.description && <p className="text-sm mt-1">{typeof service.description === "string" ? service.description : JSON.stringify(service.description)}</p>}
                  <p className="text-sm mt-2">
                    ₱{discountedPrice}
                    {isDiscounted && <span className="text-red-500 ml-2 line-through text-sm">₱{service.price}</span>}
                  </p>
                </button>
              );
            })}
          </div>
          {serviceError && !selectedService && <p className="text-red-500 text-sm mt-2">⚠️ Please select a service.</p>}
        </div>
      )}

      {/* Promotions */}
      {promotions.length > 0 && doctorServices.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Select Promotion</h3>
          <select
            value={selectedPromotion}
            onChange={(e) => setSelectedPromotion(e.target.value)}
            className="border p-2 rounded-lg w-full md:w-1/2"
          >
            <option value="">-- No Promotion --</option>
            {promotions.map((promo) => (
              <option
                key={promo._id}
                value={promo._id}
                disabled={selectedService && (!promo.serviceIds || !promo.serviceIds.includes(selectedService))}
              >
                {promo.title} ({promo.discountPercentage}% off)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Schedule */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Select Date & Time</h3>
        {/* Dates */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {doctorSchedule.map((day, i) => (
            <button
              key={i}
              onClick={() => { setSelectedDate(day.date); setSelectedTime(null); }}
              className={`px-4 py-2 rounded-full border shadow-sm whitespace-nowrap transition ${
                selectedDate === day.date ? "bg-blue-500 text-white border-blue-600" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </button>
          ))}
        </div>
        {/* Times */}
        {selectedDate && (
          <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-3">
            {getAvailableSlots().length === 0 ? (
              <p className="text-red-500 col-span-full">All slots booked for this date.</p>
            ) : (
              getAvailableSlots().map((time, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTime(time)}
                  className={`px-3 py-2 rounded-lg border shadow hover:scale-105 transform transition ${
                    selectedTime === time ? "bg-blue-500 text-white border-blue-600" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {time}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={(doctorServices.length > 0 && !selectedService) || !selectedDate || !selectedTime || booking}
        className={`mt-6 w-full py-3 rounded-lg font-semibold transition ${
          (doctorServices.length > 0 && !selectedService) || !selectedDate || !selectedTime || booking
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {booking ? "Booking..." : "Book Appointment"}
      </button>
    </div>
  );
};

export default Appointment;
