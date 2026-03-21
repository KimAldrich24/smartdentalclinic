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
  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedChild, setSelectedChild] = useState("");
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [services, setServices] = useState([]);

  // ================= FETCH DOCTOR =================
  const fetchDoctor = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/doctors/${docId}`);
      if (!res.data?.success || !res.data.doctor) {
        toast.error("Doctor not found");
        return;
      }
      setDocInfo(res.data.doctor);
      setDoctorSchedule(res.data.doctor.schedule || []);
    } catch (err) {
      console.error("Doctor fetch error:", err);
      toast.error("Failed to load doctor");
    }
  };

  // ================= FETCH SERVICES =================
  const fetchServices = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/services`);
      if (res.data.success && Array.isArray(res.data.services)) {
        setServices(res.data.services);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  // ================= FETCH CHILDREN =================
  const fetchChildren = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && Array.isArray(data.user.children)) {
        setChildren(data.user.children);
        if (data.user.children.length > 0) {
          setSelectedChild(data.user.children[0]._id);
        }
      }
    } catch (err) {
      console.error("Error fetching children:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchDoctor();
      await fetchChildren();
      await fetchServices();
      setLoading(false);
    };
    loadData();
  }, [docId]);

  // ================= AVAILABLE SLOTS =================
  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    const today = new Date();

    // Find schedule for the selected date
    const day = docInfo?.schedule?.find(s => s.date === selectedDate);
    if (!day || !Array.isArray(day.slots)) return [];

    // Get booked slots
    let bookedTimes = [];
    if (docInfo?.slots_book) {
      bookedTimes = Array.isArray(docInfo.slots_book[selectedDate])
        ? docInfo.slots_book[selectedDate]
        : [];
    }

    return day.slots.filter(slot => {
      const time = typeof slot === "string" ? slot : slot.time;
      const status = typeof slot === "string" ? "available" : slot.status?.toLowerCase();

      // Hide booked slots
      if (bookedTimes.includes(time)) return false;

      // Hide past slots
      const slotDateTime = new Date(`${selectedDate}T${time}`);
      if (slotDateTime <= today) return false;

      return status === "available";
    });
  };

  // ================= HANDLE BOOKING =================
  const handleBooking = async () => {
console.warn("test")
    if (e) e.preventDefault();
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.error("Please select date and time");
      return;
    }

    const isChildBooking = children.length > 0 && selectedChild;

    try {
      setBooking(true);
      const endpoint = isChildBooking
        ? `${backendUrl}/api/appointments/book-child`
        : `${backendUrl}/api/appointments/book`;

      const payload = { doctorId: docId, date: selectedDate, time: selectedTime };
      if (isChildBooking) payload.childId = selectedChild;

      const res = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success("Appointment submitted for admin approval");

        // ================= UPDATE LOCAL SLOTS_BOOK =================
        const newSlotsBook = { ...docInfo.slots_book };
        if (!newSlotsBook[selectedDate]) newSlotsBook[selectedDate] = [];
        newSlotsBook[selectedDate].push(selectedTime);
        setDocInfo(prev => ({ ...prev, slots_book: newSlotsBook }));

        // Clear selected time to prevent double booking
        setSelectedTime("");

        navigate("/my-appointments");
      } else {
        toast.error(res.data.message || "Booking failed");
      }
    } catch (err) {
      if (err.response) {
        // Backend blocked it (duplicate slot)
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong");
      }

      console.log("Booking blocked:", err.response?.data);
    } finally {
      setBooking(false);
    }
  };

  // ================= RENDER =================
  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!docInfo) return <p className="text-center mt-10 text-red-500">Doctor not found</p>;

  const hasAvailableSlots = doctorSchedule.some(d => {
    if (!Array.isArray(d.slots) || d.slots.length === 0) return false;
    const today = new Date();
    return d.slots.some(slot => {
      const time = typeof slot === "string" ? slot : slot.time;
      const slotDateTime = new Date(`${d.date}T${time}`);
      const bookedTimes = docInfo?.slots_book?.[d.date] || [];
      return slotDateTime > today && !bookedTimes.includes(time);
    });
  });

  if (!hasAvailableSlots) {
    return <p className="text-center mt-10 text-gray-500">No available appointments for this doctor.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">Book Appointment</h2>
          <p className="text-gray-600">Dr. {docInfo.name}</p>

          {/* Add Gender & DOB */}
          <p className="text-gray-600">
            Gender: <span className="font-medium">{docInfo.gender}</span>
          </p>
          <p className="text-gray-600">
            Birthday:{" "}
            <span className="font-medium">
              {docInfo.dob ? new Date(docInfo.dob).toLocaleDateString() : "N/A"}
            </span>
          </p>
        </div>

        {/* SERVICES SUMMARY */}
        {services.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <h3 className="font-semibold mb-2">Services Summary</h3>
            <ul className="space-y-1">
              {services.map(s => (
                <li key={s._id} className="flex justify-between border-b pb-1">
                  <span>{s.name}</span>
                  <span>₱{s.price}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SELECT CHILD */}
        {children.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Select Child (Optional)</h3>
            <select
              value={selectedChild}
              onChange={e => setSelectedChild(e.target.value)}
              className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Self / Adult</option>
              {children.map(child => (
                <option key={child._id} value={child._id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* DATE */}
        <div>
          <h3 className="font-semibold mb-2">Select Date</h3>
          <div className="flex gap-2 overflow-x-auto">
            {doctorSchedule.map(d => {
              const slotAvailable = Array.isArray(d.slots) && d.slots.some(slot => {
                const time = typeof slot === "string" ? slot : slot.time;
                const slotDateTime = new Date(`${d.date}T${time}`);
                const bookedTimes = docInfo?.slots_book?.[d.date] || [];
                return slotDateTime > new Date() && !bookedTimes.includes(time);
              });
              return (
                <button
                  key={d.date}
                  onClick={() => {
                    setSelectedDate(d.date);
                    setSelectedTime("");
                  }}
                  disabled={!slotAvailable}
                  className={`px-4 py-2 rounded-lg border ${selectedDate === d.date
                      ? "bg-blue-600 text-white"
                      : slotAvailable
                        ? "bg-gray-100"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  {new Date(d.date).toLocaleDateString()}
                </button>
              );
            })}
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
                      className={`p-2 rounded-lg border ${selectedTime === time ? "bg-blue-600 text-white" : "bg-gray-100"
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

        <form onSubmit={handleBooking}>
          <button
            onClick={handleBooking}
            disabled={booking}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
          >
            {booking ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Appointment;