import React from 'react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import RevenueHero from '../components/solutions/revenue_generation/revenue_hero.jsx';
import RevenueWhyTop from '../components/solutions/revenue_generation/revenue_whytop.jsx';
import SimpleSolution from '../components/solutions/revenue_generation/revenue_simplesolution.jsx';
import RevenueCTASurpass from '../components/solutions/revenue_generation/revenue_cta_surpass.jsx';
import RevenueFeatures from '../components/solutions/revenue_generation/revenue_features.jsx';
import RevenueSucceed from '../components/solutions/revenue_generation/revenue_succeed.jsx';
import RevenueDeliver from '../components/solutions/revenue_generation/revenue_deliver.jsx';
import RevenueBenefits from '../components/solutions/revenue_generation/revenue_benefits.jsx';
import RevenueStrategies from '../components/solutions/revenue_generation/revenue_strategies.jsx';
import RevenueGrowth from '../components/solutions/revenue_generation/revenue_growth.jsx';
import RevenuePricing from '../components/solutions/revenue_generation/revenue_pricing.jsx';
import RevenueCTA from '../components/solutions/revenue_generation/revenue_cta.jsx';

export const RevenueGeneration = () => {
  return (
    <>
      <Navbar />
      <RevenueHero />
      <RevenueWhyTop />
      <SimpleSolution />
      <RevenueCTASurpass />
      <RevenueFeatures />
      <RevenueSucceed />
      <RevenueDeliver />
      {/* <RevenueBenefits /> */}
      {/* <RevenueStrategies /> */}
      {/* <RevenueGrowth /> */}
      {/* <RevenuePricing /> */}
      {/* <RevenueCTA /> */}
      <Footer />
    </>  
  );
};

export default RevenueGeneration;

