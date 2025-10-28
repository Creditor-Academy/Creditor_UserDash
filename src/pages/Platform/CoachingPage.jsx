import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import Coachinghero from '../../components/Platform/Coaching/Coachinghero';

const CoachingPage = () => {
  return (
    <div>
      <Navbar />
      <Coachinghero />
      {/* Add more coaching-related components here */}
      <Footer />
    </div>
  );
};

export default CoachingPage;

