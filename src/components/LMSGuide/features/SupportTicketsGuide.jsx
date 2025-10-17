import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, PlusCircle, ListChecks, Star, AlertCircle, CheckCircle2, Clock, Tag } from 'lucide-react';
import { BaseFeature } from '../FeatureComponents';

const CategoryBadge = ({ text, color }) => (
  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-700`}>
    <Tag className={`w-4 h-4 mr-1 text-${color}-500`} />
    {text}
  </div>
);

const PriorityBadge = ({ level }) => {
  const colors = {
    Low: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-red-100 text-red-700'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level]}`}>
      {level}
    </span>
  );
};

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

const TicketPreview = () => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <CategoryBadge text="Technical Support" color="blue" />
        <PriorityBadge level="High" />
      </div>
      <div className="flex items-center gap-2 text-gray-500">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Just now</span>
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to access course content</h3>
    <p className="text-gray-600 mb-4">I'm trying to access the JavaScript Fundamentals course but getting an error message...</p>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-yellow-600">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Pending</span>
      </div>
      <div className="flex items-center gap-2 text-gray-500">
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-sm">Ticket #12345</span>
      </div>
    </div>
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
            <FileQuestion className="w-10 h-10 text-white" />
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
            Help & Support
          </h3>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-blue-100 text-sm font-medium">Support Ticket System</span>
          </div>
        </div>
      </div>
      
      <p className="relative z-10 text-blue-50 text-lg leading-relaxed max-w-3xl mb-8">
        Get assistance through our <span className="text-yellow-300 font-semibold">support ticket system</span>. 
        Create and track tickets for any issues or questions you may have.
      </p>

      <div className="relative z-10 flex gap-4 flex-wrap">
        <CategoryBadge text="Technical Support" color="blue" />
        <CategoryBadge text="Billing & Payments" color="green" />
        <CategoryBadge text="Account Issues" color="purple" />
        <CategoryBadge text="Course Content" color="indigo" />
        <CategoryBadge text="Other" color="gray" />
      </div>
    </motion.div>
  </div>
);

const SupportTicketsGuide = () => {
  const featureData = {
    id: 'support_tickets',
    icon: FileQuestion,
    title: 'Support Tickets',
    introduction: <IntroSection />,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example9',
        title: 'Using the Support System',
        description: 'Learn how to create and track support tickets effectively.'
      }
    ],
    steps: [
      {
        title: 'Creating a Support Ticket',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={PlusCircle}
                title="Accessing Support"
                color="blue"
                items={[
                  'Click on "Help & Support" at the bottom of the sidebar',
                  'Select "Create Ticket" from the options',
                  'Access the Support Ticket window'
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
                icon={AlertCircle}
                title="Ticket Information"
                color="emerald"
                items={[
                  'Select Ticket Category: Technical Support, Billing & Payments, Account Issues, Course Content, or Other',
                  'Choose Priority Level: Low, Medium, or High',
                  'Enter a clear Subject describing your issue',
                  'Provide a Detailed Description of the problem'
                ]}
                index={1}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Example Ticket Preview</h4>
                <TicketPreview />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <ProTip emoji="✍️">
                <span className="font-bold">Writing Effective Tickets:</span> Be specific in your description 
                and include any relevant details or error messages. This helps our support team assist you 
                more efficiently.
              </ProTip>
            </motion.div>
          </div>
        )
      },
      {
        title: 'Tracking Your Tickets',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={ListChecks}
                title="Ticket Management"
                color="purple"
                items={[
                  'Review your ticket before submission',
                  'Click "Submit Ticket" to create your support request',
                  'Access "My Tickets" to view all your tickets',
                  'Track the status and resolution of your tickets'
                ]}
                index={2}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProTip emoji="🎯">
                <span className="font-bold">Status Tracking:</span> Keep an eye on your ticket status 
                through the "My Tickets" section. You'll be notified of any updates or responses from 
                our support team.
              </ProTip>
            </motion.div>
          </div>
        )
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default SupportTicketsGuide;
