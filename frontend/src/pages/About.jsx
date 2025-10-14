import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div
      style={{
        padding: '50px 20px',
        maxWidth: '1200px',
        margin: 'auto',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
      }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          ABOUT <span style={{ color: '#007bff' }}>US</span>
        </p>
      </div>

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row', // ✅ responsive
          alignItems: 'center',
          gap: '30px',
        }}
      >
        {/* Image Left */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <img
            src={assets.about_image}
            alt="About SmartDentalClinic"
            style={{
              width: '100%',
              maxWidth: '500px',
              borderRadius: '12px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
            }}
          />
        </div>

        {/* Text Right */}
        <div
          style={{
            flex: 1.5,
            lineHeight: '1.6',
            fontSize: '1rem',
          }}
        >
          <p style={{ marginBottom: '15px' }}>
            Welcome to <strong>SMART DENTAl CLINIC</strong>, your trusted partner in managing
            your healthcare needs conveniently and efficiently. At Smart dental, we
            understand the challenges individuals face when it comes to scheduling
            doctor appointments and managing health records.
          </p>

          <p style={{ marginBottom: '15px' }}>
            smart dental is committed to excellence in healthcare technology. We
            continuously strive to enhance our platform, integrating the latest
            advancements to improve user experience and deliver superior services.
            Whether you’re booking your first appointment or managing ongoing care,
            smart dental is here to support you every step of the way.
          </p>

          <h3
            style={{
              fontSize: '1.3rem',
              margin: '20px 0 10px',
              color: '#007bff',
            }}
          >
            Our Vision
          </h3>
          <p>
            Our vision at SmartDental Clinic is to create a seamless healthcare experience
            for every user. We aim to bridge the gap between patients and healthcare
            providers, making it easier for you to access the care you need, when
            you need it.
          </p>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="text-xl my-4">
        <p>
          WHY <span className="text-gray-700 font-semibold">CHOOSE US</span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-blue-500 hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>EFFICIENCY:</b>
          <p>Streamlined appointment scheduling that fits into your busy lifestyle.</p>
        </div>

        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-blue-500 hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>CONVENIENCE:</b>
          <p>Access to a network of trusted healthcare professionals in your area.</p>
        </div>

        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-blue-500 hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>PERSONALIZATION:</b>
          <p>Tailored recommendations and reminders to help you stay on top of your health.</p>
        </div>
      </div>
    </div>
  )
}

export default About
