import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Github,
  ExternalLink,
  Users,
  TrendingUp
} from 'lucide-react';

const CommunityLinks = () => {
  const socialPlatforms = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      description: 'Professional network and company updates',
      followers: '10K+',
      link: '#',
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:to-blue-800'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      description: 'Community discussions and events',
      followers: '8K+',
      link: '#',
      color: 'from-blue-500 to-indigo-600',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      description: 'Latest news and quick updates',
      followers: '15K+',
      link: '#',
      color: 'from-sky-400 to-blue-500',
      hoverColor: 'hover:from-sky-500 hover:to-blue-600'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      description: 'Visual stories and behind-the-scenes',
      followers: '12K+',
      link: '#',
      color: 'from-pink-500 to-purple-600',
      hoverColor: 'hover:from-pink-600 hover:to-purple-700'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      description: 'Tutorials, webinars, and demos',
      followers: '20K+',
      link: '#',
      color: 'from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700'
    },
    {
      name: 'GitHub',
      icon: Github,
      description: 'Open source projects and integrations',
      followers: '5K+',
      link: '#',
      color: 'from-gray-700 to-gray-900',
      hoverColor: 'hover:from-gray-800 hover:to-black'
    }
  ];

  const stats = [
    { icon: Users, label: 'Community Members', value: '50K+' },
    { icon: MessageCircle, label: 'Daily Conversations', value: '1K+' },
    { icon: TrendingUp, label: 'Monthly Growth', value: '+25%' }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
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
          <div className="inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-md border border-sky-400/30 rounded-full text-sky-300 text-sm font-semibold mb-6 shadow-lg">
            <Users className="w-4 h-4 mr-2" />
            Join Our Community
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Connect With Us
          </h2>
          
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "150px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent mx-auto mb-6"
          />
          
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Follow us on social media for the latest updates, tips, and insights from the Athena community
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
              <stat.icon className="w-12 h-12 text-sky-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-300">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Social Platforms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialPlatforms.map((platform, index) => (
            <motion.a
              key={platform.name}
              href={platform.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-sky-400/30 transition-all duration-300 h-full">
                {/* Icon and Name */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${platform.color} ${platform.hoverColor} rounded-xl flex items-center justify-center transition-all`}>
                      <platform.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{platform.name}</h3>
                      <p className="text-xs text-slate-400">{platform.followers} followers</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-sky-400 transition-colors" />
                </div>

                {/* Description */}
                <p className="text-slate-300 text-sm">
                  {platform.description}
                </p>

                {/* Follow Button */}
                <button className={`w-full mt-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r ${platform.color} ${platform.hoverColor} transition-all duration-300 flex items-center justify-center`}>
                  Follow Us
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 text-center"
        >
          <MessageCircle className="w-16 h-16 text-sky-400 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h3>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive insights, product updates, and educational resources delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 transition-colors"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityLinks;

