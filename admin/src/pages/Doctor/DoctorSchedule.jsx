import React, { useContext, useState, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { Trash2, Plus, Calendar, Clock } from 'lucide-react';

const DoctorSchedule = () => {
  const { dToken } = useContext(DoctorContext);
  const { backendUrl } = useContext(AdminContext);

  // All available services from admin
  const [allServices, setAllServices] = useState([]);
  
  // Doctor's selected services
  const [myServices, setMyServices] = useState([]);
  
  // Schedule state
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');

  // Fetch all services and doctor's data
  const fetchData = async () => {
    try {
      // Get all services
      const servicesRes = await fetch(`${backendUrl}/api/doctors/services/all`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const servicesData = await servicesRes.json();
      if (servicesData.success) {
        setAllServices(servicesData.services);
      }

      // Get doctor's services and schedule
      const myDataRes = await fetch(`${backendUrl}/api/doctors/my-data`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      const myData = await myDataRes.json();
      if (myData.success) {
        setMyServices(myData.services || []);
        setSchedule(myData.schedule || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    if (dToken) fetchData();
  }, [dToken]);

  // Add service to doctor's profile
  const handleAddService = async (serviceId) => {
    try {
      const res = await fetch(`${backendUrl}/api/doctors/my-services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${dToken}`,
        },
        body: JSON.stringify({ serviceId }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Service added!');
        setMyServices(data.services);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to add service');
    }
  };

  // Remove service from doctor's profile
  const handleRemoveService = async (serviceId) => {
    try {
      const res = await fetch(`${backendUrl}/api/doctors/my-services/${serviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${dToken}` },
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Service removed');
        setMyServices(data.services);
      }
    } catch (error) {
      toast.error('Failed to remove service');
    }
  };

  // Add time slot
  const handleAddSlot = () => {
    if (newSlot && !timeSlots.includes(newSlot)) {
      setTimeSlots([...timeSlots, newSlot]);
      setNewSlot('');
    }
  };

  // Remove time slot
  const handleRemoveSlot = (slot) => {
    setTimeSlots(timeSlots.filter(s => s !== slot));
  };

  // Save schedule
  const handleSaveSchedule = async () => {
    if (!selectedDate || timeSlots.length === 0) {
      toast.error('Please select a date and add time slots');
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/doctors/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${dToken}`,
        },
        body: JSON.stringify({ date: selectedDate, slots: timeSlots }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Schedule updated successfully!');
        setSchedule(data.schedule);
        setSelectedDate('');
        setTimeSlots([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to save schedule');
    }
  };

  // Check if service is already added
  const isServiceAdded = (serviceId) => {
    return myServices.some(s => s._id === serviceId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Services Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          🦷 My Services
        </h2>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Available Services (Select what you offer):</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allServices.map((service) => {
              const added = isServiceAdded(service._id);
              return (
                <div
                  key={service._id}
                  className={`border rounded-lg p-4 flex justify-between items-center transition ${
                    added ? 'bg-green-50 border-green-300' : 'bg-white hover:shadow-md'
                  }`}
                >
                  <div>
                    <h4 className="font-semibold text-gray-800">{service.name}</h4>
                    <p className="text-sm text-gray-600">
                      ₱{service.price} • {service.duration}
                    </p>
                    {service.description && (
                      <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                    )}
                  </div>
                  {added ? (
                    <button
                      onClick={() => handleRemoveService(service._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddService(service._id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                      Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-3">My Selected Services:</h3>
          {myServices.length === 0 ? (
            <p className="text-gray-500">No services selected yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myServices.map((service) => (
                <div
                  key={service._id}
                  className="bg-green-50 border border-green-300 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-gray-800">{service.name}</h4>
                  <p className="text-sm text-gray-600">
                    ₱{service.price} • {service.duration}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={24} /> My Schedule
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Time Slots
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none flex-1"
              />
              <button
                type="button"
                onClick={handleAddSlot}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
              >
                <Plus size={18} /> Add
              </button>
            </div>
          </div>

          {timeSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Time Slots:
              </label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm flex items-center gap-2"
                  >
                    <Clock size={14} />
                    {slot}
                    <button
                      onClick={() => handleRemoveSlot(slot)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSaveSchedule}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Save Schedule
          </button>
        </div>

        {/* Display saved schedules */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-3">Saved Schedules:</h3>
          {schedule.length === 0 ? (
            <p className="text-gray-500">No schedules added yet</p>
          ) : (
            <div className="space-y-3">
              {schedule.map((sch, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <p className="font-semibold text-gray-800 mb-2">
                    📅 {new Date(sch.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sch.slots.map((slot, i) => (
                      <span key={i} className="bg-white border px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Clock size={12} />
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;