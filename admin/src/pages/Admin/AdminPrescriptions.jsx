import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AdminPrescriptions = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", instructions: "" },
  ]);
  const [notes, setNotes] = useState("");

  // Helper: get user object from appointment (handles variations)
  const getApptUser = (appt) => {
    // prefer appt.user, fall back to appt.patient or appt.userId
    return appt.user || appt.patient || appt.userId || null;
  };

  // Helper: get stable string id for the user
  const getApptUserId = (appt) => {
    const u = getApptUser(appt);
    if (!u) return null;
    // If u is an object with _id or id, return string; if it's already a string, return it
    if (typeof u === "string") return u;
    return String(u._id ?? u.id ?? "");
  };

  // Fetch data (prescriptions + appointments)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [presRes, apptRes] = await Promise.all([
        axios.get(`${backendUrl}/api/prescriptions`, {
          headers: { Authorization: `Bearer ${aToken}` },
        }),
        axios.get(`${backendUrl}/api/appointments/all`, {
          headers: { Authorization: `Bearer ${aToken}` },
        }),
      ]);

      if (presRes.data?.success) setPrescriptions(presRes.data.prescriptions);
      else setPrescriptions([]);

      if (apptRes.data?.success) setAppointments(apptRes.data.appointments);
      else setAppointments([]);
    } catch (err) {
      console.error("Error fetching data:", err.response?.data || err.message);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to load data");
      setPrescriptions([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [aToken, backendUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build deduplicated patients list from appointments
  const patientsList = React.useMemo(() => {
    const map = new Map();
    for (const appt of appointments) {
      const u = getApptUser(appt);
      const id = getApptUserId(appt);
      if (!id) continue;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: (typeof u === "object" && (u.name || u.fullName)) ? (u.name || u.fullName) : "Unknown",
          email: (typeof u === "object" && u.email) ? u.email : "",
        });
      }
    }
    return Array.from(map.values());
  }, [appointments]);

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", instructions: "" }]);
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    if (!patientId || !appointmentId) {
      alert("Please select a patient and appointment");
      return;
    }

    try {
      const res = await axios.post(
        // backend route expected: /api/prescriptions/add/:patientId/:appointmentId
        `${backendUrl}/api/prescriptions/add/${patientId}/${appointmentId}`,
        { medicines, notes },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (res.data?.success) {
        console.log("Prescription added:", res.data.prescription);
        setMedicines([{ name: "", dosage: "", instructions: "" }]);
        setNotes("");
        // re-fetch to update lists
        await fetchData();
        setAppointmentId("");
        setPatientId("");
        alert("Prescription saved.");
      } else {
        console.error("Add prescription failed:", res.data);
        alert(res.data?.message || "Failed to add prescription");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Failed to add prescription");
    }
  };

  // appointments for currently-selected patient
  const appointmentsForSelectedPatient = React.useMemo(() => {
    if (!patientId) return [];
    return appointments.filter((appt) => {
      const uid = getApptUserId(appt);
      return uid && uid === patientId;
    });
  }, [appointments, patientId]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Prescription Maintenance</h1>

      {errorMsg && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {errorMsg}
        </div>
      )}

      {/* Add Prescription Form */}
      <div className="mb-6 p-4 border rounded shadow">
        <h2 className="text-xl mb-2">Add Prescription</h2>
        <form onSubmit={handleAddPrescription} className="space-y-4">
          {/* Select Patient (deduplicated) */}
          <select
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value);
              setAppointmentId(""); // reset appointment when patient changes
            }}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Patient</option>
            {patientsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.email ? `(${p.email})` : ""}
              </option>
            ))}
          </select>

          {/* Select Appointment (shows appointments only for chosen patient) */}
          <select
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            className="border p-2 rounded w-full"
            disabled={!patientId || appointmentsForSelectedPatient.length === 0}
          >
            <option value="">
              {patientId
                ? appointmentsForSelectedPatient.length === 0
                  ? "No appointments for selected patient"
                  : "Select Appointment"
                : "Select patient first"}
            </option>

            {appointmentsForSelectedPatient.map((appt) => (
              <option key={appt._id} value={appt._id}>
                {appt.user?.name ? `${appt.user?.name} — ` : ""}
                {appt.date ? new Date(appt.date).toLocaleDateString() : "No date"}{" "}
                @ {appt.time ?? "No time"} — {appt.status ?? "unknown"}
              </option>
            ))}
          </select>

          {/* Medicines inputs */}
          {medicines.map((med, i) => (
            <div key={i} className="flex flex-col space-y-2">
              <input
                type="text"
                placeholder="Medicine Name"
                value={med.name}
                onChange={(e) => handleMedicineChange(i, "name", e.target.value)}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                placeholder="Dosage"
                value={med.dosage}
                onChange={(e) => handleMedicineChange(i, "dosage", e.target.value)}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                placeholder="Instructions"
                value={med.instructions}
                onChange={(e) => handleMedicineChange(i, "instructions", e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addMedicine}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Another Medicine
          </button>

          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Save Prescription
          </button>
        </form>
      </div>

      {/* Prescription List */}
      {prescriptions.length === 0 ? (
        <p>No prescriptions found.</p>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((pres, idx) => (
            <div key={idx} className="border p-4 rounded-lg shadow-sm bg-white">
              <p>
                <strong>Patient:</strong>{" "}
                {pres.patient?.name || pres.user?.name || "N/A"}{" "}
                {pres.patient?.email || pres.user?.email ? `(${pres.patient?.email || pres.user?.email})` : ""}
              </p>

              <p>
                <strong>Appointment:</strong>{" "}
                {pres.appointment
                  ? `${new Date(pres.appointment.date).toLocaleDateString()} @ ${pres.appointment.time} — ${pres.appointment.status}`
                  : "N/A"}
              </p>

              <p>
                <strong>Notes:</strong> {pres.notes}
              </p>

              <div>
                <strong>Medicines:</strong>
                <ul className="list-disc pl-6">
                  {pres.medicines?.map((med, idx2) => (
                    <li key={idx2}>
                      {med.name} — {med.dosage} — {med.instructions}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPrescriptions;
