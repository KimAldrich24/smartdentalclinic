import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors`);
      console.log("Doctors API response:", data); // Debugging
      if (data.success) setDoctors(data.doctors);
      else toast.error(data.message || "Failed to fetch doctors");
    } catch (err) {
      console.error("Doctors fetch error:", err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500">Loading doctors...</p>
    );

  return (
    <div className="px-6 md:px-12 lg:px-16 py-10">
      <p className="text-2xl font-semibold text-gray-800 mb-6">
        Our Dental Specialists
      </p>

      {doctors.length === 0 ? (
        <p className="text-gray-500 italic">No doctors available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="border border-blue-200 rounded-xl overflow-hidden bg-white shadow-md hover:-translate-y-2 transition-all duration-500"
            >
              <img
                className="w-full h-48 object-cover bg-blue-50"
                src={
                  doc.image
                    ? `${backendUrl}/uploads/doctors/${doc.image}`
                    : "/placeholder-doctor.png"
                }
                alt={doc.name}
              />
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                  <p>{doc.available ? "Available" : "Not Available"}</p>
                </div>
                <p className="text-gray-900 text-lg font-medium">{doc.name}</p>
                <p className="text-gray-600 text-sm">{doc.speciality}</p>
                {doc.experience && (
                  <p className="text-gray-500 text-sm">
                    Experience: {doc.experience} yrs
                  </p>
                )}
                {doc.fees && (
                  <p className="text-gray-500 text-sm">Fees: ${doc.fees}</p>
                )}
                {doc.degree && (
                  <p className="text-gray-500 text-sm">Degree: {doc.degree}</p>
                )}

                {/* ✅ Appointment button */}
                <button
                  onClick={() => navigate(`/appointment/${doc._id}`)}
                  className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
