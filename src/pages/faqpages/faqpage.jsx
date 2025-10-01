import React from 'react'
import Navbar from '../../components/navbar.jsx';
import Footer from '../../components/Footer.jsx';
import Hero from '../../components/faq/hero'

const faqpage = () => {
  return (
    <>
      <Navbar />
      <div>
          <Hero/>
      </div>
      <Footer />
    </>
  );
};
export default faqpage;
