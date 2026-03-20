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
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/dashboard"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.home_icon} alt="Dashboard" />
        <p className="text-sm md:text-base">Dashboard</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/all-appointment"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.appointment_icon} alt="Appointments" />
        <p className="text-sm md:text-base">Appointments</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/doctor-list"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.people_icon} alt="Doctors List" />
        <p className="text-sm md:text-base">Dentist List</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/services"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.add_icon} alt="Services" />
        <p className="text-sm md:text-base">Services Maintenance</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/patients"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.appointment_icon} alt="Patients" />
        <p className="text-sm md:text-base">Patient Account Maintenance</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/promotions"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.add_icon} alt="Promotions" />
        <p className="text-sm md:text-base">Promotion Maintenance</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/patient-history"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.appointment_icon} alt="Patient History" />
        <p className="text-sm md:text-base">Patient History</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/faqs"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.add_icon} alt="FAQ" />
        <p className="text-sm md:text-base">FAQ Maintenance</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/prescriptions"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.prescription_icon || assets.add_icon} alt="" />
        <p className="text-sm md:text-base">Prescription Maintenance</p>
      </NavLink>

      {/* Admin-Only Links */}
      {userRole === "admin" && (
        <>
          {/* <NavLink
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/add-doctor"
          >
            <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.add_icon} alt="Add Doctor" />
            <p className="text-sm md:text-base">Add Dentist</p>
          </NavLink> */}

          <NavLink
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/admin/schedules"
          >
            <img
              className="w-5 h-5 md:w-auto md:h-auto"
              src={assets.appointment_icon}
              alt="Doctor Schedule"
            />
            <p className="text-sm md:text-base">Dentist Schedule</p>
          </NavLink>


          <NavLink
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/user-maintenance"
          >
            <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.people_icon} alt="User Maintenance" />
            <p className="text-sm md:text-base">User Maintenance</p>
          </NavLink>

          <NavLink
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/suppliers"
          >
            <img
              className="w-5 h-5 md:w-auto md:h-auto"
              src={assets.add_icon}
              alt="suppliers"
            />
            <p className="text-sm md:text-base">Suppliers</p>
          </NavLink>

          <NavLink
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/equipment"
          >
            <img
              className="w-5 h-5 md:w-auto md:h-auto"
              src={assets.add_icon}
              alt="Equipment"
            />
            <p className="text-sm md:text-base">Equipment Maintenance</p>
          </NavLink>

          {/* <NavLink
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/job-applications"
          >
            <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.job_icon || assets.add_icon} alt="Job Applications" />
            <p className="text-sm md:text-base">Job Applications</p>
          </NavLink> */}
        </>
      )}

      {/* Remaining common links */}
      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/contact"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.contact_icon || assets.add_icon} alt="Contact" />
        <p className="text-sm md:text-base">Contact Info Maintenance</p>
      </NavLink>

      {/* Old links commented out as backup */}
      {/*
      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${
            isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/sales-report"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.report_icon || assets.add_icon} alt="Sales Report" />
        <p className="text-sm md:text-base">Sales Report</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${
            isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/pending-users"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.pending_icon || assets.add_icon} alt="Pending Users" />
        <p className="text-sm md:text-base">Pending Users</p>
      </NavLink>
      */}

      {/* <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/staff-management"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.pending_icon || assets.add_icon} alt="Staff Management" />
        <p className="text-sm md:text-base">👥 Receptionist</p>
      </NavLink> */}

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/admin/payment-proofs"
      >
        <img className="w-5 h-5 md:w-auto md:h-auto" src={assets.pending_icon || assets.add_icon} alt="Payment Proofs" />
        <p className="text-sm md:text-base">💳 Payment Proofs</p>
      </NavLink>

      <NavLink
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-2 py-2 px-2 md:py-3.5 md:px-9 cursor-pointer ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
          }`
        }
        to="/admin/reviews"
      >
        <img
          className="w-5 h-5 md:w-auto md:h-auto"
          src={assets.review_icon || assets.add_icon}
          alt="Reviews"
        />
        <p className="text-sm md:text-base">⭐ Reviews</p>
      </NavLink>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger stays always hamburger */}
      <div className="md:hidden fixed top-2 left-2 z-50">
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 w-36 h-[calc(100vh-4rem)] bg-white border-r z-50 shadow-lg overflow-y-auto rounded-r-md">
          {/* Close Button Inside Sidebar */}
          <div className="flex justify-end p-2 border-b">
            <button onClick={() => setMobileOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="p-1">{links}</div>
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
