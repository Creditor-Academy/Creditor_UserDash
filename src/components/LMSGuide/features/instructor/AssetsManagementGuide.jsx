import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, Upload, FolderOpen, Settings, Star, Search } from 'lucide-react';
import { BaseFeature } from '../../FeatureComponents';

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
            <FileQuestion className="w-10 h-10 text-white" />
          </div>
          <motion.div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">
            Assets Management
          </h3>
          <div className="flex items-center gap-2">
            <motion.div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-blue-100 text-sm font-medium">Instructor Tools</span>
          </div>
        </div>
      </div>
      
      <p className="relative z-10 text-blue-50 text-lg leading-relaxed max-w-3xl">
        Efficiently <span className="text-yellow-300 font-semibold">manage course materials</span> and resources. 
        Upload, organize, and distribute learning assets to enhance course content delivery.
      </p>
    </motion.div>
  </div>
);

const AssetsManagementGuide = () => {
  const featureData = {
    id: 'assets_management',
    icon: FileQuestion,
    title: 'Assets Management',
    introduction: <IntroSection />,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example1',
        title: 'Assets Management Overview',
        description: 'Learn how to effectively manage and organize course materials and resources.'
      }
    ],
    steps: [
      {
        title: 'Step 1: Navigate to Assets Management',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={FileQuestion}
                title="Access the Assets Area"
                color="indigo"
                index={0}
                items={[
                  'From the main sidebar, click "Instructor Portal" to open instructor-focused tools.',
                  'Inside the Instructor Tools sidebar, select "Assets" to launch the asset workspace.',
                  'Use this section to upload and organize files such as images, PDFs, videos, audio, spreadsheets, and more.',
                  'Remember: the Assets feature centralizes every course resource in one place for quick sharing.'
                ]}
              />
            </motion.div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
              <p className="text-indigo-900 font-medium">
                Need to add multiple resource types? Assets supports mixed uploads up to a combined size of 1 GB per batch.
              </p>
            </div>
          </div>
        )
      },
      {
        title: 'Step 2: Manage Organizations & Categories',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={FolderOpen}
                title="Manage Organizations & Categories"
                color="blue"
                index={1}
                items={[
                  'Click "+ Add Organization" to create top-level groups such as Maths or Science.',
                  'Each organization can contain multiple categories to further organize assets.',
                  'Use categories like "Exams", "Classwork", or "Practicals" to keep resources tidy.',
                  'Select the relevant organization and category whenever you upload a new asset.'
                ]}
              />
            </motion.div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
              <p className="text-blue-900 font-medium">
                Building organizations first helps you keep every resource in the right learning stream.
              </p>
            </div>
          </div>
        )
      },
      {
        title: 'Step 3: Upload Assets',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={Upload}
                title="Complete the Upload Form"
                color="emerald"
                index={2}
                items={[
                  'Enter a clear Title for each asset.',
                  'Choose the Organization (and auto-linked category) where the asset belongs.',
                  'Add a Description so instructors and learners know how to use the file.',
                  'Pick the correct File Type: Image, Video, Audio, Text File, or PDF.'
                ]}
              />
            </motion.div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm space-y-3">
              <p className="text-emerald-900 font-semibold">Uploading tips:</p>
              <p className="text-emerald-800">
                Select files (images, PDFs, videos, audio, spreadsheets, and more) and upload several at once.
                The combined file size can be up to 1 GB.
              </p>
            </div>
          </div>
        )
      },
      {
        title: 'Step 4: Review Uploaded Assets',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={Search}
                title="Track and Maintain Resources"
                color="purple"
                index={3}
                items={[
                  'Filter uploaded assets by organization and category to see everything in one place.',
                  'Open assets to confirm the right files are attached before sharing with learners.',
                  'Keep libraries tidy by removing outdated files or reorganizing categories when needed.'
                ]}
              />
            </motion.div>

            <ProTip emoji="⚠️">
              Deleting an organization removes every asset inside it. For single assets or categories, manage deletions directly within the "Manage Organizations & Categories" panel to avoid accidental data loss.
            </ProTip>
          </div>
        )
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default AssetsManagementGuide;
