import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
    
    const navigate = useNavigate();


  return (
    <div className="flex items-center justify-between bg-blue-500 rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10 overflow-hidden">

      
      {/*----------- Left Side ----------*/}
      <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5 z-10">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white">
          <p>Book Appointment</p>
          <p className="mt-4">With 100+ Doctors</p>
        </div>
        <button onClick={()=>{navigate('/login'); scrollTo(0,0)}} className="mt-6 bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition">
  Create Button
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
