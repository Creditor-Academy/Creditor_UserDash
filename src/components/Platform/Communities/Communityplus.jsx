import React from 'react';
import { motion } from 'framer-motion';

const Communityplus = () => {
  const features = [
    {
      id: 1,
      title: "Course and community connection",
      description: "A linked-user experience lets your customers switch between courses and communities easily."
    },
    {
      id: 2,
      title: "Profiles",
      description: "Personalize the experience and help learners connect with member profiles and @mentions."
    },
    {
      id: 3,
      title: "Notifications",
      description: "Keep your customers informed and updated with mobile and desktop push and in-app notifications."
    },
    {
      id: 4,
      title: "Reactions and threads",
      description: "Members can react and respond directly to comments in a thread, preserving context and continuity."
    },
    {
      id: 5,
      title: "Community analytics",
      description: "Track your members and identify the most active participants so you can reach out and engage ambassadors."
    },
    {
      id: 6,
      title: "Communities on mobile",
      description: "With push notifications, on-the-go access and activity feeds, customers can always stay connected."
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 py-20 sm:py-24 lg:py-32">
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
          {/* Main Heading */}
          <h4 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif font-normal text-white mb-8 leading-tight px-4">
            Host a private network of like-minded peers
          </h4>

          {/* Description */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Offer communal learning at its best. Do it with an interactive and<br />community-first integrated post, learning content.
          </p>
        </motion.div>

        {/* Community Interface Image/Video Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          {/* Outer blur box */}
          <div className="relative w-full max-w-5xl mx-auto p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl">
            <div className="relative w-full overflow-hidden shadow-xl" style={{ paddingBottom: '56.25%' }}>
              {/* Video iframe */}
              <iframe
                src="https://drive.google.com/file/d/1VHSrPG2_DH0Fd23eu8gYofyaPNfwcZcB/preview"
                className="absolute top-0 left-0 w-full h-full"
                allow="autoplay"
                allowFullScreen
                title="Community Interface Video"
              />
            </div>
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-0 w-full"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="border-b border-white/30 py-8 hover:bg-white/5 transition-all duration-300 px-0 rounded-lg"
            >
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Title */}
                <h3 className="text-2xl lg:text-3xl font-normal text-white leading-relaxed" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-lg lg:text-xl text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Communityplus;

