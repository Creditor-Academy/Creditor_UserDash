import React from 'react'
import Navbar from '../../components/navbar.jsx';
import Footer from '../../components/Footer.jsx';
import Hero from '../../components/contactus/hero'
import Form from '../../components/contactus/form'
import Readycontact from '../../components/contactus/readycontact'

const Contact = () => {
  return (
    <>
      <Navbar />
      <div>
          <Hero/>
          <Form/>
          <Readycontact/>
      </div>
      <Footer />
    </>
  )
}

export default Contact;
