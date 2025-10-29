import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import Digitalhero from '../../components/Platform/Digital_download/Digitalhero';

const DigitalDownloadsPage = () => {
  return (
    <div>
      <Navbar />
      <Digitalhero />
      {/* Add more digital download-related components here */}
      <Footer />
    </div>
  );
};

export default DigitalDownloadsPage;

