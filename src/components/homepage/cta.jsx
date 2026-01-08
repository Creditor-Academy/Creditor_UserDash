'use client';

import React from 'react';
import { motion } from 'framer-motion';

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Learning & Development?
          </h2>
          <p className="text-xl text-blue-200 mb-10 max-w-3xl mx-auto">
            Join thousands of Instructional Designers, Training Teams, and L&D
            leaders already building the future with Athena.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="px-6 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-300 whitespace-nowrap"
            >
              Start Your Free Trial
            </a>
            <a
              href="/pricing"
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-colors duration-300 whitespace-nowrap"
            >
              Explore Bundles
            </a>
            <a
              href="https://scheduler.zoom.us/prerna-mishra/website-requirement-meeting"
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-colors duration-300 whitespace-nowrap"
            >
              Schedule a Demo
            </a>
            <a
              href="/contact"
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-colors duration-300 whitespace-nowrap"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
