import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StaffContext } from "../../context/StaffContext";
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  FileText, 
  LogOut,
  Menu,
  X,
  User,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

const StaffDashboard = () => {
  const { staff, sToken, logoutStaff, backendUrl } = useContext(StaffContext);
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("appointments");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    if (!sToken) {
      navigate("/login");
    } else {
      fetchData();
    }
  }, [sToken, activeModule]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeModule === "appointments") {
        const res = await fetch(`${backendUrl}/api/staff/appointments`, {
          headers: { Authorization: `Bearer ${sToken}` },
        });
        const data = await res.json();
        if (data.success) setAppointments(data.appointments);
      } else if (activeModule === "patients") {
        const res = await fetch(`${backendUrl}/api/staff/patients`, {
          headers: { Authorization: `Bearer ${sToken}` },
        });
        const data = await res.json();
        if (data.success) setPatients(data.patients);
      } else if (activeModule === "treatments") {
        const res = await fetch(`${backendUrl}/api/staff/treatments`, {
          headers: { Authorization: `Bearer ${sToken}` },
        });
        const data = await res.json();
        if (data.success) setTreatments(data.treatments);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async (patientId) => {
    try {
      const res = await fetch(`${backendUrl}/api/staff/patients/${patientId}/history`, {
        headers: { Authorization: `Bearer ${sToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPatient(data.patient);
        setPatientHistory(data.appointments);
        setShowHistoryModal(true);
      }
    } catch (err) {
      console.error("Error fetching patient history:", err);
    }
  };

  const handleLogout = () => {
    logoutStaff();
    navigate("/login");
  };

  const modules = [
    { id: "appointments", name: "Appointments", icon: Calendar, color: "bg-blue-500" },
    { id: "patients", name: "Patients", icon: Users, color: "bg-green-500" },
    { id: "treatments", name: "Treatments", icon: ClipboardList, color: "bg-purple-500" },
    { id: "reports", name: "Reports", icon: FileText, color: "bg-orange-500" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-gray-800">Staff Portal</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {sidebarOpen && staff && (
          <div className="p-4 border-b bg-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                {staff.name?.charAt(0) || "S"}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{staff.name || "Staff Member"}</p>
                <p className="text-sm text-gray-600">Staff</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                  activeModule === module.id
                    ? `${module.color} text-white`
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{module.name}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white shadow-sm p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {modules.find((m) => m.id === activeModule)?.name || "Dashboard"}
          </h2>
          <p className="text-gray-600 mt-1">
            Welcome back, {staff?.name || "Staff Member"}!
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {/* Appointments Module */}
              {activeModule === "appointments" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-4">Appointments</h3>
                  {appointments.length === 0 ? (
                    <p className="text-gray-500">No appointments found</p>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((apt) => (
                        <div
                          key={apt._id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-lg">{apt.user?.name || 'Unknown Patient'}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {apt.status || 'pending'}
                                </span>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                <p className="flex items-center gap-2">
                                  <User size={16} />
                                  <span>Doctor: {apt.doctor?.name || 'Not assigned'}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <Calendar size={16} />
                                  <span>{apt.date ? new Date(apt.date).toLocaleDateString() : 'No date'}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <Clock size={16} />
                                  <span>{apt.time || 'No time'}</span>
                                </p>
                                {apt.service && (
                                  <p className="flex items-center gap-2 font-medium text-purple-600">
                                    <ClipboardList size={16} />
                                    <span>Service: {apt.service?.name || 'Not specified'}</span>
                                  </p>
                                )}
                              </div>
                              
                              {apt.notes && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                  <strong>Notes:</strong> {apt.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Patients Module */}
              {activeModule === "patients" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-4">Patient Records</h3>
                  {patients.length === 0 ? (
                    <p className="text-gray-500">No patient records found</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {patients.map((patient) => (
                        <div
                          key={patient._id}
                          onClick={() => fetchPatientHistory(patient._id)}
                          className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer hover:border-purple-500"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <User size={20} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{patient.name}</p>
                              <p className="text-sm text-gray-600">{patient.email}</p>
                            </div>
                          </div>
                          {patient.phone && (
                            <p className="text-sm text-gray-500">Phone: {patient.phone}</p>
                          )}
                          <p className="text-xs text-purple-600 mt-2">Click to view history</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Treatments Module */}
              {activeModule === "treatments" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-4">Treatment Plans</h3>
                  {treatments.length === 0 ? (
                    <p className="text-gray-500">No treatments available</p>
                  ) : (
                    <div className="space-y-3">
                      {treatments.map((treatment) => (
                        <div
                          key={treatment._id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition"
                        >
                          <p className="font-semibold">{treatment.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{treatment.description}</p>
                          <p className="text-sm font-medium text-purple-600 mt-2">
                          ₱{treatment.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reports Module */}
              {activeModule === "reports" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-4">Reports & Analytics</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-600 font-medium">Total Appointments</p>
                      <p className="text-3xl font-bold text-blue-700 mt-2">{appointments.length}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-medium">Total Patients</p>
                      <p className="text-3xl font-bold text-green-700 mt-2">{patients.length}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-purple-600 font-medium">Treatments</p>
                      <p className="text-3xl font-bold text-purple-700 mt-2">{treatments.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Patient History Modal */}
      {showHistoryModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.name}</h2>
                <p className="text-gray-600">{selectedPatient.email}</p>
                {selectedPatient.phone && <p className="text-gray-600">Phone: {selectedPatient.phone}</p>}
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Appointment History</h3>
              {patientHistory.length === 0 ? (
                <p className="text-gray-500">No appointment history found</p>
              ) : (
                <div className="space-y-3">
                  {patientHistory.map((apt) => (
                    <div key={apt._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">
                              {apt.date ? new Date(apt.date).toLocaleDateString() : 'No date'} at {apt.time || 'No time'}
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                              apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {apt.status || 'pending'}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600">
                            Doctor: {apt.doctor?.name || 'Not assigned'}
                          </p>
                          
                          {apt.service && (
                            <p className="text-sm font-medium text-purple-600 mt-1">
                            Service: {apt.service?.name || 'Not specified'}
                          </p>
                          )}
                          
                          {apt.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <strong>Notes:</strong> {apt.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;