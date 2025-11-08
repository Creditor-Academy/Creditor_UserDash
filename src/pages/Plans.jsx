import React from 'react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import PlansHero from '../components/Plans/PlansHero.jsx';
import Solutions from '../components/Plans/Solutions.jsx';
import Pricing from '../components/Plans/Pricing.jsx';

const Plans = () => {
  return (
    <>
      <Navbar />
      <div>
        <PlansHero />
        <Solutions />
        <Pricing />
      </div>
      <Footer />
    </>
  );
};

export default Plans;

