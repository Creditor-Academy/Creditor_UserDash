import React from 'react'
import Navbar from '../../components/navbar'
import Footer from '../../components/Footer'
import Sellinghero from '../../components/Platform/SellingTool/Sellinghero';
import SellingBarrier from '../../components/Platform/SellingTool/SellingBarrier';
import SellingTask from '../../components/Platform/SellingTool/SellingTask';   
export default function Sellingpage() {
  return (
    <div>
    <Navbar />
  <Sellinghero/>
  <SellingBarrier/>
  <SellingTask/>
    <Footer />
    </div>
  )
}