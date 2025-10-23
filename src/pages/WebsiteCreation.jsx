import React from 'react'
import stater from '../assets/stater.jpg';
import cadillac from '../assets/cadillac.jpg'
import websiteDevelopment from '../assets/websiteDevelopment.jpg'
import SEOready from '../assets/SEOready.jpg'
import mobileOptimized from '../assets/mobileOptimized.jpg'
import CustomBrand from '../assets/CustomBrand.jpg'
import Ongoing from '../assets/Ongoing.jpg'
import SecureHosting from '../assets/SecureHosting.jpg'
import FastLoading from '../assets/FastLoadingg.jpg'
import SEOoptimized from '../assets/SEOoptimized.jpg'
import BusinessFunctionality  from '../assets/BusinessFunctionality.jpg'
import MonthlyMaintainance from '../assets/MonthlyMaintainance.jpg'
import CustomWebsite from '../assets/CustomWebsite.jpg'
import WebsiteUpperSection from '../components/websiteUpperSection';
import WebsiteTable from '../components/WebsiteTable';
import WebsiteEndSection from '../components/WebsiteEndSection';
import Navbar from '../components/navbar.jsx';
import Footer from '../components/Footer.jsx';
import { HeroSectionOne } from '../components/Website/hero.jsx';
import PricingCard from '../components/Website/pricingCard.jsx';
import Templates from '../components/Website/Templates.jsx';
import Appointment from '../components/Website/appointment.jsx';
import ComparisonTable from '../components/Website/comparisiontable.jsx';
import { CardsCarouselSection } from '../components/Website/features.jsx';
import WhyChooseUs from '../components/Website/whychoose.jsx';


export const WebsiteCreation = () => {
  return (
    <div>
        <Navbar />
        <HeroSectionOne />
        <PricingCard />
        <Templates />
        <Appointment />
        <ComparisonTable />
        <CardsCarouselSection />
        <WhyChooseUs />
        {/* <WebsiteUpperSection/> */}
        {/* <WebsiteTable/> */}
        {/* <WebsiteEndSection/> */}
        <Footer />
    </div>
  )
}