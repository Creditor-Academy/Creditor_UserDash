import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import Membership from '../../components/Platform/Membership/Membership';

const MembershipsPage = () => {
  return (
    <div>
      <Navbar />
      <Membership />
      {/* Add more membership-related components here */}
      <Footer />
    </div>
  );
};

export default MembershipsPage;

