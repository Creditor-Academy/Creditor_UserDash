import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  MessageSquare,
  Library,
  CreditCard,
  Bot,
  FileQuestion,
  BarChart,
  GraduationCap
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    onClick={onClick}
    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer hover:bg-blue-50"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 bg-blue-50 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

const SectionTitle = ({ title, description }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-600">{description}</p>
  </div>
);

const LMSGuide = () => {
  const navigate = useNavigate();
  
  const handleFeatureClick = (featureId) => {
    navigate(`/dashboard/guide/${featureId}`);
  };

  const generalFeatures = [
    {
      icon: Users,
      title: "Private User Group",
      description: "Connect and collaborate in exclusive private groups. Share knowledge, discuss strategies, and build a community with like-minded professionals in a secure environment."
    },
    {
      icon: MessageSquare,
      title: "Private 1 on 1 Chat",
      description: "Engage in direct, private conversations with other users. Get personalized support, share insights, and build meaningful connections through secure one-on-one communication."
    },
    {
      icon: BookOpen,
      title: "My Courses",
      description: "Access your enrolled courses, track progress, and continue learning from where you left off. View course materials, assignments, and assessments all in one place."
    },
    {
      icon: Library,
      title: "Course Catalog",
      description: "Browse through our extensive collection of courses. Filter by category, difficulty level, or topic to find the perfect learning path for you."
    },
    {
      icon: CreditCard,
      title: "Creditor Card",
      description: "Manage your subscription and payment details. View transaction history and update payment methods with ease."
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Get instant help with our AI-powered assistant. Ask questions about courses, technical issues, or general platform navigation."
    },
    {
      icon: FileQuestion,
      title: "Support Tickets",
      description: "Create and track support tickets for any issues or questions. Our support team is always ready to help you."
    }
  ];

  const instructorFeatures = [
    {
      icon: BookOpen,
      title: "Course Management",
      description: "Create and manage your courses. Add content, set up assessments, and track student progress."
    },
    {
      icon: Users,
      title: "User Management",
      description: "Manage student enrollments, track progress, and handle user permissions and roles."
    },
    {
      icon: Library,
      title: "Course Catalog Management",
      description: "Organize and structure your course catalog. Create categories and manage course visibility."
    },
    {
      icon: Users,
      title: "Group Management",
      description: "Create and manage learning groups. Monitor group activities and facilitate collaboration."
    },
    {
      icon: BarChart,
      title: "Event Management",
      description: "Schedule and manage learning events, webinars, and live sessions."
    },
    {
      icon: FileQuestion,
      title: "Assets Management",
      description: "Manage course materials, media files, and learning resources efficiently."
    },
    {
      icon: MessageSquare,
      title: "Private Groups",
      description: "Create and manage private discussion groups for specific courses or topics."
    },
    {
      icon: BarChart,
      title: "Course Analytics",
      description: "Access detailed analytics and insights about course performance and student engagement."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Athena LMS Guide</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover all the powerful features our learning management system has to offer,
          including our new private communication tools. This guide will help you make the most of your learning experience.
        </p>
      </motion.div>

      {/* General Features Section */}
      <div className="mb-16">
        <SectionTitle 
          title="General Features" 
          description="Core features available to all users for learning and collaboration."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {generalFeatures.map((feature, index) => {
            const featureId = feature.title.toLowerCase().replace(/\s+/g, '_');
            return (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                onClick={() => handleFeatureClick(featureId)}
              />
            );
          })}
        </div>
      </div>

      {/* Instructor Features Section */}
      <div>
        <SectionTitle 
          title="Instructor Features" 
          description="Advanced tools and features for course creators and instructors."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {instructorFeatures.map((feature, index) => {
            const featureId = `instructor_${feature.title.toLowerCase().replace(/\s+/g, '_')}`;
            return (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                onClick={() => handleFeatureClick(featureId)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LMSGuide;