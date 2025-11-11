import React from 'react';
import { motion } from 'framer-motion';

const Communityplus = () => {
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
          <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif font-normal text-white mb-8 leading-tight px-4">
            It’s never been easier to
            <span className="block">launch a white-labeled mobile app</span>
          </h2>
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
            <div
              className="relative w-full overflow-hidden shadow-xl"
              style={{ paddingBottom: '56.25%' }}
            >
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
      </div>
    </section>
  );
};

export default Communityplus;
