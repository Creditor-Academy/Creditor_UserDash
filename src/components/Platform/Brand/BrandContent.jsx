import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Image as ImageIcon, ShoppingBag, X, ArrowRight, Check, ChevronRight, ArrowLeft, MoreVertical, Search, Star, FileText } from 'lucide-react';
import manImage from '../../../assets/man.png';
import teamImage from '../../../assets/teamm.jpg';

const sections = [
  {
    id: 1,
    title: 'Earn more with in-app purchases',
    description:
      'Our in-app purchase feature lets your audience easily buy additional courses and continue their learning journey — all without leaving your app.',
    imagePosition: 'right',
    bgColor: 'bg-[#d85b00]', // orange block like screenshot
    type: 'contentGrid',
  },
  {
    id: 2,
    title: 'Let our trusted experts bring your app to life',
    description:
      'After you purchase and complete a short form about your business, our knowledgeable team members will get started on your branded mobile app and schedule a one-on-one call with you..',
    imagePosition: 'left',
    bgColor: 'bg-[#8aa2ff]', // light purple-blue card
    type: 'uploader',
  },
  {
    id: 3,
    title: 'Enhance your brand presence',
    description:
      'Increase visibility and recognition across all platforms with an app that puts the spotlight on your one-of-a-kind brand. With a personalized app store listing, your app is also more discoverable to your learners.',
    imagePosition: 'right',
    bgColor: 'bg-[#d0cbbf]', // warm beige like screenshot
    type: 'landing',
  },
  {
    id: 4,
    title: 'Courses and communities at their fingertips — at any time',
    description:
      'With features like push notifications, on-the-go access, and activity feeds right in their pocket, your audience can stay connected to your content and their peers at all times.',
    imagePosition: 'left',
    bgColor: 'bg-[#d0cbbf]', // warm beige like screenshot
    type: 'landing',
  },
];

export default function Digitalrevenue() {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 via-blue-50/50 to-white py-20 sm:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-gray-900 mb-4 leading-tight">
          The Branded Mobile advantage
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">Elevate your business and boost revenue with a mobile app for your learning experiences — no
            <span className="block">technical expertise required.</span>
           </p>
         
        </motion.div>

        {/* Sections */}
        <div className="space-y-20 lg:space-y-28">
          {sections.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                item.imagePosition === 'left' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content Side */}
              <div className={`${item.imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1'} flex flex-col justify-center`}>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-gray-900 mb-4 leading-tight lg:leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Visual Side */}
              <div className={`${item.imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'}`}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className={`relative flex items-center justify-center group`}
                >
                  {item.type === 'contentGrid' && (
                    <div className="relative z-10 flex items-center justify-center w-[560px]">
                      {/* Dark blue background */}
                      <div className="relative w-full h-[460px] bg-[#0f4c81] rounded-lg flex items-center justify-center p-6 shadow-2xl">
                        {/* Course Detail Card on Left */}
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-[220px] overflow-hidden">
                          {/* Top Bar with X */}
                          <div className="flex items-center justify-start p-2.5 border-b border-gray-200">
                            <X className="w-3.5 h-3.5 text-gray-600" />
                          </div>

                          {/* Header Image */}
                          <div className="w-full h-28 bg-gray-200 overflow-hidden">
                            <img 
                              src={teamImage} 
                              alt="Course" 
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Course Details */}
                          <div className="px-3 py-2.5 overflow-hidden max-h-[230px]">
                            <h3 className="text-[13px] font-bold text-gray-900 mb-1.5 leading-tight">Photographing the indoor Bobby Joe Brown - get lig perfect!</h3>
                            <div className="text-sm font-bold text-gray-900 mb-2">$28.97</div>
                            <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
                              Learn about shooting wildlife in their natural habitat. We've gathered golden tips from multiple nature documentary photographers over the past decade. We'll show you the manual setting modes for capturing animal quick movements, how to set up and camouflage your environment, and more.
                            </p>
                            
                            {/* Chapter Section */}
                            <div className="mb-4">
                              <h4 className="text-[11px] font-semibold text-gray-900 mb-1.5">Chapter 1: Basics</h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-700">
                                  <span>•</span>
                                  <span>Course overview</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-700">
                                  <span>•</span>
                                  <span>Examples of great wildlife photography</span>
                                </div>
                              </div>
                            </div>

                            {/* Purchase Button */}
                            <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-2.5 rounded-lg text-xs transition-colors">
                              PURCHASE
                            </button>
                          </div>
                        </div>

                        {/* Payment Confirmation Card on Right */}
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-gray-50 rounded-lg shadow-2xl w-[240px] overflow-hidden border border-gray-200">
                          {/* Top Section */}
                          <div className="p-3 border-b border-gray-300">
                            <div className="text-[11px] text-gray-600 mb-1">Pay Stark Industries</div>
                            <div className="flex items-center justify-between">
                              <div className="text-xl font-bold text-gray-900">$28.97</div>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>

                          {/* Bottom Section with TouchID */}
                          <div className="p-6 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-3 shadow-lg">
                              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                            </div>
                            <div className="text-xs text-gray-600 font-medium">Pay with TouchID</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.type === 'uploader' && (
                    <div className="relative z-10 w-[440px]">
                      {/* Man at desk image */}
                      <div className="relative rounded-lg overflow-hidden shadow-2xl">
                        <img 
                          src={manImage} 
                          alt="Expert at work" 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    </div>
                  )}

{item.type === 'landing' && item.id === 3 && (
  <div className="relative z-10 flex items-center justify-center w-full max-w-5xl">
    {/* Dark orange background */}
    <div className="relative w-full h-[420px] bg-[#c24f0a] rounded-2xl flex items-center justify-center p-6 shadow-2xl">
      {/* Three-phone group container (centered) */}
      <div className="relative w-full flex items-center justify-center gap-8">
        
        {/* Screen 1 - App Store Listing */}
        <div className="bg-white rounded-xl shadow-xl w-[140px] h-[300px] overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-2 py-1 flex items-center gap-1 border-b border-gray-200">
            {/* Search Icon */}
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[7px] text-gray-600">Q Photography</span>
          </div>
          <div className="px-2 py-1 flex items-center gap-1">
            {/* App Icon */}
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-[8px] font-bold">WF</div>
            <div>
              <div className="text-[8px] font-bold text-gray-900">Wayfinder Co.</div>
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-2 h-2 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
                <span className="text-[6px] text-gray-500 ml-0.5">In-app purchases</span>
              </div>
            </div>
          </div>
          <div className="flex-1 px-2 py-1 space-y-1 overflow-y-hidden"> {/* Changed to hidden to match the clipped image */}
            {/* Content Blocks */}
            <div className="bg-gray-50 rounded-md p-1">
              <div className="h-10 bg-gradient-to-br from-blue-200 to-blue-300 rounded mb-1"></div>
              <div className="text-[7px] font-semibold text-gray-900">TAKE YOUR COURSE ON THE GO</div>
            </div>
            <div className="bg-gray-50 rounded-md p-1">
              <div className="h-10 bg-gradient-to-br from-blue-200 to-blue-300 rounded mb-1"></div>
              <div className="text-[7px] font-semibold text-gray-900">PICK UP WHERE YOU LEFT OFF</div>
            </div>
            <div className="bg-gray-50 rounded-md p-1 opacity-50"> {/* Faded to match the clipped look */}
              <div className="h-10 bg-gradient-to-br from-blue-200 to-blue-300 rounded mb-1"></div>
              <div className="text-[7px] font-semibold text-gray-900">ALL THE TOOLS YOU NEED</div>
            </div>
          </div>
          <div className="px-2 py-1 bg-white border-t border-gray-200">
            <p className="text-[6.5px] text-gray-600 leading-tight">
              Designed to elevate your skills and foster a culture of growth... [Clipped text matching image]
            </p>
          </div>
        </div>

        {/* Screen 2 - Splash Screen (Building) */}
        <div className="bg-white rounded-2xl shadow-xl w-[160px] h-[320px] overflow-hidden relative">
          {/* Image Placeholder - Must use an actual building image to replicate the look */}
          <div className="w-full h-full bg-cover bg-center bg-gray-900 flex items-end justify-center relative"
               style={{ 
                   // This style is a crucial placeholder for the visual look
                   backgroundImage: "url('https://i.imgur.com/example-of-tall-dark-building.jpg')", 
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   filter: 'brightness(0.7)' // Dim the image slightly
               }}>
            <div className="absolute bottom-16 left-0 right-0 text-center">
              <h2 className="text-white text-xl font-bold">Wayfinder</h2>
            </div>
          </div>
        </div>

        {/* Screen 3 - Course Details */}
        <div className="bg-white rounded-2xl shadow-xl w-[160px] h-[320px] overflow-hidden flex flex-col">
          <div className="w-full h-20 bg-gray-200 overflow-hidden">
            {/* Image Placeholder - Must use an actual team image to replicate the look */}
            <div className="w-full h-full bg-cover bg-center" 
                 style={{ 
                     backgroundImage: "url('https://i.imgur.com/example-of-meeting-table.jpg')",
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                 }}>
            </div>
          </div>
          <div className="px-2 py-2 flex-1 overflow-hidden">
            <h3 className="text-[8px] font-bold text-gray-900 mb-1">Enterprise Growth Strategies</h3>
            <p className="text-[7px] text-gray-600 mb-2">50% completed • 16 lessons</p>
            <button className="w-full bg-black text-white py-1.5 rounded-md text-[7px] font-semibold mb-2">RESUME</button>
            <div className="space-y-1 pt-1 border-t border-gray-100">
              
              {/* Introduction */}
              <div className="text-[7px] font-semibold text-gray-700 flex justify-between items-center">
                <span>Introduction</span>
                <span className='text-gray-400'>&gt;</span>
              </div>
              
              {/* Chapter 1 */}
              <div className="text-[7px] font-semibold text-gray-700 pt-1 border-t border-gray-100">
                Chapter 1: Composition & Framing
              </div>
              <div className="flex justify-between items-center text-[7px] text-gray-700 pl-1">
                <div className="flex items-center gap-1">
                  <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Welcome!</span>
                </div>
                <span className='text-gray-400'>&gt;</span>
              </div>
              <div className="flex justify-between items-center text-[7px] text-gray-700 pl-1">
                <div className="flex items-center gap-1">
                  <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Chapter 1: Mastering the Foundations</span>
                </div>
                <span className='text-gray-400'>&gt;</span>
              </div>

              {/* Chapter 2 */}
              <div className="text-[7px] font-semibold text-gray-700 pt-1 border-t border-gray-100">
                Chapter 2: High-Impact Communications
              </div>
              
            </div>
          </div>
        </div>

        {/* Removed 4th screen to match the 3-card design */}

      </div>
    </div>
  </div>
)}

                  {item.type === 'landing' && item.id === 4 && (
                    <div className="relative z-10 flex items-center justify-center w-[420px]">
                      {/* Dark purple/brown background */}
                      <div className="relative w-full h-[520px] bg-[#1c1530] rounded-lg flex items-center justify-center p-6 shadow-2xl">
                        {/* Light brownish-gray backdrop */}
                        <div className="absolute left-0 top-0 w-1/2 h-full bg-[#d0cbbf] rounded-l-lg"></div>
                        
                        {/* Mobile App Display */}
                        <div className="relative z-10 bg-white rounded-lg shadow-2xl w-[240px] h-[420px] overflow-hidden flex flex-col">
                          {/* Top Bar - Dark */}
                          <div className="bg-gray-800 px-3 py-2.5 rounded-t-lg">
                            <h3 className="text-white text-[13px] font-semibold">Communities</h3>
                          </div>

                          {/* Content Area */}
                          <div className="flex-1 bg-white overflow-hidden">
                            {/* The Success Accelerator Card */}
                            <div className="p-3">
                              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {/* Header Image - Highway with car lights */}
                                <div className="w-full h-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
                                  <div className="absolute inset-0">
                                    {/* Car lights effect */}
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/20 blur-sm"></div>
                                    <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white rounded-full blur-sm"></div>
                                    <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-red-500 rounded-full blur-sm"></div>
                                    <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white rounded-full blur-sm"></div>
                                    <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-red-500 rounded-full blur-sm"></div>
                                  </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-3">
                                  <h4 className="text-sm font-bold text-gray-900 mb-1.5">The Success Accelerator</h4>
                                  <p className="text-[11px] text-gray-700 leading-relaxed mb-2">
                                    Welcome to "The Success Accelerator," a vibrant community dedicated to discussing leadership essentials and strategies. Join us to enhance your professional growth journey!
                                  </p>
                                  
                                  {/* Statistics */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5 text-gray-600" />
                                        <span className="text-[11px] text-gray-900">1257 posts</span>
                                      </div>
                                      <span className="text-[9px] text-gray-500">Last active 2 hours ago</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <ImageIcon className="w-3.5 h-3.5 text-gray-600" />
                                      <span className="text-[11px] text-gray-900">12 spaces</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Partial Second Card */}
                              <div className="mt-2.5 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="h-16 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
                                  {/* Person image placeholder */}
                                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full"></div>
                                </div>
                              </div>
                        </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
