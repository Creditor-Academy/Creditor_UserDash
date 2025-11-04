import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import Digitalhero from '../../components/Platform/Digital download/Digitalhero';
import Digitalunlock from '../../components/Platform/Digital download/Digitalunlock';
import Digitalrevenue from '../../components/Platform/Digital download/Digitalrevenue';
import Digitalfaq from '../../components/Platform/Digital download/Digitalfaq';
import Digitalcta from '../../components/Platform/Digital download/Digitalcta';

const DigitalDownloadsPage = () => {
  return (
    <div>
      <Navbar />
      <Digitalhero />
      <Digitalunlock />
      <Digitalrevenue />
      <Digitalfaq />
      <Digitalcta />
      <Footer />    
    </div>
  );
};

export default DigitalDownloadsPage;

