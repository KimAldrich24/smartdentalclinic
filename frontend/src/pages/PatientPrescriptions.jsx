import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { AuthContext } from "../context/AuthContext.jsx";

const PatientPrescriptions = () => {
  const { token, user } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [debug, setDebug] = useState("");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!token) {
        setErrorMsg("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${backendUrl}/api/prescriptions/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDebug(JSON.stringify(res.data, null, 2));

        if (res.data.success) {
          setPrescriptions(res.data.prescriptions || []);
          setErrorMsg("");
        } else {
          setPrescriptions([]);
          setErrorMsg(res.data.message || "Failed to load prescriptions.");
        }
      } catch (err) {
        console.error("Error fetching prescriptions:", err.response?.data || err.message);
        setPrescriptions([]);
        setErrorMsg(
          err.response?.data?.message || "Failed to fetch prescriptions. Please try again later."
        );
        setDebug(JSON.stringify(err.response?.data || err.message, null, 2));
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [token, backendUrl]);

  // ✅ Download PDF
  const handleDownloadPDF = (prescription) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Smart Dental Clinic", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text("Prescription Record", 105, 25, { align: "center" });
    doc.line(20, 28, 190, 28);

    doc.setFontSize(11);
    doc.text(`Patient: ${user?.name || "N/A"}`, 20, 40);
    doc.text(`Date: ${new Date(prescription.dateIssued).toLocaleDateString()}`, 20, 48);
    doc.text(`Doctor: ${prescription.doctor?.name || "N/A"}`, 20, 56);

    let y = 70;
    doc.setFontSize(12);
    doc.text("Medicines:", 20, y);
    y += 8;
    doc.setFontSize(11);

    prescription.medicines.forEach((med, index) => {
      const medLine = `${index + 1}. ${med.name} — ${med.dosage} (${med.instructions})`;
      doc.text(medLine, 25, y);
      y += 8;
    });

    if (prescription.notes) {
      y += 5;
      doc.setFontSize(12);
      doc.text("Notes:", 20, y);
      y += 8;
      doc.setFontSize(11);
      const splitNotes = doc.splitTextToSize(prescription.notes, 170);
      doc.text(splitNotes, 25, y);
    }

    doc.line(20, 270, 190, 270);
    doc.setFontSize(10);
    doc.text("Thank you for trusting Smart Dental Clinic", 105, 278, { align: "center" });

    doc.save(`Prescription_${new Date(prescription.dateIssued).toLocaleDateString()}.pdf`);
  };

  // ✅ Print
  const handlePrint = (prescription) => {
    const printWindow = window.open("", "_blank");
    const medsList = prescription.medicines
      .map((med) => `<li>${med.name} — ${med.dosage} (${med.instructions})</li>`)
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h3 { text-align: center; margin: 0; }
            ul { margin-top: 10px; }
            hr { margin: 10px 0; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: gray; }
          </style>
        </head>
        <body>
          <h1>Smart Dental Clinic</h1>
          <h3>Prescription Record</h3>
          <hr/>
          <p><strong>Patient:</strong> ${user?.name || "N/A"}</p>
          <p><strong>Date:</strong> ${new Date(prescription.dateIssued).toLocaleDateString()}</p>
          <p><strong>Doctor:</strong> ${prescription.doctor?.name || "N/A"}</p>
          <h4>Medicines:</h4>
          <ul>${medsList}</ul>
          ${prescription.notes ? `<p><strong>Notes:</strong> ${prescription.notes}</p>` : ""}
          <div class="footer">Thank you for trusting Smart Dental Clinic</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <p className="text-center mt-10">Loading prescriptions...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">My Prescriptions</h2>

      {errorMsg && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">{errorMsg}</div>
      )}

      {prescriptions.length === 0 && !errorMsg ? (
        <p className="text-center text-gray-600">No prescriptions found.</p>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p._id} className="border p-4 rounded-lg shadow-sm bg-white flex flex-col gap-2">
              <p><strong>Date Issued:</strong> {new Date(p.dateIssued).toLocaleDateString()}</p>
              <p><strong>Doctor:</strong> {p.doctor?.name || "N/A"}</p>

              {p.notes && <p><strong>Notes:</strong> {p.notes}</p>}

              <div>
                <strong>Medicines:</strong>
                <ul className="list-disc pl-6">
                  {p.medicines?.map((med, i) => (
                    <li key={i}>{med.name} — {med.dosage} ({med.instructions})</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleDownloadPDF(p)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => handlePrint(p)}
                  className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                >
                  Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Debug info */}
      <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
        <strong>Debug Info:</strong>
        <pre>{debug}</pre>
      </div>
    </div>
  );
};

export default PatientPrescriptions;
