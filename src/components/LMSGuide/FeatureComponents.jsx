import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Reusable section component
export const Section = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-xl p-6 shadow-md mb-8"
  >
    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
    {children}
  </motion.div>
);

// Video tutorial section component
export const VideoSection = ({ videoUrl, title, description }) => (
  <div className="mb-6">
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden mb-4">
      <iframe
        src={videoUrl}
        title={title}
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Base feature page component
export const BaseFeature = ({ feature }) => {
  const navigate = useNavigate();
  const { title, introduction, videos, steps, icon: Icon } = feature;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate('/dashboard/guide')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Guide</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
      </motion.div>

      {/* Introduction Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        {introduction}
      </motion.div>

      {/* Video Tutorials Section */}
      <Section title="Video Tutorial">
        {videos.map((video, index) => (
          <VideoSection
            key={index}
            videoUrl={video.url}
            title={video.title}
            description={video.description}
          />
        ))}
      </Section>

      {/* Steps Section */}
      <Section title="How to Use">
        {steps.map((step, index) => (
          <div key={index} className="mb-12 last:mb-0">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{step.title}</h3>
            {step.renderDescription ? (
              step.renderDescription()
            ) : (
              <p className="text-gray-600">{step.description}</p>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
};

export default BaseFeature;