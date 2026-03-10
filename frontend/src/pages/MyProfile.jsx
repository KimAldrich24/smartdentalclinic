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

  const [credit, setCredit] = useState({ amount: 0, history: [] });
  const [creditLoading, setCreditLoading] = useState(true);
  const [creditError, setCreditError] = useState("");

  // Children state
  const [children, setChildren] = useState([]);
  const [childForm, setChildForm] = useState({ name: "", dob: "" });
  const [childSaving, setChildSaving] = useState(false);

  // =====================
  // Load user profile
  // =====================
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${backendUrl}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          const user = data.user;
          const formattedUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            gender: user.gender,
            image: user.image,
            role: user.role,
            status: user.status,
            dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
            children: user.children || [],
          };
          setUserData(formattedUser);
          setChildren(formattedUser.children);
        } else {
          setError(data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, backendUrl]);

  // =====================
  // Fetch completed appointments
  // =====================
  useEffect(() => {
    if (!token) return;

    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          const completed = data.appointments.filter(a => a.status === "COMPLETED");
          setRecords(completed);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAppointments();
  }, [token, backendUrl]);

  // =====================
  // Fetch prescriptions
  // =====================
  useEffect(() => {
    if (!token) return;

    const fetchPrescriptions = async () => {
      setPrescriptionsLoading(true);
      setPrescriptionsError("");
      try {
        const { data } = await axios.get(`${backendUrl}/api/prescriptions/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setPrescriptions(data.prescriptions);
        } else {
          setPrescriptionsError(data.message || "Failed to load prescriptions");
          setPrescriptions([]);
        }
      } catch (err) {
        console.error(err);
        setPrescriptionsError(err.response?.data?.message || "Error fetching prescriptions");
      } finally {
        setPrescriptionsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [token, backendUrl]);

  // =====================
  // Fetch credit
  // =====================
  useEffect(() => {
    if (!token || !userData?.id) return;

    const fetchCredit = async () => {
      setCreditLoading(true);
      setCreditError("");
      try {
        const { data } = await axios.get(`${backendUrl}/api/credits/${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCredit({ amount: data.amount || 0, history: data.history || [] });
      } catch (err) {
        console.error(err);
        setCreditError("Failed to load credit info");
      } finally {
        setCreditLoading(false);
      }
    };

    fetchCredit();
  }, [token, backendUrl, userData?.id]);

  // =====================
  // Save profile info (name, phone, gender, dob, image, children)
  // =====================
  const saveProfile = async () => {
    if (!token) return alert("No auth token found");

    setSaving(true);
    try {
      const payload = {
        name: userData.name,
        phone: userData.phone,
        gender: userData.gender || "Not Selected",
        dob: userData.dob || undefined,
        image: userData.image,
        children: userData.children || [],
      };
      const { data } = await axios.put(`${backendUrl}/api/users/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const updated = {
          ...userData,
          name: data.user.name,
          phone: data.user.phone,
          gender: data.user.gender,
          image: data.user.image,
          dob: data.user.dob ? new Date(data.user.dob).toISOString().split("T")[0] : "",
          children: data.user.children || [],
        };
        setUserData(updated);
        setChildren(updated.children);
        setIsEdit(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // =====================
  // Add child (save immediately to backend)
  // =====================
  const addChild = async () => {
    if (!childForm.name || !childForm.dob) return alert("Enter name and DOB");

    const newChildren = [...(userData.children || []), childForm];
    setChildSaving(true);
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/users/me`,
        { children: newChildren },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setUserData(prev => ({ ...prev, children: data.user.children }));
        setChildren(data.user.children);
        setChildForm({ name: "", dob: "" });
        alert("Child added successfully!");
      } else {
        alert(data.message || "Failed to add child");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding child");
    } finally {
      setChildSaving(false);
    }
  };

  // =====================
  // Loading/Error states
  // =====================
  if (loading) return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!userData) return <p className="text-center mt-10 text-red-500">No user profile found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <img src={userData.image || "/default-avatar.png"} alt="profile"
          className="w-24 h-24 rounded-full border-4 border-blue-100 object-cover shadow-sm" />
        <div className="flex-1">
          {isEdit ? (
            <input type="text" value={userData.name || ""} 
              onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
              className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400" />
          ) : (
            <p className="text-2xl font-semibold text-gray-800">{userData.name}</p>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Personal Info */}
      <div>
        <p className="text-lg font-semibold text-gray-700 mb-3">PERSONAL INFORMATION</p>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-600">Email:</p>
            <p className="text-gray-500">{userData.email}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600">Phone:</p>
            {isEdit ? (
              <input type="text" value={userData.phone || ""} 
                onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400" />
            ) : <p className="text-gray-500">{userData.phone || "Not set"}</p>}
          </div>
          <div>
            <p className="font-medium text-gray-600">Gender:</p>
            {isEdit ? (
              <select value={userData.gender || "Not Selected"} 
                onChange={e => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400">
                <option value="Not Selected">Not Selected</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : <p className="text-gray-500">{userData.gender || "Not set"}</p>}
          </div>
          <div>
            <p className="font-medium text-gray-600">Date of Birth:</p>
            {isEdit ? (
              <input type="date" value={userData.dob || ""} 
                onChange={e => setUserData(prev => ({ ...prev, dob: e.target.value }))}
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400" />
            ) : (
              <p className="text-gray-500">{userData.dob ? new Date(userData.dob).toLocaleDateString() : "Not set"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      <div>
        <p className="text-lg font-semibold text-gray-700 mb-3">MY CHILDREN</p>
        {children.length === 0 ? (
          <p className="text-gray-500">No children added yet.</p>
        ) : (
          <ul className="space-y-2">
            {children.map((c, i) => (
              <li key={i} className="border p-3 rounded-lg bg-gray-50 shadow-sm">
                {c.name} — {c.dob ? new Date(c.dob).toLocaleDateString() : "No DOB"}
              </li>
            ))}
          </ul>
        )}
        {isEdit && (
          <div className="mt-4 space-y-2">
            <input type="text" placeholder="Child's Name" value={childForm.name} 
              onChange={e => setChildForm(prev => ({ ...prev, name: e.target.value }))}
              className="border px-3 py-2 rounded-lg w-full" />
            <input type="date" value={childForm.dob} 
              onChange={e => setChildForm(prev => ({ ...prev, dob: e.target.value }))}
              className="border px-3 py-2 rounded-lg w-full" />
            <button onClick={addChild} 
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md">
              {childSaving ? "Saving..." : "Add Child"}
            </button>
          </div>
        )}
      </div>

      {/* CREDIT */}
      <div>
        <p className="text-lg font-semibold text-gray-700 mb-3">CREDIT BALANCE</p>
        {creditLoading ? <p className="text-gray-500">Loading credit...</p> :
        creditError ? <p className="text-red-500">{creditError}</p> :
        <div className="border p-4 rounded-lg bg-yellow-50 shadow-sm space-y-4">
          <p className="text-2xl font-bold text-gray-800">₱ {credit.amount.toLocaleString()}</p>
          {credit.history.length === 0 ? <p className="text-gray-500">No credit history yet.</p> :
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {credit.history.slice().reverse().map((h, i) => (
                <div key={i} className="border-b pb-1 last:border-b-0">
                  <p className="text-sm text-gray-700">{h.note} — {h.change>0?'+':'-'}₱ {h.change.toLocaleString()}</p>
                  {h.appointment && <p className="text-xs text-gray-400">
                    Appointment: {records.find(r=>r._id===h.appointment)?.date || "N/A"} — Services: {records.find(r=>r._id===h.appointment)?.services.map(s=>s.service?.name || s.price).join(", ")}
                  </p>}
                </div>
              ))}
            </div>
          }
        </div>}
      </div>

      {/* TOOTH HISTORY */}
      <div>
        <p className="text-lg font-semibold text-gray-700 mb-3">TOOTH HISTORY</p>
        {records.length === 0 ? <p className="text-gray-500">No completed dental history found.</p> :
          <div className="space-y-4">
            {records.map(rec => (
              <div key={rec._id} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                <p className="font-medium text-gray-800">{rec.services.map(s=>s.service?.name || "Unknown Service").join(", ")}</p>
                <p className="text-sm text-gray-600">{rec.date} at {rec.time}</p>
                <p className="text-sm text-gray-500">Dentist: {rec.doctor?.name || "N/A"}</p>
                <p className="text-sm italic text-gray-400">Status: {rec.status}</p>
              </div>
            ))}
          </div>
        }
      </div>

      {/* PRESCRIPTIONS */}
      <div>
        <p className="text-lg font-semibold text-gray-700 mb-3">PRESCRIPTIONS</p>
        {prescriptionsLoading && <p>Loading prescriptions...</p>}
        {prescriptionsError && <p className="text-red-500">{prescriptionsError}</p>}
        {prescriptions.length===0 && !prescriptionsLoading ? <p className="text-gray-500">No prescriptions found.</p> :
          <div className="space-y-4">
            {prescriptions.map(p=>(
              <div key={p._id} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                <p className="font-medium text-gray-800">Prescribed by: {p.doctor?.name || "N/A"}</p>
                <p className="text-sm text-gray-600">Date: {new Date(p.dateIssued).toLocaleDateString()}</p>
                <ul className="list-disc pl-5">
                  {p.medicines.map((med,i)=>(
                    <li key={i}><b>{med.name}</b> — {med.dosage} ({med.instructions})</li>
                  ))}
                </ul>
                {p.notes && <p className="text-sm italic text-gray-500">Notes: {p.notes}</p>}
              </div>
            ))}
          </div>
        }
      </div>

      {/* SAVE / EDIT / BECOME GUARDIAN BUTTONS */}
      <div className="flex justify-end gap-3">
        {isEdit ? (
          <>
            <button onClick={()=>{setIsEdit(false); window.location.reload();}}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg shadow-md">Cancel</button>
            <button onClick={saveProfile} disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              {saving?"Saving...":"Save Information"}
            </button>
          </>
        ) : (
          <>
            <button onClick={()=>setIsEdit(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md">Edit</button>

            {userData.role!=="guardian" && (
              <button onClick={async ()=>{
                if(!window.confirm("Do you want to become a guardian?")) return;
                try{
                  const {data}=await axios.put(`${backendUrl}/api/users/become-guardian`, {}, { headers:{Authorization:`Bearer ${token}`}});
                  if(data.success){
                    setUserData(prev=>({...prev, role:data.user.role, children:data.user.children || []}));
                    setChildren(data.user.children || []);
                    alert("You are now a guardian! You can add children now.");
                  }
                }catch(err){
                  console.error(err);
                  alert(err.response?.data?.message || "Failed to become guardian");
                }
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg shadow-md">
                Become Guardian
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyProfile;