import React from 'react';
import Navbar from '../../components/navbar.jsx';
import Footer from '../../components/Footer.jsx';
import AboutHero from '../../components/AboutUs/AboutHero';
import AboutSection  from '../../components/AboutUs/About';
import Team from '../../components/AboutUs/Team';
import Principle from '../../components/AboutUs/Principle';
import Insights from '../../components/AboutUs/Insights';
const About = () => {
    return (
      <>
        <Navbar />
        <div>
          <AboutHero />
          <AboutSection/>
          <Team/>
          <Principle/>
          <Insights/>
          {/* Add other components here */}
        </div>
        <Footer />
      </>
    );
  };  
  export default About;