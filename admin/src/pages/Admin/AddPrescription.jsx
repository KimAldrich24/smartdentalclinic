import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AddPrescription = ({ patientId, doctorId }) => {
  const { aToken, backendUrl } = useContext(AdminContext);

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", instructions: "" }]);
  const [notes, setNotes] = useState("");

  // Fetch completed appointments for this patient (admin can view)
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!patientId) return;
      try {
        const res = await axios.get(
          `${backendUrl}/api/appointments/completed/${patientId}`,
          { headers: { Authorization: `Bearer ${aToken}` } }
        );
        setAppointments(res.data.records || []); // `records` key from backend
      } catch (err) {
        console.error("Error fetching completed appointments:", err.response?.data || err.message);
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
      alert("Please select an appointment to attach the prescription to.");
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/prescriptions/add/${patientId}`,
        {
          appointment: selectedAppointment,
          doctor: doctorId,
          medicines,
          notes,
        },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      console.log("Prescription added:", res.data.prescription);
      alert("Prescription added successfully!");

      // Reset form
      setMedicines([{ name: "", dosage: "", instructions: "" }]);
      setNotes("");
      setSelectedAppointment("");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to add prescription");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "auto" }}>
      {/* Appointment select */}
      <div>
        <label>Select Completed Appointment:</label>
        <select
          value={selectedAppointment}
          onChange={(e) => setSelectedAppointment(e.target.value)}
          required
        >
          <option value="">-- Select Appointment --</option>
          {appointments.map((appt) => (
            <option key={appt._id} value={appt._id}>
              {new Date(appt.date).toLocaleDateString()} at {appt.time} with{" "}
              {appt.doctor?.name || "N/A"}
            </option>
          ))}
        </select>
      </div>

      {/* Medicines */}
      {medicines.map((med, i) => (
        <div key={i} style={{ marginTop: "10px" }}>
          <input
            type="text"
            placeholder="Medicine Name"
            value={med.name}
            onChange={(e) => handleMedicineChange(i, "name", e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Dosage"
            value={med.dosage}
            onChange={(e) => handleMedicineChange(i, "dosage", e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Instructions"
            value={med.instructions}
            onChange={(e) => handleMedicineChange(i, "instructions", e.target.value)}
            required
          />
        </div>
      ))}

      <button type="button" onClick={addMedicine} style={{ marginTop: "10px" }}>
        Add Another Medicine
      </button>

      {/* Notes */}
      <div style={{ marginTop: "10px" }}>
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button type="submit" style={{ marginTop: "10px" }}>
        Save Prescription
      </button>
    </form>
  );
};

export default AddPrescription;
