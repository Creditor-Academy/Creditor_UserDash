import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Play, 
  Pause, 
  Upload, 
  Download, 
  Settings, 
  Globe, 
  User, 
  Mic, 
  Type, 
  Zap, 
  Sparkles, 
  Users, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Camera, 
  Edit3, 
  Layers, 
  Target, 
  CheckCircle, 
  Clock, 
  Volume2,
  Eye,
  MousePointer,
  FileText,
  Palette,
  Headphones
} from 'lucide-react';

const AIVideoStudio = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);

  const avatars = [
    { name: 'Sarah', type: 'Professional', expression: 'Friendly', color: 'from-blue-500 to-cyan-500' },
    { name: 'David', type: 'Business', expression: 'Confident', color: 'from-emerald-500 to-teal-500' },
    { name: 'Emma', type: 'Casual', expression: 'Energetic', color: 'from-purple-500 to-pink-500' },
    { name: 'Michael', type: 'Academic', expression: 'Authoritative', color: 'from-orange-500 to-red-500' },
    { name: 'Sophie', type: 'Creative', expression: 'Expressive', color: 'from-indigo-500 to-blue-500' },
    { name: 'James', type: 'Technical', expression: 'Precise', color: 'from-violet-500 to-purple-500' }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
  ];

  const features = [
    {
      title: "Text-to-Video Generation",
      description: "Transform scripts or documents into interactive learning videos instantly with AI avatars.",
      icon: Video,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "200+ AI Avatars",
      description: "Choose from diverse AI avatars with human-like expressions, lip-sync, and natural gestures.",
      icon: User,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Personalized Avatars",
      description: "Create custom avatars with your appearance or branding for personalized experiences.",
      icon: Edit3,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Multi-Language Support",
      description: "140+ languages with natural dubbing and translation capabilities.",
      icon: Globe,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Auto-Captioning",
      description: "Automatic subtitle generation and captioning for accessibility and engagement.",
      icon: Type,
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Template Library",
      description: "Pre-built templates for training, onboarding, explainer videos, and more.",
      icon: Layers,
      color: "from-violet-500 to-purple-500"
    },
    {
      title: "Brand Customization",
      description: "Apply your brand colors, fonts, and logos to maintain consistency.",
      icon: Palette,
      color: "from-teal-500 to-green-500"
    },
    {
      title: "Voice Cloning",
      description: "Integrate expressive AI speech with voice cloning capabilities.",
      icon: Mic,
      color: "from-amber-500 to-yellow-500"
    },
    {
      title: "Screen Recording",
      description: "Record screen with auto-transcription and intelligent editing features.",
      icon: Monitor,
      color: "from-rose-500 to-pink-500"
    },
    {
      title: "Interactive Elements",
      description: "Add clickable hotspots, embedded quizzes, and call-to-action buttons.",
      icon: MousePointer,
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: "Collaborative Editing",
      description: "Real-time collaboration with team members and bulk video generation.",
      icon: Users,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Quality Control",
      description: "AI-powered quality checks and optimization for professional results.",
      icon: CheckCircle,
      color: "from-blue-500 to-indigo-500"
    }
  ];

  const templates = [
    { name: 'Training', description: 'Employee training and skill development', color: 'from-blue-500 to-cyan-500' },
    { name: 'Onboarding', description: 'New employee orientation and introduction', color: 'from-emerald-500 to-teal-500' },
    { name: 'Explainer', description: 'Product and service explanations', color: 'from-purple-500 to-pink-500' },
    { name: 'Tutorial', description: 'Step-by-step instructional content', color: 'from-orange-500 to-red-500' },
    { name: 'Presentation', description: 'Business and educational presentations', color: 'from-indigo-500 to-blue-500' },
    { name: 'Interview', description: 'Interview and Q&A format videos', color: 'from-violet-500 to-purple-500' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
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
          <div className="inline-flex items-center px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium mb-6">
            <Video className="w-4 h-4 mr-2" />
            AI Video Creation Studio
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Transform Scripts into{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Interactive Videos
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Alternative to Synthesia Features. Instantly create professional learning videos with AI avatars, 
            multi-language support, and interactive elements that engage and educate.
          </p>
        </motion.div>

        {/* Video Creation Demo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                AI Video Creation Interface
              </h3>
              <p className="text-gray-300">
                Experience the power of AI-driven video creation with customizable avatars and content.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Script Input */}
              <div>
                <h4 className="text-white font-semibold mb-4">Script Input:</h4>
                <div className="bg-white/5 rounded-2xl p-6 mb-6">
                  <textarea
                    placeholder="Enter your script here..."
                    className="w-full h-32 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none"
                    defaultValue="Welcome to Athena's AI Video Studio. This revolutionary technology allows you to create professional learning videos in minutes. Simply input your script, choose an avatar, and let our AI handle the rest. Perfect for training, onboarding, and educational content."
                  />
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4 text-white mr-2 inline" />
                    Upload Document
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4 text-white mr-2 inline" />
                    Import from Course
                  </motion.button>
                </div>
              </div>

              {/* Avatar Selection */}
              <div>
                <h4 className="text-white font-semibold mb-4">Choose AI Avatar:</h4>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {avatars.map((avatar, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedAvatar(index)}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        selectedAvatar === index
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${avatar.color} mb-2 flex items-center justify-center`}>
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-medium text-xs">{avatar.name}</div>
                        <div className="text-gray-400 text-xs">{avatar.type}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Language Selection */}
                <div className="mb-6">
                  <label className="text-gray-300 text-sm mb-2 block">Language:</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-slate-800">
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsGenerating(!isGenerating)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Generate Video
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Advanced Video Features
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Comprehensive video creation tools that rival professional video production software.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 h-full">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h4 className="text-white font-semibold text-lg mb-3">
                    {feature.title}
                  </h4>
                  
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Template Library */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Template Library
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Pre-built templates for various use cases to get you started quickly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="group cursor-pointer"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  
                  <h4 className="text-white font-semibold text-lg mb-2">
                    {template.name}
                  </h4>
                  
                  <p className="text-gray-300 text-sm">
                    {template.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Elements Demo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Interactive Video Elements
              </h3>
              <p className="text-gray-300">
                Add engaging interactive elements to make your videos more effective and memorable.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Clickable Hotspots', icon: MousePointer, description: 'Interactive areas for additional information' },
                { name: 'Embedded Quizzes', icon: Target, description: 'In-video assessments and knowledge checks' },
                { name: 'Call-to-Action', icon: Eye, description: 'Engagement buttons and next steps' }
              ].map((element, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 mb-4">
                    <element.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">{element.name}</h4>
                  <p className="text-gray-300 text-sm">{element.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Create Amazing Videos?
            </h3>
            
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Transform your content into engaging video experiences with AI-powered avatars and interactive elements.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Creating Videos
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-gray-600 text-white font-semibold rounded-xl hover:bg-white/5 transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIVideoStudio;
