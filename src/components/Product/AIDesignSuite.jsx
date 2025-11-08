import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Image, 
  Edit3, 
  Play, 
  Volume2, 
  Smartphone, 
  FileText, 
  Globe, 
  BarChart3, 
  Presentation, 
  RefreshCw, 
  Search, 
  Tag, 
  Sparkles,
  Zap,
  Wand2,
  Layers,
  Eye,
  Mic,
  Music,
  Monitor,
  Tablet,
  Smartphone as Phone
} from 'lucide-react';

const AIDesignSuite = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Smart Layout Generator",
      description: "Upload content or describe your lesson — Athena instantly creates templates, layouts, and visual hierarchies.",
      icon: Layers,
      color: "from-blue-500 to-cyan-500",
      demo: "Upload a document → AI analyzes content → Generates optimized layout"
    },
    {
      title: "AI Writing Assistant",
      description: "Generate headlines, objectives, summaries, or scripts. Summarize, rephrase, or expand learning text intelligently.",
      icon: Edit3,
      color: "from-emerald-500 to-teal-500",
      demo: "Input topic → AI generates → Headlines, objectives, summaries"
    },
    {
      title: "AI Image Creator",
      description: "Convert written descriptions into original visuals — from realistic to conceptual styles.",
      icon: Image,
      color: "from-purple-500 to-pink-500",
      demo: "Describe image → AI creates → High-quality visuals"
    },
    {
      title: "Smart Edit Tools",
      description: "Replace, remove, or modify elements in visuals using text prompts.",
      icon: Wand2,
      color: "from-orange-500 to-red-500",
      demo: "Select element → Text prompt → AI modifies instantly"
    },
    {
      title: "Auto Animation",
      description: "Add transitions, visual motion, or interactive flow with one click.",
      icon: Play,
      color: "from-indigo-500 to-blue-500",
      demo: "Select content → One click → Smooth animations"
    },
    {
      title: "Voice Narration Generator",
      description: "Convert written scripts into natural, expressive speech in multiple languages and tones.",
      icon: Mic,
      color: "from-violet-500 to-purple-500",
      demo: "Input text → Choose voice → Generate narration"
    },
    {
      title: "Audio Sync & Beat Flow",
      description: "Automatically aligns narration, music, and visuals to maintain pacing and rhythm.",
      icon: Music,
      color: "from-teal-500 to-green-500",
      demo: "Upload audio → AI syncs → Perfect timing"
    },
    {
      title: "Smart Resize & Adaptation",
      description: "Convert a course design into multiple formats automatically.",
      icon: RefreshCw,
      color: "from-amber-500 to-yellow-500",
      demo: "One design → Multiple formats → eLearning, microlearning, presentation"
    },
    {
      title: "Summarize & Translate",
      description: "Generate summaries or translations into over 100 languages while retaining layout.",
      icon: Globe,
      color: "from-rose-500 to-pink-500",
      demo: "Input content → Choose language → AI translates + maintains design"
    },
    {
      title: "Brand Intelligence",
      description: "Learns your brand's tone, colors, and typography to maintain design consistency.",
      icon: Palette,
      color: "from-cyan-500 to-blue-500",
      demo: "Upload brand assets → AI learns → Consistent designs"
    },
    {
      title: "AI Collaboration",
      description: "Real-time co-editing, feedback, and workflow suggestions.",
      icon: Eye,
      color: "from-green-500 to-emerald-500",
      demo: "Team collaboration → AI suggestions → Improved workflow"
    },
    {
      title: "Data Visualization Engine",
      description: "Paste your data — Athena transforms it into clean, interactive infographics.",
      icon: BarChart3,
      color: "from-blue-500 to-indigo-500",
      demo: "Paste data → AI visualizes → Interactive charts"
    },
    {
      title: "AI Presentation Builder",
      description: "Generate entire decks or microlearning slides from a topic or document.",
      icon: Presentation,
      color: "from-purple-500 to-violet-500",
      demo: "Input topic → AI creates → Complete presentation"
    },
    {
      title: "Smart Media Switch",
      description: "Instantly convert one asset into another format (video → infographic → article).",
      icon: RefreshCw,
      color: "from-orange-500 to-amber-500",
      demo: "Upload media → Choose format → AI converts"
    },
    {
      title: "Search & Auto Tagging",
      description: "AI recognizes and tags assets for easy reuse.",
      icon: Tag,
      color: "from-emerald-500 to-teal-500",
      demo: "Upload assets → AI tags → Easy search & reuse"
    }
  ];

  const formats = [
    { name: 'eLearning', icon: Monitor, color: 'from-blue-500 to-cyan-500' },
    { name: 'Microlearning', icon: Smartphone, color: 'from-emerald-500 to-teal-500' },
    { name: 'Presentation', icon: Presentation, color: 'from-purple-500 to-pink-500' },
    { name: 'Article', icon: FileText, color: 'from-orange-500 to-red-500' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
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
          <div className="inline-flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
            <Palette className="w-4 h-4 mr-2" />
            AI-Powered Design Suite
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Visual Storytelling{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Made Effortless
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Alternative to Canva's Magic Features. Smart layout generation, AI writing assistance, 
            image creation, and intelligent design tools that learn your brand.
          </p>
        </motion.div>

        {/* Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                onClick={() => setActiveFeature(index)}
                className={`group cursor-pointer ${
                  activeFeature === index ? 'ring-2 ring-emerald-500' : ''
                }`}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 h-full">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-white font-semibold text-lg mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-emerald-400 text-xs font-medium">
                      {feature.demo}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Format Conversion */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Smart Format Conversion
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Convert a course design into multiple formats automatically — eLearning, microlearning, presentation, and more.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-4 gap-6">
              {formats.map((format, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${format.color} mb-4`}>
                    <format.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-semibold text-lg">{format.name}</h4>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-4 text-emerald-400">
                <RefreshCw className="w-6 h-6" />
                <span className="text-lg font-medium">One Design → Multiple Formats</span>
                <RefreshCw className="w-6 h-6" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Brand Intelligence Demo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Brand Intelligence
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Learns your brand's tone, colors, and typography to maintain design consistency across all content.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Color Palette",
                description: "AI learns your brand colors and applies them consistently",
                demo: "Upload brand guide → AI extracts colors → Auto-applies to designs",
                color: "from-purple-500 to-pink-500"
              },
              {
                title: "Typography",
                description: "Maintains your brand fonts and text styles across content",
                demo: "Define font styles → AI applies → Consistent typography",
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Tone & Voice",
                description: "Adapts writing style to match your brand personality",
                demo: "Input brand voice → AI writes → On-brand content",
                color: "from-emerald-500 to-teal-500"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} mb-4`}>
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold text-lg mb-3">{item.title}</h4>
                <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-emerald-400 text-xs">{item.demo}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Content?
            </h3>
            
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Experience the power of AI-driven design that learns your brand and creates stunning visuals effortlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Designing with AI
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-gray-600 text-white font-semibold rounded-xl hover:bg-white/5 transition-all duration-300"
              >
                View Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIDesignSuite;
