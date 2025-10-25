import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from "../../context/DoctorContext";
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { Calendar, Clock, Users, LogOut } from 'lucide-react';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { doctor, dToken, logoutDoctor } = useContext(DoctorContext); // ✅ Use logoutDoctor
  const { backendUrl } = useContext(AdminContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Logout function using context's logoutDoctor
  const handleLogout = () => {
    logoutDoctor(); // Clear token and doctor data
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Fetch doctor's appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      console.log("🔍 Fetching appointments for doctor:", doctor?.id || doctor?._id);
      console.log("🔍 Using token:", dToken?.substring(0, 20) + "...");
      
      const res = await fetch(`${backendUrl}/api/appointments/doctor/my-appointments`, {
        headers: {
          Authorization: `Bearer ${dToken}`,
        },
      });
      const data = await res.json();

      console.log("📥 Appointments response:", data);

      if (data.success) {
        setAppointments(data.appointments);
        console.log('✅ Appointments loaded:', data.appointments.length);
        console.log('📋 First appointment:', data.appointments[0]);
      } else {
        toast.error(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dToken) {
      fetchAppointments();
    }
  }, [dToken]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Doctor Profile Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
        {/* Header with Title and Logout */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">👨‍⚕️ Doctor Dashboard</h1>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2 shadow-md"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Doctor Profile Info and Actions */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Doctor Avatar */}
            {doctor?.image ? (
              <img
                src={`${backendUrl}/uploads/doctors/${doctor.image}`}
                alt={doctor.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl">
                👨‍⚕️
              </div>
            )}
            
            {/* Doctor Info */}
            <div>
              <h2 className="text-2xl font-semibold">{doctor?.name || 'Doctor'}</h2>
              <p className="text-green-100">{doctor?.degree || 'Medical Professional'}</p>
              <p className="text-green-100">{doctor?.speciality || doctor?.degree || 'General Practice'}</p>
              <p className="text-sm text-green-100 mt-1">📧 {doctor?.email}</p>
            </div>
          </div>
          
          {/* Manage Schedule Button */}
          <button
            onClick={() => navigate('/doctor-schedule')}
            className="bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition font-semibold shadow-md flex items-center gap-2"
          >
            <Calendar size={20} />
            Manage Schedule & Services
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Scheduled</p>
              <p className="text-2xl font-bold text-gray-800">
                {appointments.filter(a => a.status === 'booked').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-800">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
          📅 My Appointments
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No appointments scheduled yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Make sure to set up your schedule and services to start receiving appointments!
            </p>
            <button
              onClick={() => navigate('/doctor-schedule')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Set Up Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold text-gray-800">
                        {appointment.user?.name || 'Patient'}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : appointment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {appointment.status === 'cancelled'
                          ? 'Cancelled'
                          : appointment.status === 'completed'
                          ? 'Completed'
                          : 'Scheduled'}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📧 {appointment.user?.email}</p>
                      <p>📞 {appointment.user?.phone || 'No phone'}</p>
                      <p>🦷 <span className="font-medium">{appointment.service?.name}</span></p>
                      <p>📅 {appointment.date}</p>
                      <p>🕐 {appointment.time}</p>
                      <p>💰 ₱{appointment.finalPrice}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Booked: {new Date(appointment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;