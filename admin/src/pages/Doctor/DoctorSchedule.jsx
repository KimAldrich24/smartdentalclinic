import React, { useContext, useState, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { Trash2, Plus, Calendar, Clock } from 'lucide-react';
import Swal from "sweetalert2";

const DoctorSchedule = () => {
  const { dToken } = useContext(DoctorContext);
  const { backendUrl } = useContext(AdminContext);

  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Check if date is in the past
  const isPastDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // ---------------- Fetch doctor's schedule ----------------
  const fetchSchedule = async () => {
    if (!dToken) return;

    try {
      const res = await fetch(`${backendUrl}/api/doctors/schedule`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Unexpected response:', text);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Invalid response from server",
        });
        return;
      }

      if (data.success) {
        const normalizedSchedule = (data.schedule || []).map((s) => ({
          date: s.date,
          slots: s.slots.map((slot) =>
            typeof slot === 'string' ? { time: slot, status: 'available' } : slot
          ),
        }));
        setSchedule(normalizedSchedule);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || 'Failed to fetch schedule',
        });
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load schedule",
      });
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [dToken]);

  // ---------------- Time Slots Handlers ----------------
  const handleAddSlot = () => {
    if (!newSlot) return Swal.fire({
      icon: "error",
      title: "Error",
      text: "Select a time first",
    });
    if (timeSlots.includes(newSlot)) return Swal.fire({
      icon: "error",
      title: "Error",
      text: "Time slot already added",
    });
    setTimeSlots([...timeSlots, newSlot]);
    setNewSlot('');
  };

  const handleRemoveSlot = (slot) => {
    setTimeSlots(timeSlots.filter((s) => s !== slot));
  };

  const handleSaveSchedule = async () => {
  if (!selectedDate || timeSlots.length === 0) {
    toast.error('Select a date and add slots');
    return;
  }

  const today = new Date();
  const selected = new Date(selectedDate);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1); // max 1 month ahead

  // Reset time to ignore hours
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  maxDate.setHours(0, 0, 0, 0);

  if (selected < today) {
    toast.error('Cannot create schedule for past dates');
    return;
  }

  if (selected > maxDate) {
    toast.error('Cannot create schedule more than 1 month ahead');
    return;
  }

    try {
      const res = await fetch(`${backendUrl}/api/doctors/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${dToken}`,
        },
        body: JSON.stringify({ date: selectedDate, slots: timeSlots }),
      });

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Unexpected response:', text);
        toast.error('Invalid response from server');
        return;
      }

      if (data.success) {
        toast.success('Schedule saved!');
        setSelectedDate('');
        setTimeSlots([]);
        setIsEditing(false);
        fetchSchedule();
      } else {
        toast.error(data.message || 'Failed to save schedule');
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
      toast.error('Failed to save schedule');
    }
  };

  const handleEditSchedule = (date) => {
  const sch = schedule.find((s) => s.date === date);
  if (!sch) return;

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);
  const schDate = new Date(sch.date);

  // Reset time
  today.setHours(0,0,0,0);
  maxDate.setHours(0,0,0,0);
  schDate.setHours(0,0,0,0);

  if (schDate < today || schDate > maxDate) {
    return toast.error('Cannot edit past or too-far schedule');
  }

  setSelectedDate(sch.date);
  setTimeSlots(sch.slots.map((s) => s.time));
  setIsEditing(true);
};

  const handleDeleteSchedule = async (date) => {
      const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this schedule?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
    
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${backendUrl}/api/doctors/schedule/${date}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${dToken}` },
      });

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Unexpected response:', text);
        toast.error('Invalid response from server');
        return;
      }

      if (data.success) {
        toast.success('Schedule deleted!');
        setSchedule((prev) => prev.filter((s) => s.date !== date));
      } else {
        toast.error(data.message || 'Failed to delete schedule');
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
      toast.error('Failed to delete schedule');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Calendar size={24} /> My Schedule
      </h2>

      {/* Add/Edit Schedule */}
      <div className="space-y-4 mb-6">
        {/* Select Date */}
        <div>
          <label className="block mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]} // today
            max={new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]} // 1 month ahead
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Add Time Slots</label>
          <div className="flex gap-2">
            <input
              type="time"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="border px-3 py-2 rounded flex-1"
            />
            <button
              type="button"
              onClick={handleAddSlot}
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-1"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {timeSlots.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((t, i) => (
              <span key={i} className="bg-blue-100 px-3 py-1 rounded flex items-center gap-1">
                <Clock size={12} /> {t}
                <button onClick={() => handleRemoveSlot(t)} className="text-red-500 font-bold">×</button>
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handleSaveSchedule}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {isEditing ? 'Update Schedule' : 'Save Schedule'}
        </button>
      </div>

      {/* Saved Schedules */}
      <div>
        {schedule.length === 0 ? (
          <p>No schedules yet.</p>
        ) : (
          <div className="space-y-3">
            {schedule.map((s) => (
              <div key={s.date} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{new Date(s.date).toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {s.slots.map((slot, i) => (
                      <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {slot.time} ({slot.status})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSchedule(s.date)}
                    className="bg-yellow-400 px-3 py-1 rounded text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(s.date)}
                    className="bg-red-500 px-3 py-1 rounded text-white flex items-center gap-1"
                  >
                    Delete <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule;
