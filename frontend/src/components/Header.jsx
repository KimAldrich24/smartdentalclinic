import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <div className='flex flex-row items-center bg-blue-500 rounded-lg px-6 md:px-12 lg:px-16 py-8'>
      
      {/* Left side */}
      <div className='w-1/2 flex flex-col items-start gap-3'>
        <p className='text-2xl md:text-3xl lg:text-4xl text-white font-semibold leading-snug'>
          Book Appointment <br/> With Trusted Doctors
        </p>

        <div className='flex items-center gap-3 text-white text-sm font-light'>
          <img className='w-20 md:w-24' src={assets["group_profiles"]} alt="" />
          <p className='max-w-xs md:max-w-sm'>
            Simply browse through our list of trusted doctors, <br className='hidden sm:block'/> schedule your appointment hassle-free
          </p>
        </div>

        <a 
          href="#topdoctors" 
          className='flex items-center gap-2 bg-white px-6 py-2 rounded-full text-gray-700 text-sm mt-4 hover:scale-105 transition-all duration-300'
        >
          Book Appointment <img className='w-3' src={assets.arrow_icon} alt="" />
        </a>
      </div>

      {/* Right side */}
      <div className='w-1/2 flex justify-center'>
        <img 
          className='w-72 md:w-80 lg:w-96 rounded-lg object-contain' 
          src={assets.header_img} 
          alt="" 
        />
      </div>
    </div>
  )
}

export default Header
