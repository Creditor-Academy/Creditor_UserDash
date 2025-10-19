import React from 'react'
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import Hero from '../components/homepage/herosection.jsx';
import About from '../components/homepage/about.jsx';
// import AboutHero from '../../components/homepage/AboutHero';
// import AboutFeatures from '../../components/homepage/AboutFeatures';
import Pricing from '../components/homepage/Pricing.jsx';
import Video from '../components/homepage/Video.jsx';
import PromotionalSection from '../components/homepage/PromotionalSection.jsx';
import Buildfeature from '../components/homepage/Buildfeature.jsx';
import Customerpay from '../components/homepage/Customerpay.jsx';
import Ready from '../components/homepage/readysection.jsx';
import Features from '../components/homepage/features.jsx';
import LearningSection from '../components/homepage/learningsection.jsx';
import Testimonial from '../components/homepage/Testimonial.jsx';
// import HowWork from '../components/homepage/HowWork.jsx';
import KeyCapabilities from '../components/homepage/KeyCapabilities.jsx';
import MonetizeSection from '../components/homepage/MonetizeSection.jsx';
import LearningPathways from '../components/homepage/LearningPathways.jsx';
import CTA from '../components/homepage/cta.jsx';


const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      {/* <About/> */}
      <KeyCapabilities />
      <MonetizeSection />
      <Pricing />
      <Video />
      <PromotionalSection />
      <Buildfeature />
      <Customerpay />
      {/* <HowWork /> */}
      {/* <Features /> */}
      {/* <LearningSection /> */}
      {/* <LearningPathways /> */}
      {/* <Testimonial />
      <CTA /> */}
      <Ready />
      <Footer />
    </>
  );
};

export default Home;