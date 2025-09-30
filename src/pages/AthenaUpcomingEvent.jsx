import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function AthenaUpcomingEvent() {
  return (
    <div className="mb-12">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-blue-600 font-medium">Coming Soon</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Features In Athena</h2>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
        </p>
      </div>
      
      {/* Upcoming Features Grid - Wider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 px-4">
        {/* Private User Group Feature (first) */}
        <div className="group relative bg-white rounded-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-96">
          {/* Banner Image - Always visible, fades on hover */}
          <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-20">
            <img 
              src="https://lesson-banners.s3.us-east-1.amazonaws.com/Dashboard-banners/Image_20250930_152650_589.jpeg"
              alt="Private User Group Feature"
              className="w-full h-full object-cover"
            /> 
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>
          
          {/* Content - Appears on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 to-pink-800/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Private User Groups</h3>
              <p className="text-gray-200 text-base leading-relaxed mb-6">
                Create exclusive private groups for focused discussions, collaborative learning, and secure team interactions.
              </p>
              
            </div>
          </div>
          
          {/* Default overlay with title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-500 group-hover:opacity-0">
            <h3 className="text-white font-bold text-xl mb-2 drop-shadow-lg">Private User Groups</h3>
            <p className="text-gray-200 text-sm drop-shadow-md">Exclusive groups for collaborative learning</p>
          </div>
          
          {/* Status indicator */}
          <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
            Coming Next
          </div>
        </div>
        {/* Progress Bar Feature (second) */}
        <div className="group relative bg-white rounded-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-96">
          {/* Banner Image - Always visible, fades on hover */}
          <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-20">
            <img 
              src="https://lesson-banners.s3.us-east-1.amazonaws.com/Dashboard-banners/Image_20250930_152714_664.jpeg"
              alt="Progress Bar Feature"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>
          
          {/* Content - Appears on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/95 to-emerald-800/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Advanced Progress Tracking</h3>
              <p className="text-gray-200 text-base leading-relaxed mb-6">
                Visual progress bars and detailed analytics to track your learning journey with comprehensive insights and milestones.
              </p>
              
            </div>
          </div>
          
          {/* Default overlay with title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-500 group-hover:opacity-0">
            <h3 className="text-white font-bold text-xl mb-2 drop-shadow-lg">Progress Bar</h3>
            <p className="text-gray-200 text-sm drop-shadow-md">Visual tracking of learning progress and achievements</p>
          </div>
          
          {/* Status indicator */}
          <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
            Coming Soon
          </div>
        </div>

        {/* Games Feature (third) */}
        <div className="group relative bg-white rounded-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-96">
          {/* Banner Image - Always visible, fades on hover */}
          <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-20">
            <img 
              src="https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/G_Banner.jpg"
              alt="Games Feature"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>
          
          {/* Content - Appears on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 to-indigo-800/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Games</h3>
              <p className="text-gray-200 text-base leading-relaxed mb-6">
                Coming soon: interactive games for lesson understanding and user interaction.
              </p>
              
            </div>
          </div>
          
          {/* Default overlay with title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-500 group-hover:opacity-0">
            <h3 className="text-white font-bold text-xl mb-2 drop-shadow-lg">Games</h3>
            <p className="text-gray-200 text-sm drop-shadow-md">Interactive learning and engagement</p>
          </div>
          
          {/* Status indicator */}
          <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
            Coming Soon
          </div>
        </div>

        
      </div>
    </div>
  );
}

export default AthenaUpcomingEvent;