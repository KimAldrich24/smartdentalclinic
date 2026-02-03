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
  Shield
} from "lucide-react";

const StaffDashboard = () => {
  const { staff, sToken, logoutStaff, backendUrl } = useContext(StaffContext);
  const navigate = useNavigate();

  const [activeModule, setActiveModule] = useState("appointments");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    else fetchData();
    // eslint-disable-next-line
  }, [activeModule, sToken]);

  const fetchData = async () => {
    if (!backendUrl || !sToken) return;
    setLoading(true);
    try {
      let url = "";
      if (activeModule === "appointments") url = "/api/staff/appointments";
      if (activeModule === "patients") url = "/api/staff/patients";
      if (activeModule === "treatments") url = "/api/staff/treatments";
      if (!url) return;

      const res = await fetch(`${backendUrl}${url}`, {
        headers: { Authorization: `Bearer ${sToken}` },
      });
      const data = await res.json();

      if (data.success) {
        if (activeModule === "appointments") setAppointments(data.appointments || []);
        if (activeModule === "patients") setPatients(data.patients || []);
        if (activeModule === "treatments") setTreatments(data.treatments || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async (id) => {
    const res = await fetch(`${backendUrl}/api/staff/patients/${id}/history`, {
      headers: { Authorization: `Bearer ${sToken}` },
    });
    const data = await res.json();
    if (data.success) {
      setSelectedPatient(data.patient);
      setPatientHistory(data.appointments || []);
      setShowHistoryModal(true);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword)
      return alert("Passwords do not match");

    const res = await fetch(`${backendUrl}/api/staff/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sToken}`,
      },
      body: JSON.stringify(passwordData),
    });
    const data = await res.json();
    if (data.success) {
      alert("Password changed");
      setActiveModule("appointments");
    } else alert(data.message);
  };

  const modules = [
    { id: "appointments", name: "Appointments", icon: Calendar },
    { id: "patients", name: "Patients", icon: Users },
    { id: "treatments", name: "Treatments", icon: ClipboardList },
    { id: "reports", name: "Reports", icon: FileText },
    { id: "changePassword", name: "Change Password", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">Staff Portal</h2>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>

        <div className="p-4 border-b">
          <p className="font-semibold">{staff?.name}</p>
          <p className="text-sm text-gray-500">Staff</p>
        </div>

        <nav className="p-4 space-y-2">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveModule(m.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition
                ${activeModule === m.id ? "bg-purple-500 text-white" : "hover:bg-gray-100"}`}
              >
                <Icon size={18} />
                {m.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => {
              logoutStaff();
              navigate("/login");
            }}
            className="flex items-center gap-2 text-red-600"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Mobile Header */}
        <header className="md:hidden bg-white p-4 shadow flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu />
          </button>
          <h1 className="font-bold">
            {modules.find(m => m.id === activeModule)?.name}
          </h1>
        </header>

        <div className="p-4 md:p-6">
          {loading && <p className="text-center">Loading...</p>}

          {/* Appointments */}
          {activeModule === "appointments" && (
            <div className="space-y-3">
              {appointments.map(a => (
                <div key={a._id} className="bg-white p-4 rounded-xl shadow">
                  <p className="font-semibold">{a.user?.name}</p>
                  <p className="text-sm text-gray-600 flex gap-2">
                    <Calendar size={14}/> {new Date(a.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 flex gap-2">
                    <Clock size={14}/> {a.time}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Patients */}
          {activeModule === "patients" && (
            <div className="grid sm:grid-cols-2 gap-4">
              {patients.map(p => (
                <div
                  key={p._id}
                  onClick={() => fetchPatientHistory(p._id)}
                  className="bg-white p-4 rounded-xl shadow cursor-pointer"
                >
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.email}</p>
                </div>
              ))}
            </div>
          )}

          {/* Treatments */}
          {activeModule === "treatments" && (
            <div className="space-y-3">
              {treatments.map(t => (
                <div key={t._id} className="bg-white p-4 rounded-xl shadow">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-gray-600">₱{t.price}</p>
                </div>
              ))}
            </div>
          )}

          {/* Change Password */}
          {activeModule === "changePassword" && (
            <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-3">
              <input
                type="password"
                placeholder="Current password"
                className="w-full border p-2 rounded"
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <input
                type="password"
                placeholder="New password"
                className="w-full border p-2 rounded"
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full border p-2 rounded"
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              <button
                onClick={handleChangePassword}
                className="w-full bg-purple-500 text-white py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Patient History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">{selectedPatient?.name}</h3>
              <button onClick={() => setShowHistoryModal(false)}>
                <X />
              </button>
            </div>
            {patientHistory.map(h => (
              <div key={h._id} className="border rounded p-3 mb-2">
                <p className="text-sm">{new Date(h.date).toLocaleDateString()} • {h.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
