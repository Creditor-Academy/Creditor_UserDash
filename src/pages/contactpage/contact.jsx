import React from 'react'
import Navbar from '../../components/navbar.jsx';
import Footer from '../../components/Footer.jsx';
import Hero from '../../components/contactus/hero'
// import ContactOptions from '../../components/contactus/ContactOptions'
// import Form from '../../components/contactus/form'
// import CommunityLinks from '../../components/contactus/CommunityLinks'
// import Readycontact from '../../components/contactus/readycontact'

const Contact = () => {
  return (
    <>
      <Navbar />
      <div>
          <Hero/>
          {/* <ContactOptions/> */}
          {/* <Form/> */}
          {/* <CommunityLinks/> */}
          {/* <Readycontact/> */}
      </div>
      <Footer />
    </>
  )
}

export default Contact;
