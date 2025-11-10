import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import CreditorImage from '../../assets/creditor.png';

const Video = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      background: "linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)"
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
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-gray-800 mb-6 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
            The right learning products<br />for your customers
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
            From online courses and communities to memberships and digital downloads. LMS Athena supports every way you want to share — and scale — your expertise.
          </p>
        </motion.div>

        {/* Contact Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <style>
            {`
              .contact-btn-primary {
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                color: #000;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                font-family: 'Arial', sans-serif;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
              }

              .contact-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
              }
            `}
          </style>
          <a href="/contact" className="contact-btn-primary">
            Get Started
            <ArrowUpRight size={16} strokeWidth={2} />
          </a>
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
    </section>
  );
};

export default Video;