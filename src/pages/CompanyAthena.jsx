import React from 'react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import CompanyHero from '../components/solutions/company_athena/company_hero.jsx';

export const CompanyAthena = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CompanyHero />
      <Footer />
    </div>
  );
};

export default CompanyAthena;

