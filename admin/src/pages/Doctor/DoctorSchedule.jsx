import React, { useContext, useState, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { Trash2, Plus, Calendar, Clock } from 'lucide-react';

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

  // Fetch doctor's schedule
  const fetchSchedule = async () => {
    if (!dToken) return;
    try {
      const res = await fetch(`${backendUrl}/api/doctors/schedule`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const data = await res.json();
      if (data.success) {
        // Convert slots strings to objects for UI display
        const normalizedSchedule = (data.schedule || []).map((s) => ({
          date: s.date,
          slots: s.slots.map((slot) =>
            typeof slot === "string" ? { time: slot, status: "available" } : slot
          ),
        }));
        setSchedule(normalizedSchedule);
      }
    } catch (err) {
      console.error("Error fetching schedule:", err);
      toast.error("Failed to load schedule");
    }
  };
  

  useEffect(() => {
    fetchSchedule();
  }, [dToken]);

  // --- Time Slots Handlers ---
  const handleAddSlot = () => {
    if (!newSlot) return toast.error('Select a time first');
    if (timeSlots.includes(newSlot)) return toast.error('Time slot already added');
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
    if (isPastDate(selectedDate)) {
      toast.error('Cannot create schedule for past dates');
      return;
    }

    try {
      // ✅ Send strings only to backend
      const slotsPayload = timeSlots; // ["09:00", "10:00"]

      const res = await fetch(`${backendUrl}/api/doctors/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${dToken}`,
        },
        body: JSON.stringify({ date: selectedDate, slots: slotsPayload }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Schedule saved!');
        setSelectedDate('');
        setTimeSlots([]);
        setIsEditing(false);
        fetchSchedule();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
      toast.error('Failed to save schedule');
    }
  };

  const handleEditSchedule = (date) => {
    const sch = schedule.find((s) => s.date === date);
    if (!sch) return;
    if (isPastDate(sch.date)) return toast.error('Cannot edit past schedule');
    setSelectedDate(sch.date);
    // Convert slot objects to strings for editing
    setTimeSlots(sch.slots.map((s) => s.time));
    setIsEditing(true);
  };

  const handleDeleteSchedule = async (date) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      const res = await fetch(`${backendUrl}/api/doctors/schedule/${date}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Schedule deleted!');
        setSchedule((prev) => prev.filter((s) => s.date !== date));
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
      toast.error('Failed to delete schedule');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calendar size={24} /> My Schedule</h2>

      {/* Add/Edit Schedule */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
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
