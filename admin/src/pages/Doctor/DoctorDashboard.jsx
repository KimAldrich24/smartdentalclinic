import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from "../../context/DoctorContext";
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { Calendar, LogOut, Plus, Clock } from 'lucide-react';

const DoctorDashboard = () => {

  const navigate = useNavigate();
  const { doctor, dToken, logoutDoctor } = useContext(DoctorContext);
  const { backendUrl } = useContext(AdminContext);

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [services, setServices] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [mySchedules, setMySchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  const handleLogout = () => {
    logoutDoctor();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // FETCH APPOINTMENTS
  const fetchAppointments = async () => {

    if (!dToken) return;

    try {

      setLoadingAppointments(true);

      const res = await fetch(`${backendUrl}/api/appointments/doctor/my-appointments`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });

      const data = await res.json();

      if (data.success) setAppointments(data.appointments);
      else toast.error(data.message || 'Failed to fetch appointments');

    } catch (err) {

      console.error(err);
      toast.error('Failed to load appointments');

    } finally {

      setLoadingAppointments(false);

    }

  };

  // FETCH SERVICES
  const fetchServices = async () => {

    try {

      const res = await fetch(`${backendUrl}/api/services`, {
        headers: { Authorization: `Bearer ${dToken}` }
      });

      const data = await res.json();

      if (data.success) setServices(data.services);

    } catch (err) {

      toast.error("Error fetching services");

    }

  };

  // FETCH EQUIPMENT
  const fetchEquipment = async () => {

    try {

      const res = await fetch(`${backendUrl}/api/equipment`, {
        headers: { Authorization: `Bearer ${dToken}` }
      });

      const data = await res.json();

      if (data.success) setEquipment(data.equipment);

    } catch (err) {

      toast.error("Failed to fetch equipment");

    }

  };

  // FETCH SCHEDULES
  const fetchMySchedules = async () => {

    try {

      setLoadingSchedules(true);

      const res = await fetch(`${backendUrl}/api/doctor/schedule-request/doctor`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });

      const data = await res.json();

      if (data.success) setMySchedules(data.requests);

    } catch (err) {

      toast.error("Error fetching schedules");

    } finally {

      setLoadingSchedules(false);

    }

  };

  useEffect(() => {

    if (dToken) {

      fetchAppointments();
      fetchServices();
      fetchEquipment();
      fetchMySchedules();

    }

  }, [dToken]);


  // UPDATE APPOINTMENT
  const handleUpdateAppointment = async (apptId, selectedServiceIds, finalPrice, usedEquipment) => {

    try {

      const servicesPayload = selectedServiceIds.map(id => {

        const svc = services.find(s => s._id === id);

        return {
          serviceId: id,
          price: finalPrice || svc.price
        };

      });

      const res = await fetch(`${backendUrl}/api/appointments/doctor/${apptId}/assign-services`, {

        method: "PUT",

        headers: {
          Authorization: `Bearer ${dToken}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          services: servicesPayload,
          equipmentUsed: usedEquipment
        })

      });

      const data = await res.json();

      if (data.success) {

        toast.success("Appointment updated");
        fetchAppointments();

      }

    } catch (err) {

      toast.error("Error updating appointment");

    }

  };


  // ADD SLOT
  const handleAddSlot = () => {

    if (!newSlot) return toast.error("Select a time first");

    if (timeSlots.includes(newSlot))
      return toast.error("Time slot already added");

    setTimeSlots([...timeSlots, newSlot]);
    setNewSlot('');

  };


  const handleRemoveSlot = (slot) => {

    setTimeSlots(timeSlots.filter(s => s !== slot));

  };


  const handlePushSchedule = async () => {

    if (!selectedDate || timeSlots.length === 0)
      return toast.error("Select date and slots");

    try {

      const res = await fetch(`${backendUrl}/api/doctor/schedule-request`, {

        method: "POST",

        headers: {
          Authorization: `Bearer ${dToken}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          date: selectedDate,
          slots: timeSlots
        })

      });

      const data = await res.json();

      if (data.success) {

        toast.success("Schedule pushed");
        setSelectedDate('');
        setTimeSlots([]);
        fetchMySchedules();

      }

    } catch (err) {

      toast.error("Error pushing schedule");

    }

  };


  return (

    <div className="min-h-[100dvh] max-w-6xl mx-auto px-4 py-6 md:p-6">

      {/* HEADER */}

      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-5 md:p-6 mb-8 shadow-lg">

        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">

          <h1 className="text-2xl md:text-3xl font-bold">
            👨‍⚕️ Doctor Dashboard
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

            <button
              onClick={() => navigate("/doctor-change-password")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md"
            >
              🔒 Change Password
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center gap-2"
            >
              <LogOut size={18}/>
              Logout
            </button>

          </div>

        </div>

      </div>


      {/* APPOINTMENTS */}

      <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 mb-8">

        <h2 className="text-xl md:text-2xl font-bold mb-5 border-b pb-2">
          📅 My Appointments
        </h2>

        {loadingAppointments ? (
          <p className="text-center text-gray-500 py-10">
            Loading appointments...
          </p>
        ) : appointments.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No appointments yet.
          </p>
        ) : (
          appointments.map(appt => (
            <AppointmentCard
              key={appt._id}
              appointment={appt}
              services={services}
              equipment={equipment}
              onUpdate={handleUpdateAppointment}
            />
          ))
        )}

      </div>

    </div>

  );

};




// APPOINTMENT CARD

const AppointmentCard = ({ appointment, services, equipment, onUpdate }) => {

  const [selectedServices, setSelectedServices] = useState([]);
  const [finalPrice, setFinalPrice] = useState(0);
  const [usedEquipment, setUsedEquipment] = useState({});


  const toggleService = (serviceId) => {

    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );

  };


  const updateEquipmentUsage = (id, qty) => {

    setUsedEquipment(prev => ({
      ...prev,
      [id]: Number(qty)
    }));

  };


  const handleSave = () => {

    if (selectedServices.length === 0)
      return alert("Select service");

    onUpdate(
      appointment._id,
      selectedServices,
      finalPrice,
      usedEquipment
    );

  };


  return (

    <div className="border rounded-xl p-4 mb-4">

      <div className="mb-3">

        <p className="font-semibold">
          {appointment.user?.name}
        </p>

        <p>
          {appointment.date} - {appointment.time}
        </p>

      </div>


      {(appointment.status === "APPROVED_ADMIN" ||
        appointment.status === "IN_PROGRESS") && (

        <>

          {/* SERVICES */}

          <p className="font-semibold mt-2">
            Select Services
          </p>

          <div className="flex flex-wrap gap-2 mt-2">

            {services.map(service => (

              <button
                key={service._id}
                onClick={() => toggleService(service._id)}
                className={`px-3 py-1 border rounded-full ${
                  selectedServices.includes(service._id)
                    ? "bg-green-500 text-white"
                    : ""
                }`}
              >
                {service.name} ₱{service.price}
              </button>

            ))}

          </div>


          {/* FINAL PRICE */}

          <div className="mt-3">

            <label>Final Price</label>

            <input
              type="number"
              className="border ml-2 px-2 py-1 rounded w-32"
              value={finalPrice}
              onChange={(e) =>
                setFinalPrice(Number(e.target.value))
              }
            />

          </div>


          {/* EQUIPMENT USED */}

          <p className="font-semibold mt-4">
            Equipment Used
          </p>

          {equipment.map(eq => (

            <div key={eq._id} className="flex gap-2 mt-2">

              <span className="w-40">
                {eq.name}
              </span>

              <input
                type="number"
                min="0"
                placeholder="0"
                className="border px-2 py-1 rounded w-20"
                onChange={(e) =>
                  updateEquipmentUsage(eq._id, e.target.value)
                }
              />

              <span>{eq.unit}</span>

            </div>

          ))}


          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Save
          </button>

        </>

      )}

    </div>

  );

};

export default DoctorDashboard;