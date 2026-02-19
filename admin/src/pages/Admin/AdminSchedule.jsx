import React, { useContext, useState, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const AdminSchedule = () => {
  const { doctors, backendUrl, aToken } = useContext(AdminContext);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [slots, setSlots] = useState([]);
  const [schedule, setSchedule] = useState([]);

  // 🔹 NEW: schedule requests
  const [scheduleRequests, setScheduleRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // ================= Fetch doctor schedule =================
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
        const normalizedSchedule = data.schedule.map((s) => ({
          date: s.date,
          slots: Array.isArray(s.slots)
            ? s.slots.map((slot) =>
                typeof slot === "string"
                  ? { time: slot, status: "available" }
                  : slot
              )
            : [],
        }));
        setSchedule(normalizedSchedule);
      } else {
        setSchedule([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch schedule");
      setSchedule([]);
    }
  };

  // ================= Fetch doctor schedule requests =================
  const fetchScheduleRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch(
        `${backendUrl}/api/schedule-requests`,
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setScheduleRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch schedule requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchScheduleRequests();
  }, []);

  useEffect(() => {
    if (selectedDoctor) fetchDoctorSchedule(selectedDoctor);
    setSlots([]);
    setDate("");
  }, [selectedDoctor]);

  // ================= Add slot =================
  const addSlot = () => {
    if (!newSlot) return toast.error("Select a time first");
    if (slots.includes(newSlot)) return toast.error("Time slot already added");
    setSlots([...slots, newSlot]);
    setNewSlot("");
  };

  // ================= Save schedule =================
  const saveSchedule = async () => {
    if (!selectedDoctor || !date || slots.length === 0)
      return toast.error("Select doctor, date, and slots");

    try {
      const res = await fetch(`${backendUrl}/api/admin/add-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aToken}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          schedule: { [date]: slots },
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Schedule added!");
        setSlots([]);
        setDate("");
        fetchDoctorSchedule(selectedDoctor);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save schedule");
    }
  };

  // ================= Make finished slot available =================
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
      <h2 className="text-2xl font-bold">Admin Schedule</h2>

      {/* ================= Doctor Schedule Requests ================= */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold mb-3">Doctor Schedule Requests</h3>

        {loadingRequests ? (
          <p className="text-gray-500">Loading requests...</p>
        ) : scheduleRequests.length === 0 ? (
          <p className="text-gray-500">No requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Doctor</th>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Slots</th>
                  <th className="border px-2 py-1">Requested At</th>
                </tr>
              </thead>
              <tbody>
                {scheduleRequests.map((r) => (
                  <tr key={r._id}>
                    <td className="border px-2 py-1">{r.doctor?.name}</td>
                    <td className="border px-2 py-1 text-center">{r.date}</td>
                    <td className="border px-2 py-1">
                      {r.slots.map((s, i) => (
                        <span key={i} className="bg-green-100 px-2 py-1 rounded mr-1">
                          {s}
                        </span>
                      ))}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= Existing Admin Schedule ================= */}
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

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <div className="flex gap-2">
        <input
          type="time"
          value={newSlot}
          onChange={(e) => setNewSlot(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button onClick={addSlot} className="bg-green-500 text-white px-4 rounded">
          Add
        </button>
      </div>

      {slots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {slots.map((s) => (
            <span key={s} className="bg-blue-100 px-3 py-1 rounded">
              {s}
            </span>
          ))}
        </div>
      )}

      <button onClick={saveSchedule} className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Schedule
      </button>

      <div>
        {schedule.map((s) => (
          <div key={s.date} className="border p-3 rounded">
            <p className="font-semibold">{s.date}</p>
            {s.slots.map((slot) => (
              <span
                key={slot.time}
                className={`inline-block px-2 py-1 mr-2 rounded ${
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
                    className="ml-2 text-red-600"
                  >
                    Available
                  </button>
                )}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSchedule;
