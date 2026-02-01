import React, { useContext, useState, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { Trash2, Plus, Calendar, Clock, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorSchedule = () => {
  const { dToken } = useContext(DoctorContext);
  const { backendUrl } = useContext(AdminContext);
  const navigate = useNavigate();

  const [allServices, setAllServices] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [isEditing, setIsEditing] = useState(false); // 🔒 Track if editing

  // ✅ Helper function to check if date is in the past
  const isPastDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Fetch services and doctor's data
  const fetchData = async () => {
    try {
      const servicesRes = await fetch(`${backendUrl}/api/doctors/services/all`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const servicesData = await servicesRes.json();
      if (servicesData.success) setAllServices(servicesData.services);

      const myDataRes = await fetch(`${backendUrl}/api/doctors/my-data`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const myData = await myDataRes.json();
      if (myData.success) {
        setMyServices(myData.services || []);
        setSchedule(myData.schedule || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    if (dToken) fetchData();
  }, [dToken]);

  // Services
  const handleAddService = async (serviceId) => {
    try {
      const res = await fetch(`${backendUrl}/api/doctors/my-services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${dToken}`,
        },
        body: JSON.stringify({ serviceId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Service added!');
        setMyServices(data.services);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to add service');
    }
  };

  const handleRemoveService = async (serviceId) => {
    try {
      const res = await fetch(`${backendUrl}/api/doctors/my-services/${serviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Service removed');
        setMyServices(data.services);
      }
    } catch {
      toast.error('Failed to remove service');
    }
  };

  const isServiceAdded = (serviceId) => myServices.some(s => s._id === serviceId);

  // Time slots
  const handleAddSlot = () => {
    if (newSlot && !timeSlots.includes(newSlot)) {
      setTimeSlots([...timeSlots, newSlot]);
      setNewSlot('');
    }
  };
  const handleRemoveSlot = (slot) => {
    setTimeSlots(timeSlots.filter(s => s !== slot));
  };

  const handleSaveSchedule = async () => {
    if (!selectedDate || timeSlots.length === 0) {
      toast.error('Please select a date and add time slots');
      return;
    }

    if (isPastDate(selectedDate)) {
      toast.error('Cannot create schedule for past dates');
      return;
    }

    try {
      const existingSchedule = schedule.find(s => s.date === selectedDate);
      let url = `${backendUrl}/api/doctors/schedule`;
      let method = 'POST';

      if (existingSchedule?._id) {
        url = `${backendUrl}/api/doctors/schedule/${existingSchedule._id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${dToken}`,
        },
        body: JSON.stringify({ date: selectedDate, slots: timeSlots }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Schedule saved successfully');
        setSchedule(data.schedule || schedule);
        setSelectedDate('');
        setTimeSlots([]);
        setIsEditing(false); // 🔒 Reset editing state
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to save schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const res = await fetch(`${backendUrl}/api/doctors/schedule/${scheduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${dToken}` },
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Schedule deleted successfully');
        setSchedule(prev => prev.filter(s => s._id !== scheduleId));
      }
    } catch {
      toast.error('Failed to delete schedule');
    }
  };

  // Edit schedule
  const handleEditSchedule = (scheduleId) => {
    const sch = schedule.find(s => s._id === scheduleId);
    if (!sch) return;

    if (isPastDate(sch.date)) {
      toast.error('Cannot edit past schedule');
      return;
    }
    setSelectedDate(sch.date);
    setTimeSlots([...sch.slots]);
    setIsEditing(true); // 🔒 Lock back button while editing
  };

  // Clear time slots if user selects a past date manually
  useEffect(() => {
    if (selectedDate && isPastDate(selectedDate)) {
      setTimeSlots([]);
      toast.error('Cannot select a past date');
    }
  }, [selectedDate]);

  // 🔙 Back button logic
  const handleBack = () => {
    if (isEditing) {
      toast.error("Cannot go back while editing!");
      return; // 🔒 Disabled back
    }
    navigate(-1); // ⏪ Back to previous page
  };

  const handleBackHome = () => navigate('/'); // 🏠 Back to home

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Back Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={handleBackHome}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Home size={18} /> Home
        </button>
      </div>

      {/* Services Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">🦷 My Services</h2>
        {/* ...existing services UI */}
      </div>

      {/* Schedule Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calendar size={24} /> My Schedule</h2>
        {/* ...existing schedule UI */}
      </div>
    </div>
  );
};

export default DoctorSchedule;
