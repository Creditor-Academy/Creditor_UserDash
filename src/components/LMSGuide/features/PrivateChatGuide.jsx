import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Settings, Search, Bell, Star } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const ProTip = ({ children, emoji = "💡" }) => (
  <div className="relative bg-gradient-to-r from-amber-100 via-orange-50 to-yellow-100 rounded-2xl p-8 border border-amber-300/50 shadow-lg overflow-hidden">
    {/* Background pattern */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-16 translate-x-16"></div>
    
    <div className="relative z-10 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
        <span className="text-xl">{emoji}</span>
      </div>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-amber-800 font-bold text-lg">Pro Tip.</span>
          <div className="px-2 py-1 bg-amber-200/50 rounded-full">
            <span className="text-amber-700 text-sm font-medium">Expert Advice</span>
          </div>
        </div>
        <p className="text-amber-900 leading-relaxed font-medium">{children}</p>
      </div>
    </div>
  </div>
);

const StepCard = ({ icon: Icon, title, items, color, index }) => (
  <div className={`
    relative bg-white rounded-2xl p-8 shadow-xl border-l-4 border-${color}-500 
    hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300
    group overflow-hidden
  `}>
    {/* Background decoration */}
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-full -translate-y-16 translate-x-16`}></div>
    
    <div className="relative z-10 flex items-center gap-4 mb-6">
      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
          <span className={`text-${color}-600 text-xs font-bold`}>{index + 1}</span>
        </div>
      </div>
      <h4 className={`text-xl font-bold text-${color}-800`}>{title}</h4>
    </div>
    
    <ul className="relative z-10 space-y-4">
      {items.map((item, itemIndex) => (
        <li key={itemIndex} className="flex items-start gap-4 group/item hover:transform hover:translate-x-1 transition-transform duration-200">
          <div className={`w-2 h-2 rounded-full bg-${color}-400 mt-2 flex-shrink-0`}></div>
          <span className="text-gray-700 leading-relaxed font-medium">{item}</span>
        </li>
      ))}
    </ul>
    
    {/* Hover effect */}
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
  </div>
);

const IntroSection = () => (
  <div className="space-y-10">
    {/* Enhanced Header Section */}
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-10 rounded-3xl shadow-2xl"
    >
      {/* Background pattern */}
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
      <motion.div 
        className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 20,
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
            <MessageSquare className="w-10 h-10 text-white" />
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
            Welcome to Private Chat
          </h3>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-blue-100 text-sm font-medium">Secure Communication Channel</span>
          </div>
        </div>
      </div>
      
      <p className="relative z-10 text-blue-50 text-lg leading-relaxed max-w-3xl">
        Your dedicated space for <span className="text-yellow-300 font-semibold">private conversations</span> and direct communication. 
        Connect one-on-one with other users in a secure and organized environment.
      </p>
      
      {/* Stats */}
      <div className="relative z-10 flex gap-8 mt-8">
        {[
          { color: "bg-green-400", text: "Private" },
          { color: "bg-blue-400", text: "Secure" },
          { color: "bg-purple-400", text: "Real-time" }
        ].map((stat, index) => (
          <motion.div 
            key={index}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <motion.div 
              className={`w-3 h-3 ${stat.color} rounded-full`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
            />
            <span className="text-white/90 font-medium">{stat.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
);

const PrivateChatGuide = () => {
  const featureData = {
    id: 'private_chat',
    icon: MessageSquare,
    title: 'Private 1 on 1 Chat',
    introduction: <IntroSection />,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example3',
        title: 'Using Private Chat Features',
        description: 'Learn how to start conversations, use chat features, and manage your private messages securely.'
      }
    ],
    steps: [
      {
        title: 'Getting Started with Private Chat',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={MessageSquare}
                title="Accessing Chat Features"
                color="blue"
                items={[
                  'Navigate to the Messages section using the sidebar icon',
                  'View your existing conversations in the main dashboard.'
                  
                ]}
                index={0}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StepCard
                icon={Send}
                title="Starting Conversations"
                color="emerald"
                items={[
                  'Click the "New Message" button to initiate a chat',
                  'Search and select a user from the directory',
                  'Begin your conversation with a friendly greeting'
                ]}
                index={1}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ProTip emoji="💬">
                <span className="font-bold">Communication Tip:</span> Start with a clear and professional greeting. 
                Include context about why you're reaching out to make your communication more effective.
              </ProTip>
            </motion.div>
          </div>
        )
      },
      {
        title: 'Managing Your Conversations',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={Settings}
                title="Chat Settings & Features"
                color="purple"
                items={[
                  
                  'Share files and media securely within the chat',
                  'Delte any messaege for everyone in the private chat for that typing error 😁.'
                ]}
                index={2}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StepCard
                icon={Search}
                title="Search & Organization"
                color="indigo"
                items={[
                  'Use the search function to find specific messages or files',
                  'Organize conversations with labels and favorites',
                  'Archive old conversations for better inbox management'
                ]}
                index={3}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              
            </motion.div>

          </div>
        )
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default PrivateChatGuide;
