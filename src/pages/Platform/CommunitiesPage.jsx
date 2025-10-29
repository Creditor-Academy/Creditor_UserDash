import React from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import Communityhero from '../../components/Platform/Communities/Communityhero';
import Communitydeliver from '../../components/Platform/Communities/Communitydeliver';
import Communityplus from '../../components/Platform/Communities/Communityplus';
import Communitybuild from '../../components/Platform/Communities/Communitybuild';    

const CommunitiesPage = () => {
  return (
    <div>
      <Navbar />
      <Communityhero />
      <Communityplus />
      <Communitydeliver />
      <Communitybuild />
      {/* Add more community-related components here */}
      <Footer />
    </div>
  );
};

export default CommunitiesPage;

