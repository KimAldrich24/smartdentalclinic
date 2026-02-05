// App.jsx
import React, { useContext, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context Providers
import AdminContextProvider, { AdminContext } from "./context/AdminContext";
import DoctorContextProvider, { DoctorContext } from "./context/DoctorContext";
import { StaffContextProvider, StaffContext } from "./context/StaffContext";
import { AuthContext } from "./context/AuthContext";

// Shared Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Admin Pages
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import Services from "./pages/Admin/ServicesMaintenance";
import Patients from "./pages/Admin/Patients";
import PromotionManagement from "./pages/Admin/PromotionManagement";
import PatientsList from "./pages/Admin/PatientsList";
import PatientHistory from "./pages/Admin/PatientHistory";
import AdminFaq from "./pages/Admin/AdminFaq";
import AdminPrescriptions from "./pages/Admin/AdminPrescriptions";
import UserMaintenance from "./pages/Admin/UserMaintenance";
import AdminProfile from "./pages/Admin/AdminProfile";
import AdminContact from "./pages/Admin/AdminContact";
import AdminJobApplications from "./pages/Admin/AdminJobApplications";
import AdminAppointments from "./pages/Admin/AdminAppointments";
import AdminSalesReport from "./pages/Admin/AdminSalesReport";
import AdminAuditTrail from "./pages/Admin/AdminAuditTrail";
import AdminEquipment from "./pages/Admin/AdminEquipment";
import PendingUsers from "./pages/Admin/PendingUsers";
import StaffManagement from "./pages/Admin/StaffManagement";
import AdminRegister from "./pages/Admin/AdminRegister";
import AdminPaymentProofs from "./pages/Admin/AdminPaymentProofs";
import AdminSchedule from "./pages/Admin/AdminSchedule";

// Doctor Pages
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorSchedule from "./pages/Doctor/DoctorSchedule";
import DoctorChangePassword from "./pages/Doctor/DoctorChangePassword";

// Staff Pages
import StaffDashboard from "./pages/Staff/StaffDashboard";

// Public Pages
import Login from "./pages/Login";

const AppContent = () => {
  const { aToken, userRole } = useContext(AdminContext);
  const { dToken, doctor } = useContext(DoctorContext);
  const { sToken, staff } = useContext(StaffContext);
  const { user, token } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(false); // MOBILE SIDEBAR STATE

  // Wait until role is decoded
  if (aToken && userRole === null) {
    return <div className="p-6 text-center text-gray-600">Loading admin dashboard...</div>;
  }

  // ✅ ADMIN ROUTES
if (aToken && userRole === "admin") {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="flex-shrink-0">
        {/* Desktop sidebar */}
        <div className="hidden md:block w-64 h-screen border-r bg-white overflow-y-auto">
          <Sidebar />
        </div>

        {/* Mobile sidebar (SLIMMER) */}
        <div
          className={`fixed inset-y-0 left-0 w-52 bg-white z-50 transform transition-transform duration-300 md:hidden overflow-y-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar closeSidebar={() => setSidebarOpen(false)} isMobile />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar onBurgerClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/all-appointment" element={<AllAppointments />} />
              <Route path="/add-doctor" element={<AddDoctor />} />
              <Route path="/doctor-list" element={<DoctorsList />} />
              <Route path="/services" element={<Services />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/promotions" element={<PromotionManagement />} />
              <Route path="/patient-history" element={<PatientsList />} />
              <Route path="/patient-history/:id" element={<PatientHistory />} />
              <Route path="/faqs" element={<AdminFaq />} />
              <Route path="/profile" element={<AdminProfile />} />
              <Route path="/contact" element={<AdminContact />} />
              <Route path="/prescriptions" element={<AdminPrescriptions />} />
              <Route path="/appointments" element={<AdminAppointments />} />
              <Route path="/sales-report" element={<AdminSalesReport />} />
              <Route path="/audit-trail" element={<AdminAuditTrail />} />
              <Route path="/equipment" element={<AdminEquipment />} />
              <Route path="/pending-users" element={<PendingUsers />} />
              <Route path="/user-maintenance" element={<UserMaintenance />} />
              <Route path="/job-applications" element={<AdminJobApplications />} />
              <Route path="/staff-management" element={<StaffManagement />} />
              <Route path="/admin/payment-proofs" element={<AdminPaymentProofs />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin/schedules" element={<AdminSchedule />} />

            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // ✅ DOCTOR ROUTES
  if (dToken && doctor) {
    return (
      <Routes>
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor-schedule" element={<DoctorSchedule />} />
        <Route path="/doctor-change-password" element={<DoctorChangePassword />} />
        <Route path="*" element={<Navigate to="/doctor-dashboard" replace />} />
      </Routes>
    );
  }

  // ✅ STAFF ROUTES
  if (sToken && staff) {
    return (
      <Routes>
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="*" element={<Navigate to="/staff-dashboard" replace />} />
      </Routes>
    );
  }

  // ✅ PUBLIC ROUTES
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-register" element={<AdminRegister />} />
      <Route path="/staff-login" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AdminContextProvider>
      <DoctorContextProvider>
        <StaffContextProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          <AppContent />
        </StaffContextProvider>
      </DoctorContextProvider>
    </AdminContextProvider>
  );
};

export default App;
