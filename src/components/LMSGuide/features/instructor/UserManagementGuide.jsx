import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Settings, Shield, Star } from 'lucide-react';
import { BaseFeature } from '../../FeatureComponents';

// Reuse the ProTip and StepCard components from CourseManagementGuide
const ProTip = ({ children, emoji = "💡" }) => (
  // ... Same ProTip component as CourseManagementGuide
);

const StepCard = ({ icon: Icon, title, items, color, index }) => (
  // ... Same StepCard component as CourseManagementGuide
);

const IntroSection = () => (
  <div className="space-y-10">
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-10 rounded-3xl shadow-2xl"
    >
      {/* Background animations */}
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
            User Management
          </h3>
          <div className="flex items-center gap-2">
            <motion.div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-blue-100 text-sm font-medium">Instructor Tools</span>
          </div>
        </div>
      </div>
      
      <p className="relative z-10 text-blue-50 text-lg leading-relaxed max-w-3xl">
        Efficiently <span className="text-yellow-300 font-semibold">manage users</span> and their roles. 
        Control access, track progress, and ensure a smooth learning experience for all participants.
      </p>
    </motion.div>
  </div>
);

const UserManagementGuide = () => {
  const featureData = {
    id: 'user_management',
    icon: Users,
    title: 'User Management',
    introduction: <IntroSection />,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example1',
        title: 'User Management Overview',
        description: 'Learn how to effectively manage users, roles, and permissions in your courses.'
      }
    ],
    steps: [
      {
        title: 'Managing Users',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={UserPlus}
                title="User Administration"
                color="blue"
                items={[
                  'Add new users individually or in bulk',
                  'Import users from CSV or Excel files',
                  'Manage user profiles and contact information'
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
                icon={Shield}
                title="Role Management"
                color="emerald"
                items={[
                  'Assign and modify user roles (Student, Instructor, Admin)',
                  'Set up custom permissions for specific users',
                  'Manage access levels for different course sections'
                ]}
                index={1}
              />
            </motion.div>
          </div>
        )
      },
      {
        title: 'User Settings & Analytics',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={Settings}
                title="User Settings"
                color="purple"
                items={[
                  'Configure user notification preferences',
                  'Manage user access and restrictions',
                  'Set up user groups and batch operations'
                ]}
                index={2}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProTip emoji="👥">
                <span className="font-bold">Batch Operations:</span> Use bulk actions to efficiently 
                manage multiple users at once. This saves time when updating roles or permissions for groups.
              </ProTip>
            </motion.div>
          </div>
        )
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default UserManagementGuide;
