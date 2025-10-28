import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Video, TrendingUp, MessageCircle, Lock, Shield, Pin, BarChart3 } from 'lucide-react';

const Communitybuild = () => {
  const features = [
    {
      id: 1,
      title: "Weekly digests",
      description: "Keep your members engaged and connected with an automated weekly email.",
      icon: Mail,
    },
    {
      id: 2,
      title: "Private spaces",
      description: "Host spaces open to all members or kept private for select groups. Members can connect in more focused, meaningful ways.",
      icon: Lock,
    },
    {
      id: 3,
      title: "Live events",
      description: "Let members connect in real time. Offer dynamic learning experiences like workshops, Q&As, office hours, coaching, and more.",
      icon: Video,
    },
    {
      id: 4,
      title: "Community moderation",
      description: "Fuel steady engagement and consistent activity by empowering your team with a Community Moderator Role.",
      icon: Shield,
    },
    {
      id: 5,
      title: "Trending posts",
      description: "Push notifications alert your audience to trending posts so they can jump back in and take part in the discussion — no matter where they are.",
      icon: TrendingUp,
    },
    {
      id: 6,
      title: "Pinned posts and announcements",
      description: "Help members stay informed on shared goals, prompts, and important community updates.",
      icon: Pin,
    },
    {
      id: 7,
      title: "Direct Messaging",
      description: "Boost engagement and build stronger member relationships with direct messaging, providing private, real-time communication right inside your community.",
      icon: MessageCircle,
    },
    {
      id: 8,
      title: "Community analytics",
      description: "Track your members and identify the most active participants so you can reach out and engage ambassadors.",
      icon: BarChart3,
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 py-20 sm:py-24 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-white mb-6 leading-tight">
            Build around the needs of your members
          </h2>
          <p className="text-base sm:text-lg text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Customize your community with learners in mind. Keep connecting with customers in a way that feels authentic to your business.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="group"
            >
              <div className="relative pb-8 border-b border-white/20">
                <div className="flex items-start justify-between gap-6 mb-4">
                  {/* Title */}
                  <h3 className="text-2xl font-normal text-white leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                    {feature.title}
                  </h3>
                  
                  {/* Icon */}
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-700/50 rounded-lg flex items-center justify-center group-hover:bg-blue-600/50 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-base text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Communitybuild;

