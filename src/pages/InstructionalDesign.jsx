import React from 'react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import HeroSection from '../components/InstructionalDesign/HeroSection.jsx';
import QuickValue from '../components/InstructionalDesign/QuickValue.jsx';
import ServicesOverview from '../components/InstructionalDesign/ServicesOverview.jsx';
import WhyChooseAthena from '../components/InstructionalDesign/WhyChooseAthena.jsx';
import FounderQuote from '../components/InstructionalDesign/FounderQuote.jsx';
import Approach from '../components/InstructionalDesign/Approach.jsx';
import OurClients from '../components/InstructionalDesign/OurClients.jsx';
import Technology from '../components/InstructionalDesign/Technology.jsx';
import CTA from '../components/InstructionalDesign/CTA.jsx';

const InstructionalDesign = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <QuickValue />
      <OurClients />
      <ServicesOverview />
      <WhyChooseAthena />
      <FounderQuote />
      <Approach />
      <Technology />
      <CTA />
      <Footer />
    </div>
  );
};

export default InstructionalDesign;