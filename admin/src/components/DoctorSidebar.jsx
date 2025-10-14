import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { Calendar, Home, LogOut } from "lucide-react";

const DoctorSidebar = () => {
  const { logoutDoctor } = useContext(DoctorContext);

  return (
    <div className="w-64 h-screen bg-blue-900 text-white p-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-8">Doctor Panel</h2>
      <nav className="flex flex-col gap-4">
        <Link to="/doctor-dashboard" className="flex items-center gap-2 hover:text-blue-300">
          <Home size={18} /> Dashboard
        </Link>
        <Link to="/doctor-schedule" className="flex items-center gap-2 hover:text-blue-300">
          <Calendar size={18} /> Schedule
        </Link>
        <button
          onClick={logoutDoctor}
          className="mt-auto flex items-center gap-2 text-red-400 hover:text-red-600"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>
    </div>
  );
};

export default DoctorSidebar;
