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
  Shield,
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

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!sToken) navigate("/login");
  }, [sToken]);

  useEffect(() => {
    if (backendUrl && sToken) fetchData();
    // eslint-disable-next-line
  }, [activeModule]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = "";
      if (activeModule === "appointments") url = "/api/staff/appointments";
      if (activeModule === "patients") url = "/api/staff/patients";
      if (activeModule === "treatments") url = "/api/staff/treatments";

      if (!url) return setLoading(false);

      const res = await fetch(`${backendUrl}${url}`, {
        headers: { Authorization: `Bearer ${sToken}` },
      });
      const data = await res.json();

      if (data.success) {
        if (activeModule === "appointments") setAppointments(data.appointments || []);
        if (activeModule === "patients") setPatients(data.patients || []);
        if (activeModule === "treatments") setTreatments(data.treatments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/staff/patients/${id}/history`, {
        headers: { Authorization: `Bearer ${sToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPatient(data.patient);
        setPatientHistory(data.appointments || []);
        setShowHistoryModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logoutStaff();
    navigate("/login");
  };

  const modules = [
    { id: "appointments", name: "Appointments", icon: Calendar },
    { id: "patients", name: "Patients", icon: Users },
    { id: "treatments", name: "Treatments", icon: ClipboardList },
    { id: "reports", name: "Reports", icon: FileText },
    { id: "changePassword", name: "Change Password", icon: Shield },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } hidden md:flex flex-col bg-white border-r transition-all`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          {sidebarOpen && <h1 className="font-bold text-lg">Staff Portal</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${
                  activeModule === m.id
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && m.name}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="p-4 flex items-center gap-3 text-red-600 hover:bg-red-50"
        >
          <LogOut />
          {sidebarOpen && "Logout"}
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        {/* MOBILE HEADER */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center border-b">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu />
          </button>
          <h2 className="font-bold">Staff Dashboard</h2>
        </div>

        {/* CONTENT */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {loading ? (
            <div className="text-center py-20">Loading...</div>
          ) : (
            <>
              {/* APPOINTMENTS */}
              {activeModule === "appointments" && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {appointments.map((apt) => (
                    <div key={apt._id} className="bg-white p-4 rounded-lg shadow">
                      <p className="font-semibold">{apt.user?.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(apt.date).toLocaleDateString()} • {apt.time}
                      </p>
                      <p className="text-sm text-purple-600 mt-1">
                        {apt.service?.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* PATIENTS */}
              {activeModule === "patients" && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {patients.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => fetchPatientHistory(p._id)}
                      className="bg-white p-4 rounded-lg shadow hover:border-purple-500 border cursor-pointer"
                    >
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-gray-600">{p.email}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TREATMENTS */}
              {activeModule === "treatments" && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {treatments.map((t) => (
                    <div key={t._id} className="bg-white p-4 rounded-lg shadow">
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm text-gray-600">{t.description}</p>
                      <p className="text-purple-600 font-medium">₱{t.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
