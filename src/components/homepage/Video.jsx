import React from 'react';
import { motion } from 'framer-motion';

const Video = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #bae6fd 100%)"
    }}>
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 right-20 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl"
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
          className="absolute bottom-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
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

      <div className="relative z-10 container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            The right learning products<br />for your customers
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From online courses and communities to memberships and digital downloads. Athena LMS supports every way you want to share — and scale — your expertise.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Video Wrapper with Shadow */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Video Iframe */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              {/* Add your video source link in the src attribute below */}
              {/* Example: src="https://drive.google.com/file/d/1VHSrPG2_DH0Fd23eu8gYofyaPNfwcZcB/preview" */}
              <iframe
                src="https://drive.google.com/file/d/1VHSrPG2_DH0Fd23eu8gYofyaPNfwcZcB/preview"
                className="absolute top-0 left-0 w-full h-full"
                title="Athena LMS Product Overview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Decorative Elements */}
          <motion.div
            className="absolute -top-4 -left-4 w-24 h-24 bg-sky-400/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"
            animate={{
              scale: [1.3, 1, 1.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Video;

