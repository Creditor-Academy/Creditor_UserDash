import React from 'react';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import CustomerHero from '../components/solutions/customer_training/customer_hero.jsx';
import CustomerWhyTop from '../components/solutions/customer_training/customer_whytop.jsx';
import CustomerSimpleSolution from '../components/solutions/customer_training/customer_simplesolution.jsx';
import CustomerCTASurpass from '../components/solutions/customer_training/customer_cta_surpass.jsx';
import CustomerFeatures from '../components/solutions/customer_training/customer_features.jsx';
import CustomerSucceed from '../components/solutions/customer_training/customer_succeed.jsx';
import CustomerDeliver from '../components/solutions/customer_training/customer_deliver.jsx';

export const CustomerTraining = () => {
  return (
    <>
      <Navbar />
      <CustomerHero />
      <CustomerWhyTop />
      <CustomerSimpleSolution />
      <CustomerCTASurpass />
      <CustomerFeatures />
      {/* <CustomerSucceed /> */}
      <CustomerDeliver />
      <Footer />
    </>
  );
};

export default CustomerTraining;
