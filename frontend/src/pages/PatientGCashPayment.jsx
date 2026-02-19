import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Upload, CreditCard } from 'lucide-react';

const PatientGCashPayment = () => {
  const { appointmentId } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [referenceNumber, setReferenceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

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
      toast.error('Fill all fields and upload screenshot');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('appointmentId', appointmentId);
      formData.append('referenceNumber', referenceNumber);
      formData.append('amount', amount);
      formData.append('screenshot', screenshot);

      const res = await fetch(`${backendUrl}/api/payment-proofs/submit`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Created successfully!');
        setReferenceNumber('');
        setAmount('');
        setScreenshot(null);
        setPreview('');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <CreditCard size={28} />
        Submit Payment Proof
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Reference Number"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded p-2"
        />
        <div>
          {preview ? (
            <div className="mb-2">
              <img src={preview} alt="Preview" className="max-h-40" />
              <button type="button" onClick={() => { setScreenshot(null); setPreview(''); }}>
                Remove
              </button>
            </div>
          ) : (
            <input type="file" onChange={handleFileChange} />
          )}
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default PatientGCashPayment;
