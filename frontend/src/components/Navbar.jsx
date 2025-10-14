import React, { useState, useEffect, useRef, useContext } from "react";
import { assets } from "../assets/assets.js";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);

  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ safer check: must have both token + user
  const isLoggedIn = Boolean(token && user);

  // Auto-close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setShowMenu(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout function
  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setShowMenu(false);
    navigate("/login");
  };

  return (
    <div className="w-full flex items-center justify-between text-sm py-4 mb-5 border-b border-gray-300 relative px-4 md:px-10 z-30">
      {/* Logo */}
      <img
        className="w-24 sm:w-28 md:w-32 cursor-pointer"
        src={assets.logo2}
        alt="logo"
        onClick={() => navigate("/")}
      />

      {/* Nav Links (Desktop) */}
      <ul className="hidden md:flex items-center gap-6 font-medium text-gray-700">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                : "hover:text-blue-500"
            }
          >
            HOME
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/doctors"
            className={({ isActive }) =>
              isActive ? "text-blue-600" : "hover:text-blue-500"
            }
          >
            ALL DOCTORS
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "text-blue-600" : "hover:text-blue-500"
            }
          >
            ABOUT
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "text-blue-600" : "hover:text-blue-500"
            }
          >
            CONTACT
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/faq"
            className={({ isActive }) =>
              isActive ? "text-blue-600" : "hover:text-blue-500"
            }
          >
            FAQ
          </NavLink>
        </li>
      </ul>

      {/* Right Side */}
      <div className="flex items-center gap-4 relative">
        {isLoggedIn ? (
          <div
            className="flex items-center gap-2 cursor-pointer relative"
            onClick={() => setShowDropdown(!showDropdown)}
            ref={dropdownRef}
          >
            <img
              className="w-8 h-8 rounded-full object-cover"
              src={user?.image || "/default-avatar.png"}
              alt="profile"
            />
            <img className="w-2.5" src={assets.dropdown_icon} alt="dropdown" />

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-10 right-0 text-base font-medium text-gray-600 z-50">
                <div className="min-w-48 bg-white rounded shadow-md flex flex-col gap-4 p-4">
                  <p
                    onClick={() => {
                      navigate("/my-profile");
                      setShowDropdown(false);
                    }}
                    className="hover:text-black cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => {
                      navigate("/my-appointments");
                      setShowDropdown(false);
                    }}
                    className="hover:text-black cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <p
                    onClick={handleLogout}
                    className="hover:text-black cursor-pointer"
                  >
                    Logout
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition"
          >
            Create Account / Login
          </button>
        )}

        {/* Hamburger Menu (Mobile) */}
        <button
          className="md:hidden flex flex-col gap-1"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="w-6 h-0.5 bg-gray-700"></span>
          <span className="w-6 h-0.5 bg-gray-700"></span>
          <span className="w-6 h-0.5 bg-gray-700"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md md:hidden z-40">
          <ul className="flex flex-col items-start gap-2 p-5 font-medium text-gray-700">
            <li className="w-full">
              <NavLink
                to="/"
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  isActive
                    ? "block w-full px-3 py-2 rounded-md bg-blue-600 text-white"
                    : "block w-full px-3 py-2 rounded-md hover:bg-blue-500 hover:text-white transition"
                }
              >
                HOME
              </NavLink>
            </li>
            <li className="w-full">
              <NavLink
                to="/doctors"
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  isActive
                    ? "block w-full px-3 py-2 rounded-md bg-blue-600 text-white"
                    : "block w-full px-3 py-2 rounded-md hover:bg-blue-500 hover:text-white transition"
                }
              >
                ALL DOCTORS
              </NavLink>
            </li>
            <li className="w-full">
              <NavLink
                to="/about"
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  isActive
                    ? "block w-full px-3 py-2 rounded-md bg-blue-600 text-white"
                    : "block w-full px-3 py-2 rounded-md hover:bg-blue-500 hover:text-white transition"
                }
              >
                ABOUT
              </NavLink>
            </li>
            <li className="w-full">
              <NavLink
                to="/contact"
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  isActive
                    ? "block w-full px-3 py-2 rounded-md bg-blue-600 text-white"
                    : "block w-full px-3 py-2 rounded-md hover:bg-blue-500 hover:text-white transition"
                }
              >
                CONTACT
              </NavLink>
            </li>
            <li className="w-full">
              <NavLink
                to="/faq"
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  isActive
                    ? "block w-full px-3 py-2 rounded-md bg-blue-600 text-white"
                    : "block w-full px-3 py-2 rounded-md hover:bg-blue-500 hover:text-white transition"
                }
              >
                FAQ
              </NavLink>
            </li>
            {!isLoggedIn && (
              <li className="w-full">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/login");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition"
                >
                  Create Account / Login
                </button>
              </li>
            )}
            {isLoggedIn && (
              <li className="w-full flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/my-profile");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/my-appointments");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  My Appointments
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
