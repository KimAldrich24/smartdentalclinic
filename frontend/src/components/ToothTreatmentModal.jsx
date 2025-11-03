import React from 'react';

const ToothTreatmentModal = ({ 
  isOpen, 
  onClose, 
  toothNumber, 
  treatments
}) => {
  if (!isOpen) return null;

  // Filter treatments for this specific tooth
  const toothTreatments = treatments.filter(t => t.toothNumber === toothNumber);

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
          <h3 className="font-semibold mb-3">Treatment History:</h3>
          {toothTreatments.length === 0 ? (
            <p className="text-gray-500 italic">No treatments recorded for this tooth</p>
          ) : (
            <div className="space-y-3">
              {toothTreatments.map((treatment, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Date:</strong> {new Date(treatment.treatmentDate).toLocaleDateString()}
                  </p>
                  {treatment.doctorId?.name && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Doctor:</strong> Dr. {treatment.doctorId.name}
                    </p>
                  )}
                  <p className="text-sm">
                    <strong>Treatment Notes:</strong>
                  </p>
                  <p className="mt-1 text-gray-700">{treatment.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ToothTreatmentModal;