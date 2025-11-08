import React from 'react'
import Navbar from '../../components/navbar.jsx';
import Footer from '../../components/Footer.jsx';
import WhyHero from '../../components/Why us/WhyHero'
// import WhyDifferent from '../../components/Why us/WhyDifferent'
import AthenaAudience from '../../components/Why us/AthenaAudience'
const WhyUs = () => {
  return (
    <>
      <Navbar />
      <div>
        <WhyHero />
        {/* <WhyDifferent /> */}
        <AthenaAudience />
      </div>
      <Footer />
    </>
  )
}
export default WhyUs;
    