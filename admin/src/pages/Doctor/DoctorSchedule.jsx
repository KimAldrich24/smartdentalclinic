import React, { useState, useEffect, useContext } from "react";
import DoctorSidebar from "../../components/DoctorSidebar";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorSchedule = () => {
  const { backendUrl, dToken } = useContext(DoctorContext);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [schedules, setSchedules] = useState([]);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/doctor-schedules`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      if (res.data.success) setSchedules(res.data.schedules);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const addSchedule = async (e) => {
    e.preventDefault();
    if (!date || !start || !end) return toast.error("Fill all fields");

    const timeSlots = [{ start, end }];

    try {
      const res = await axios.post(
        `${backendUrl}/api/doctor-schedules`,
        { date, timeSlots },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      if (res.data.success) {
        toast.success("Schedule added");
        setDate("");
        setStart("");
        setEnd("");
        fetchSchedules();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to add schedule");
    }
  };

  const deleteSchedule = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/doctor-schedules/${id}`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      toast.success("Deleted schedule");
      fetchSchedules();
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  return (
    <div className="flex">
      <DoctorSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">My Schedule</h1>

        <form onSubmit={addSchedule} className="mb-8 flex gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border p-2 rounded"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Add
          </button>
        </form>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time Slots</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s._id}>
                <td className="p-2 border">{s.date}</td>
                <td className="p-2 border">
                  {s.timeSlots.map((slot, i) => (
                    <div key={i}>
                      {slot.start} - {slot.end}
                    </div>
                  ))}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => deleteSchedule(s._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">
                  No schedules yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorSchedule;
