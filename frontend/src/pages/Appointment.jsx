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

  // Calculate discounted price
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

  // Get available slots for selected date, excluding already booked
  const getAvailableSlots = () => {
    if (!selectedDate || !doctorSchedule.length || !docInfo) return [];

    const scheduleForDate = doctorSchedule.find((s) => s.date === selectedDate);
    if (!scheduleForDate || !scheduleForDate.slots.length) return [];

    const bookedSlots = docInfo.slots_book?.[selectedDate] || [];
    const availableSlots = scheduleForDate.slots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    return availableSlots;
  };

  // Handle booking
  const handleBooking = async () => {
    if (!token) {
      toast.error("You must be logged in to book an appointment");
      navigate("/login");
      return;
    }

    if (!selectedService) {
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
          serviceId: selectedService,
          date: selectedDate,
          time: selectedTime,
          promotionId: selectedPromotion || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Appointment booked successfully!");
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedPromotion("");
        setSuccessAnim(true);
        setTimeout(() => setSuccessAnim(false), 2000);

        // Refresh doctor data to remove booked slot
        fetchDoctor();
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
      {/* Success Animation */}
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
          <p className="mt-3 text-gray-500">Experience: {docInfo.experience}</p>
          <p className="mt-3 text-gray-700">{docInfo.about}</p>
        </div>
      </div>

      {/* Services */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Select Service</h3>
        {doctorServices.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <p className="text-yellow-700">⚠️ This doctor hasn't added any services yet.</p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-2 rounded-lg ${
              serviceError && !selectedService ? "border-2 border-red-500" : ""
            }`}
          >
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
                  className={`p-4 border rounded-lg text-left transition ${
                    selectedService === service._id 
                      ? "bg-blue-500 text-white border-blue-600" 
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <h4 className="font-semibold">{service.name}</h4>
                  {service.description && (
                    <p className={`text-sm mt-1 ${selectedService === service._id ? 'text-white' : 'text-gray-600'}`}>
                      {service.description}
                    </p>
                  )}
                  <p className={`text-sm mt-2 ${selectedService === service._id ? 'text-white' : 'text-gray-700'}`}>
                    ₱{discountedPrice}
                    {isDiscounted && (
                      <span className="text-red-500 ml-2 line-through text-sm">₱{service.price}</span>
                    )} • {service.duration}
                  </p>
                </button>
              );
            })}
          </div>
        )}
        {serviceError && !selectedService && (
          <p className="text-red-500 text-sm mt-2">⚠️ You must select a service before booking.</p>
        )}
      </div>

      {/* Promotions */}
      {promotions.length > 0 && (
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

      {/* Available Slots */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Available Slots</h3>
        {doctorSchedule.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <p className="text-yellow-700">⚠️ This doctor hasn't set up their schedule yet.</p>
          </div>
        ) : (
          <>
            {/* Date Selection */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {doctorSchedule.map((scheduleDay, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDate(scheduleDay.date);
                    setSelectedTime(null);
                  }}
                  className={`px-4 py-2 rounded-lg border whitespace-nowrap transition ${
                    selectedDate === scheduleDay.date ? "bg-blue-500 text-white border-blue-600" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {new Date(scheduleDay.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </button>
              ))}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Select Time:</p>
                {getAvailableSlots().length === 0 ? (
                  <p className="text-red-500 font-semibold">All slots for this date are already booked.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {getAvailableSlots().map((time, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTime(time)}
                        className={`px-3 py-2 border rounded-lg transition ${
                          selectedTime === time ? "bg-blue-500 text-white border-blue-600" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={!selectedService || !selectedDate || !selectedTime || booking}
        className={`mt-6 w-full py-3 rounded-lg font-semibold transition ${
          !selectedService || !selectedDate || !selectedTime || booking
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
