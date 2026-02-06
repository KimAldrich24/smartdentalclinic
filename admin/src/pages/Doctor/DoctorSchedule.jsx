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
  const [isEditing, setIsEditing] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  // Check if date is in the past
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
      // All services
      const servicesRes = await fetch(`${backendUrl}/api/doctors/services/all`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const servicesData = await servicesRes.json();
      if (servicesData.success) setAllServices(servicesData.services);

      // My services + schedule
      const myDataRes = await fetch(`${backendUrl}/api/doctors/my-data`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const myData = await myDataRes.json();
      if (myData.success) {
        setMyServices(myData.services || []);
        // Normalize schedule: ensure slots are objects {time, status}
        const normalizedSchedule = (myData.schedule || []).map((s) => ({
          ...s,
          slots: s.slots.map(slot =>
            typeof slot === 'string' ? { time: slot, status: 'available' } : slot
          ),
        }));
        setSchedule(normalizedSchedule);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    if (dToken) fetchData();
  }, [dToken]);

  // --- Services Handlers ---
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
      } else toast.error(data.message);
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

  const isServiceAdded = (serviceId) => myServices.some((s) => s._id === serviceId);

  // --- Time Slots Handlers ---
  const handleAddSlot = () => {
    if (newSlot && !timeSlots.includes(newSlot)) {
      setTimeSlots([...timeSlots, newSlot]);
      setNewSlot('');
    }
  };

  const handleRemoveSlot = (slot) => {
    setTimeSlots(timeSlots.filter((s) => s !== slot));
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
      // Convert timeSlots strings to objects for backend
      const slotsPayload = timeSlots.map((t) => ({ time: t, status: 'available' }));
      let url = `${backendUrl}/api/doctors/schedule`;
      let method = 'POST';
      if (isEditing && editingScheduleId) {
        url = `${backendUrl}/api/doctors/schedule/${editingScheduleId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${dToken}`,
        },
        body: JSON.stringify({ date: selectedDate, slots: slotsPayload }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Schedule saved successfully');
        setSchedule(data.schedule || schedule);
        setSelectedDate('');
        setTimeSlots([]);
        setIsEditing(false);
        setEditingScheduleId(null);
        fetchData();
      } else toast.error(data.message);
    } catch {
      toast.error('Failed to save schedule');
    }
  };

  const handleEditSchedule = (schId) => {
    const sch = schedule.find((s) => s._id === schId);
    if (!sch) return;
    if (isPastDate(sch.date)) {
      toast.error('Cannot edit past schedule');
      return;
    }
    setSelectedDate(sch.date);
    // Convert slots objects to strings for input
    setTimeSlots(sch.slots.map((s) => s.time));
    setIsEditing(true);
    setEditingScheduleId(sch._id);
  };

  const handleDeleteSchedule = async (schId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      const res = await fetch(`${backendUrl}/api/doctors/schedule/${schId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Schedule deleted successfully');
        setSchedule((prev) => prev.filter((s) => s._id !== schId));
      }
    } catch {
      toast.error('Failed to delete schedule');
    }
  };

  // --- Back/Home Handlers ---
  const handleBack = () => {
    if (isEditing) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to go back?')) return;
    }
    navigate(-1);
  };
  const handleBackHome = () => navigate('/');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Back Buttons */}
      <div className="flex gap-4 mb-4">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handleBackHome} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <Home size={18} /> Home
        </button>
      </div>

      {/* Schedule Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calendar size={24} /> My Schedule</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Time Slots</label>
            <div className="flex gap-2">
              <input
                type="time"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none flex-1"
              />
              <button type="button" onClick={handleAddSlot} className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2">
                <Plus size={18} /> Add
              </button>
            </div>
          </div>

          {timeSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Time Slots:</label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                    <Clock size={14} />
                    {slot}
                    <button onClick={() => handleRemoveSlot(slot)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleSaveSchedule} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
            {isEditing ? 'Update Schedule' : 'Save Schedule'}
          </button>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-3">Saved Schedules:</h3>
          {schedule.length === 0 ? (
            <p className="text-gray-500">No schedules added yet</p>
          ) : (
            <div className="space-y-3">
              {schedule.map((sch) => (
                <div key={sch._id} className="border rounded-lg p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">
                      📅 {new Date(sch.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sch.slots.map((slot, i) => (
                        <span key={i} className="bg-white border px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Clock size={12} /> {slot.time} ({slot.status})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button onClick={() => handleEditSchedule(sch._id)} className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteSchedule(sch._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-1">
                      Delete <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;
