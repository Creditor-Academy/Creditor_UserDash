import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Section = ({ title, children }) => (
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

const StepItem = ({ number, title, description }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
      <span className="text-blue-600 font-semibold">{number}</span>
    </div>
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const VideoSection = ({ videoUrl, title, description }) => (
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

const FeaturePage = ({ feature }) => {
  const navigate = useNavigate();

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h1>
      </motion.div>

      {/* Introduction Section */}
      <Section title="Introduction">
        <p className="text-gray-600 leading-relaxed">
          {feature.introduction}
        </p>
      </Section>

      {/* Video Tutorials Section */}
      <Section title="Video Tutorials">
        {feature.videos.map((video, index) => (
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
        {feature.steps.map((step, index) => (
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

export default FeaturePage;
