import React, { useEffect, useState } from "react";
import axios from "axios";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const [contact, setContact] = useState({
    phone: "",
    email: "",
    address: "",
    active: true, // ✅ hiring toggle
    businessHours: "", // ✅ new field
  });

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Fetch contact info from backend
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/contact`);
        setContact({
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          active: data.active ?? true,
          businessHours: data.businessHours || "Not specified", // ✅ added
        });
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      }
    };
    fetchContact();
  }, [backendUrl]);

  // ✅ Convert comma-separated phone numbers into an array
  const phoneNumbers =
    contact.phone && typeof contact.phone === "string"
      ? contact.phone.split(",").map((num) => num.trim()).filter(Boolean)
      : [];

  // ✅ Convert business hours into multiple lines (if using newline-separated format)
  const businessHoursLines =
    contact.businessHours && typeof contact.businessHours === "string"
      ? contact.businessHours.split("\n").filter(Boolean)
      : [];

  return (
    <div className="px-6 md:px-20 lg:px-32 py-12">
      {/* Title */}
      <div className="text-center text-2xl md:text-3xl font-medium text-gray-600">
        <p>
          CONTACT <span className="text-gray-800 font-semibold">US</span>
        </p>
      </div>

      {/* Content */}
      <div className="mt-10 flex flex-col md:flex-row items-center gap-12">
        {/* Image */}
        <div className="flex-1 flex justify-center">
          <img
            src={assets.contact_image}
            alt="Contact"
            className="w-full max-w-md rounded-2xl shadow-lg border border-gray-200"
          />
        </div>

        {/* Info Section */}
        <div className="flex-1 text-gray-700 space-y-6">
          {/* Address */}
          <div>
            <p className="text-xl font-semibold text-gray-800">Our Office</p>
            <p className="text-gray-600 mt-1">
              {contact.address || "Not available"}
            </p>
          </div>

          {/* Business Hours */}
          <div>
            <p className="font-medium text-gray-800">Business Hours:</p>
            {businessHoursLines.length > 0 ? (
              <ul className="text-gray-600 mt-1 space-y-1">
                {businessHoursLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 mt-1">Not available</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <p className="font-medium text-gray-800">Phone:</p>
            {phoneNumbers.length > 0 ? (
              <ul className="text-gray-600 mt-1 space-y-1">
                {phoneNumbers.map((num, idx) => (
                  <li key={idx}>{num}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 mt-1">Not available</p>
            )}
          </div>

          {/* Email */}
          <div>
            <p className="font-medium text-gray-800">Email:</p>
            <p className="text-gray-600 mt-1">
              {contact.email || "Not available"}
            </p>
          </div>

          {/* ✅ Careers Section (Visible only when hiring is ON) */}
          {contact.active && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-lg font-semibold text-gray-800">
                Careers at Smart Dental Clinic
              </p>
              <p className="text-gray-600 mt-1">
                Learn more about our team and available job openings.
              </p>

              <button
                onClick={() => navigate("/apply")}
                className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition duration-200"
              >
                Explore Jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
