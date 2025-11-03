import React from 'react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import AcademicHero from '../components/solutions/academic_athena/academic_hero.jsx';
import AcademicChoose from '../components/solutions/academic_athena/academic_choose.jsx';
import AcademicFeature from '../components/solutions/academic_athena/academic_feature.jsx';
import AcademicAnswer from '../components/solutions/academic_athena/academic_answer.jsx';
// import AcademicSucceed from '../components/solutions/academic_athena/academic_succeed.jsx';
import AcademicScale from '../components/solutions/academic_athena/academic_scale.jsx';

export const AcademicAthena = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <AcademicHero />
      <AcademicChoose />
      <AcademicAnswer />
      <AcademicFeature />
      {/* <AcademicSucceed /> */}
      <AcademicScale />
      <Footer />
    </div>
  );
};

export default AcademicAthena;
