import React from 'react';
import { motion } from 'framer-motion';
import { UserCog, Star, Camera, Link2, Phone, Users, Clock, FileText, ChevronDown } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const ProfilePreview = () => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
    <div className="flex items-start gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Camera className="w-8 h-8 text-white/80" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-blue-100">
          <Camera className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Edit Mode</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Link2 className="w-4 h-4" />
            <span className="text-sm">LinkedIn & Facebook URLs</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span className="text-sm">Contact Information</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">Personal Details</span>
          </div>
        </div>
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
            <UserCog className="w-10 h-10 text-white" />
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
            Edit Profile
          </h3>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-blue-100 text-sm font-medium">Personalize Your Account</span>
          </div>
        </div>
      </div>
      
      <p className="relative z-10 text-blue-50 text-lg leading-relaxed max-w-3xl">
        Customize your profile settings and manage your personal information. Make your profile more 
        professional by adding social links, contact details, and a personalized bio.
      </p>
    </motion.div>
  </div>
);

const EditProfileGuide = () => {
  const featureData = {
    id: 'edit_profile',
    icon: UserCog,
    title: 'Edit Profile',
    introduction: <IntroSection />,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example',
        title: 'Managing Your Profile Settings',
        description: 'Learn how to customize your profile and update your personal information.'
      }
    ],
    steps: [
      {
        title: 'Accessing Profile Settings',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={ChevronDown}
                title="Navigation"
                color="blue"
                items={[
                  'Look for your Profile in the top left corner of the website',
                  'Click to reveal a dropdown menu with options',
                  'Select "Profile" from the dropdown (not "Logout")',
                  'You will be directed to the profile settings page'
                ]}
                index={0}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings Preview</h4>
                <ProfilePreview />
              </div>
            </motion.div>
          </div>
        )
      },
      {
        title: 'Customizing Your Profile',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={Camera}
                title="Profile Picture"
                color="purple"
                items={[
                  'Click on your profile picture or the camera icon',
                  'Upload a new photo or choose from existing ones',
                  'Adjust and crop your photo as needed'
                ]}
                index={1}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StepCard
                icon={Link2}
                title="Social Links"
                color="emerald"
                items={[
                  'Add or update your LinkedIn Profile URL',
                  'Add or update your Facebook Profile URL',
                  'Ensure the URLs are correct and active'
                ]}
                index={2}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <StepCard
                icon={FileText}
                title="Personal Information"
                color="indigo"
                items={[
                  'Update your phone number for contact purposes',
                  'Select your gender from the dropdown menu',
                  'Write a brief "About Me" description',
                  'Choose your preferred time zone'
                ]}
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

export default EditProfileGuide;
