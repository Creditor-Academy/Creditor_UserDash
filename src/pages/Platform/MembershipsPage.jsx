import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import Membership from '../../components/Platform/Membership/Membershiphero';
import Membershipincome from '../../components/Platform/Membership/Membershipincome';
import Membershipcontent from '../../components/Platform/Membership/Membershipcontent';
import Membershipready from '../../components/Platform/Membership/Membershipready';
import Membershipfaq from '../../components/Platform/Membership/Membershipfaq';
import Membershipscale from '../../components/Platform/Membership/Membershipscale';
const MembershipsPage = () => {
  return (
    <div>
      <Navbar />
      <Membership />
      <Membershipincome />
      <Membershipcontent />
      <Membershipready />
      <Membershipfaq />
      <Membershipscale />
        {/* Add more membership-related components here */}
      <Footer />
    </div>
  );
};

export default MembershipsPage;

