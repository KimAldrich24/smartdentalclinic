import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AddPrescription = ({ patientId }) => {
  const { aToken, backendUrl } = useContext(AdminContext);

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", instructions: "" }]);
  const [notes, setNotes] = useState("");
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Fetch completed appointments for patient + children
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!patientId) return;

      setLoadingAppointments(true);
      try {
        const res = await axios.get(
          `${backendUrl}/api/appointments/admin/completed/${patientId}`,
          { headers: { Authorization: `Bearer ${aToken}` } }
        );

        console.log("Completed appointments response:", res.data);
        setAppointments(res.data.appointments || []);
      } catch (err) {
        console.error("Error fetching completed appointments:", err.response?.data || err.message);
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [patientId, aToken, backendUrl]);

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", instructions: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) {
      alert("Select an appointment first");
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/prescriptions/add/${patientId}/${selectedAppointment}`,
        { medicines, notes },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      console.log("Prescription added:", res.data.prescription);
      alert("Prescription added successfully!");
      setMedicines([{ name: "", dosage: "", instructions: "" }]);
      setNotes("");
      setSelectedAppointment("");
    } catch (err) {
      console.error("Failed to add prescription:", err.response?.data || err.message);
      alert("Failed to add prescription");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "auto" }}>
      {/* Appointment select */}
      <div style={{ marginBottom: "15px" }}>
        <label>Select Completed Appointment:</label>
        <select
          value={selectedAppointment}
          onChange={(e) => setSelectedAppointment(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        >
          <option value="">-- Select Appointment --</option>
          {loadingAppointments && <option disabled>Loading...</option>}
          {!loadingAppointments && appointments.length === 0 && (
            <option disabled>No completed appointments available</option>
          )}
          {!loadingAppointments &&
            appointments.map((appt) => {
              const patientLabel =
                appt.patient?._id !== patientId ? `${appt.patient?.name} (child)` : "Self";
              return (
                <option key={appt._id} value={appt._id}>
                  {new Date(appt.date).toLocaleDateString()} at {appt.time} with{" "}
                  {appt.doctor?.name || "N/A"} - {patientLabel}
                </option>
              );
            })}
        </select>
      </div>

      {/* Medicines */}
      {medicines.map((med, i) => (
        <div key={i} style={{ marginBottom: "10px", display: "flex", gap: "2%" }}>
          <input
            type="text"
            placeholder="Medicine Name"
            value={med.name}
            onChange={(e) => handleMedicineChange(i, "name", e.target.value)}
            required
            style={{ flex: 1, padding: "6px" }}
          />
          <input
            type="text"
            placeholder="Dosage"
            value={med.dosage}
            onChange={(e) => handleMedicineChange(i, "dosage", e.target.value)}
            required
            style={{ flex: 1, padding: "6px" }}
          />
          <input
            type="text"
            placeholder="Instructions"
            value={med.instructions}
            onChange={(e) => handleMedicineChange(i, "instructions", e.target.value)}
            required
            style={{ flex: 1, padding: "6px" }}
          />
        </div>
      ))}

      <button type="button" onClick={addMedicine} style={{ marginBottom: "15px" }}>
        Add Another Medicine
      </button>

      {/* Notes */}
      <div style={{ marginBottom: "15px" }}>
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: "100%", padding: "8px", minHeight: "80px" }}
        />
      </div>

      <button type="submit" style={{ padding: "10px 20px" }}>
        Save Prescription
      </button>
    </form>
  );
};

export default AddPrescription;