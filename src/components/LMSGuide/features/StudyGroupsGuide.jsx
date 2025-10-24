import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Settings, Star, GraduationCap } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const ProTip = ({ children, emoji = "💡" }) => (
  <div className="relative bg-gradient-to-r from-amber-100 via-orange-50 to-yellow-100 rounded-2xl p-8 border border-amber-300/50 shadow-lg overflow-hidden">
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
      <motion.div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
      
      <div className="relative z-10 flex items-center gap-6 mb-8">
        <motion.div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <Users className="w-10 h-10 text-white" />
          </div>
          <motion.div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">
            Study Groups
          </h3>
          <div className="flex items-center gap-2">
            <motion.div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-blue-100 text-sm font-medium">Collaborative Learning</span>
          </div>
        </div>
      </div>
      
      <p className="relative z-10 text-blue-50 text-lg leading-relaxed max-w-3xl">
        Foster <span className="text-yellow-300 font-semibold">collaborative learning</span> through study groups. 
        Simply click on the Study Groups tab in the sidebar to access all your groups in one place. View and join both common interest groups and course-specific groups to enhance your learning experience.
      </p>
      
      <div className="relative z-10 flex gap-8 mt-8">
        {[
          { color: "bg-green-400", text: "Common Groups" },
          { color: "bg-blue-400", text: "Course Groups" },
          { color: "bg-purple-400", text: "Interactive Features" }
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

const StudyGroupsGuide = () => {
  const featureData = {
    id: 'study_groups',
    icon: Users,
    title: 'Study Groups',
    introduction: <IntroSection />,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example1',
        title: 'Study Groups Overview',
        description: 'Learn how to create and manage study groups for collaborative learning.'
      }
    ],
    steps: [
      {
        title: 'Accessing Study Groups',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={MessageSquare}
                title="Quick Access"
                color="blue"
                items={[
                  'Click on "Study Groups" in the sidebar navigation',
                  'View all available groups in one place',
                  'Easy access to both common and course groups',
                  'Quick overview of group activities'
                ]}
                index={0}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProTip emoji="🔍">
                <span className="font-bold">Quick Navigation:</span> The Study Groups tab in the sidebar 
                provides instant access to all your groups. It's your central hub for collaborative learning!
              </ProTip>
            </motion.div>
          </div>
        )
      },
      {
        title: 'Types of Study Groups',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={Users}
                title="Common Groups"
                color="blue"
                items={[
                  'Join open discussion groups for general topics',
                  'Participate in common interest study circles',
                  'Connect with peers across different courses',
                  'Engage in collaborative learning communities'
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
                icon={GraduationCap}
                title="Course Groups"
                color="emerald"
                items={[
                  'Access instructor-created course-specific groups',
                  'Collaborate with course peers on assignments',
                  'Receive course-related announcements',
                  'Participate in guided discussions'
                ]}
                index={1}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ProTip emoji="💡">
                <span className="font-bold">Group Selection:</span> Common Groups are perfect for general discussions and networking, 
                while Course Groups provide focused, instructor-guided learning environments specific to your enrolled courses.
              </ProTip>
            </motion.div>
          </div>
        )
      },
      {
        title: 'Group Features & Interaction',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={MessageSquare}
                title="Group Communication"
                color="purple"
                items={[
                  'View group news and updates',
                  'Chat with all group members in real-time',
                  'Access member list and profiles',
                  'Receive important announcements'
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
                icon={Settings}
                title="Group Sections"
                color="indigo"
                items={[
                  'News - Stay updated with latest group activities',
                  'Members - View and interact with group participants',
                  'Chat - Engage in group discussions',
                  'Announcements - Access instructor notices and updates'
                ]}
                index={3}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ProTip emoji="🔔">
                <span className="font-bold">Stay Connected:</span> Check the Announcements section regularly 
                to stay updated with important information from instructors and group administrators.
              </ProTip>
            </motion.div>
          </div>
        )
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default StudyGroupsGuide;
