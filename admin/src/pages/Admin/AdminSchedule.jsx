import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const AdminSchedule = () => {
  const { doctors, backendUrl, aToken } = useContext(AdminContext);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [slots, setSlots] = useState([]); // Slots to add before saving
  const [schedule, setSchedule] = useState([]); // Existing schedule from backend

  // ---------------- Fetch doctor's schedule ----------------
  const fetchDoctorSchedule = async (doctorId) => {
    if (!doctorId) return;

    try {
      const res = await fetch(
        `${backendUrl}/api/admin/doctor-schedule/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.schedule)) {
        // Normalize slots
        const normalizedSchedule = data.schedule.map((s) => ({
          date: s.date,
          slots: Array.isArray(s.slots)
            ? s.slots.map((slot) =>
                typeof slot === "string" ? { time: slot, status: "available" } : slot
              )
            : [],
        }));
        setSchedule(normalizedSchedule);
      } else {
        setSchedule([]);
      }
    } catch (err) {
      console.error(err);
      setSchedule([]);
      toast.error("Failed to fetch schedule");
    }
  };

  useEffect(() => {
    if (selectedDoctor) fetchDoctorSchedule(selectedDoctor);
    setSlots([]);
    setDate("");
  }, [selectedDoctor]);

  // ---------------- Add slot before saving ----------------
  const addSlot = () => {
    if (!newSlot) return toast.error("Select a time first");
    if (slots.includes(newSlot)) return toast.error("Time slot already added");
    setSlots([...slots, newSlot]);
    setNewSlot("");
  };

  // ---------------- Save schedule to backend ----------------
  const saveSchedule = async () => {
    if (!selectedDoctor || !date || slots.length === 0)
      return toast.error("Select doctor, date, and add slots");

    try {
      const res = await fetch(`${backendUrl}/api/admin/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aToken}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          schedule: { [date]: slots }, // backend expects { "YYYY-MM-DD": ["10:00", "11:00"] }
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Schedule added successfully!");
        setSlots([]);
        setDate("");
        fetchDoctorSchedule(selectedDoctor); // re-fetch updated schedule
      } else {
        toast.error(data.message || "Failed to save schedule");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save schedule");
    }
  };

  // ---------------- Make finished slot available ----------------
  const makeAvailable = async (date, time) => {
    try {
      const res = await fetch(
        `${backendUrl}/api/admin/schedule/slot-available/${selectedDoctor}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${aToken}`,
          },
          body: JSON.stringify({ date, time }),
        }
      );
      const data = await res.json();
      if (data.success) fetchDoctorSchedule(selectedDoctor);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update slot");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Admin Schedule</h2>

      {/* Doctor selector */}
      <select
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Select Doctor</option>
        {doctors.map((d) => (
          <option key={d._id} value={d._id}>
            {d.name}
          </option>
        ))}
      </select>

      {/* Date picker */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 rounded w-full mt-2"
      />

      {/* Time slot input */}
      <div className="flex gap-2 mt-2">
        <input
          type="time"
          value={newSlot}
          onChange={(e) => setNewSlot(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={addSlot}
          className="bg-green-500 px-4 py-2 rounded text-white"
        >
          Add
        </button>
      </div>

      {/* Slots to be saved */}
      {slots.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {slots.map((s) => (
            <span key={s} className="bg-blue-100 px-3 py-1 rounded">
              {s} (available)
            </span>
          ))}
        </div>
      )}

      {/* Save schedule button */}
      <button
        onClick={saveSchedule}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Save Schedule
      </button>

      {/* Existing schedule */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Doctor Schedule</h3>
        {schedule.length === 0 ? (
          <p className="text-gray-500">No schedule yet.</p>
        ) : (
          schedule.map((s) => (
            <div key={s.date} className="border p-3 rounded mb-2">
              <p className="font-semibold">{s.date}</p>
              <div className="flex flex-wrap gap-2">
                {s.slots.map((slot) => (
                  <span
                    key={slot.time}
                    className={`px-3 py-1 rounded ${
                      slot.status === "finished"
                        ? "bg-gray-300"
                        : slot.status === "booked"
                        ? "bg-blue-300"
                        : "bg-green-200"
                    }`}
                  >
                    {slot.time} ({slot.status})
                    {slot.status === "finished" && (
                      <button
                        onClick={() => makeAvailable(s.date, slot.time)}
                        className="ml-2 text-red-500"
                      >
                        Available
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminSchedule;
