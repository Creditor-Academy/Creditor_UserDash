import React from 'react';
import Navbar from '../../components/navbar.jsx';
import Footer from '../../components/Footer.jsx';
import AboutHero from '../../components/AboutUs/AboutHero';
import AboutSection  from '../../components/AboutUs/About';
import Team from '../../components/AboutUs/Team';
import Principle from '../../components/AboutUs/Principle';
import Insights from '../../components/AboutUs/Insights';
import Video from '../../components/AboutUs/Video';
import Capabilities from '../../components/AboutUs/Capabilities';
import CoFounderQuote from '../../components/AboutUs/CoFounderQuote';
import GuidingStars from '../../components/AboutUs/GuidingStars';
const About = () => {
    return (
      <>
        <Navbar />
        <div>
          <AboutHero />
          <Video />
          <Capabilities />
          <CoFounderQuote />
          {/* <AboutSection/> */}
          {/* <Team/> */}
          <Principle/>
          <GuidingStars />
          {/* <Insights/> */}
          {/* Add other components here */}
        </div>
        <Footer />
      </>
    );
  };  
  export default About;