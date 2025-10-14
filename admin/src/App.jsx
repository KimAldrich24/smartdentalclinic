import React, { useContext } from "react";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate } from "react-router-dom";

// Admin imports
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { AdminContext } from "./context/AdminContext";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import Services from "./pages/Admin/ServicesMaintenance";
import Patients from "./pages/Admin/Patients";
import PromotionManagement from "./pages/Admin/PromotionManagement";
import PatientHistory from "./pages/Admin/PatientHistory";
import PatientsList from "./pages/Admin/PatientsList";
import AdminFaq from "./pages/Admin/AdminFaq.jsx";
import AdminPrescriptions from "./pages/Admin/AdminPrescriptions";
import UserMaintenance from "./pages/Admin/UserMaintenance.jsx";
import AdminProfile from "./pages/Admin/AdminProfile.jsx";
import AdminContact from "./pages/Admin/AdminContact.jsx";
import AdminJobApplications from "./pages/Admin/AdminJobApplications.jsx";
import AdminAppointments from "./pages/Admin/AdminAppointments.jsx";

// Doctor imports
import DoctorContextProvider from "./context/DoctorContext";
import DoctorLogin from "./pages/Doctor/DoctorLogin.jsx";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard.jsx";
import DoctorSchedule from "./pages/Doctor/DoctorSchedule.jsx";


const App = () => {
  const { aToken } = useContext(AdminContext);

  return (
    <DoctorContextProvider>
      <ToastContainer />
      {aToken ? (
        // 🟢 Admin Layout
        <div>
          <Navbar />
          <div className="flex items-start">
            <Sidebar />
            <div className="flex-1 p-4">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/admin-dashboard" element={<Dashboard />} />
                <Route path="/all-appointment" element={<AllAppointments />} />
                <Route path="/add-doctor" element={<AddDoctor />} />
                <Route path="/doctor-list" element={<DoctorsList />} />
                <Route path="/admin/services" element={<Services />} />
                <Route path="/admin/patients" element={<Patients />} />
                <Route path="/admin/promotions" element={<PromotionManagement />} />
                <Route path="/admin/patient-history" element={<PatientsList />} />
                <Route path="/admin/patient-history/:id" element={<PatientHistory />} />
                <Route path="/admin/faqs" element={<AdminFaq />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/admin/contact" element={<AdminContact />} />
                <Route path="/admin/user-maintenance" element={<UserMaintenance />} />
                <Route path="/admin/prescriptions" element={<AdminPrescriptions />} />
                <Route path="/admin/job-applications" element={<AdminJobApplications />} />
                <Route path="/admin/appointments" element={<AdminAppointments />} />
                {/* Redirect unknown admin routes to dashboard */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        // 🟢 Public + Doctor Routes
        <Routes>
          <Route path="/" element={<Login />} /> {/* Public login page */}
          <Route path="/doctor-login" element={<DoctorLogin />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-schedule" element={<DoctorSchedule />} />
          {/* Redirect unknown public routes to login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </DoctorContextProvider>
  );
};

export default App;
