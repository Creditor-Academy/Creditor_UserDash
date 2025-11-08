import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, 
  Mic, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Settings, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Download, 
  Upload, 
  Eye, 
  Zap, 
  Headphones, 
  User, 
  Clock, 
  CheckCircle,
  Sparkles,
  Waves,
  Type,
  Camera
} from 'lucide-react';

const AIVoiceStudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const voices = [
    { name: 'Sarah - Professional', accent: 'American', emotion: 'Neutral', color: 'from-blue-500 to-cyan-500' },
    { name: 'David - Friendly', accent: 'British', emotion: 'Warm', color: 'from-emerald-500 to-teal-500' },
    { name: 'Emma - Energetic', accent: 'Australian', emotion: 'Excited', color: 'from-purple-500 to-pink-500' },
    { name: 'Michael - Authoritative', accent: 'American', emotion: 'Confident', color: 'from-orange-500 to-red-500' },
    { name: 'Sophie - Calm', accent: 'Canadian', emotion: 'Relaxed', color: 'from-indigo-500 to-blue-500' },
    { name: 'James - Dramatic', accent: 'British', emotion: 'Expressive', color: 'from-violet-500 to-purple-500' }
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
      title: "High-Quality Speech Conversion",
      description: "Converts any text, lesson, or document into crystal-clear, natural-sounding speech.",
      icon: Volume2,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Multiple Voices & Emotions",
      description: "Choose from various voices, accents, and emotions for different learning contexts.",
      icon: User,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Adjustable Playback Speed",
      description: "Control playback speed from 0.5x to 4x for personalized learning pace.",
      icon: Clock,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Multi-Device Sync",
      description: "Seamless experience across web, mobile, and desktop with full synchronization.",
      icon: Smartphone,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Offline Playback",
      description: "Download content for offline access, perfect for remote learners.",
      icon: Download,
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Optical Text Reading",
      description: "Capture printed materials with camera and convert to audio instantly.",
      icon: Camera,
      color: "from-violet-500 to-purple-500"
    },
    {
      title: "AI Voice Cloning",
      description: "Create branded or instructor-specific voices for personalized experience.",
      icon: Mic,
      color: "from-teal-500 to-green-500"
    },
    {
      title: "Visual Text Highlighting",
      description: "Synchronized text highlighting improves comprehension and retention.",
      icon: Eye,
      color: "from-amber-500 to-yellow-500"
    }
  ];

  const devices = [
    { name: 'Web Browser', icon: Monitor, color: 'from-blue-500 to-cyan-500' },
    { name: 'Mobile App', icon: Smartphone, color: 'from-emerald-500 to-teal-500' },
    { name: 'Desktop App', icon: Monitor, color: 'from-purple-500 to-pink-500' },
    { name: 'Tablet', icon: Tablet, color: 'from-orange-500 to-red-500' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
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
          <div className="inline-flex items-center px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-6">
            <Volume2 className="w-4 h-4 mr-2" />
            AI Voice & Listening Studio
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Listen, Learn, and{' '}
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Engage
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Anytime, Anywhere. Alternative to Speechify Features. Convert any content to high-quality speech 
            with multiple voices, accents, and emotions for enhanced learning experiences.
          </p>
        </motion.div>

        {/* Voice Player Demo */}
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
                Interactive Voice Player
              </h3>
              <p className="text-gray-300">
                Experience the power of AI-generated speech with customizable voices and settings.
              </p>
            </div>

            {/* Sample Text */}
            <div className="bg-white/5 rounded-2xl p-6 mb-8">
              <h4 className="text-white font-semibold mb-4">Sample Text:</h4>
              <p className="text-gray-300 leading-relaxed">
                "Welcome to Athena's AI Voice Studio. This advanced technology converts any text into natural, 
                expressive speech. You can choose from multiple voices, adjust the speed, and even select different 
                emotions to match your learning context. Whether you're studying on the go or need accessibility 
                support, our AI voice technology makes learning more engaging and accessible."
              </p>
            </div>

            {/* Voice Controls */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Voice Selection */}
              <div>
                <h4 className="text-white font-semibold mb-4">Select Voice:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {voices.map((voice, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedVoice(index)}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        selectedVoice === index
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${voice.color} mb-2`}></div>
                      <div className="text-left">
                        <div className="text-white font-medium text-sm">{voice.name}</div>
                        <div className="text-gray-400 text-xs">{voice.accent} • {voice.emotion}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Playback Controls */}
              <div>
                <h4 className="text-white font-semibold mb-4">Playback Controls:</h4>
                
                {/* Main Controls */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <SkipBack className="w-5 h-5 text-white" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <SkipForward className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* Speed Control */}
                <div className="mb-4">
                  <label className="text-gray-300 text-sm mb-2 block">Playback Speed: {playbackSpeed}x</label>
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.1"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Language Selection */}
                <div>
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
              Powerful Voice Features
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Comprehensive voice technology that enhances learning accessibility and engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
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

        {/* Multi-Device Support */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Multi-Device Synchronization
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Seamless experience across all your devices with full synchronization and offline support.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {devices.map((device, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${device.color} mb-4`}>
                  <device.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-white font-semibold text-lg">{device.name}</h4>
                <div className="flex items-center justify-center mt-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">Synced</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Accessibility Features */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-6">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Accessibility Compliance
            </h3>
            
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Seamless integration with course modules and full accessibility compliance for inclusive learning experiences.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                'WCAG 2.1 AA Compliant',
                'Screen Reader Compatible',
                'Keyboard Navigation Support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
              >
                <Zap className="w-5 h-5 mr-2" />
                Try Voice Studio
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

export default AIVoiceStudio;
