// Home.jsx
import React from 'react';
import Header from '../components/Header';
import SpecialityMenu from '../components/SpecialityMenu';
import TopDoctors from '../components/TopDoctors';
import Banner from '../components/Banner';
import Reviews from '../pages/Reviews';
import AddReview from '../pages/AddReview';

const Home = () => {
  return (
    <div>
      <Header />
      {/* <SpecialityMenu /> */}
      <TopDoctors />

      {/* ⭐ REVIEW SECTION */}
      <div className="my-10 px-4 md:px-10 space-y-6">
        {/* AddReview: form for patients to submit a review */}
        <AddReview />

        {/* Reviews: show all existing reviews */}
        <Reviews />
      </div>

      <Banner />
    </div>
  );
};

export default Home;