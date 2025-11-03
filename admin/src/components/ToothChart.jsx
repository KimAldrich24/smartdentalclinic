import React from 'react';

const ToothChart = ({ treatments, onToothClick, isDoctor }) => {
  // Generate 32 teeth (1-32)
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => i + 17);

  // Check if tooth has been treated
  const isToothTreated = (toothNum) => {
    return treatments.some(t => t.toothNumber === toothNum);
  };

  // Get treatment count for a tooth
  const getToothTreatmentCount = (toothNum) => {
    return treatments.filter(t => t.toothNumber === toothNum).length;
  };

  const ToothButton = ({ number }) => {
    const treated = isToothTreated(number);
    const count = getToothTreatmentCount(number);

    return (
      <button
        onClick={() => onToothClick(number)}
        className={`
          relative w-12 h-16 rounded-lg border-2 transition-all
          ${treated 
            ? 'bg-red-400 border-red-600 text-white' 
            : 'bg-white border-gray-300 hover:bg-blue-50'
          }
          ${isDoctor ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
        `}
      >
        <div className="font-bold text-sm">{number}</div>
        {count > 0 && (
          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {count}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-center">Dental Chart</h3>
      
      {/* Upper Jaw */}
      <div className="mb-8">
        <p className="text-sm text-gray-600 mb-2 text-center">Upper Jaw</p>
        <div className="grid grid-cols-8 gap-2 mb-2">
          {upperTeeth.slice(0, 8).map(num => (
            <ToothButton key={num} number={num} />
          ))}
        </div>
        <div className="grid grid-cols-8 gap-2">
          {upperTeeth.slice(8, 16).reverse().map(num => (
            <ToothButton key={num} number={num} />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-gray-300 my-4"></div>

      {/* Lower Jaw */}
      <div>
        <p className="text-sm text-gray-600 mb-2 text-center">Lower Jaw</p>
        <div className="grid grid-cols-8 gap-2 mb-2">
          {lowerTeeth.slice(0, 8).map(num => (
            <ToothButton key={num} number={num} />
          ))}
        </div>
        <div className="grid grid-cols-8 gap-2">
          {lowerTeeth.slice(8, 16).reverse().map(num => (
            <ToothButton key={num} number={num} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-300"></div>
          <span>Untreated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 border-2 border-red-600"></div>
          <span>Treated</span>
        </div>
      </div>
    </div>
  );
};

export default ToothChart;