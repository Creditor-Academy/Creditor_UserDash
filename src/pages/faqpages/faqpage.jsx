import React from 'react'
import Navbar from '../../components/navbar.jsx';
import Footer from '../../components/Footer.jsx';
// import Hero from '../../components/faq/hero'
import Resources from '../../components/faq/Resources'

const faqpage = () => {
  return (
    <>
      <Navbar />
      <div>
          {/* <Hero/> */}
          <Resources/>
      </div>
      <Footer />
    </>
  );
};
export default faqpage;
