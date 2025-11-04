import React from 'react'
import Navbar from '../../components/navbar'
import Footer from '../../components/Footer'
import Analyticshero from '../../components/Platform/Analytics/Analyticshero'
import AnalyticsContent from '../../components/Platform/Analytics/AnalyticsContent'                 
import AnalyticsSuceed from '../../components/Platform/Analytics/AnalyticsSuceed'       
import AnalyticsCta from '../../components/Platform/Analytics/AnalyticsCta'
   
export default function Analyticspage() {
  return (
    <div>
    <Navbar />
    <Analyticshero />
    <AnalyticsContent />    
    <AnalyticsSuceed />
    <AnalyticsCta />
    <Footer />
    </div>
  )
}