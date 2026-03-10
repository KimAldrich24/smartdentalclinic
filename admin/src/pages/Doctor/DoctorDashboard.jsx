import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from "../../context/DoctorContext";
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { Calendar, LogOut, Plus, Clock } from 'lucide-react';

const DoctorDashboard = () => {

const navigate = useNavigate();
const { doctor, dToken, logoutDoctor } = useContext(DoctorContext);
const { backendUrl } = useContext(AdminContext);

const [appointments,setAppointments] = useState([]);
const [loadingAppointments,setLoadingAppointments] = useState(true);

const [services,setServices] = useState([]);
const [equipment,setEquipment] = useState([]);

const [selectedDate,setSelectedDate] = useState('');
const [timeSlots,setTimeSlots] = useState([]);
const [newSlot,setNewSlot] = useState('');

const [mySchedules,setMySchedules] = useState([]);
const [loadingSchedules,setLoadingSchedules] = useState(true);



const handleLogout = () => {
logoutDoctor();
toast.success('Logged out successfully');
navigate('/login');
};



const fetchAppointments = async () => {

if(!dToken) return;

try{

setLoadingAppointments(true);

const res = await fetch(`${ backendUrl } /api/appointments / doctor / my - appointments`,{
headers:{Authorization:`Bearer ${ dToken } `}
});

const data = await res.json();

if(data.success) setAppointments(data.appointments);
else toast.error(data.message || 'Failed to fetch appointments');

}catch(err){
console.error(err);
toast.error('Failed to load appointments');
}
finally{
setLoadingAppointments(false);
}

};



const fetchServices = async () => {

if(!dToken) return;

try{

const res = await fetch(`${ backendUrl } /api/services`,{
headers:{Authorization:`Bearer ${ dToken } `}
});

const data = await res.json();

if(data.success) setServices(data.services);
else toast.error(data.message || 'Failed to fetch services');

}catch(err){
console.error(err);
toast.error('Error fetching services');
}

};



const fetchEquipment = async () => {

try{

const res = await fetch(`${ backendUrl } /api/equipment`,{
headers:{Authorization:`Bearer ${ dToken } `}
});

const data = await res.json();

if(data.success) setEquipment(data.equipment);

}catch(err){
console.error(err);
}

};



const fetchMySchedules = async () => {

try{

setLoadingSchedules(true);

const res = await fetch(`${ backendUrl } /api/doctor / schedule - request / doctor`,{
headers:{Authorization:`Bearer ${ dToken } `}
});

const data = await res.json();

if(data.success) setMySchedules(data.requests);
else toast.error(data.message || 'Failed to fetch schedules');

}catch(err){
console.error(err);
toast.error('Error fetching schedules');
}
finally{
setLoadingSchedules(false);
}

};



useEffect(()=>{

if(dToken){

fetchAppointments();
fetchServices();
fetchEquipment();
fetchMySchedules();

}

},[dToken]);



const handleUpdateAppointment = async(apptId,selectedServiceIds,finalPrice,usedEquipment)=>{

try{

const servicesPayload = selectedServiceIds.map(id=>{
const svc = services.find(s=>s._id===id);
return{
serviceId:id,
price:finalPrice || (svc?.price ?? 0)
};
});

const res = await fetch(`${ backendUrl } /api/appointments / doctor / ${ apptId }/assign-services`,{

method: 'PUT',

  headers: {
  Authorization: `Bearer ${dToken}`,
    'Content-Type': 'application/json'
},

body: JSON.stringify({
  services: servicesPayload,
  equipmentUsed: usedEquipment
})

});

const data = await res.json();

if (data.success) {
  toast.success('Appointment updated successfully');
  fetchAppointments();
}
else toast.error(data.message || 'Failed to update appointment');

}catch (err) {
  console.error(err);
  toast.error('Error updating appointment');
}

};



const handleAddSlot = () => {

  if (!newSlot) return toast.error("Select a time first");
  if (timeSlots.includes(newSlot)) return toast.error("Time slot already added");

  setTimeSlots([...timeSlots, newSlot]);
  setNewSlot('');

};



const handleRemoveSlot = (slot) => {
  setTimeSlots(timeSlots.filter(s => s !== slot));
};



const handlePushSchedule = async () => {

  if (!selectedDate || timeSlots.length === 0)
    return toast.error("Select date and slots");

  try {

    const res = await fetch(`${backendUrl}/api/doctor/schedule-request`, {

      method: 'POST',

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dToken}`
      },

      body: JSON.stringify({
        date: selectedDate,
        slots: timeSlots
      })

    });

    const data = await res.json();

    if (data.success) {

      toast.success("Schedule pushed to admin!");
      setSelectedDate('');
      setTimeSlots([]);
      fetchMySchedules();

    }
    else toast.error(data.message || "Failed to push schedule");

  } catch (err) {
    console.error(err);
    toast.error("Error pushing schedule");
  }

};



return (

  <div className="min-h-[100dvh] max-w-6xl mx-auto px-4 py-6 md:p-6">


    {/* HEADER */}

    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-5 md:p-6 mb-8 shadow-lg">

      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">

        <h1 className="text-2xl md:text-3xl font-bold">
          👨‍⚕️ Doctor Dashboard
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

          <button
            onClick={() => navigate("/doctor-change-password")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md w-full md:w-auto"
          >
            🔒 Change Password
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      </div>



      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        <div className="flex items-center gap-4">

          {doctor?.image ? (

            <img
              src={`${backendUrl}/uploads/doctors/${doctor.image}`}
              alt={doctor.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white"
            />

          ) : (

            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-3xl">
              👨‍⚕️
            </div>

          )}

          <div>

            <h2 className="text-xl md:text-2xl font-semibold">
              {doctor?.name || 'Doctor'}
            </h2>

            <p className="text-green-100">{doctor?.degree}</p>
            <p className="text-green-100">{doctor?.speciality}</p>

            <p className="text-sm text-green-100 mt-1">
              📧 {doctor?.email}
            </p>

          </div>
        </div>



        <button
          onClick={() => navigate('/doctor-schedule')}
          className="bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 font-semibold shadow-md flex items-center justify-center gap-2 w-full md:w-auto"
        >

          <Calendar size={20} />
          Manage Schedule & Services

        </button>

      </div>
    </div>



    {/* APPOINTMENTS */}

    <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 mb-8">

      <h2 className="text-xl md:text-2xl font-bold mb-5 border-b pb-2">
        📅 My Appointments
      </h2>

      {loadingAppointments ?

        <p className="text-center text-gray-500 py-10">
          Loading appointments...
        </p>

        :

        appointments.length === 0 ?

          <p className="text-center text-gray-500 py-10">
            No appointments yet.
          </p>

          :

          appointments.map(appt => (
            <AppointmentCard
              key={appt._id}
              appointment={appt}
              services={services}
              equipment={equipment}
              onUpdate={handleUpdateAppointment}
            />
          ))

      }

    </div>



    {/* PUSH SCHEDULE */}

    <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 mb-8">

      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
        <Calendar size={20} />
        Push Schedule to Admin
      </h2>

      <div className="mb-3">

        <label className="block mb-1">Select Date</label>

        <input
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />

      </div>


      <div className="mb-3">

        <label className="block mb-1">Add Time Slots</label>

        <div className="flex gap-2">

          <input
            type="time"
            value={newSlot}
            onChange={e => setNewSlot(e.target.value)}
            className="border px-3 py-2 rounded flex-1"
          />

          <button
            onClick={handleAddSlot}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-1"
          >

            <Plus size={16} />
            Add

          </button>

        </div>
      </div>


      {timeSlots.length > 0 && (

        <div className="flex flex-wrap gap-2 mb-3">

          {timeSlots.map((t, i) => (
            <span
              key={i}
              className="bg-blue-100 px-3 py-1 rounded flex items-center gap-1"
            >

              <Clock size={12} />
              {t}

              <button
                onClick={() => handleRemoveSlot(t)}
                className="text-red-500 font-bold"
              >

                ×

              </button>

            </span>
          ))}

        </div>

      )}


      <button
        onClick={handlePushSchedule}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >

        Push to Admin

      </button>

    </div>



    {/* MY PUSHED SCHEDULES */}

    <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 mb-8">

      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">

        <Calendar size={20} />
        My Pushed Schedules

      </h2>


      {loadingSchedules ?

        <p className="text-center text-gray-500 py-10">
          Loading schedules...
        </p>

        :

        mySchedules.length === 0 ?

          <p className="text-center text-gray-500 py-10">
            No schedules yet.
          </p>

          :

          <div className="space-y-3">

            {mySchedules.map(schedule => (
              <div
                key={schedule._id}
                className="border rounded-xl p-3 flex flex-col md:flex-row md:justify-between gap-2"
              >

                <div>

                  <p className="font-semibold">
                    📅 Date: {schedule.date}
                  </p>

                  <p className="flex flex-wrap gap-2 items-center">

                    🕐 Slots:

                    {schedule.slots.map((slot, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 px-2 py-1 rounded"
                      >

                        {slot}

                      </span>
                    ))}

                  </p>

                </div>

                <div className="text-sm text-gray-500">

                  <p>
                    Requested at: {new Date(schedule.createdAt).toLocaleString()}
                  </p>

                </div>

              </div>
            ))}

          </div>

      }

    </div>

  </div>

);

};



const AppointmentCard = ({ appointment, services, equipment, onUpdate }) => {

  const [selectedServices, setSelectedServices] = useState(
    appointment.services?.map(s => s.service?._id) || []
  );

  const [finalPrice, setFinalPrice] = useState(
    appointment.services?.reduce((acc, s) => acc + (s.price ?? 0), 0) || 0
  );

  const [usedEquipment, setUsedEquipment] = useState({});



  const toggleService = (serviceId) => {

    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );

  };



  const updateEquipment = (id, qty) => {

    setUsedEquipment({
      ...usedEquipment,
      [id]: Number(qty)
    });

  };



  const handleSave = () => {

    if (selectedServices.length === 0)
      return alert('Select at least one service');

    onUpdate(
      appointment._id,
      selectedServices,
      finalPrice,
      usedEquipment
    );

  };



  return (

    <div className="border rounded-xl p-4 md:p-5 mb-4 hover:shadow-md transition">

      <div className="flex flex-col md:flex-row md:justify-between gap-4">

        <div>

          <div className="flex flex-wrap items-center gap-2 mb-3">

            <span className="font-semibold text-gray-800">
              {appointment.user?.name}
            </span>

            <span className={`px-3 py-1 rounded-full text-xs font-medium
${appointment.status === 'COMPLETED'
                ? 'bg-green-100 text-green-700'
                : appointment.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'}`}>

              {appointment.status}

            </span>

          </div>


          <div className="text-sm text-gray-600 space-y-1">

            <p>📧 {appointment.user?.email}</p>
            <p>📞 {appointment.user?.phone || 'No phone'}</p>

            <p>📅 {appointment.date}</p>
            <p>🕐 {appointment.time}</p>

          </div>



          {(appointment.status === 'APPROVED_ADMIN'
            || appointment.status === 'IN_PROGRESS') && (

              <div className="mt-3">

                <p className="font-semibold">Select Services:</p>

                <div className="flex flex-wrap gap-2 mt-1">

                  {services.map(svc => (
                    <button
                      key={svc._id}
                      onClick={() => toggleService(svc._id)}
                      className={`px-3 py-1 border rounded-full text-sm
${selectedServices.includes(svc._id)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-800'}`}
                    >

                      {svc.name} ₱{svc.price}

                    </button>
                  ))}

                </div>



                <div className="mt-3">

                  <p className="font-semibold mb-1">
                    Equipment Used
                  </p>

                  {equipment.map(eq => (
                    <div
                      key={eq._id}
                      className="flex items-center gap-2 mb-1"
                    >

                      <span className="w-40">
                        {eq.name}
                      </span>

                      <input
                        type="number"
                        min="0"
                        className="border px-2 py-1 rounded w-24"
                        onChange={(e) => updateEquipment(eq._id, e.target.value)}
                      />

                    </div>
                  ))}

                </div>



                <div className="mt-2 flex items-center gap-2">

                  <label className="font-semibold">
                    Final Price:
                  </label>

                  <input
                    type="number"
                    className="border px-2 py-1 rounded w-32"
                    value={finalPrice}
                    onChange={e => setFinalPrice(Number(e.target.value))}
                  />

                  <button
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                    onClick={handleSave}
                  >

                    Save

                  </button>

                </div>

              </div>

            )}

        </div>

      </div>

    </div>

  );

};

export default DoctorDashboard;
