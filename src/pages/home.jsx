import React from 'react'
import Navbar from '@/components/navbar.jsx';
import Footer from '@/components/Footer.jsx';
import Hero from '@/components/homepage/hero.jsx';
import About from '@/components/homepage/about.jsx';
import AboutHero from '@/components/homepage/AboutHero.jsx';
import AboutFeatures from '@/components/homepage/AboutFeatures.jsx';
//import Ready from '@/components/Ready.jsx';
import Features from '@/components/homepage/features.jsx';
import LearningSection from '@/components/homepage/learningsection.jsx';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <About/>
      <Features />
      <LearningSection />
      <Footer />
      {/* <Ready /> */}
    </>
  );
};

export default Home;