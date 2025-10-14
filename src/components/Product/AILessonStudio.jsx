import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  FileText, 
  Quote, 
  Volume2, 
  Video, 
  File, 
  Link, 
  Table, 
  Layers, 
  Images, 
  MapPin, 
  Clock, 
  ChevronDown,
  Sparkles,
  BookOpen,
  Target,
  Lightbulb,
  CheckCircle,
  Play,
  Edit3,
  Zap
} from 'lucide-react';

const AILessonStudio = () => {
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState('knowledge');

  const templates = [
    { name: 'Text Block', icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { name: 'Quote', icon: Quote, color: 'from-purple-500 to-pink-500' },
    { name: 'Statement', icon: FileText, color: 'from-emerald-500 to-teal-500' },
    { name: 'Audio', icon: Volume2, color: 'from-orange-500 to-red-500' },
    { name: 'Video', icon: Video, color: 'from-indigo-500 to-blue-500' },
    { name: 'PDF', icon: File, color: 'from-gray-500 to-slate-500' },
    { name: 'Link', icon: Link, color: 'from-green-500 to-emerald-500' },
    { name: 'Table', icon: Table, color: 'from-yellow-500 to-orange-500' },
    { name: 'Tabs', icon: Layers, color: 'from-pink-500 to-rose-500' },
    { name: 'Carousel', icon: Images, color: 'from-cyan-500 to-blue-500' },
    { name: 'Hotspots', icon: MapPin, color: 'from-violet-500 to-purple-500' },
    { name: 'Timeline', icon: Clock, color: 'from-teal-500 to-green-500' },
    { name: 'Accordion', icon: ChevronDown, color: 'from-amber-500 to-yellow-500' }
  ];

  const bloomLevels = [
    { 
      name: 'Knowledge', 
      description: 'Remember facts and basic concepts',
      color: 'from-blue-500 to-cyan-500',
      examples: ['Define', 'List', 'Recall', 'Identify']
    },
    { 
      name: 'Comprehension', 
      description: 'Explain ideas or concepts',
      color: 'from-emerald-500 to-teal-500',
      examples: ['Explain', 'Describe', 'Summarize', 'Interpret']
    },
    { 
      name: 'Application', 
      description: 'Use information in new situations',
      color: 'from-purple-500 to-pink-500',
      examples: ['Apply', 'Demonstrate', 'Solve', 'Use']
    },
    { 
      name: 'Analysis', 
      description: 'Draw connections among ideas',
      color: 'from-orange-500 to-red-500',
      examples: ['Analyze', 'Compare', 'Contrast', 'Examine']
    },
    { 
      name: 'Synthesis', 
      description: 'Create new or original work',
      color: 'from-indigo-500 to-blue-500',
      examples: ['Create', 'Design', 'Develop', 'Construct']
    },
    { 
      name: 'Evaluation', 
      description: 'Justify a stand or decision',
      color: 'from-violet-500 to-purple-500',
      examples: ['Evaluate', 'Judge', 'Critique', 'Assess']
    }
  ];

  const strategies = [
    {
      name: 'Scenario-Based Learning',
      description: 'Real-world situations that challenge learners to apply knowledge',
      icon: Target,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Guided Discovery',
      description: 'Structured exploration that leads learners to discover concepts',
      icon: Lightbulb,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Reflection Prompts',
      description: 'Thought-provoking questions that encourage deep thinking',
      icon: Brain,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            AI Lesson{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Creation Studio
            </span>
          </h2>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Create engaging lessons with AI-powered templates & Bloom's Taxonomy
          </p>
        </motion.div>

        {/* Lesson Templates Library */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Lesson Templates Library
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Pre-built lesson structures with text, quotes, statements, audio, video, PDFs, links, 
              tables, and interactive elements like tabs, carousels, hotspots, timelines, and accordions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {templates.map((template, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.05 }}
                onClick={() => setActiveTemplate(index)}
                className={`group cursor-pointer ${
                  activeTemplate === index ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <template.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-white font-medium text-sm text-center">
                    {template.name}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bloom's Taxonomy Levels */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Bloom's Taxonomy Integration
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              AI suggests structure based on Bloom's Taxonomy levels from Knowledge to Evaluation, 
              ensuring comprehensive learning outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bloomLevels.map((level, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedLevel(level.name.toLowerCase())}
                className={`group cursor-pointer ${
                  selectedLevel === level.name.toLowerCase() ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${level.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  
                  <h4 className="text-white font-semibold text-lg mb-2">
                    {level.name}
                  </h4>
                  
                  <p className="text-gray-300 text-sm mb-4">
                    {level.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {level.examples.map((example, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-lg"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Instructional Strategies */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Instructional Strategy Guidance
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              AI provides guidance on instructional strategy including scenario-based learning, 
              guided discovery, and reflection prompts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${strategy.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <strategy.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h4 className="text-white font-semibold text-xl mb-4">
                    {strategy.name}
                  </h4>
                  
                  <p className="text-gray-300 leading-relaxed">
                    {strategy.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Features Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              AI-Powered Features
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Every template integrates cognitive load theory, spaced repetition, and learner engagement principles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Auto-Assessments', description: 'Creates assessments aligned with measurable outcomes', icon: Target },
              { title: 'Visual Suggestions', description: 'Suggests visuals based on learning goals', icon: Sparkles },
              { title: 'Voice Integration', description: 'Auto-suggests voice and interaction types', icon: Volume2 },
              { title: 'Cognitive Load', description: 'Integrates cognitive load theory principles', icon: Brain }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Creating with AI
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AILessonStudio;
