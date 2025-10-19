import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import Customer from '../../assets/Customer.webp';

const Customerpay = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const accordionItems = [
    {
      id: 0,
      title: "Self-paced, scheduled, and cohort courses",
      content: "Deliver your content in whatever way best serves your learners."
    },
    {
      id: 1,
      title: "Live lessons and webinars",
      content: "Connect to your audience in real time through Live Lessons with Zoom integration."
    },
    {
      id: 2,
      title: "Recognize and reward",
      content: "Celebrate your audience's success by automatically sending completion certificates after they finish a course."
    },
    {
      id: 3,
      title: "Mobile learning app",
      content: "Drive engagement with your own white-labeled mobile app that gives your audience the freedom to learn when and where it works best for them."
    },
    {
        id: 4,
        title: "Engaging multimedia lessons",
        content: "Create interactive lessons with text, images, videos, and audio to keep your audience engaged and motivated."
    },
    {
        id: 5,
        title: "Unified courses and communities",
        content:"Let learners flow between your connected course and community, enriching their learning journey and maximizing the value of your content."
    },

  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-sky-50 py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Heading */}
            <h2 className="text-3xl lg:text-4xl font-normal text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
              Courses your customers will love — and pay for
            </h2>

            {/* Description */}
            <p className="text-base text-black mb-8 leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
              Athena LMS's easy-to-use platform helps you create engaging, high-quality experiences that boost learner success and satisfaction.
            </p>

            {/* Accordion */}
            <div className="space-y-0 border-t border-gray-200">
              {accordionItems.map((item, index) => (
                <div key={item.id} className="border-b border-gray-200">
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full py-5 flex items-center justify-between text-left transition-colors duration-200"
                  >
                    <span className="text-lg font-normal text-gray-900 pr-4" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                      {item.title}
                    </span>
                    <div className="flex-shrink-0">
                      {openIndex === index ? (
                        <X className="w-5 h-5 text-gray-900" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-900" />
                      )}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5 text-black text-sm leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
                          {item.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative w-full h-[600px] lg:h-[700px] bg-gray-100 overflow-hidden shadow-2xl">
              {/* Add your image here */}
              <img
                src={Customer}
                alt="Customer learning experience"
                className="w-full h-full object-cover"
              />
              {/* Placeholder if no image */}
              {/* <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center p-8">
                  <p className="text-gray-500 text-lg">
                    Add customer image here
                  </p>
                </div>
              </div> */}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Customerpay;

