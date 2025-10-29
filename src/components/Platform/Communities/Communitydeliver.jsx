import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import Customer from '../../../assets/Customer.webp';

const Communitydeliver = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const accordionItems = [
    {
      id: 0,
      title: "All in one place",
      content: "Your community integrates directly with your course offerings, all on a single, familiar platform. Forget paying for multiple tools or services."
    },
    {
      id: 1,
      title: "Launch quickly",
      content: "Get your community up and running fast with easy setup tools and intuitive features designed for quick deployment."
    },
    {
      id: 2,
      title: "Price, package, and sell your community",
      content: "Monetize your community with flexible pricing options and bundled offerings that attract and retain members."
    },
    {
      id: 3,
      title: "Keep customers coming back",
      content: "Foster engagement and loyalty with features that encourage ongoing participation and continuous value for your members."
    },
    {
      id: 4,
      title: "Your community, your way",
      content: "Customize every aspect of your community to match your brand and meet the unique needs of your audience."
    },
    {
      id: 5,
      title: "Learn from your community",
      content: "Gain valuable insights from member interactions and feedback to continuously improve your offerings and grow your business."
    },

  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-20 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-300/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-300/30 to-blue-300/20 blur-3xl" />
      </div>
      
      <div className="container mx-auto max-w-7xl relative">
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
              Deliver the high-quality learning experience your customers expect
            </h2>

            {/* Description */}
            <p className="text-base text-gray-700 mb-8 leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
              With close collaboration, lively discussion, and insights sharing, give students a reason to come back to your business every time.
            </p>

            {/* Accordion */}
            <div className="space-y-0 border-t border-gray-300">
              {accordionItems.map((item, index) => (
                <div key={item.id} className="border-b border-gray-300">
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
                        <div className="pb-5 text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
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

export default Communitydeliver;

