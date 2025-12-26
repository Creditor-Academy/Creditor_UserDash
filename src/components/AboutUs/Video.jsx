import React from 'react';
import { motion } from 'framer-motion';
import CreditorImage from '../../assets/creditor.png';
const Video = () => {
  return (
    <section
      className="py-20 px-4 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)',
      }}
    >
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
            ease: 'easeInOut',
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
            ease: 'easeInOut',
            delay: 1,
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
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-normal text-gray-800 mb-6 leading-tight"
            style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
          >
            We are Athena LMS
          </h2>

          <p
            className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-normal"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            Athena LMS transforms the way teams learn, share, and grow. We
            combine design, interactivity, and deep insights to empower
            businesses with impactful learning journeys that win hearts and
            minds.
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
            <div
              className="relative w-full"
              style={{ paddingBottom: '56.25%' }}
            >
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
              ease: 'easeInOut',
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
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
        </motion.div>

        {/* Success Stories Section
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-gray-800 mb-6 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
              Athena LMS-powered success stories
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
              Explore the features and tools used by top-earning businesses on Athena LMS.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col hover:bg-blue-600 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={CreditorImage} 
                  alt="Creditor Academy" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-3 transition-colors" style={{ fontFamily: 'Arial, sans-serif' }}>
                  How Creditor Academy Transformed Financial Education
                </h3>
                <p className="text-gray-600 group-hover:text-white text-sm leading-relaxed mb-2 flex-grow transition-colors" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Creditor Academy revolutionized credit and legal empowerment training with Athena LMS — offering immersive, interactive learning paths that helped thousands achieve financial confidence and independence.
                </p>
                <a href="#" className="text-gray-900 group-hover:text-white font-medium text-sm flex items-center gap-1 hover:text-blue-600 transition-colors mt-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Read success story →
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col hover:bg-blue-600 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop" 
                  alt="Hootsuite team" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-3 transition-colors" style={{ fontFamily: 'Arial, sans-serif' }}>
                  How Hootsuite scaled customer education and revenue
                </h3>
                <p className="text-gray-600 group-hover:text-white text-sm leading-relaxed mb-2 flex-grow transition-colors" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Social media platform Hootsuite scaled its educational content to reach over 500,000 students and drove revenue through a paid certification program built on Athena LMS Plus.
                </p>
                <a href="#" className="text-gray-900 group-hover:text-white font-medium text-sm flex items-center gap-1 hover:text-blue-600 transition-colors mt-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Read case study →
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col hover:bg-blue-600 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop" 
                  alt="Keap team" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-3 transition-colors" style={{ fontFamily: 'Arial, sans-serif' }}>
                  How Keap reduced partner onboarding time by 30%
                </h3>
                <p className="text-gray-600 group-hover:text-white text-sm leading-relaxed mb-2 flex-grow transition-colors" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Keap created an online partner education program that saves time and elevates product knowledge by switching from a legacy LMS to Athena LMS Plus.
                </p>
                <a href="#" className="text-gray-900 group-hover:text-white font-medium text-sm flex items-center gap-1 hover:text-blue-600 transition-colors mt-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Read case study →
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div> */}
      </div>

      {/* Footer Text */}
      <div className="relative z-10 container mx-auto max-w-4xl mt-16 text-center">
        <p
          className="text-base md:text-lg text-gray-700 leading-relaxed font-normal px-4"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          Our philosophy is simple: knowledge should be immersive, intuitive,
          and inspiring. That's why we built Athena — to help businesses educate
          with elegance and scale with confidence.
        </p>
      </div>
    </section>
  );
};

export default Video;
