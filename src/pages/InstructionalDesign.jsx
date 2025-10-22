import React from 'react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import HeroSection from '../components/InstructionalDesign/HeroSection.jsx';
import QuickValue from '../components/InstructionalDesign/QuickValue.jsx';
import ServicesOverview from '../components/InstructionalDesign/ServicesOverview.jsx';

const InstructionalDesign = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <QuickValue />
      <ServicesOverview />
      <Footer />
    </div>
  );
};

export default InstructionalDesign;