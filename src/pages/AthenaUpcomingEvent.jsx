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
      
      {/* Single Upcoming Feature Card: Progress Bar */}
      <div className="grid grid-cols-1 gap-8 mb-12 px-4">
        <div className="group relative bg-white rounded-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-96 hover:ring-2 hover:ring-emerald-300/60">
          {/* Banner Image - Always visible, fades on hover */}
          <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-20">
            <img 
              src="https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/Progress+bar.png"
              alt="Progress Bar Feature"
              className="w-full h-full object-contain scale-100 origin-center transition-transform duration-500 group-hover:scale-105"
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
              <h3 className="text-2xl font-bold text-white mb-4">Progress Bar</h3>
              <p className="text-gray-200 text-base leading-relaxed mb-6">
                Visual tracking of learning progress and achievements.
              </p>
              
            </div>
          </div>
          
          {/* Default overlay with title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-500 group-hover:opacity-0">
            <h3 className="text-white font-bold text-xl mb-2 drop-shadow-lg">Progress Bar</h3>
            <p className="text-gray-200 text-sm drop-shadow-md">Visual tracking of learning progress and achievements</p>
          </div>

          {/* Bottom progress indicator on hover */}
          <div className="absolute bottom-0 left-0 h-1 bg-emerald-400/80 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
          
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