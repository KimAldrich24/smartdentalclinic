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
      id="topdoctors" // ✅ Added ID so Header button can scroll here
      className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10"
    >
      <h1 className="text-3xl font-medium">Top Doctors To Book</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {doctors.slice(0, 10).map((item) => (
          <div
            onClick={() => navigate(`/appointment/${item._id}`)}
            className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500"
            key={item._id}
          >
            {/* Doctor Image */}
            <img
              className="bg-blue-50 w-full h-48 object-cover"
              src={item.image}
              alt={item.name}
              onError={(e) => {
                e.target.src = "/default-doctor.png" // fallback image
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

      {/* More Button */}
      <button
        onClick={() => {
          navigate("/doctors")
          scrollTo(0, 0)
        }}
        className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10"
      >
        more
      </button>
    </div>
  )
}

export default TopDoctors
