import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import WalkInAppointmentForm from "../../components/WalkInAppointmentForm"; // 🔑 import your form

const AllAppointments = () => {
  const { aToken, backendUrl } = useContext(AdminContext);

  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [showWalkInForm, setShowWalkInForm] = useState(false); // 🔑 Walk-in form toggle

  // 🔥 Filters
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/appointments`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (data.success) {
        setAppointments(data.appointments);
        setError(null);
      } else {
        setError(data.message || "Failed to load appointments");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // ✅ Delete appointment
  const deleteAppointment = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/appointments/${id}`,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        setAppointments((prev) => prev.filter((a) => a._id !== id));
        toast.success("Appointment deleted");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // ✅ Mark appointment as completed (admin)
  const markAsDone = async (appt) => {
    if (!window.confirm("Mark appointment as completed?")) return;

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/appointments/${appt._id}/admin-complete`,
        {},
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        toast.success("Appointment marked as completed ✅");
        fetchAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // ✅ Mark payment as paid
  const markAsPaid = async (appt) => {
    if (!window.confirm("Mark payment as Paid?")) return;

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/appointments/${appt._id}/mark-paid`,
        {},
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        toast.success("Payment marked as Paid 💰");
        fetchAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // ✅ Approve appointment (Admin)
  const approveAppointment = async (appt) => {
    if (!window.confirm("Approve this appointment?")) return;

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/appointments/${appt._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        toast.success("Appointment approved ✅");
        fetchAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (aToken) fetchAppointments();
  }, [aToken, backendUrl]);

  // ✅ Filter and sort appointments
  const filteredAppointments = appointments
    .filter((appt) => {
      const term = searchTerm.toLowerCase();
      return (
        appt.user?.name?.toLowerCase().includes(term) ||
        appt.doctor?.name?.toLowerCase().includes(term)
      );
    })
    .filter((appt) =>
      statusFilter === "all" ? true : appt.status === statusFilter.toUpperCase()
    )
    .filter((appt) => {
      const apptDate = new Date(appt.date);
      if (startDate && apptDate < new Date(startDate)) return false;
      if (endDate && apptDate > new Date(endDate)) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  if (!aToken)
    return <p className="p-4 text-red-500">Admin login required.</p>;

  if (error)
    return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="w-full min-w-0 overflow-x-hidden p-4 md:p-6">
      {/* 🔑 Header + Walk-in Button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-xl md:text-2xl font-semibold">All Appointments</p>
        <button
          onClick={() => setShowWalkInForm(prev => !prev)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          + Add Walk-in
        </button>
      </div>

      {/* 🔑 Walk-in Form */}
      {showWalkInForm && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <WalkInAppointmentForm onSuccess={fetchAppointments} />
          <button
            onClick={() => setShowWalkInForm(false)}
            className="mt-2 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-6">
        <input
          type="text"
          placeholder="Search patient or doctor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm min-w-[200px]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm min-w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="PENDING_ADMIN">Pending</option>
          <option value="APPROVED_ADMIN">Approved</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm min-w-[150px]"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm min-w-[150px]"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm min-w-[130px]"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* LIST OF APPOINTMENTS */}
      {filteredAppointments.length === 0 ? (
        <p className="text-gray-500">No appointments found.</p>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white shadow rounded-xl p-4 flex flex-col md:flex-row gap-4"
            >
              <img
                src={
                  appt.doctor?.image
                    ? `${backendUrl}/uploads/doctors/${appt.doctor.image}`
                    : "/placeholder-doctor.png"
                }
                alt="Doctor"
                className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
              />

              <div className="flex-1 text-sm">
                <p className="text-lg font-semibold">Dr. {appt.doctor?.name}</p>
                <p className="text-gray-500">{appt.doctor?.speciality}</p>
                <p className="mt-2">
                  <b>Patient:</b> {appt.childName || appt.patient?.name || "N/A"}{" "}
                  {appt.childName && `(Child of ${appt.bookedBy?.name})`}
                </p>
                <p><b>Booked By:</b> {appt.bookedBy?.name || "Self"}</p>
                <p><b>Date:</b> {appt.date} | {appt.time}</p>
                <p>
                  <b>Status:</b>{" "}
                  <span
                    className={
                      appt.status === "COMPLETED"
                        ? "text-green-600"
                        : appt.status === "CANCELLED"
                          ? "text-red-500"
                          : "text-blue-500"
                    }
                  >
                    {appt.status}
                  </span>
                </p>
                <p className="mt-1">
                  <b>Total Price:</b> ₱{appt.totalPrice?.toLocaleString() || 0}
                </p>
                {appt.additionalPayment > 0 && (
                  <p>
                    <b>Additional Payment:</b> ₱{appt.additionalPayment.toLocaleString()}
                  </p>
                )}
                <p><b>Payment Status:</b> {appt.paymentStatus || "Pending"}</p>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                {appt.status === "PENDING_ADMIN" && (
                  <button
                    onClick={() => approveAppointment(appt)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg w-full"
                  >
                    Approve
                  </button>
                )}

                {appt.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => markAsDone(appt)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg w-full"
                  >
                    Mark as Done
                  </button>
                )}

                {/* ✅ Mark Payment Paid */}
                {appt.status === "COMPLETED" && appt.paymentStatus !== "Paid" && (
                  <button
                    onClick={() => markAsPaid(appt)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
                  >
                    Mark Payment Paid
                  </button>
                )}

                {/* <button
                  onClick={() => deleteAppointment(appt._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg w-full"
                >
                  Delete
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllAppointments;