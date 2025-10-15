import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Section, VideoSection, StepItem } from './FeatureComponents';

const BaseFeature = ({ feature }) => {
  const navigate = useNavigate();
  const { title, introduction, videos, steps, icon: Icon } = feature;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate('/dashboard/guide')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
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
      <Section title="Introduction">
        <p className="text-gray-600 leading-relaxed">
          {introduction}
        </p>
      </Section>

      {/* Video Tutorials Section */}
      <Section title="Video Tutorials">
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
          <StepItem
            key={index}
            number={index + 1}
            title={step.title}
            description={step.description}
          />
        ))}
      </Section>
    </div>
  );
};

export default BaseFeature;
