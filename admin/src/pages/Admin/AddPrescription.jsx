import React, { useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AddPrescription = ({ patientId, doctorId }) => {
  const { aToken, backendUrl } = useContext(AdminContext);

  const [medicines, setMedicines] = useState([{ name: "", dosage: "", instructions: "" }]);
  const [notes, setNotes] = useState("");

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", instructions: "" }]);
  };

  

  const addPrescription = async (userId) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/prescriptions/add/${userId}`,
        {
          medicines: [
            { name: "Paracetamol", dosage: "500mg", instructions: "Take twice daily" },
          ],
          notes: "Take after food"
        },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
  
      console.log("Prescription added:", res.data.prescription);
      alert("Prescription added successfully!");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${backendUrl}/api/prescriptions`,
        { patient: patientId, doctor: doctorId, medicines, notes },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      console.log("Prescription added:", res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {medicines.map((med, i) => (
        <div key={i}>
          <input
            type="text"
            placeholder="Medicine Name"
            value={med.name}
            onChange={(e) => handleMedicineChange(i, "name", e.target.value)}
          />
          <input
            type="text"
            placeholder="Dosage"
            value={med.dosage}
            onChange={(e) => handleMedicineChange(i, "dosage", e.target.value)}
          />
          <input
            type="text"
            placeholder="Instructions"
            value={med.instructions}
            onChange={(e) => handleMedicineChange(i, "instructions", e.target.value)}
          />
        </div>
      ))}
      <button type="button" onClick={addMedicine}>
        Add Another Medicine
      </button>
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button type="submit">Save Prescription</button>
    </form>
  );
};

export default AddPrescription;
