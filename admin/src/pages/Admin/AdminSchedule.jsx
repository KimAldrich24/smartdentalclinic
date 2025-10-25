import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = ["10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];

const AdminSchedule = () => {
  const { doctors, aToken, backendUrl } = useContext(AdminContext);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [schedule, setSchedule] = useState({});

  // Fetch doctor schedule when a doctor is selected
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedDoctor) return;
      try {
        const res = await fetch(`${backendUrl}/api/admin/doctor-schedule/${selectedDoctor}`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        const data = await res.json();
        if (res.ok && data.schedule) setSchedule(data.schedule);
      } catch (err) {
        console.error("Error fetching schedule:", err);
      }
    };
    fetchSchedule();
  }, [selectedDoctor]);

  // Toggle a time slot for a specific day
  const toggleSlot = (day, time) => {
    setSchedule(prev => {
      const daySlots = prev[day] || [];
      return {
        ...prev,
        [day]: daySlots.includes(time)
          ? daySlots.filter(t => t !== time)
          : [...daySlots, time],
      };
    });
  };

  // Save schedule for selected doctor
  const saveSchedule = async () => {
    if (!selectedDoctor) return toast.error("Select a doctor first");
    try {
      const res = await fetch(`${backendUrl}/api/admin/add-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aToken}`,
        },
        body: JSON.stringify({ doctorId: selectedDoctor, schedule }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Schedule saved successfully!");
      } else {
        toast.error(data.message || "Failed to save schedule");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving schedule");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">Set Doctor Schedule</h2>

      {/* Doctor selector */}
      <select
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
        className="w-full border rounded-lg p-2"
      >
        <option value="">Select a doctor</option>
        {doctors.map(doc => (
          <option key={doc._id} value={doc._id}>{doc.name}</option>
        ))}
      </select>

      {/* Schedule UI */}
      {selectedDoctor && weekdays.map(day => (
        <div key={day} className="space-y-2">
          <h3 className="font-medium">{day}</h3>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map(time => (
              <button
                key={time}
                type="button"
                onClick={() => toggleSlot(day, time)}
                className={`px-3 py-1 rounded-lg border ${
                  schedule[day]?.includes(time)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={saveSchedule}
        className="w-full bg-blue-500 text-white font-medium py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Save Schedule
      </button>
    </div>
  );
};

export default AdminSchedule;
