import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Banner = () => {
    
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    // ✅ If user is logged in (token exists), don't show the banner
    if (token) {
      return null;
    }

  return (
    <div className="flex items-center justify-between bg-blue-500 rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10 overflow-hidden">

      
      {/*----------- Left Side ----------*/}
      <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5 z-10">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white">
          <p>Book Appointment</p>
          <p className="mt-4">With 100+ Doctors</p>
        </div>
        
        {/* ✅ Improved button design */}
        <button 
          onClick={() => {navigate('/login'); scrollTo(0,0)}} 
          className="mt-6 bg-white text-blue-600 px-8 py-3 rounded-full font-semibold text-sm sm:text-base hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          Create Account
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>

      {/*----------- Right Side ----------*/}
      <div className="hidden md:flex md:w-1/2 lg:w-[370px] items-end justify-end">
        <img
          className="w-full max-w-md object-contain"
          src={assets.appointment_img}
          alt="Appointment"
        />
      </div>
    </div>
  )
}

export default Banner