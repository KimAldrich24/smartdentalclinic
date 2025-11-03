import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ToothChart from '../components/ToothChart';
import ToothTreatmentModal from '../components/ToothTreatmentModal';

const MyToothHistory = () => {
  const { user, token } = useContext(AuthContext);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTreatments = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        // Update this URL to match your backend route
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/tooth-treatments/patient/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('Treatments loaded:', res.data);
        setTreatments(res.data.treatments || []);
      } catch (error) {
        console.error('Error fetching treatments:', error);
        setTreatments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, [user, token]);

  const handleToothClick = (toothNumber) => {
    console.log('Tooth clicked:', toothNumber);
    setSelectedTooth(toothNumber);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading your tooth history...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Tooth Treatment History</h1>
      
      <ToothChart 
        treatments={treatments}
        onToothClick={handleToothClick}
      />

      <ToothTreatmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        toothNumber={selectedTooth}
        treatments={treatments}
      />

      {/* Treatment Summary */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <p className="text-gray-600">
          Total treatments: <strong>{treatments.length}</strong>
        </p>
        <p className="text-gray-600">
          Teeth treated: <strong>{new Set(treatments.map(t => t.toothNumber)).size}</strong>
        </p>
      </div>
    </div>
  );
};

export default MyToothHistory;