import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, BookOpen, Target, Monitor, Layout, Eye, Zap, Award, Clock, CheckCircle2, PlayCircle, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardImage from '../../assets/Dashboard.png';

const DashboardOverview = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const scrollContainerRef = useRef(null);
  const [progressData] = useState([
    { name: 'Course Completion', value: 78, icon: BookOpen },
    { name: 'Active Learners', value: 92, icon: Users },
    { name: 'Visual Learners', value: 65, icon: Layout },
    { name: 'Progress Rate', value: 85, icon: TrendingUp }
  ]);

  const modules = [
    { 
      name: "Introduction to Financial Literacy", 
      progress: 85, 
      lessons: 12, 
      completed: 10,
      duration: "2.5 hrs",
      status: "in-progress",
      accentColor: "sky"
    },
    { 
      name: "Credit Building Basics", 
      progress: 67, 
      lessons: 15, 
      completed: 10,
      duration: "3.0 hrs",
      status: "locked",
      accentColor: "blue"
    },
    { 
      name: "Investment Strategies", 
      progress: 45, 
      lessons: 20, 
      completed: 9,
      duration: "4.5 hrs",
      status: "in-progress",
      accentColor: "sky"
    }
  ];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of one card + gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-sky-50 via-blue-50 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl"></div>
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
          <div className="inline-flex items-center px-4 py-2 bg-white border border-sky-200 rounded-full text-sky-700 text-sm font-medium mb-4 shadow-sm">
            <Monitor className="w-4 h-4 mr-2" />
            LMS Dashboard
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Powerful Analytics Dashboard
          </h2>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Track learner progress and engagement in real-time
          </p>
        </motion.div>

        {/* Dashboard Showcase Section - Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-20 max-w-7xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Dashboard Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative group order-2 lg:order-1"
            >
              {/* Decorative Glow Effects */}
              <div className="absolute -inset-4 bg-gradient-to-r from-sky-400 to-blue-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              {/* Main Image Container */}
              <div className="relative bg-white rounded-2xl p-3 md:p-4 border-2 border-sky-200 shadow-2xl">
                {/* Browser Chrome */}
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-200">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="px-3 py-1 bg-slate-100 rounded-md text-xs text-slate-600 font-medium">
                      lmsathena.com/dashboard
                    </div>
                  </div>
                  <div className="w-16"></div>
                </div>
                
                {/* Dashboard Image */}
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
                  <img 
                    src={DashboardImage}
                    alt="Athena LMS Dashboard - Real-time Analytics" 
                    className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Overlay Badge - Live Indicator */}
                  <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-2 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-xs font-semibold">Live Dashboard</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="absolute -bottom-6 -right-6 bg-white border-2 border-sky-200 rounded-xl p-4 shadow-xl hidden md:block"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Active Now</div>
                    <div className="text-lg font-bold text-slate-900">248</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Content & Features */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-sky-100 border border-sky-200 rounded-full text-sky-700 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Live Analytics
              </div>

              {/* Main Heading */}
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                Everything You Need in
                <span className="block bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  One Powerful Dashboard
                </span>
              </h3>

              {/* Description */}
              <p className="text-lg text-slate-600 leading-relaxed">
                Get real-time insights into learner progress, engagement metrics, and course performance. Make data-driven decisions with our intuitive analytics dashboard.
              </p>

              {/* Feature List */}
              <div className="space-y-4">
                {[
                  {
                    icon: BarChart3,
                    title: "Real-time Analytics",
                    desc: "Track learner progress and engagement as it happens"
                  },
                  {
                    icon: Users,
                    title: "Learner Insights",
                    desc: "Understand learning styles and adapt content accordingly"
                  },
                  {
                    icon: Award,
                    title: "Performance Metrics",
                    desc: "Monitor completion rates and assessment results"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-4 p-4 bg-white border border-sky-100 rounded-xl hover:border-sky-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-sky-100 transition-colors">
                      <feature.icon className="w-6 h-6 text-sky-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {["Customizable", "Export Data", "Multi-device", "Secure"].map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-sky-50 text-sky-700 text-xs font-medium rounded-full border border-sky-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white border-2 border-sky-200 rounded-xl p-1 inline-flex shadow-sm">
            {['overview', 'modules', 'learners'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-sky-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {progressData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white border border-sky-200 rounded-xl p-6 hover:shadow-xl hover:border-sky-300 shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-slate-900 font-semibold text-sm">{item.name}</h4>
                    <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-sky-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-slate-900">{item.value}%</div>
                    <div className="w-full bg-sky-50 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: index * 0.15 }}
                        viewport={{ once: true }}
                        className="h-2 rounded-full bg-sky-600"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {modules.map((module, index) => {
                const getAccentClasses = (color) => {
                  const colors = {
                    sky: {
                      border: 'border-sky-200',
                      hoverBorder: 'hover:border-sky-300',
                      bg: 'bg-sky-50',
                      text: 'text-sky-700',
                      progressBg: 'bg-sky-600',
                      buttonBg: 'bg-sky-600 hover:bg-sky-700'
                    },
                    blue: {
                      border: 'border-blue-200',
                      hoverBorder: 'hover:border-blue-300',
                      bg: 'bg-blue-50',
                      text: 'text-blue-700',
                      progressBg: 'bg-blue-600',
                      buttonBg: 'bg-blue-600 hover:bg-blue-700'
                    },
                    indigo: {
                      border: 'border-indigo-200',
                      hoverBorder: 'hover:border-indigo-300',
                      bg: 'bg-indigo-50',
                      text: 'text-indigo-700',
                      progressBg: 'bg-indigo-600',
                      buttonBg: 'bg-indigo-600 hover:bg-indigo-700'
                    },
                    slate: {
                      border: 'border-slate-300',
                      hoverBorder: 'hover:border-slate-400',
                      bg: 'bg-slate-100',
                      text: 'text-slate-600',
                      progressBg: 'bg-slate-400',
                      buttonBg: 'bg-slate-400'
                    }
                  };
                  return colors[color] || colors.sky;
                };

                const accent = getAccentClasses(module.accentColor);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className={`bg-white border ${accent.border} rounded-xl overflow-hidden shadow-md hover:shadow-lg ${accent.hoverBorder} transition-all duration-300 group`}
                  >
                    {/* Compact Header Section */}
                    <div className={`${accent.bg} p-5 border-b ${accent.border}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-2">
                          <h4 className="text-slate-900 font-bold text-lg mb-2 leading-tight">
                            {module.name}
                          </h4>
                          <div className="flex items-center space-x-4 text-slate-600 text-sm">
                            <div className="flex items-center space-x-1.5">
                              <BookOpen className="w-4 h-4" />
                              <span>{module.lessons} Lessons</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Clock className="w-4 h-4" />
                              <span>{module.duration}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Compact Status Badge */}
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                          module.status === 'locked' 
                            ? 'bg-slate-200 text-slate-600' 
                            : `${accent.bg} ${accent.text} border ${accent.border}`
                        }`}>
                          {module.status === 'locked' ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <PlayCircle className="w-3 h-3" />
                          )}
                        </div>
                      </div>

                      {/* Progress Display */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-slate-900 leading-none">
                            {module.progress}%
                          </div>
                          <div className="text-slate-600 text-sm mt-1">Complete</div>
                        </div>
                        
                        {/* Progress Ring */}
                        <div className="relative w-16 h-16">
                          <svg className="transform -rotate-90 w-16 h-16">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              className="text-slate-200"
                              strokeWidth="4"
                              fill="none"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              className={accent.text}
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - module.progress / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle2 className={`w-5 h-5 ${accent.text}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Body Section */}
                    <div className="p-5 space-y-4">
                      {/* Lesson Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            Lessons Progress
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {module.completed}/{module.lessons}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${module.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.15, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className={`h-2.5 rounded-full ${accent.progressBg}`}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <button 
                        className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${
                          module.status === 'locked'
                            ? 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-700 hover:shadow-md cursor-pointer'
                            : `${accent.buttonBg} text-white hover:shadow-md`
                        }`}
                      >
                        {module.status === 'locked' ? '🔒 Unlock Module' : 'Continue Learning'}
                      </button>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                        <div className="text-center">
                          <div className={`text-base font-bold ${accent.text}`}>
                            {Math.round((module.completed / module.lessons) * 100)}%
                          </div>
                          <div className="text-xs text-slate-500">Completion</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base font-bold text-slate-900">
                            {module.lessons - module.completed}
                          </div>
                          <div className="text-xs text-slate-500">Remaining</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base font-bold text-slate-900">
                            {module.duration}
                          </div>
                          <div className="text-xs text-slate-500">Duration</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === 'learners' && (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white border border-sky-200 rounded-xl p-8 hover:shadow-xl shadow-md transition-all">
                <h4 className="text-slate-900 font-bold text-xl mb-6">Learning Styles</h4>
                <div className="space-y-5">
                  {[
                    { style: 'Visual', percentage: 65 },
                    { style: 'Auditory', percentage: 23 },
                    { style: 'Kinesthetic', percentage: 12 }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-700 font-medium">{item.style}</span>
                        <span className="text-sky-600 font-bold">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-sky-50 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.15 }}
                          viewport={{ once: true }}
                          className="h-3 rounded-full bg-sky-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white border border-sky-200 rounded-xl p-8 hover:shadow-xl shadow-md transition-all">
                <h4 className="text-slate-900 font-bold text-xl mb-6">Device Usage</h4>
                <div className="space-y-5">
                  {[
                    { device: 'Desktop', percentage: 45, icon: Monitor },
                    { device: 'Tablet', percentage: 30, icon: Target },
                    { device: 'Mobile', percentage: 25, icon: BookOpen }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <item.icon className="w-5 h-5 text-sky-600" />
                          <span className="text-slate-700 font-medium">{item.device}</span>
                        </div>
                        <span className="text-sky-600 font-bold">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-sky-50 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.15 }}
                          viewport={{ once: true }}
                          className="h-3 rounded-full bg-sky-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </section>
  );
};

export default DashboardOverview;
