import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Brain, TrendingUp, Sparkles, Play, Zap, Award, Target } from 'lucide-react';

const ProductHero = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered",
      description: "Smart content creation"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Real-time insights"
    },
    {
      icon: Target,
      title: "Adaptive",
      description: "Personalized learning"
    },
    {
      icon: Award,
      title: "Certified",
      description: "Track achievements"
    }
  ];

  return (
    <section className="min-h-screen relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:72px_72px]"></div>

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 bg-sky-500/20 backdrop-blur-sm border border-sky-400/30 rounded-full text-sky-300 text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4 mr-2" />
              Next-Gen Learning Platform
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Learning with{' '}
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                AI Power
              </span>
            </h1>
            
            <p className="text-xl text-sky-100 mb-8 leading-relaxed">
              Comprehensive LMS with AI Instructional Design Engine. Create, manage, and deliver personalized learning experiences at scale.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { value: "10+", label: "AI Tools" },
                { value: "20+", label: "Languages" },
                { value: "500+", label: "Learners" },
                { value: "98%", label: "Success" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-sky-400">{stat.value}</div>
                  <div className="text-xs text-sky-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/50 transition-all duration-300 inline-flex items-center justify-center"
              >
                Get Started 
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 ml-2" />
                </motion.div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </motion.button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 transition-all"
                >
                  <feature.icon className="w-4 h-4 text-sky-400" />
                  <span className="text-sm text-white font-medium">{feature.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full px-4 py-2 shadow-xl z-20"
            >
              <p className="text-white text-sm font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Live Dashboard Preview
              </p>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-4 shadow-2xl shadow-sky-500/50 z-10"
            >
              <Users className="w-8 h-8 text-white" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -right-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-4 shadow-2xl shadow-blue-500/50 z-10"
            >
              <TrendingUp className="w-8 h-8 text-white" />
            </motion.div>

            {/* Main Dashboard Mockup */}
            <div className="relative bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-6 shadow-2xl">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Athena Dashboard</div>
                    <div className="text-sky-300 text-xs">Real-time Analytics</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Stats Cards with Labels */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "Active Learners", value: "500", percentage: 85 },
                  { label: "Course Progress", value: "67%", percentage: 67 },
                  { label: "Completion Rate", value: "94%", percentage: 94 },
                  { label: "Engagement", value: "8.5", percentage: 85 }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:from-white/15 hover:to-white/10 transition-all cursor-pointer"
                  >
                    <div className="text-sky-300 text-xs font-medium mb-2">{stat.label}</div>
                    <div className="text-white text-2xl font-bold mb-3">{stat.value}</div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                        className="h-full bg-gradient-to-r from-sky-400 to-blue-500"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chart Area with Label */}
              <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white text-sm font-semibold">Weekly Activity</p>
                  <div className="flex items-center gap-2 text-sky-300 text-xs">
                    <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                    <span>Live Data</span>
                  </div>
                </div>
                <div className="flex items-end justify-between h-32 gap-2">
                  {[65, 80, 55, 90, 70, 85, 75, 95].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: 1 + i * 0.1 }}
                      className="relative flex-1 bg-gradient-to-t from-sky-500 to-blue-400 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer group"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-slate-900 text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                        {height}%
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 gap-2 text-sky-300 text-xs">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-blue-600/20 rounded-3xl blur-2xl -z-10"></div>
            </div>

            {/* Bottom Info Label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="mt-6 text-center"
            >
              <p className="text-sky-200 text-sm">
                ✨ <span className="font-semibold">AI-Powered Insights</span> • Real-time Updates • Customizable Views
              </p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ProductHero;
