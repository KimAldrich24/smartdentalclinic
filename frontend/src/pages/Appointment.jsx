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
  const [slots, setSlots] = useState([]);
  const [services, setServices] = useState([]);
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
      if (data.success) setDocInfo(data.doctor);
      else toast.error("Doctor not found");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Fetch slots
  const fetchSlots = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors/${docId}/slots`);
      if (data.success) setSlots(data.slots);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/services`);
      if (data.success) setServices(data.services);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
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
    fetchSlots();
    fetchServices();
    fetchPromotions();
  }, [docId]);

  // Calculate discounted price safely
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

  const handleBooking = async () => {
    if (!token) {
      toast.error("You must be logged in to book an appointment");
      navigate("/login");
      return;
    }

    if (!selectedService) {
      toast.error("⚠️ Please select a service before booking");
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
          serviceId: selectedService,
          date: selectedDate,
          time: selectedTime,
          promotionId: selectedPromotion || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("✅ Appointment booked successfully!");
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedPromotion("");
        setSuccessAnim(true);
        setTimeout(() => setSuccessAnim(false), 2000);
        fetchSlots();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
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
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50 animate-fade">
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
          <p className="text-gray-600 mt-1">{docInfo.degree} • {docInfo.speciality}</p>
          <p className="mt-3 text-gray-500">Experience: {docInfo.experience} years</p>
          <p className="mt-1 text-gray-500">Fee: ₱{docInfo.fees}</p>
          <p className="mt-3 text-gray-700">{docInfo.about}</p>
        </div>
      </div>

      {/* Services */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Select Service</h3>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-2 rounded-lg ${
            serviceError && !selectedService ? "border-2 border-red-500" : ""
          }`}
        >
          {services.map((service) => {
            const discountedPrice = getDiscountedPrice(service);
            const isDiscounted = discountedPrice !== service.price;
            return (
              <button
                key={service._id}
                onClick={() => {
                  setSelectedService(service._id);
                  setSelectedPromotion(""); // reset promotion when switching services
                  setServiceError(false);
                }}
                className={`p-4 border rounded-lg text-left ${
                  selectedService === service._id ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
              >
                <h4 className="font-semibold">{service.name}</h4>
                <p className="text-sm text-gray-600">{service.description}</p>
                <p className="text-sm text-gray-700 mt-1">
                  ₱{discountedPrice}
                  {isDiscounted && (
                    <span className="text-red-500 ml-2 line-through text-sm">₱{service.price}</span>
                  )}{" "}
                  • {service.duration}
                </p>
              </button>
            );
          })}
        </div>
        {serviceError && !selectedService && (
          <p className="text-red-500 text-sm mt-2">⚠️ You must select a service before booking.</p>
        )}
      </div>

      {/* Promotions */}
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
              disabled={
                selectedService &&
                (!Array.isArray(promo.serviceIds) || !promo.serviceIds.includes(selectedService))
              }
            >
              {promo.title} ({promo.discountPercentage}% off)
            </option>
          ))}
        </select>
      </div>

      {/* Slots */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Available Slots</h3>
        <div className="flex gap-3 overflow-x-auto">
          {slots.map((day, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedDate(day.date);
                setSelectedTime(null);
              }}
              className={`px-4 py-2 rounded-lg border ${
                selectedDate === day.date ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
            >
              {day.date}
            </button>
          ))}
        </div>

        {selectedDate && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {slots
              .find((s) => s.date === selectedDate)
              ?.availableSlots.map((time, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTime(time)}
                  className={`px-3 py-2 border rounded-lg ${
                    selectedTime === time ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  {time}
                </button>
              ))}
          </div>
        )}

        {/* Final Price */}
        {selectedService && (
          <p className="mt-4 font-semibold">
            Final Price: ₱{getDiscountedPrice(services.find((s) => s._id === selectedService))}
          </p>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={handleBooking}
            disabled={booking}
            className={`px-6 py-3 text-lg font-semibold rounded-full shadow-md transition ${
              booking ? "bg-gray-400 cursor-not-allowed text-white" : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {booking ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
