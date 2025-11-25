import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Bot } from 'lucide-react';

const LoadingBuffer = ({
  message = 'Processing your request...',
  type = 'default',
  showSparkles = false,
}) => {
  const getLoadingConfig = () => {
    switch (type) {
      case 'ai':
        return {
          icon: <Bot className="w-6 h-6" />,
          gradient: 'from-blue-500 to-purple-600',
          message: message || 'AI is working on your request...',
        };
      case 'generation':
        return {
          icon: <Sparkles className="w-6 h-6" />,
          gradient: 'from-purple-500 to-pink-600',
          message: message || 'Generating content...',
        };
      default:
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin" />,
          gradient: 'from-blue-500 to-indigo-600',
          message: message,
        };
    }
  };

  const config = getLoadingConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center p-8 min-h-[200px]"
    >
      {/* Animated Background */}
      <div className="relative">
        {/* Pulsing Background Circle */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r ${config.gradient} blur-xl`}
        />

        {/* Main Icon Container */}
        <motion.div
          animate={{
            rotate: type === 'default' ? 360 : 0,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`relative w-20 h-20 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center text-white shadow-lg`}
        >
          {config.icon}
        </motion.div>

        {/* Sparkles Animation */}
        {showSparkles && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [
                    0,
                    (i % 2 === 0 ? 30 : -30) *
                      Math.cos((i * 60 * Math.PI) / 180),
                  ],
                  y: [
                    0,
                    (i % 2 === 0 ? 30 : -30) *
                      Math.sin((i * 60 * Math.PI) / 180),
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Loading Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {config.message}
        </h3>
        <div className="flex items-center justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
              className="w-2 h-2 bg-gray-400 rounded-full"
            />
          ))}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 3, ease: 'easeInOut' }}
        className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden w-48"
      >
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`h-full w-1/3 bg-gradient-to-r ${config.gradient} rounded-full`}
        />
      </motion.div>
    </motion.div>
  );
};

export default LoadingBuffer;
