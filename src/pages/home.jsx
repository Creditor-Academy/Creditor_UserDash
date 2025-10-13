import React from 'react'
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import Hero from '../components/homepage/herosection.jsx';
import About from '../components/homepage/about.jsx';
// import AboutHero from '../../components/homepage/AboutHero';
// import AboutFeatures from '../../components/homepage/AboutFeatures';
import Ready from '../components/homepage/readysection.jsx';
import Features from '../components/homepage/features.jsx';
import LearningSection from '../components/homepage/learningsection.jsx';
import Testimonial from '../components/homepage/Testimonial.jsx';
import HowWork from '../components/homepage/HowWork.jsx';


const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <About/>
      <HowWork />
      <Features />
      <LearningSection />
      <Ready />
      <Testimonial />
      
      <Footer />
    </>
  );
};

export default Home;