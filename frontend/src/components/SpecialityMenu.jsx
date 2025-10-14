import React from 'react'
import { specialityData } from '../assets/assets'    
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
  return (
    <div className='flex flex-col items-center gap-4 py-16 text-gray-800 ' id='speciality'>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Find by Speciality</h1>
      <p className="text-gray-500 mb-6">Simple browse through our extensive list of trusted doctors, schedule your appointment hassle free.</p>

      {/* grid for layout */}
      <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-scroll">
        {specialityData.map((item, index) => (
          <Link onClick={()=>scrollTo(0,0)} className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover hover:-translate-y-2 transition-all duration-500'
            key={index} 
            to={`/doctors/${item.speciality}`} 
           
          >
            <img 
              src={item.image} 
              alt={item.speciality} 
              className="w-16 sm:w-24 mb-3"
            />
            <p className="text-sm font-medium text-gray-700">{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SpecialityMenu
