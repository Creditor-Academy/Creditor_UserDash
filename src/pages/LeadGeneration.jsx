import React from 'react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import LeadHero from '../components/solutions/lead_generation/lead_hero.jsx';
import LeadWhyTop from '../components/solutions/lead_generation/lead_whytop.jsx';
import LeadSimpleSolution from '../components/solutions/lead_generation/lead_simplesolution.jsx';
import LeadCTASurpass from '../components/solutions/lead_generation/lead_cta_surpass.jsx';
import LeadFeatures from '../components/solutions/lead_generation/lead_features.jsx';
import LeadSucceed from '../components/solutions/lead_generation/lead_succeed.jsx';
import LeadDeliver from '../components/solutions/lead_generation/lead_deliver.jsx';

export const LeadGeneration = () => {
  return (
    <>
      <Navbar />
      <LeadHero />
      <LeadWhyTop />
      <LeadSimpleSolution />
      <LeadCTASurpass />
      <LeadFeatures />
      {/* <LeadSucceed /> */}
      <LeadDeliver />
      <Footer />
    </>
  );
};

export default LeadGeneration;
