import React, { useState, useEffect } from "react";
import axios from "axios";
import { assets } from "../assets/assets.js";
import { Link } from "react-router-dom";
import TermsModal from "./TermsModal.jsx";
import PrivacyPolicy from "../pages/PrivacyPolicy";

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [contact, setContact] = useState({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/contact`);
        setContact(data || {});
      } catch (error) {
        console.error("Failed to fetch contact info");
      }
    };
    fetchContact();
  }, [backendUrl]);

  // ✅ Split phone numbers safely (comma → new line)
  const phoneNumbers = contact.phone
    ? contact.phone.split(",").map((num) => num.trim())
    : [];

  return (
    <>
      <div className="bg-gray-100 px-6 md:px-16 py-10 mt-40">
        <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr] text-sm">
          {/* Left Section */}
          <div>
            <img src={assets.logo2} alt="logo" className="mb-4 w-32" />
            <p className="w-full md:w-2/3 text-gray-600 leading-6">
              Smart Dental Clinic provides quality, compassionate, and modern dental care.
              Our goal is to create healthy, confident smiles through personalized and
              comfortable treatments.
            </p>


          </div>

          {/* Center Section */}
          <div>
            <p className="font-semibold text-gray-800 mb-3">COMPANY</p>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/" className="hover:text-secondary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-secondary">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-secondary">
                  Contact us
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setShowTerms(true)}
                  className="hover:text-secondary bg-transparent border-none"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="hover:text-secondary bg-transparent border-none"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Right Section (Dynamic Contact) */}
          <div>
            <p className="font-semibold text-gray-800 mb-3">GET IN TOUCH</p>
            <ul className="space-y-2 text-gray-600">
              {/* ✅ Display each number in its own line */}
              {phoneNumbers.length > 0 ? (
                phoneNumbers.map((num, index) => <li key={index}>{num}</li>)
              ) : (
                <li>+000 000 000 000</li>
              )}
              <li>{contact.email || "your@email.com"}</li>
              <li>{contact.address || "123 Dental St., City"}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-4 text-center text-gray-500 text-sm">
          <p>© 2025 Smart Dental Clinic - All rights reserved.</p>
        </div>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </>
  );
};

export default Footer;
