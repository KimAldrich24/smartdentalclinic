import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const MyProfile = () => {
  const { token } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const [userData, setUserData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [prescriptionsError, setPrescriptionsError] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ Load user data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        console.log("🔄 Fetching user profile...");
        const { data } = await axios.get(`${backendUrl}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("📥 User data from backend:", data);

        if (data.success) {
          // Format the user data properly
          const formattedUser = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            gender: data.user.gender,
            image: data.user.image,
            role: data.user.role,
            status: data.user.status,
            dob: data.user.dob 
              ? new Date(data.user.dob).toISOString().split("T")[0] 
              : "",
          };
          
          console.log("✅ Formatted user data:", formattedUser);
          setUserData(formattedUser);
          setError("");
        } else {
          setError(data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, backendUrl]);

  useEffect(() => {
    if (!token) return;
  
    const fetchAppointments = async () => {
      try {
        console.log("📞 Fetching appointments...");
        
        const { data } = await axios.get(`${backendUrl}/api/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("📦 Appointments response:", data);
  
        if (data.success) {
          const completed = data.appointments.filter((a) => a.status === "completed");
          console.log("✔️ Completed appointments:", completed.length);
          setRecords(completed);
        }
      } catch (err) {
        console.error("❌ Error fetching appointments:", err.response?.data || err.message);
      }
    };
  
    fetchAppointments();
  }, [token, backendUrl]);

  // ✅ Fetch prescriptions
  useEffect(() => {
    if (!token) return;

    const fetchPrescriptions = async () => {
      setPrescriptionsLoading(true);
      setPrescriptionsError("");

      try {
        const url = `${backendUrl}/api/prescriptions/my`;
        const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          setPrescriptions(data.prescriptions);
        } else {
          setPrescriptionsError(data.message || "Failed to load prescriptions");
          setPrescriptions([]);
        }
      } catch (err) {
        console.error("❌ Error fetching prescriptions:", err.response?.data || err.message);
        setPrescriptionsError(err.response?.data?.message || "Error fetching prescriptions");
      } finally {
        setPrescriptionsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [token, backendUrl]);

  const saveProfile = async () => {
    if (!token) return alert("No auth token found");
  
    setSaving(true);
  
    try {
      // Prepare payload with correct field name
      const payload = {
        name: userData.name,
        phone: userData.phone,
        gender: userData.gender || "Not Selected",
        dob: userData.dob || undefined,
        image: userData.image,
      };
  
      console.log("📤 Sending payload:", payload);
  
      // Send update to backend
      const { data } = await axios.put(`${backendUrl}/api/users/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("📥 Response from server:", data);
  
      if (data.success) {
        // Build the updated state from backend response
        const updated = {
          ...userData,
          name: data.user.name,
          phone: data.user.phone,
          gender: data.user.gender,
          image: data.user.image,
          dob: data.user.dob
            ? new Date(data.user.dob).toISOString().split("T")[0]
            : "",
        };
  
        // Update React state
        setUserData(updated);
  
        setIsEdit(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("❌ Error saving profile:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // 🕒 Loading states
  if (loading) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-500">Loading profile...</p>
        <p className="text-sm text-gray-400 mt-2">If this takes too long, check your internet connection</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!userData) {
    return <p className="text-center text-red-500 mt-10">No user profile found.</p>;
  }

  // ✅ Render UI
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <img
          src={userData.image || "/default-avatar.png"}
          alt="profile"
          className="w-24 h-24 rounded-full border-4 border-blue-100 object-cover shadow-sm"
        />
        <div className="flex-1">
          {isEdit ? (
            <input
              type="text"
              value={userData.name || ""}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="text-2xl font-semibold text-gray-800">{userData.name}</p>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Contact Info */}
      <div>
        <p className="text-lg font-semibold text-gray-700 mb-3">
          PERSONAL INFORMATION
        </p>
        <div className="space-y-4">
          {/* Email */}
          <div>
            <p className="font-medium text-gray-600">Email:</p>
            <p className="text-gray-500">{userData.email}</p>
          </div>

          {/* Phone */}
          <div>
            <p className="font-medium text-gray-600">Phone:</p>
            {isEdit ? (
              <input
                type="text"
                value={userData.phone || ""}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <p className="text-gray-500">{userData.phone || "Not set"}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <p className="font-medium text-gray-600">Gender:</p>
            {isEdit ? (
              <select
                value={userData.gender || "Not Selected"}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              >
                <option value="Not Selected">Not Selected</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <p className="text-gray-500">{userData.gender || "Not set"}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <p className="font-medium text-gray-600">Date of Birth:</p>
            {isEdit ? (
              <input
                type="date"
                value={userData.dob || ""}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <p className="text-gray-500">
                {userData.dob
                  ? new Date(userData.dob).toLocaleDateString()
                  : "Not set"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tooth History */}
      <div>
        <p className="text-lg font-semibold text-gray-700 mb-3">TOOTH HISTORY</p>
        {records.length === 0 ? (
          <p className="text-gray-500">No completed dental history found.</p>
        ) : (
          <div className="space-y-4">
            {records.map((rec) => (
              <div key={rec._id} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                <p className="font-medium text-gray-800">
                  {rec.service?.name || "Unknown Service"}
                </p>
                <p className="text-sm text-gray-600">
                  {rec.date} at {rec.time}
                </p>
                <p className="text-sm text-gray-500">
                  Dentist: {rec.doctor?.name || "N/A"}
                </p>
                <p className="text-sm italic text-gray-400">Status: {rec.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescriptions */}
      <div>
        <p className="text-lg font-semibold text-gray-700 mb-3">PRESCRIPTIONS</p>
        {prescriptionsLoading && <p>Loading prescriptions...</p>}
        {prescriptionsError && <p className="text-red-500">{prescriptionsError}</p>}
        {prescriptions.length === 0 && !prescriptionsLoading ? (
          <p className="text-gray-500">No prescriptions found.</p>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((p) => (
              <div key={p._id} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                <p className="font-medium text-gray-800">
                  Prescribed by: {p.doctor?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(p.dateIssued).toLocaleDateString()}
                </p>
                <ul className="list-disc pl-5">
                  {p.medicines.map((med, i) => (
                    <li key={i}>
                      <b>{med.name}</b> — {med.dosage} ({med.instructions})
                    </li>
                  ))}
                </ul>
                {p.notes && (
                  <p className="text-sm italic text-gray-500">Notes: {p.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save/Edit Button */}
      <div className="flex justify-end gap-3">
        {isEdit ? (
          <>
            <button
              onClick={() => {
                setIsEdit(false);
                window.location.reload(); // Reset to original data
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg shadow-md"
            >
              Cancel
            </button>
            <button
              onClick={saveProfile}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Information"}
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;