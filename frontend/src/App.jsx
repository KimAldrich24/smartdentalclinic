import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Faq from "./pages/Faq";
import PatientPrescriptions from "../src/pages/PatientPrescriptions";
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsAndConditions from "./pages/TermsAndConditions";
import JobApplication from "./pages/JobApplication"; // 👈 add this


const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      

      < Navbar/>

      <Routes>
        <Route path='/' element= { <Home/>} />
        <Route path='/doctors' element= { <Doctors/>} />
        <Route path='/doctors/:speciality' element= { <Doctors/>} />
        <Route path='/login' element= { <Login/>} />
        <Route path='/about' element= { <About/>} />
        <Route path='/contact' element= { <Contact/>} />
        <Route path='/my-profile' element= { <MyProfile/>} />
        <Route path='/my-appointments' element= { <MyAppointments/>} />
        <Route path='/appointment/:docId' element= { <Appointment/>} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/apply" element={<JobApplication />} /> {/* 👈 add this */}



      </Routes> 
       <Footer/>
    </div>
  )
}

export default App



