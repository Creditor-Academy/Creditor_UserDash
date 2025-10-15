import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Settings, Layout, Calendar, Edit, Trash2, UserMinus, Info, Star } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

// 💡 Pro Tip Component
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

// 🎯 Step Card Component
const StepCard = ({ icon: Icon, title, color, items, index }) => (
  <div
    className={`
      relative bg-white rounded-2xl p-8 shadow-xl border-l-4 border-${color}-500
      hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300
      group overflow-hidden
    `}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-full -translate-y-16 translate-x-16`}></div>
    <div className="relative z-10 flex items-center gap-4 mb-6">
      <div
        className={`relative w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center shadow-lg`}
      >
        <Icon className="w-6 h-6 text-white" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
          <span className={`text-${color}-600 text-xs font-bold`}>{index + 1}</span>
        </div>
      </div>
      <h4 className={`text-xl font-bold text-${color}-800`}>{title}</h4>
    </div>
    <ul className="relative z-10 space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-4 group/item">
          <div className={`w-2 h-2 rounded-full bg-${color}-400 mt-2 flex-shrink-0`}></div>
          <span className="text-gray-700 leading-relaxed font-medium">{item}</span>
        </li>
      ))}
    </ul>
    <div
      className={`absolute inset-0 bg-gradient-to-br from-${color}-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
    ></div>
  </div>
);

// ✨ Intro Section
const IntroSection = () => (
  <div className="space-y-10">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-10 rounded-3xl shadow-2xl"
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative z-10 flex items-center gap-6 mb-8">
        <div className="relative w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
          <Users className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">Welcome to Private User Groups</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-blue-100 text-sm font-medium">Collaborative Learning Space</span>
          </div>
        </div>
      </div>
      <p className="relative z-10 text-blue-50 text-lg leading-relaxed max-w-3xl">
        Your dedicated space for <span className="text-yellow-300 font-semibold">collaborative learning</span> and
        knowledge sharing in Athena LMS. Create exclusive communities where you can connect, share, and grow together
        in a secure environment.
      </p>
    </motion.div>
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
        description:
          'Learn how to build and nurture thriving learning communities with our comprehensive guide to private groups.'
      }
    ],
    steps: [
      {
        title: 'Part 1: Creating a Private Group',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <StepCard
              icon={Info}
              title="Step 1 → Open the Messages Section"
              color="blue"
              items={['From the sidebar, click on “Messages.” → This is where you can access your chats and group options.']}
              index={0}
            />
            <StepCard
              icon={UserPlus}
              title="Step 2 → Start the Group Creation Process"
              color="cyan"
              items={[
                'At the top-right corner of the Messages page, click on “Create Group.”',
                '→ A pop-up window will appear prompting you to enter your group details.'
              ]}
              index={1}
            />
            <StepCard
              icon={Settings}
              title="Step 3 → Enter Group Information"
              color="emerald"
              items={[
                'Fill in the following fields in the pop-up:',
                '→ Group Name (Mandatory): Enter a suitable name for your group.',
                '→ Group Image (Optional): Upload a local image or use an image URL.',
                '→ Description (Optional): Add a short description about your group’s purpose or topic.'
              ]}
              index={2}
            />
            <StepCard
              icon={Users}
              title="Step 4 → Choose Group Members"
              color="indigo"
              items={[
                'Use the Admin or Instructor filters to view users.',
                '→ Click on desired users to add them as group members.'
              ]}
              index={3}
            />
            <StepCard
              icon={Layout}
              title="Step 5 → Create the Group"
              color="purple"
              items={[
                'Once all details are entered and members selected, click on “Create Group.”',
                '✅ Your Private Group is now successfully created.'
              ]}
              index={4}
            />
          </div>
        )
      },
      {
        title: 'Part 2: Updating Group Information',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <StepCard
              icon={Info}
              title="Step 1 → Open Group Information"
              color="orange"
              items={[
                'Go to your group and click on “Group Info.”',
                '→ A modal window will open showing all details about your group.'
              ]}
              index={0}
            />
            <StepCard
              icon={Edit}
              title="Step 2 → Edit Group Details"
              color="teal"
              items={[
                'Click on “Edit” to update the group name, image, or description.',
                '→ Make your desired changes and save them.'
              ]}
              index={1}
            />
            <StepCard
              icon={UserPlus}
              title="Step 3 → Add New Members"
              color="blue"
              items={[
                'Click on the “Add Member” button.',
                '→ Select users you want to invite and send invitations.',
                '→ If accepted within 7 days, they will join automatically; else, the invite expires.'
              ]}
              index={2}
            />
            <StepCard
              icon={UserMinus}
              title="Step 4 → Remove Existing Members"
              color="rose"
              items={[
                'To remove a member, click the Delete icon or button beside their name.',
                '→ The selected user will be removed from the group immediately.'
              ]}
              index={3}
            />
            <StepCard
              icon={Trash2}
              title="Step 5 → Delete the Entire Group (If Needed)"
              color="red"
              items={[
                'If you want to permanently delete the group, click on “Delete Group.”',
                '⚠️ Note: This action cannot be undone.'
              ]}
              index={4}
            />
            <ProTip emoji="💡">
              Keep your group’s <strong>name</strong>, <strong>image</strong>, and <strong>description</strong> concise
              and professional. → It helps members clearly understand the group’s purpose and keeps your LMS organized.
            </ProTip>
          </div>
        )
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default PrivateGroupGuide;
