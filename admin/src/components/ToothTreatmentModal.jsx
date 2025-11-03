import React, { useState } from 'react';

const ToothTreatmentModal = ({ 
  isOpen, 
  onClose, 
  toothNumber, 
  patientId,
  treatments,
  onSave,
  isDoctor 
}) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const toothTreatments = treatments.filter(t => t.toothNumber === toothNumber);

  const handleSave = async () => {
    if (!notes.trim()) {
      alert('Please enter treatment notes');
      return;
    }

    setLoading(true);
    await onSave(toothNumber, notes);
    setLoading(false);
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Tooth #{toothNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Treatment History */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Treatment History:</h3>
          {toothTreatments.length === 0 ? (
            <p className="text-gray-500 italic">No treatments yet</p>
          ) : (
            <div className="space-y-3">
              {toothTreatments.map((treatment, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">
                    {new Date(treatment.treatmentDate).toLocaleDateString()} 
                    {treatment.doctorId?.name && ` - Dr. ${treatment.doctorId.name}`}
                  </p>
                  <p className="mt-1">{treatment.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Treatment (Doctor Only) */}
        {isDoctor && (
          <div>
            <h3 className="font-semibold mb-2">Add New Treatment:</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter treatment notes..."
              rows={4}
              className="w-full border rounded-lg p-3 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                {loading ? 'Saving...' : 'Save Treatment'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Close button for patients */}
        {!isDoctor && (
          <button
            onClick={onClose}
            className="w-full bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default ToothTreatmentModal;