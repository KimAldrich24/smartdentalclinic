import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from "../../context/DoctorContext";
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { Calendar, Clock, Users, LogOut } from 'lucide-react';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { doctor, dToken, logoutDoctor } = useContext(DoctorContext);
  const { backendUrl } = useContext(AdminContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]); // schedule array

  const handleLogout = () => {
    logoutDoctor();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    if (!dToken) return;
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/appointments/doctor/my-appointments`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const data = await res.json();

      if (data.success) {
        // Normalize time field to string
        const normalizedAppointments = data.appointments.map(appt => ({
          ...appt,
          time: appt.time
            ? typeof appt.time === 'object'
              ? `${appt.time.start || ''} - ${appt.time.end || ''}`
              : appt.time
            : 'N/A',
          status: appt.status || 'pending',
        }));
        setAppointments(normalizedAppointments);
      } else {
        toast.error(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedule
  const fetchSchedule = async () => {
    if (!dToken) return;
    try {
      const res = await fetch(`${backendUrl}/api/doctors/my-data`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const data = await res.json();

      if (data.success) {
        let scheduleArray = [];

        if (Array.isArray(data.schedule)) {
          scheduleArray = data.schedule.map(s => ({
            _id: s._id,
            date: s.date,
            slots: Array.isArray(s.slots) ? s.slots : [],
          }));
        } else if (typeof data.schedule === 'object' && data.schedule !== null) {
          scheduleArray = Object.entries(data.schedule).map(([date, slots]) => ({
            date,
            slots: Array.isArray(slots) ? slots : [],
          }));
        }

        setSchedule(scheduleArray);
      } else {
        toast.error(data.message || 'Failed to fetch schedule');
        setSchedule([]);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      toast.error('Error fetching schedule');
      setSchedule([]);
    }
  };

  useEffect(() => {
    if (dToken) {
      fetchAppointments();
      fetchSchedule();
    }
  }, [dToken]);

  return (
    <div className="min-h-[100dvh] max-w-6xl mx-auto px-4 py-6 md:p-6">
      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-5 md:p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">👨‍⚕️ Doctor Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate("/doctor-change-password")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md w-full md:w-auto"
            >
              🔒 Change Password
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-4">
            {doctor?.image ? (
              <img
                src={`${backendUrl}/uploads/doctors/${doctor.image}`}
                alt={doctor.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-3xl">
                👨‍⚕️
              </div>
            )}

            <div>
              <h2 className="text-xl md:text-2xl font-semibold">{doctor?.name || 'Doctor'}</h2>
              <p className="text-green-100">{doctor?.degree}</p>
              <p className="text-green-100">{doctor?.speciality}</p>
              <p className="text-sm text-green-100 mt-1">📧 {doctor?.email}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/doctor-schedule')}
            className="bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 font-semibold shadow-md flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Calendar size={20} /> Manage Schedule & Services
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard icon={<Users size={24} />} title="Total Appointments" value={appointments.length} color="blue" />
        <StatCard icon={<Clock size={24} />} title="Scheduled" value={appointments.filter(a => a.status === 'booked').length} color="green" />
        <StatCard icon={<Calendar size={24} />} title="Completed" value={appointments.filter(a => a.status === 'completed').length} color="purple" />
      </div>

      {/* ================= APPOINTMENTS ================= */}
      <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-5 border-b pb-2">📅 My Appointments</h2>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No appointments scheduled yet.</p>
            <button
              onClick={() => navigate('/doctor-schedule')}
              className="mt-5 bg-blue-500 text-white px-6 py-2 rounded-lg"
            >
              Set Up Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {appointments.map(appt => (
              <div key={appt._id} className="border rounded-xl p-4 md:p-5 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="font-semibold text-gray-800">{appt.user?.name || 'Patient'}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appt.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : appt.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📧 {appt.user?.email}</p>
                      <p>📞 {appt.user?.phone || 'No phone'}</p>
                      <p>🦷 {appt.service?.name}</p>
                      <p>📅 {appt.date}</p>
                      <p>🕐 {appt.time}</p>
                      <p>💰 ₱{appt.finalPrice}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 md:text-right">
                    Booked: {new Date(appt.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= SCHEDULE ================= */}
      <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 mt-8">
        <h2 className="text-xl md:text-2xl font-bold mb-5 border-b pb-2">📅 My Schedule (Set by Admin)</h2>

        {schedule.length === 0 ? (
          <p className="text-gray-500 text-center py-5">No schedule set yet. Please contact admin.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.map(s => (
              <div key={s.date} className="border rounded-lg p-3">
                <h3 className="font-semibold mb-2">{s.date}</h3>
                {s.slots.length === 0 ? (
                  <p className="text-gray-500">No slots</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {s.slots.map((slot, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {typeof slot === 'object' ? `${slot.start || ''} - ${slot.end || ''}` : slot}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= STAT CARD ================= */
const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: "border-blue-500 bg-blue-100 text-blue-600",
    green: "border-green-500 bg-green-100 text-green-600",
    purple: "border-purple-500 bg-purple-100 text-purple-600",
  };

  return (
    <div className={`bg-white rounded-xl shadow p-4 border-l-4 ${colors[color].split(" ")[0]}`}>
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${colors[color].split(" ").slice(1).join(" ")}`}>{icon}</div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
