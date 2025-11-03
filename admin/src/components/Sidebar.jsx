import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  const { aToken, userRole } = useContext(AdminContext);

  if (!aToken) return null;

  return (
    <div className="min-h-screen bg-white border-r">
      <ul className="text-[#515151] mt-5">
        {/* Common Links for Admin & Staff */}
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/dashboard"
        >
          <img src={assets.home_icon} alt="Dashboard" />
          <p>Dashboard</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/all-appointment"
        >
          <img src={assets.appointment_icon} alt="Appointments" />
          <p>Appointments</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/doctor-list"
        >
          <img src={assets.people_icon} alt="Doctors List" />
          <p>Doctors List</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/services"
        >
          <img src={assets.add_icon} alt="Services" />
          <p>Services Maintenance</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/patients"
        >
          <img src={assets.appointment_icon} alt="Patients" />
          <p>Patient Account Maintenance</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/promotions"
        >
          <img src={assets.add_icon} alt="Promotions" />
          <p>Promotion Maintenance</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/patient-history"
        >
          <img src={assets.appointment_icon} alt="Patient History" />
          <p>Patient History</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/faqs"
        >
          <img src={assets.add_icon} alt="FAQ" />
          <p>FAQ Maintenance</p>
        </NavLink>

        <NavLink
  className={({ isActive }) =>
    `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
      isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
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
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/add-doctor"
            >
              <img src={assets.add_icon} alt="Add Doctor" />
              <p>Add Doctor</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/user-maintenance"
            >
              <img src={assets.people_icon} alt="User Maintenance" />
              <p>User Maintenance</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
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
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/contact"
        >
          <img src={assets.contact_icon || assets.add_icon} alt="Contact" />
          <p>Contact Info Maintenance</p>
        </NavLink>

        <NavLink
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
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/audit-trail"
        >
          <img src={assets.report_icon || assets.add_icon} alt="Audit Trail" />
          <p>Audit Trail</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/equipment"
        >
          <img src={assets.report_icon || assets.add_icon} alt="Equipment" />
          <p>Equipment Maintenance</p>
        </NavLink>

        {/* <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/pending-users"
        >
          <img src={assets.pending_icon || assets.add_icon} alt="Pending Users" />
          <p>Pending Users</p>
        </NavLink> */}

<NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/staff-management"
        >
          <img src={assets.pending_icon || assets.add_icon} alt="Pending Users" />
          <p>👥 Staff Management</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/admin/payment-proofs"
        >
          <img src={assets.pending_icon || assets.add_icon} alt="Payment Proofs" />
          <p>💳 Payment Proofs</p>
        </NavLink>
      </ul>
    </div>
  );
};

export default Sidebar;
