import React, { useContext, useState, useEffect, useRef } from "react";
import { AdminContext } from "../context/AdminContext";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User, Menu } from "lucide-react"; // ✅ Imported Menu icon

const Navbar = ({ onBurgerClick }) => { // ✅ Accept burger click prop
  const { aToken, setAToken, admin } = useContext(AdminContext);
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    setAToken("");
    localStorage.removeItem("aToken");
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center px-3 sm:px-10 py-3 border-b bg-white shadow-sm">

      {/* Left: Burger + Logo */}
      <div className="flex items-center gap-2">
        {/* Burger button: visible only on mobile */}
        <button
          className="md:hidden p-2 mr-2 rounded-md hover:bg-gray-100"
          onClick={onBurgerClick} // ✅ Trigger sidebar toggle
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <img
          className="w-24 sm:w-28 md:w-32 cursor-pointer"
          src={assets.logo2}
          alt="logo"
        />
        <p className="hidden sm:block border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          Admin
        </p>
      </div>

      {/* Admin Profile Section */}
      <div className="relative" ref={menuRef}>
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setOpenMenu(!openMenu)}
        >
          <img
            src={admin?.image || assets.defaultProfile}
            alt="profile"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border"
          />
          <div className="hidden sm:flex flex-col text-sm text-gray-700">
            <span className="font-semibold">{admin?.name || "Admin"}</span>
            <span className="text-gray-500 text-xs">Administrator</span>
          </div>
          <ChevronDown size={18} className="text-gray-600" />
        </div>

        {/* Dropdown menu */}
        {openMenu && (
          <div className="absolute right-0 mt-2 w-56 sm:w-44 bg-white border rounded-lg shadow-lg py-2 z-50">
            <button
              onClick={() => {
                navigate("/profile");
                setOpenMenu(false);
              }}
              className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <User size={16} /> Profile
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-100 w-full text-left"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
