import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Upload, CreditCard } from 'lucide-react';
import { backendUrl } from "../config";

const PatientGCashPayment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [referenceNumber, setReferenceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const gcashQRCode = '/gcashqr.jpg'; // Put your GCash QR image in public folder

  // Ensure patient info exists
  useEffect(() => {
    const id = localStorage.getItem('patientId');
    const name = localStorage.getItem('patientName');
    if (!id || !name) {
      toast.error('Patient info missing. Please log in again.');
      navigate('/login');
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!referenceNumber || !amount || !screenshot) {
      toast.error('Please fill all fields and upload screenshot');
      return;
    }

    const patientId = localStorage.getItem('patientId');
    const patientName = localStorage.getItem('patientName');

    if (!patientId || !patientName) {
      toast.error('Patient info missing. Cannot submit.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('appointmentId', appointmentId);
      formData.append('referenceNumber', referenceNumber);
      formData.append('amount', amount);
      formData.append('screenshot', screenshot);
      formData.append('patientId', patientId);
      formData.append('patientName', patientName);

      const res = await fetch(`${backendUrl}/api/payment-proofs/submit`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setReferenceNumber('');
        setAmount('');
        setScreenshot(null);
        setPreview('');
        navigate('/my-appointments'); // redirect after success
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error('❌ Error submitting payment proof:', err);
      toast.error('Failed to submit payment proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <CreditCard size={32} />
        GCash Payment
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Scan QR Code</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <img src={gcashQRCode} alt="GCash QR" className="w-full max-w-sm mx-auto" />
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>Open GCash app</li>
              <li>Scan the QR code above</li>
              <li>Enter the appointment amount</li>
              <li>Complete the payment</li>
              <li>Take a screenshot of the receipt</li>
            </ol>
          </div>
        </div>

        {/* Submit Payment Proof Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Submit Payment Proof</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Reference Number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full border rounded px-4 py-2"
              required
            />
            <input
              type="number"
              placeholder="Amount Paid (₱)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded px-4 py-2"
              required
            />
            <div className="border-2 border-dashed border-gray-300 p-4 rounded text-center">
              {preview ? (
                <div className="space-y-2">
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
                  <button type="button" onClick={() => { setScreenshot(null); setPreview(''); }} className="text-red-500 text-sm hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <Upload size={40} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload screenshot</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" required />
                </label>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit Payment Proof'}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4">
            ⚠️ Your payment will be verified by admin before approval
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientGCashPayment;
