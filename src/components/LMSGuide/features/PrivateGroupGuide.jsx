import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, UserPlus, Settings, Layout, Calendar, Star, Zap } from 'lucide-react';
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
          <span className="text-amber-800 font-bold text-lg">Pro Tip</span>
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

const FeatureCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay * 0.1 }}
    className={`
      relative overflow-hidden bg-gradient-to-br from-${color}-50 via-white to-${color}-50/50 
      p-8 rounded-2xl border border-${color}-200/60 backdrop-blur-sm
      transform hover:scale-105 hover:shadow-2xl transition-all duration-500
      shadow-lg
    `}
  >
    {/* Animated background elements */}
    <motion.div 
      className={`absolute -top-12 -right-12 w-24 h-24 bg-${color}-200/20 rounded-full`}
      animate={{ 
        rotate: 360,
        scale: [1, 1.1, 1],
      }}
      transition={{ 
        duration: 20,
        repeat: Infinity,
        ease: "linear" 
      }}
    />
    <motion.div 
      className={`absolute -bottom-8 -left-8 w-16 h-16 bg-${color}-300/10 rounded-full`}
      animate={{ 
        rotate: -360,
        scale: [1, 1.2, 1],
      }}
      transition={{ 
        duration: 15,
        repeat: Infinity,
        ease: "linear" 
      }}
    />
    
    <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-${color}-400 to-${color}-600 flex items-center justify-center mb-6 shadow-lg`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    
    <h4 className={`relative z-10 text-${color}-800 font-bold text-xl mb-3`}>{title}</h4>
    <p className="relative z-10 text-gray-700 leading-relaxed">{description}</p>
  </motion.div>
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
            <Users className="w-10 h-10 text-white" />
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
            Welcome to Private User Groups
          </h3>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-blue-100 text-sm font-medium">Collaborative Learning Space</span>
          </div>
        </div>
      </div>
      
      <p className="relative z-10 text-blue-50 text-lg leading-relaxed max-w-3xl">
        Your dedicated space for <span className="text-yellow-300 font-semibold">collaborative learning</span> and knowledge sharing in Athena LMS. 
        Create exclusive communities where you can connect, share, and grow together in a secure environment.
      </p>
      
      {/* Stats */}
      <div className="relative z-10 flex gap-8 mt-8">
        {[
          { color: "bg-green-400", text: "Secure" },
          { color: "bg-blue-400", text: "Collaborative" },
          { color: "bg-purple-400", text: "Engaging" }
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

    {/* Enhanced Feature Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <FeatureCard
        icon={UserPlus}
        title="Connect & Network"
        description="Build meaningful connections with fellow learners and industry professionals in your field of interest."
        color="emerald"
        delay={0}
      />
      
      <FeatureCard
        icon={MessageCircle}
        title="Share Knowledge"
        description="Exchange valuable insights, resources, and experiences securely within your trusted community."
        color="blue"
        delay={1}
      />
      
      <FeatureCard
        icon={Zap}
        title="Grow Together"
        description="Accelerate your learning journey through collaborative projects and peer-to-peer feedback."
        color="amber"
        delay={2}
      />
    </div>
  </div>
);

const PrivateGroupGuide = () => {
  const featureData = {
    id: 'private_group',
    icon: Users,
    title: 'Private User Group',
    introduction: <IntroSection />,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example1',
        title: 'Creating and Managing Private Groups',
        description: 'Learn how to build and nurture thriving learning communities with our comprehensive guide to private groups.'
      }
    ],
    steps: [
      {
        title: 'Creating Your Private Group',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={UserPlus}
                title="Initial Setup & Foundation"
                color="blue"
                items={[
                  'Navigate to the Messages section from your dashboard sidebar',
                  'Click the "Create Group" button with the plus icon in top-right corner',
                  'Fill in the comprehensive group details form with all required information'
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
                icon={Settings}
                title="Essential Configuration"
                color="emerald"
                items={[
                  'Choose a descriptive and engaging group name that reflects your purpose',
                  'Upload a high-quality, distinctive group image or logo for brand identity',
                  'Write a clear and inviting group description that outlines goals and expectations'
                ]}
                index={1}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ProTip emoji="🚀">
                <span className="font-bold">Naming Strategy:</span> Keep your group name concise but descriptive. 
                A proven format is: <span className="text-amber-700">[Topic] + [Purpose] + [Community]</span> 
                (e.g., 'JavaScript Study Group' or 'Data Science Projects Team - Collaborative Learning')
              </ProTip>
            </motion.div>
          </div>
        )
      },
      {
        title: 'Managing Your Community',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={Users}
                title="Member Management & Growth"
                color="purple"
                items={[
                  'Send personalized invites to potential members with custom messages',
                  'Generate and share secure invitation links with expiration controls',
                  'Set appropriate member roles and permissions for organized management'
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
                icon={Layout}
                title="Content Organization & Structure"
                color="indigo"
                items={[
                  'Create focused channels for different topics and discussion threads',
                  'Pin important announcements and essential resources for easy access',
                  'Set up dedicated spaces for specific discussions and project collaborations'
                ]}
                index={3}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <StepCard
                icon={Calendar}
                title="Engagement & Activity Planning"
                color="cyan"
                items={[
                  'Schedule regular group meetings with calendar integration',
                  'Create learning milestones and progress tracking systems',
                  'Organize collaborative projects with clear timelines and goals'
                ]}
                index={4}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <ProTip emoji="🌟">
                <span className="font-bold">Engagement Strategy:</span> Maintain active community participation by 
                scheduling regular activities like weekly discussion topics or study sessions. 
                Consider creating a <span className="text-amber-700">content calendar</span> to ensure consistent 
                engagement and varied interaction formats.
              </ProTip>
            </motion.div>
          </div>
        )
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default PrivateGroupGuide;