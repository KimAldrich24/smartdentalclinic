import React, { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, X } from "lucide-react";

const Sidebar = () => {
  const { aToken, userRole } = useContext(AdminContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!aToken) return null;

  // Close mobile sidebar when a link is clicked
  const handleLinkClick = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  const links = (
    <>
      {/* Common Links for Admin & Staff */}
      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/dashboard"
      >
        <img src={assets.home_icon} alt="Dashboard" />
        <p>Dashboard</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/all-appointment"
      >
        <img src={assets.appointment_icon} alt="Appointments" />
        <p>Appointments</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/doctor-list"
      >
        <img src={assets.people_icon} alt="Doctors List" />
        <p>Dentist List</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/services"
      >
        <img src={assets.add_icon} alt="Services" />
        <p>Services Maintenance</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/patients"
      >
        <img src={assets.appointment_icon} alt="Patients" />
        <p>Patient Account Maintenance</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/promotions"
      >
        <img src={assets.add_icon} alt="Promotions" />
        <p>Promotion Maintenance</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/patient-history"
      >
        <img src={assets.appointment_icon} alt="Patient History" />
        <p>Patient History</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/faqs"
      >
        <img src={assets.add_icon} alt="FAQ" />
        <p>FAQ Maintenance</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/prescriptions"
      >
        <img src={assets.prescription_icon || assets.add_icon} alt="" />
        <p>Prescription Maintenance</p>
      </NavLink>

      {/* Admin-Only Links */}
      {userRole === "admin" && (
        <>
          <NavLink
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/add-doctor"
          >
            <img src={assets.add_icon} alt="Add Doctor" />
            <p>Add Dentist</p>
          </NavLink>

          <NavLink
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/user-maintenance"
          >
            <img src={assets.people_icon} alt="User Maintenance" />
            <p>User Maintenance</p>
          </NavLink>

          <NavLink
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/job-applications"
          >
            <img src={assets.job_icon || assets.add_icon} alt="Job Applications" />
            <p>Job Applications</p>
          </NavLink>
        </>
      )}

      {/* Remaining common links */}
      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/contact"
      >
        <img src={assets.contact_icon || assets.add_icon} alt="Contact" />
        <p>Contact Info Maintenance</p>
      </NavLink>

      {/* Old links commented out as backup */}
      {/*
      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
            isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/sales-report"
      >
        <img src={assets.report_icon || assets.add_icon} alt="Sales Report" />
        <p>Sales Report</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
            isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/pending-users"
      >
        <img src={assets.pending_icon || assets.add_icon} alt="Pending Users" />
        <p>Pending Users</p>
      </NavLink>
      */}

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/staff-management"
      >
        <img src={assets.pending_icon || assets.add_icon} alt="Pending Users" />
        <p>👥 Staff Management</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/admin/payment-proofs"
      >
        <img src={assets.pending_icon || assets.add_icon} alt="Payment Proofs" />
        <p>💳 Payment Proofs</p>
      </NavLink>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-2 left-2 z-50">
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>



      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden absolute top-0 left-0 w-64 h-screen bg-white border-r z-50 shadow-lg overflow-y-auto">
          <div className="p-3">{links}</div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block min-h-screen bg-white border-r overflow-y-auto">
        <ul className="text-[#515151] mt-5">{links}</ul>
      </div>
    </>
  );
};

export default Sidebar;
