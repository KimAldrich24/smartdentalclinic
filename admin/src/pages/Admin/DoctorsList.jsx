import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { toast } from "react-toastify";

const DoctorsList = () => {
  const { doctors, getAllDoctors, removeDoctor } = useContext(AdminContext);

  useEffect(() => {
    getAllDoctors();
  }, []);

  const handleRemove = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to remove this doctor?"
    );
    if (!confirm) return;

    try {
      await removeDoctor(id);
      toast.success("Doctor removed successfully!");
      getAllDoctors();
    } catch (err) {
      toast.error("Failed to remove doctor.");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Dentist List</h2>

      {doctors.length === 0 ? (
        <p>No doctors found.</p>
      ) : (
        <>
          {/* ===================== */}
          {/* 🖥 DESKTOP TABLE */}
          {/* ===================== */}
          <div className="hidden md:block">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="border p-2">{doc.name}</td>
                    <td className="border p-2">{doc.email}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleRemove(doc._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===================== */}
          {/* 📱 MOBILE CARD VIEW */}
          {/* ===================== */}
          <div className="md:hidden space-y-4">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white border rounded-xl shadow-sm p-4"
              >
                <p className="text-lg font-semibold">{doc.name}</p>
                <p className="text-sm text-gray-600 break-all">
                  {doc.email}
                </p>

                <button
                  onClick={() => handleRemove(doc._id)}
                  className="mt-3 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Remove Doctor
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorsList;
