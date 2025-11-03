import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Upload, CreditCard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext'; // Changed from AdminContext

const PatientGCashPayment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext); // Get token from AuthContext
  const backendUrl = import.meta.env.VITE_BACKEND_URL; // Get backendUrl from env
  
  const [referenceNumber, setReferenceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Your GCash QR Code image URL (put your QR code image in public folder)
  const gcashQRCode = '/gcashqr.jpg';// Update this path

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!screenshot || !referenceNumber || !amount) {
      toast.error('Please fill all fields and upload screenshot');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('appointmentId', appointmentId);
      formData.append('referenceNumber', referenceNumber);
      formData.append('amount', amount);
      formData.append('screenshot', screenshot);
      formData.append('patientName', localStorage.getItem('patientName') || 'Patient');

      const res = await fetch(`${backendUrl}/api/payment-proofs/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Payment proof submitted successfully!');
        setTimeout(() => {
          navigate('/my-appointments');
        }, 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <CreditCard size={32} />
        GCash Payment
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GCash QR Code Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Step 1: Scan QR Code
          </h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <img
              src={gcashQRCode}
              alt="GCash QR Code"
              className="w-full max-w-sm mx-auto"
            />
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Instructions:</strong>
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 mt-2 space-y-1">
              <li>Open your GCash app</li>
              <li>Scan the QR code above</li>
              <li>Enter the appointment amount</li>
              <li>Complete the payment</li>
              <li>Take a screenshot of the receipt</li>
            </ol>
          </div>
        </div>

        {/* Payment Proof Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Step 2: Submit Payment Proof
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Enter GCash reference number"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Paid (₱)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Screenshot
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {preview ? (
                  <div className="space-y-2">
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshot(null);
                        setPreview('');
                      }}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <Upload size={40} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload screenshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
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