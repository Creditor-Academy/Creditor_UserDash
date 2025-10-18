import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Video, 
  FileText, 
  BarChart3, 
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Calendar,
  Download,
  Search,
  Filter,
  Star,
  TrendingUp,
  Award,
  Lightbulb
} from 'lucide-react';

const Resources = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Resources', icon: BookOpen },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'webinars', label: 'Webinars', icon: Video },
    { id: 'case-studies', label: 'Case Studies', icon: Award },
    { id: 'whitepapers', label: 'Whitepapers', icon: BarChart3 },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ];

  const resources = {
    blogs: [
      {
        title: "AI in Education: Transforming Learning in 2024",
        description: "Explore how artificial intelligence is revolutionizing educational experiences and personalized learning paths.",
        category: "AI in Education",
        readTime: "8 min read",
        date: "Dec 15, 2023",
        featured: true,
        tag: "Trending"
      },
      {
        title: "Instructional Design Best Practices for Online Courses",
        description: "Learn proven strategies for creating engaging and effective online learning experiences.",
        category: "Instructional Design",
        readTime: "10 min read",
        date: "Dec 10, 2023",
        featured: true,
        tag: "Popular"
      },
      {
        title: "The Science Behind Effective Learning",
        description: "Understanding cognitive psychology and learning theories to design better courses.",
        category: "Learning Science",
        readTime: "12 min read",
        date: "Dec 5, 2023",
        featured: false
      },
      {
        title: "Adaptive Learning: Personalizing Education at Scale",
        description: "How AI-powered adaptive learning systems adjust to individual student needs.",
        category: "AI in Education",
        readTime: "7 min read",
        date: "Nov 28, 2023",
        featured: false
      },
      {
        title: "Visual Design Principles for E-Learning",
        description: "Creating visually appealing and pedagogically effective learning materials.",
        category: "Instructional Design",
        readTime: "9 min read",
        date: "Nov 20, 2023",
        featured: false
      },
      {
        title: "Memory Retention Techniques for Online Learning",
        description: "Evidence-based strategies to improve long-term retention in digital courses.",
        category: "Learning Science",
        readTime: "11 min read",
        date: "Nov 15, 2023",
        featured: false
      }
    ],
    webinars: [
      {
        title: "Getting Started with Athena LMS",
        description: "Complete walkthrough of platform features and best practices for new users.",
        duration: "45 min",
        date: "Live: Dec 20, 2023",
        type: "Tutorial",
        featured: true
      },
      {
        title: "AI-Powered Course Creation Workshop",
        description: "Learn how to leverage AI tools to create engaging courses in minutes.",
        duration: "60 min",
        date: "Dec 18, 2023",
        type: "Workshop",
        featured: true
      },
      {
        title: "Advanced Analytics and Reporting",
        description: "Master the analytics dashboard to track learner progress and course effectiveness.",
        duration: "40 min",
        date: "Dec 12, 2023",
        type: "Tutorial",
        featured: false
      },
      {
        title: "Creating Interactive Assessments",
        description: "Design quizzes, assignments, and interactive exercises that engage learners.",
        duration: "35 min",
        date: "Dec 8, 2023",
        type: "Tutorial",
        featured: false
      }
    ],
    caseStudies: [
      {
        title: "University of Technology: 40% Increase in Student Engagement",
        description: "How a leading university transformed their online learning with Athena LMS.",
        industry: "Higher Education",
        metric: "40% ↑ Engagement",
        featured: true
      },
      {
        title: "TechCorp: Streamlining Employee Training Across 50+ Countries",
        description: "Global corporate training success story with multilingual course delivery.",
        industry: "Corporate Training",
        metric: "50+ Countries",
        featured: true
      },
      {
        title: "EdTech Academy: From 100 to 10,000 Students in 6 Months",
        description: "Scaling online education with AI-powered course creation and delivery.",
        industry: "Online Education",
        metric: "100x Growth",
        featured: false
      },
      {
        title: "HealthCare Institute: Compliance Training Made Simple",
        description: "Ensuring regulatory compliance with automated tracking and reporting.",
        industry: "Healthcare",
        metric: "100% Compliance",
        featured: false
      }
    ],
    whitepapers: [
      {
        title: "The State of Learning Analytics 2024",
        description: "Comprehensive research on how data-driven insights are transforming education.",
        pages: "32 pages",
        format: "PDF",
        featured: true
      },
      {
        title: "AI in Instructional Design: A Practical Guide",
        description: "Evidence-based approaches to integrating AI into course development.",
        pages: "28 pages",
        format: "PDF",
        featured: true
      },
      {
        title: "Measuring ROI in Corporate E-Learning",
        description: "Frameworks and metrics for quantifying training program effectiveness.",
        pages: "24 pages",
        format: "PDF",
        featured: false
      },
      {
        title: "The Future of Personalized Learning",
        description: "Trends and predictions for adaptive learning technologies through 2030.",
        pages: "40 pages",
        format: "PDF",
        featured: false
      }
    ]
  };

  const filteredResources = (type) => {
    let items = resources[type] || [];
    if (searchQuery) {
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return items;
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-white via-sky-50 to-blue-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-sky-200 rounded-full text-sky-700 text-sm font-semibold mb-6 shadow-sm">
            <Lightbulb className="w-4 h-4 mr-2" />
            Learning Resources
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Resources & Learning Center
          </h2>
          
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "150px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent mx-auto mb-6"
          />
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive collection of blogs, webinars, case studies, and research papers to enhance your learning journey
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-sky-200 rounded-xl focus:outline-none focus:border-sky-400 text-gray-700 shadow-sm"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === cat.id
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-sky-200 hover:border-sky-400'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content Sections */}
        {/* Blogs Section */}
        {(activeTab === 'all' || activeTab === 'blogs') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-blue-900 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-sky-600" />
                Latest Blogs
              </h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources('blogs').map((blog, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div className="bg-white border-2 border-sky-100 rounded-xl p-6 hover:border-sky-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {blog.featured && (
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full mb-3 self-start">
                        {blog.tag}
                      </span>
                    )}
                    <h4 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-sky-600 transition-colors">
                      {blog.title}
                    </h4>
                    <p className="text-gray-600 mb-4 flex-1">
                      {blog.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {blog.date}
                      </span>
                      <span>{blog.readTime}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-sky-100">
                      <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
                        {blog.category}
                      </span>
                      <button className="flex items-center text-sky-600 font-semibold hover:text-sky-700 transition-colors">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Webinars Section */}
        {(activeTab === 'all' || activeTab === 'webinars') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-blue-900 flex items-center">
                <Video className="w-8 h-8 mr-3 text-sky-600" />
                Webinars & Tutorials
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredResources('webinars').map((webinar, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-white to-sky-50 border-2 border-sky-200 rounded-xl p-6 hover:border-sky-400 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded-full">
                        {webinar.type}
                      </span>
                      {webinar.featured && (
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-blue-900 mb-3">
                      {webinar.title}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {webinar.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {webinar.date}
                      </span>
                      <span>{webinar.duration}</span>
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center">
                      <Video className="w-4 h-4 mr-2" />
                      Watch Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Case Studies Section */}
        {(activeTab === 'all' || activeTab === 'case-studies') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-blue-900 flex items-center">
                <Award className="w-8 h-8 mr-3 text-sky-600" />
                Success Stories
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredResources('caseStudies').map((study, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div className="bg-white border-2 border-sky-100 rounded-xl p-6 hover:border-sky-300 hover:shadow-xl transition-all duration-300 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full">
                        {study.industry}
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                        {study.metric}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-blue-900 mb-3">
                      {study.title}
                    </h4>
                    <p className="text-gray-600 mb-6">
                      {study.description}
                    </p>
                    <button className="flex items-center text-sky-600 font-semibold hover:text-sky-700 transition-colors">
                      Read Case Study
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Whitepapers Section */}
        {(activeTab === 'all' || activeTab === 'whitepapers') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-blue-900 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-sky-600" />
                Research & Whitepapers
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredResources('whitepapers').map((paper, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                        {paper.format}
                      </span>
                      <span className="text-sm text-gray-600">{paper.pages}</span>
                    </div>
                    <h4 className="text-xl font-bold text-blue-900 mb-3">
                      {paper.title}
                    </h4>
                    <p className="text-gray-600 mb-6">
                      {paper.description}
                    </p>
                    <button className="w-full py-3 bg-white border-2 border-blue-300 hover:bg-blue-50 text-blue-700 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Support CTA */}
        {(activeTab === 'all' || activeTab === 'support') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 md:p-12 text-center"
          >
            <HelpCircle className="w-16 h-16 text-white mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">
              Need More Help?
            </h3>
            <p className="text-sky-50 text-lg mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you 24/7.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-white text-sky-600 font-semibold rounded-xl hover:bg-sky-50 transition-all duration-300 shadow-lg">
                Contact Support
              </button>
              <button className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300">
                Browse FAQ
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Resources;

