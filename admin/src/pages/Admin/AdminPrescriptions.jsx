import React, { useEffect, useState, useCallback, useMemo, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AdminPrescriptions = () => {
  const { aToken, backendUrl } = useContext(AdminContext);

  // State
  const [patientsList, setPatientsList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", instructions: "" }]);
  const [notes, setNotes] = useState("");

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ===========================================
  // Fetch Patients with Completed Appointments
  // ===========================================
  const fetchPatientsWithCompletedAppointments = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const res = await axios.get(`${backendUrl}/api/appointments`, {
        headers: { Authorization: `Bearer ${aToken}` },
        params: { status: "COMPLETED" },
      });

      const appts = res.data.appointments || [];
      const uniquePatients = [];
      const seen = new Set();

      appts.forEach((appt) => {
        const user = appt.user;
        if (user && !seen.has(user._id)) {
          seen.add(user._id);
          uniquePatients.push({
            id: user._id,
            name: user.name,
            email: user.email,
          });
        }
      });

      setPatientsList(uniquePatients);
    } catch (err) {
      console.error("Error fetching patients:", err.response?.data || err.message);
      setPatientsList([]);
    } finally {
      setLoadingPatients(false);
    }
  }, [aToken, backendUrl]);

  // ===========================================
  // Fetch Completed Appointments for Patient
  // ===========================================
  const fetchAppointmentsForPatient = useCallback(async (pid) => {
    if (!pid) return;
    setLoadingAppointments(true);
    try {
      const res = await axios.get(`${backendUrl}/api/appointments/patient/${pid}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      const appts = res.data.appointments || [];
      const completed = appts.filter((a) => a.status === "COMPLETED");
      setAppointments(completed);
    } catch (err) {
      console.error("Error fetching appointments:", err.response?.data || err.message);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }, [aToken, backendUrl]);

  // ===========================================
  // Fetch Prescriptions
  // ===========================================
  const fetchPrescriptions = useCallback(async (pageNumber = 1) => {
    setLoadingPrescriptions(true);
    try {
      const params = { page: pageNumber, limit: 20 };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await axios.get(`${backendUrl}/api/prescriptions`, {
        headers: { Authorization: `Bearer ${aToken}` },
        params,
      });

      setPrescriptions(res.data.prescriptions || []);
      setPage(res.data.page || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching prescriptions:", err.response?.data || err.message);
      setPrescriptions([]);
    } finally {
      setLoadingPrescriptions(false);
    }
  }, [aToken, backendUrl, fromDate, toDate]);

  // ===========================================
  // Handle patient change
  // ===========================================
  useEffect(() => {
    setAppointmentId("");
    if (patientId) fetchAppointmentsForPatient(patientId);
    else setAppointments([]);
  }, [patientId, fetchAppointmentsForPatient]);

  // ===========================================
  // Initial load
  // ===========================================
  useEffect(() => {
    fetchPatientsWithCompletedAppointments();
    fetchPrescriptions(page);
  }, [fetchPatientsWithCompletedAppointments, fetchPrescriptions, page]);

  // ===========================================
  // Medicines handlers
  // ===========================================
  const handleMedicineChange = (index, field, value) => {
    const newMeds = [...medicines];
    newMeds[index][field] = value;
    setMedicines(newMeds);
  };
  const addMedicine = () => setMedicines([...medicines, { name: "", dosage: "", instructions: "" }]);

  // ===========================================
  // Submit prescription
  // ===========================================
  const handleAddPrescription = async (e) => {
    e.preventDefault();
    if (!patientId || !appointmentId) {
      alert("Select patient and appointment first");
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/prescriptions/add/${patientId}/${appointmentId}`,
        { medicines, notes },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (res.data?.success || res.data?.prescription) {
        alert("Prescription saved!");
        setMedicines([{ name: "", dosage: "", instructions: "" }]);
        setNotes("");
        setPatientId("");
        setAppointmentId("");
        setAppointments([]);
        fetchPrescriptions(page);
      } else {
        alert(res.data?.message || "Failed to save prescription");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Failed to save prescription");
    }
  };

  // ===========================================
  // Filter prescriptions frontend
  // ===========================================
  const filteredPrescriptions = useMemo(() => {
    if (!searchTerm) return prescriptions;
    const term = searchTerm.toLowerCase();
    return prescriptions.filter((p) => {
      const patientName = p.patient?.name?.toLowerCase() || p.user?.name?.toLowerCase() || "";
      const patientEmail = p.patient?.email?.toLowerCase() || p.user?.email?.toLowerCase() || "";
      const doctorName = p.doctor?.name?.toLowerCase() || "";
      return patientName.includes(term) || patientEmail.includes(term) || doctorName.includes(term);
    });
  }, [searchTerm, prescriptions]);

  // ===========================================
  // Render
  // ===========================================
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Prescription Maintenance</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Search patient/doctor/email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-2 rounded w-full md:w-1/5"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-2 rounded w-full md:w-1/5"
        />
        <button
          onClick={() => fetchPrescriptions(1)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Apply
        </button>
      </div>

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
              <option value="">Select Patient</option>
              {patientsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.email ? `(${p.email})` : ""}
                </option>
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
                    ? "No completed appointments"
                    : "Select Appointment"}
                </option>
                {appointments.map((appt) => (
                  <option key={appt._id} value={appt._id}>
                    {new Date(appt.date).toLocaleDateString()} @ {appt.time} — {appt.status}
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
        ) : filteredPrescriptions.length === 0 ? (
          <p>No prescriptions found.</p>
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions.map((pres, idx) => (
              <div key={idx} className="border p-4 rounded shadow-sm bg-white">
                <p>
                  <strong>Patient:</strong> {pres.patient?.name || pres.user?.name}{" "}
                  {pres.patient?.email ? `(${pres.patient.email})` : ""}
                </p>
                <p>
                  <strong>Doctor:</strong> {pres.doctor?.name} {pres.doctor?.email ? `(${pres.doctor.email})` : ""}
                </p>
                <p><strong>Notes:</strong> {pres.notes}</p>
                <div>
                  <strong>Medicines:</strong>
                  <ul className="list-disc pl-6">
                    {pres.medicines?.map((med, i2) => (
                      <li key={i2}>{med.name} — {med.dosage} — {med.instructions}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPrescriptions;
