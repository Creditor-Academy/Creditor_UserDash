import React from 'react';
import Navbar from '../../components/navbar.jsx';
import Footer from '../../components/Footer.jsx';
import ProductHero from '../../components/Product/ProductHero.jsx';
import FeaturesShowcase from '../../components/Product/FeaturesShowcase.jsx';
import DashboardOverview from '../../components/Product/DashboardOverview.jsx';
import ProductCTA from '../../components/Product/ProductCTA.jsx';

const Product = () => {
    return (
      <>
        <Navbar />
        <div>
          <ProductHero />
          <FeaturesShowcase />
          <DashboardOverview />
          <ProductCTA />
        </div>
        <Footer />
      </>
    );
  };  
  export default Product;