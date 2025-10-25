import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AdminContact = () => {
  const { aToken, backendUrl } = useContext(AdminContext);

  const [contact, setContact] = useState({
    phone: [""],
    email: "",
    address: "",
    businessHours: "", // ✅ new field
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Fetch contact info from backend
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/contact`);
        setContact({
          phone: data.phone
            ? Array.isArray(data.phone)
              ? data.phone
              : data.phone.split(",").map((num) => num.trim())
            : [""],
          email: data.email || "",
          address: data.address || "",
          businessHours: data.businessHours || "", // ✅ include
          active: data.active ?? true,
        });
      } catch (error) {
        console.error("Error fetching contact info:", error);
      }
    };
    fetchContact();
  }, [backendUrl]);

  // ✅ Handle phone number changes
  const handlePhoneChange = (index, value) => {
    const updated = [...contact.phone];
    updated[index] = value;
    setContact((prev) => ({ ...prev, phone: updated }));
  };

  // ✅ Add or remove phone fields
  const addPhoneField = () =>
    setContact((prev) => ({ ...prev, phone: [...prev.phone, ""] }));

  const removePhoneField = (index) =>
    setContact((prev) => ({
      ...prev,
      phone: prev.phone.filter((_, i) => i !== index),
    }));

  // ✅ Validation
  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!contact.email || !emailRegex.test(contact.email)) {
      alert("❌ Please enter a valid email address.");
      return false;
    }

    for (let num of contact.phone) {
      if (num.trim() === "") continue;
      if (!/^09\d{9}$/.test(num)) {
        alert("❌ Each phone number must start with '09' and be exactly 11 digits.");
        return false;
      }
    }
    return true;
  };

  // ✅ Save changes
  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await axios.put(
        `${backendUrl}/api/contact`,
        {
          ...contact,
          phone: contact.phone.filter((p) => p.trim() !== "").join(","),
        },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      alert("✅ Contact info updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving contact info:", error);
      alert("❌ Failed to update contact info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-3xl mx-auto mt-10 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          📞 Manage Contact Information
        </h2>
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition ${
            isEditing
              ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isEditing ? "Cancel" : "✏️ Edit"}
        </button>
      </div>

      {/* Body */}
      <div className="space-y-6">
        {/* Hiring toggle */}
        <div className="flex items-center justify-between border p-3 rounded-lg">
          <p className="text-gray-700 font-medium">
            {contact.active ? "✅ Hiring is ON" : "🚫 Hiring is OFF"}
          </p>
          {isEditing && (
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={contact.active}
                onChange={(e) =>
                  setContact((prev) => ({ ...prev, active: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-all after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          )}
        </div>

        {/* Phone numbers */}
        <div>
          <label className="block text-gray-600 font-medium mb-2">
            Phone Numbers
          </label>
          {contact.phone.map((num, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={num}
                onChange={(e) => handlePhoneChange(index, e.target.value)}
                placeholder="e.g. 09123456789"
                disabled={!isEditing}
                className={`flex-1 p-3 border rounded-lg ${
                  isEditing
                    ? "bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    : "bg-gray-100 text-gray-500 cursor-not-allowed"
                }`}
              />
              {isEditing && contact.phone.length > 1 && (
                <button
                  onClick={() => removePhoneField(index)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button
              onClick={addPhoneField}
              className="mt-2 text-blue-600 font-medium hover:text-blue-800"
            >
              ➕ Add another phone number
            </button>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">Email</label>
          <input
            type="email"
            value={contact.email}
            onChange={(e) =>
              setContact((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="example@domain.com"
            disabled={!isEditing}
            className={`w-full p-3 border rounded-lg ${
              isEditing
                ? "bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                : "bg-gray-100 text-gray-500 cursor-not-allowed"
            }`}
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Address
          </label>
          <textarea
            value={contact.address}
            onChange={(e) =>
              setContact((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="Enter full address here..."
            disabled={!isEditing}
            className={`w-full p-3 border rounded-lg ${
              isEditing
                ? "bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                : "bg-gray-100 text-gray-500 cursor-not-allowed"
            }`}
            rows="3"
          />
        </div>

        {/* ✅ Business Hours */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Business Hours
          </label>
          <input
            type="text"
            value={contact.businessHours}
            onChange={(e) =>
              setContact((prev) => ({
                ...prev,
                businessHours: e.target.value,
              }))
            }
            placeholder="e.g. Mon–Fri: 9AM–6PM"
            disabled={!isEditing}
            className={`w-full p-3 border rounded-lg ${
              isEditing
                ? "bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                : "bg-gray-100 text-gray-500 cursor-not-allowed"
            }`}
          />
        </div>

        {/* Save button */}
        {isEditing && (
          <button
            onClick={handleSave}
            disabled={loading}
            className={`mt-4 w-full py-3 rounded-lg text-white font-semibold shadow-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Saving..." : "💾 Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminContact;
