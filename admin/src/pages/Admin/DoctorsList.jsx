import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { toast } from "react-toastify";

const DoctorsList = () => {
  const { doctors, getAllDoctors, removeDoctor } = useContext(AdminContext);

  useEffect(() => {
    getAllDoctors();
  }, []);

  const handleRemove = async (id) => {
    const confirm = window.confirm("Are you sure you want to remove this doctor?");
    if (!confirm) return;

    try {
      await removeDoctor(id); // call context function
      toast.success("Doctor removed successfully!");
      getAllDoctors(); // refresh list
    } catch (err) {
      toast.error("Failed to remove doctor.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Doctors List</h2>
      {doctors.length === 0 ? (
        <p>No doctors found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Fees</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc._id}>
                <td className="border p-2">{doc.name}</td>
                <td className="border p-2">{doc.email}</td>
                <td className="border p-2">{doc.fees}</td>
                <td className="border p-2">
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
      )}
    </div>
  );
};

export default DoctorsList;
