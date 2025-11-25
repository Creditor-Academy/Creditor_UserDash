import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import Emailhero from '../../components/Platform/Email/Emailhero';
import Emailfaq from '../../components/Platform/Email/Emailfaq';
import Emailincome from '../../components/Platform/Email/Emailincome';
import Emailcta from '../../components/Platform/Email/Emailcta';
const Emailautomation = () => {
  return (
    <div>
      <Navbar />
      <Emailhero />
      <Emailincome />
      <Emailfaq />
      <Emailcta />

      <Footer />
    </div>
  );
};

export default Emailautomation;
