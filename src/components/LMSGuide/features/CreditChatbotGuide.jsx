import React from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageSquare, Star, Brain, CheckCircle2, ArrowRight } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const ChatPreview = () => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Bot className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Credit Health Check</h3>
        <span className="text-sm text-gray-500">Interactive Assessment</span>
      </div>
    </div>
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Bot className="w-5 h-5 text-blue-600 mt-1" />
        <p className="text-gray-700">Let's assess your credit health. Are you ready to begin?</p>
      </div>
      <div className="flex items-start gap-3">
        <MessageSquare className="w-5 h-5 text-green-600 mt-1" />
        <p className="text-gray-700">Yes, I'm ready to start.</p>
      </div>
      <div className="flex items-start gap-3">
        <Bot className="w-5 h-5 text-blue-600 mt-1" />
        <p className="text-gray-700">Great! I'll ask you a series of questions to understand your credit situation better.</p>
      </div>
    </div>
  </div>
);

const StepCard = ({ icon: Icon, title, description, color, index }) => (
  <div className={`
    relative bg-white rounded-2xl p-8 shadow-xl border-l-4 border-${color}-500 
    hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300
    group overflow-hidden
  `}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-full -translate-y-16 translate-x-16`}></div>
    
    <div className="relative z-10 flex items-center gap-4 mb-4">
      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
          <span className={`text-${color}-600 text-xs font-bold`}>{index + 1}</span>
        </div>
      </div>
      <h4 className={`text-xl font-bold text-${color}-800`}>{title}</h4>
    </div>
    
    <p className="relative z-10 text-gray-600 ml-16">{description}</p>
    
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
  </div>
);

const IntroSection = () => (
  <div className="space-y-10">
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-10 rounded-3xl shadow-2xl"
    >
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5] 
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <div className="relative z-10 flex items-center gap-6 mb-8">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <motion.div 
            className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">
            Credit ChatBot
          </h3>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-blue-100 text-sm font-medium">AI-Powered Credit Assessment</span>
          </div>
        </div>
      </div>
      
      <p className="relative z-10 text-blue-50 text-lg leading-relaxed max-w-3xl">
        Get personalized credit health assessment through our <span className="text-yellow-300 font-semibold">Credit ChatBot</span>. 
        Answer a few questions and receive tailored recommendations for your credit improvement journey.
      </p>
    </motion.div>
  </div>
);

const CreditChatbotGuide = () => {
  const featureData = {
    id: 'credit_chatbot',
    icon: Bot,
    title: 'Credit ChatBot',
    introduction: <IntroSection />,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example8',
        title: 'Using the Credit ChatBot',
        description: 'Learn how to get personalized credit health assessment and recommendations.'
      }
    ],
    steps: [
      {
        title: 'Accessing the Credit ChatBot',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={ArrowRight}
                title="Navigation"
                description="From the sidebar, click on 'More' to reveal additional options. Look for and select 'Credit ChatBot' from the menu."
                color="blue"
                index={0}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StepCard
                icon={Brain}
                title="Start Assessment"
                description="In the Credit Health Check window, click on 'Start Credit Health Check' to begin your assessment."
                color="purple"
                index={1}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Interactive Chat Preview</h4>
                <ChatPreview />
              </div>
            </motion.div>
          </div>
        )
      },
      {
        title: 'Getting Your Assessment',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={MessageSquare}
                title="Answer Questions"
                description="Respond to the ChatBot's questions about your credit situation. Be honest and thorough in your responses for the most accurate assessment."
                color="emerald"
                index={2}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StepCard
                icon={CheckCircle2}
                title="Receive Recommendations"
                description="Based on your answers, the ChatBot will analyze your situation and provide personalized remedy recommendations for improving your credit health."
                color="indigo"
                index={3}
              />
            </motion.div>
          </div>
        )
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default CreditChatbotGuide;
