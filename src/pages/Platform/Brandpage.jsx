import React from 'react'
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import Brandhero from '../../components/Platform/Brand/Brandhero';
import BrandVideo from '../../components/Platform/Brand/BrandVideo';
import BrandContent from '../../components/Platform/Brand/BrandContent';
import Brandfaq from "../../components/Platform/Brand/Brandfaq";
import BrandCta from "../../components/Platform/Brand/Brandcta";

export default function Brandpage() {
  return (
    <div>
      <Navbar />
      <Brandhero />
      <BrandVideo />
      <BrandContent />
      <Brandfaq/>
      <BrandCta/>
    <Footer />                            
    </div>
  )
}   