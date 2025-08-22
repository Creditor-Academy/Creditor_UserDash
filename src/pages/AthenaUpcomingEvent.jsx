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
          Discover the exciting new features we're developing to enhance your learning experience and make Athena even more powerful.
        </p>
      </div>

      {/* Upcoming Features Grid - Wider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 px-4">
        {/* Assessments Feature (first) */}
        <div className="group relative bg-white rounded-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-96">
          {/* Banner Image - Always visible, fades on hover */}
          <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-20">
            <img 
              src="https://lesson-banners.s3.us-east-1.amazonaws.com/Dashboard-banners/AssessmentCard.jpg"
              alt="Assessments Feature"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          </div>
          
          {/* Content - Appears on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/95 to-emerald-800/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6M9 16h6M9 8h6M5 6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Advanced Assessments</h3>
              <p className="text-gray-200 text-base leading-relaxed mb-6">
                Comprehensive evaluation system with multiple question types: MCQs, fill-in-the-blanks, true/false, and more.
              </p>
              <div className="inline-flex items-center text-teal-200 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                Learn more
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Default overlay with title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
            <h3 className="text-white font-bold text-xl mb-1">Advanced Assessments</h3>
            <p className="text-gray-300 text-sm">Multiple question types</p>
          </div>
          
          {/* Status indicator */}
          <div className="absolute top-4 right-4 bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full">
            In Development
          </div>
        </div>

        {/* Group Message Feature (second) */}
        <div className="group relative bg-white rounded-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-96">
          {/* Banner Image - Always visible, fades on hover */}
          <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-20">
            <img 
              src="https://lesson-banners.s3.us-east-1.amazonaws.com/Recording-banners/Upcoming-Features/Group_messages.jpeg"
              alt="Group Messages Feature"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          </div>
          
          {/* Content - Appears on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 to-indigo-800/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Group Messaging</h3>
              <p className="text-gray-200 text-base leading-relaxed mb-6">
                Connect and collaborate effortlessly with multiple users in a single conversation. Perfect for team projects and study groups.
              </p>
              <div className="inline-flex items-center text-blue-200 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                Learn more
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Default overlay with title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
            <h3 className="text-white font-bold text-xl mb-1">Group Messaging</h3>
            <p className="text-gray-300 text-sm">Collaborate with multiple users</p>
          </div>
          
          {/* Status indicator */}
          <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
            In Development
          </div>
        </div>

        {/* Private Message Feature (third) */}
        <div className="group relative bg-white rounded-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-96">
          {/* Banner Image - Always visible, fades on hover */}
          <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-20">
            <img 
              src="https://lesson-banners.s3.us-east-1.amazonaws.com/Recording-banners/Upcoming-Features/Private_messages.jpeg"
              alt="Private Messages Feature"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          </div>
          
          {/* Content - Appears on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 to-pink-800/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Private Messaging</h3>
              <p className="text-gray-200 text-base leading-relaxed mb-6">
                Communicate one-on-one with complete privacy and security. Direct messaging for personalized conversations.
              </p>
              <div className="inline-flex items-center text-purple-200 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                Learn more
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Default overlay with title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
            <h3 className="text-white font-bold text-xl mb-1">Private Messaging</h3>
            <p className="text-gray-300 text-sm">One-on-one secure conversations</p>
          </div>
          
          {/* Status indicator */}
          <div className="absolute top-4 right-4 bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
            In Development
          </div>
        </div>
      </div>
    </div>
  );
}

export default AthenaUpcomingEvent;