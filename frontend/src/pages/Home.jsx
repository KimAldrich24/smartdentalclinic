import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import Reviews from '../components/Reviews';

const Home = () => {
  return (
    <div>
        <Header/>
       {/*  <SpecialityMenu/>  */}
        <TopDoctors/>
        {/* ⭐ REVIEWS SECTION */}
        <div className="my-10 px-4 md:px-10">
          <Reviews />
        </div>
        <Banner/>
    </div>
  )
}

export default Home