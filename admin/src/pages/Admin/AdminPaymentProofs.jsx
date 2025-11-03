import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { AdminContext } from '../../context/AdminContext';

const AdminPaymentProofs = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [proofs, setProofs] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchProofs = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? `${backendUrl}/api/payment-proofs/all`
        : `${backendUrl}/api/payment-proofs/all?status=${filter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${aToken}` }
      });

      const data = await res.json();
      if (data.success) {
        setProofs(data.proofs);
      }
    } catch (error) {
      console.error('Error fetching proofs:', error);
      toast.error('Failed to load payment proofs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aToken) fetchProofs();
  }, [filter, aToken]);

  const handleApprove = async (proofId) => {
    try {
      const res = await fetch(`${backendUrl}/api/payment-proofs/approve/${proofId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${aToken}` }
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Payment approved!');
        fetchProofs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  const handleReject = async (proofId) => {
    if (!rejectionReason) {
      toast.error('Please provide rejection reason');
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/payment-proofs/reject/${proofId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aToken}`
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Payment rejected');
        setSelectedProof(null);
        setRejectionReason('');
        fetchProofs();
      }
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Payment Proofs</h1>

      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : proofs.length === 0 ? (
        <p className="text-center text-gray-500">No payment proofs found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proofs.map((proof) => (
            <div key={proof._id} className="bg-white rounded-xl shadow-lg p-4">
              <img
                src={`${backendUrl}/uploads/payment-proofs/${proof.screenshot}`}
                alt="Payment Screenshot"
                className="w-full h-48 object-cover rounded-lg mb-3"
              />

              <div className="space-y-2 text-sm">
                <p><strong>Patient:</strong> {proof.patientName}</p>
                <p><strong>Reference:</strong> {proof.referenceNumber}</p>
                <p><strong>Amount:</strong> ₱{proof.amount}</p>
                <p><strong>Submitted:</strong> {new Date(proof.submittedAt).toLocaleDateString()}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`font-semibold ${
                    proof.status === 'approved' ? 'text-green-600' :
                    proof.status === 'rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {proof.status.toUpperCase()}
                  </span>
                </p>
              </div>

              {proof.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(proof._id)}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button
                    onClick={() => setSelectedProof(proof)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-1"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject Payment Proof</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this payment:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-red-400 outline-none"
              rows="4"
              placeholder="e.g., Invalid reference number, screenshot not clear..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedProof(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedProof._id)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentProofs;  