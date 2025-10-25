import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AdminPrescriptions = () => {
  const { aToken, backendUrl } = useContext(AdminContext);

  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientsList, setPatientsList] = useState([]);

  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [errorPrescriptions, setErrorPrescriptions] = useState("");
  const [errorAppointments, setErrorAppointments] = useState("");

  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", instructions: "" }]);
  const [notes, setNotes] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Helpers
  const getApptUser = (appt) => appt.user || appt.patient || appt.userId || null;
  const getApptUserId = (appt) => {
    const u = getApptUser(appt);
    if (!u) return null;
    return typeof u === "string" ? u : String(u._id ?? u.id ?? "");
  };

  // Fetch paginated prescriptions
  const fetchPrescriptions = useCallback(async (pageNumber = 1) => {
    setLoadingPrescriptions(true);
    setErrorPrescriptions("");
    
    try {
      const { data } = await axios.get(`${backendUrl}/api/prescriptions`, {
        params: { page: pageNumber, limit: 20 },
        headers: { Authorization: `Bearer ${aToken}` },
        timeout: 30000,
      });
      setPrescriptions(data.prescriptions || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setErrorPrescriptions(err.response?.data?.message || err.message || "Failed to fetch prescriptions");
    } finally {
      setLoadingPrescriptions(false);
    }
  }, [aToken, backendUrl]);

  // Fetch ALL patients who have completed appointments
  const fetchPatientsWithCompletedAppointments = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const res = await axios.get(`${backendUrl}/api/appointments`, {
        headers: { Authorization: `Bearer ${aToken}` },
        params: { status: 'completed' },
        timeout: 30000,
      });
      
      const appts = res.data.appointments || [];
      
      // Extract unique patients
      const uniquePatients = [];
      const seenIds = new Set();
      
      appts.forEach(appt => {
        const user = getApptUser(appt);
        const userId = getApptUserId(appt);
        
        if (userId && !seenIds.has(userId)) {
          seenIds.add(userId);
          uniquePatients.push({
            id: userId,
            name: user?.name || user?.fullName || "Unknown",
            email: user?.email || ""
          });
        }
      });
      
      setPatientsList(uniquePatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setPatientsList([]);
    } finally {
      setLoadingPatients(false);
    }
  }, [aToken, backendUrl]);

  // Fetch appointments only for selected patient
  const fetchAppointmentsForPatient = useCallback(async (pid) => {
    if (!pid) return;
    setLoadingAppointments(true);
    setErrorAppointments("");
    try {
      const res = await axios.get(`${backendUrl}/api/appointments/patient/${pid}`, {
        headers: { Authorization: `Bearer ${aToken}` },
        timeout: 30000,
      });
      const appts = res.data.appointments || [];
      
      // Only show completed appointments
      const completedAppts = appts.filter(a => a.status === 'completed');
      setAppointments(completedAppts);
    } catch (err) {
      console.error("Error fetching appointments:", err.response?.data || err.message);
      setErrorAppointments(err.response?.data?.message || err.message || "Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }, [aToken, backendUrl]);

  // Initial fetch
  useEffect(() => {
    fetchPrescriptions(page);
  }, [fetchPrescriptions, page]);

  useEffect(() => {
    fetchPatientsWithCompletedAppointments();
  }, [fetchPatientsWithCompletedAppointments]);

  // Handle medicine inputs
  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };
  const addMedicine = () => setMedicines([...medicines, { name: "", dosage: "", instructions: "" }]);

  // Handle add prescription
  const handleAddPrescription = async (e) => {
    e.preventDefault();
    if (!patientId || !appointmentId) {
      alert("Please select a patient and appointment");
      return;
    }
    try {
      const res = await axios.post(
        `${backendUrl}/api/prescriptions/add/${patientId}/${appointmentId}`,
        { medicines, notes },
        { headers: { Authorization: `Bearer ${aToken}` }, timeout: 30000 }
      );

      if (res.data?.success) {
        setMedicines([{ name: "", dosage: "", instructions: "" }]);
        setNotes("");
        setAppointmentId("");
        setPatientId("");
        alert("Prescription saved.");
        fetchPrescriptions(page);
      } else {
        alert(res.data?.message || "Failed to add prescription");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Failed to add prescription");
    }
  };

  // Update appointments when patient changes
  useEffect(() => {
    setAppointmentId("");
    if (patientId) {
      fetchAppointmentsForPatient(patientId);
    } else {
      setAppointments([]);
    }
  }, [patientId, fetchAppointmentsForPatient]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Prescription Maintenance</h1>

      {/* Errors */}
      {errorPrescriptions && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{errorPrescriptions}</div>}
      {errorAppointments && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{errorAppointments}</div>}

      {/* Add Prescription Form */}
      <div className="mb-6 p-4 border rounded shadow">
        <h2 className="text-xl mb-2">Add Prescription</h2>
        {loadingPatients ? (
          <p>Loading patients...</p>
        ) : (
          <form onSubmit={handleAddPrescription} className="space-y-4">
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Patient (with completed appointments)</option>
              {patientsList.map((p) => (
                <option key={p.id} value={p.id}>{p.name} {p.email ? `(${p.email})` : ""}</option>
              ))}
            </select>

            {loadingAppointments ? (
              <p>Loading appointments...</p>
            ) : (
              <select
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                className="border p-2 rounded w-full"
                disabled={!patientId || appointments.length === 0}
              >
                <option value="">
                  {!patientId
                    ? "Select patient first"
                    : appointments.length === 0
                    ? "No completed appointments for this patient"
                    : "Select Appointment"}
                </option>
                {appointments.map((appt) => (
                  <option key={appt._id} value={appt._id}>
                    {appt.date ? new Date(appt.date).toLocaleDateString() : "No date"} @ {appt.time ?? "No time"} — {appt.status ?? "unknown"}
                  </option>
                ))}
              </select>
            )}

            {medicines.map((med, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={med.name}
                  onChange={(e) => handleMedicineChange(i, "name", e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={med.dosage}
                  onChange={(e) => handleMedicineChange(i, "dosage", e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Instructions"
                  value={med.instructions}
                  onChange={(e) => handleMedicineChange(i, "instructions", e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
            ))}

            <button type="button" onClick={addMedicine} className="bg-blue-500 text-white px-4 py-2 rounded">
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
        )}
      </div>

      {/* Prescription List */}
      <div>
        <h2 className="text-xl mb-2">Existing Prescriptions</h2>
        {loadingPrescriptions ? (
          <p>Loading prescriptions...</p>
        ) : prescriptions.length === 0 ? (
          <p>No prescriptions found.</p>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((pres, idx) => (
              <div key={idx} className="border p-4 rounded-lg shadow-sm bg-white">
                <p><strong>Patient:</strong> {pres.patient?.name || pres.user?.name || "N/A"} {pres.patient?.email || pres.user?.email ? `(${pres.patient?.email || pres.user?.email})` : ""}</p>
                <p><strong>Doctor:</strong> {pres.doctor?.name || "N/A"} {pres.doctor?.email ? `(${pres.doctor?.email})` : ""}</p>
                <p><strong>Date Issued:</strong> {pres.dateIssued ? new Date(pres.dateIssued).toLocaleDateString() : "N/A"}</p>
                <p><strong>Notes:</strong> {pres.notes}</p>
                <div>
                  <strong>Medicines:</strong>
                  <ul className="list-disc pl-6">
                    {pres.medicines?.map((med, idx2) => (
                      <li key={idx2}>{med.name} — {med.dosage} — {med.instructions}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPrescriptions;