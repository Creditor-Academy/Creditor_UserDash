import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import Coachinghero from '../../components/Platform/Coaching/Coachinghero';
import Coachingvisitor from '../../components/Platform/Coaching/Coachingvisitor';
import Coachingfaq from '../../components/Platform/Coaching/Coachingfaq';
import Coachingcta from '../../components/Platform/Coaching/Coachingcta';
const CoachingPage = () => {
  return (
    <div>
      <Navbar />
      <Coachinghero />
      <Coachingvisitor />
      <Coachingfaq />
      <Coachingcta />
        {/* Add more coaching-related components here */}
      <Footer />
    </div>
  );
};

export default CoachingPage;

