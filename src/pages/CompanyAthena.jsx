import React from 'react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import CompanyHero from '../components/solutions/company_athena/company_hero.jsx';
import CompanyChoose from '../components/solutions/company_athena/company_choose.jsx';
import CompanyAnswers from '../components/solutions/company_athena/company_answer.jsx';
import Companyfeatures from '../components/solutions/company_athena/company_feature.jsx';
import CompanyEnterprise from '../components/solutions/company_athena/company_enterprise.jsx';
// import CompanyCase from '../components/solutions/company_athena/company_case.jsx';
import CompanyScale from '../components/solutions/company_athena/company_scale.jsx';
export const CompanyAthena = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CompanyHero />
      <CompanyChoose />
      <CompanyAnswers />
      <Companyfeatures />
      <CompanyEnterprise />
      {/* <CompanyCase /> */}
      <CompanyScale />
      <Footer />
    </div>  
    );
};

export default CompanyAthena;

