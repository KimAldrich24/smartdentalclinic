import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const TopDoctors = () => {
  const navigate = useNavigate()
  const { doctors, loading } = useContext(AppContext)

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="flex justify-center items-center my-16">
        <p className="text-gray-500 text-lg">Loading doctors...</p>
      </div>
    )
  }

  // If no doctors found
  if (!doctors || doctors.length === 0) {
    return (
      <div className="flex justify-center items-center my-16">
        <p className="text-gray-500 text-lg">No doctors available at the moment.</p>
      </div>
    )
  }

  return (
    <div
      id="topdoctors"
      className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10"
    >
      <h1 className="text-3xl font-medium">All Our Dentist</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Browse through our extensive list of trusted dentist.
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {doctors.map((item) => (
          <div
            onClick={() => navigate(`/appointment/${item._id}`)}
            className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500"
            key={item._id}
          >
            {/* Doctor Image */}
            <img
              className="bg-blue-50 w-full h-48 object-cover"
              src={item.image || "/default-doctor.png"} // fallback if image missing
              alt={item.name}
              onError={(e) => {
                // Only set fallback if it's not already the fallback
                if (!e.target.src.includes("/default-doctor.png")) {
                  e.target.src = "/default-doctor.png"
                }
              }}
            />

            {/* Doctor Info */}
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-green-500">
                <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                <p>{item.available ? "Available" : "Unavailable"}</p>
              </div>
              <p className="text-gray-900 text-lg font-medium">{item.name}</p>
              <p className="text-gray-600 text-sm">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopDoctors