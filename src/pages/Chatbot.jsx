import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bot, ExternalLink } from 'lucide-react';

const Chatbot = () => {
  const handleStartBot = () => {
    // Open the chatbot in a new tab
    window.open('https://chatbot.lmsathena.com/', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Credit Health Check
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized insights about your credit situation with our AI-powered chatbot
          </p>
        </motion.div>

        {/* Banner Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/chat_banner.jpeg"
              alt="Credit Health Check Banner"
              className="w-full h-64 md:h-80 object-cover"
              onError={(e) => {
                // Fallback if image doesn't load
                e.target.src = '/src/assets/chat_banner.jpeg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 right-6 text-white text-right">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                AI-Powered Credit Analysis
              </h2>
              <p className="text-lg opacity-90">
                Answer a few questions to understand your credit situation
              </p>
            </div>
          </div>
        </motion.div>

        {/* Start Bot Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-8"
        >
          <Button
            onClick={handleStartBot}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Bot className="w-5 h-5 mr-2" />
            Start Credit Health Check
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smart Analysis
            </h3>
            <p className="text-gray-600">
              Our AI analyzes your responses to provide personalized credit insights
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <ExternalLink className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quick Assessment
            </h3>
            <p className="text-gray-600">
              Complete a comprehensive credit health check in just a few minutes
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Expert Guidance
            </h3>
            <p className="text-gray-600">
              Get actionable recommendations based on your specific situation
            </p>
          </div>
        </motion.div>

        
        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-8 text-center text-gray-600"
        >
          <p className="text-sm">
            The chatbot will open in a new tab to provide you with the best experience
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Chatbot;
