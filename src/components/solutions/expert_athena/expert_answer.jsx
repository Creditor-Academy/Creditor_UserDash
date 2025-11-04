import React from "react";
import { motion } from "framer-motion";
import { Play, Users, Menu, Plus, MessageCircle, Mail, Download, List, Mic } from "lucide-react";

const questions = [
  {
    id: 1,
    question: "How can I boost learner engagement?",
    answer:
      "Seamlessly integrate our lead generation tools into frictionless funnels and customized learning environments to effortlessly engage leads and nurture them into loyal advocates.",
    imagePosition: "right",
    imageBg: "bg-gradient-to-br from-purple-200 to-purple-300",
    showVideoPlayer: true,
  },
  {
    id: 2,
    question: "How can I simplify my tech stack?",
    answer:
      "Athena LMS consolidates all your essential features—course building, community management, payment processing, and more—in one place, allowing you to focus on growing your business rather than juggling multiple platforms.",
    imagePosition: "left",
    imageBg: "bg-gradient-to-br from-gray-300 to-gray-400",
    showTechStack: true,
  },
  {
    id: 3,
    question: "How can I go beyond trading my time for money?",
    answer:
      "Turn your expertise into scalable, revenue-generating digital learning products. With Athena LMS, you can create on-demand courses, paid communities, and digital downloads that sell while you sleep—so you can earn more without always being 'on'.",
    imagePosition: "right",
    imageBg: "bg-gradient-to-br from-blue-200 to-blue-300",
    showProductChooser: true,
  },
];

export default function ExpertAnswer() {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 via-blue-50/50 to-white py-20 sm:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-gray-900 mb-6 leading-tight">
            Solve your biggest business needs with{" "}
            <span className="text-blue-600">learning experiences</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            As a subject matter expert, your unique business comes with unique opportunities. Here are some ways Athena can help you turn that expertise into learning experiences that sell.
          </p>
        </motion.div>

        {/* Q&A Sections */}
        <div className="space-y-20 lg:space-y-32">
          {questions.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                item.imagePosition === "left" ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Content Side */}
              <div
                className={`${
                  item.imagePosition === "left" ? "lg:order-2" : "lg:order-1"
                } flex flex-col justify-center`}
              >
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-gray-900 mb-6 leading-tight">
                  {item.question}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
                  {item.answer}
                </p>
                {/* Decorative underline */}
                <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-200 rounded-full" />
              </div>

              {/* Image Side */}
              <div
                className={`${
                  item.imagePosition === "left" ? "lg:order-1" : "lg:order-2"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className={`relative ${item.imageBg} rounded-3xl shadow-2xl overflow-hidden h-[400px] lg:h-[450px] flex items-center justify-center group`}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10" />
                  
                  {/* Video Player Mockup */}
                  {item.showVideoPlayer && (
                    <div className="relative z-10 bg-black rounded-2xl shadow-2xl p-4 m-8 w-4/5 h-3/4 flex flex-col">
                      {/* Video Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-white text-xs font-semibold">LIVE</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">❤️</span>
                          </div>
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">👍</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Video Content */}
                      <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center relative">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                          241 current viewers
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tech Stack Icons */}
                  {item.showTechStack && (
                    <div className="relative z-10 bg-gray-800 rounded-2xl shadow-2xl p-8 m-8 w-4/5 h-3/4 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-6 w-full">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <Menu className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <Plus className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <Mail className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Chooser */}
                  {item.showProductChooser && (
                    <div className="relative z-10 bg-blue-200 rounded-2xl shadow-2xl p-6 m-8 w-4/5 h-3/4 flex flex-col">
                      <h3 className="text-gray-800 text-lg font-semibold mb-6 text-center">Choose a product</h3>
                      <div className="grid grid-cols-3 gap-4 flex-1">
                        <div className="bg-white/60 rounded-lg p-3 flex flex-col items-center gap-2">
                          <Download className="w-6 h-6 text-gray-700" />
                          <span className="text-gray-700 text-xs text-center">Digital download</span>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 flex flex-col items-center gap-2">
                          <List className="w-6 h-6 text-gray-700" />
                          <span className="text-gray-700 text-xs text-center">Course outline</span>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 flex flex-col items-center gap-2">
                          <Play className="w-6 h-6 text-gray-700" />
                          <span className="text-gray-700 text-xs text-center">Course</span>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 flex flex-col items-center gap-2">
                          <Users className="w-6 h-6 text-gray-700" />
                          <span className="text-gray-700 text-xs text-center">Community</span>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 flex flex-col items-center gap-2">
                          <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
                          <span className="text-gray-700 text-xs text-center">Membership</span>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 flex flex-col items-center gap-2">
                          <Mic className="w-6 h-6 text-gray-700" />
                          <span className="text-gray-700 text-xs text-center">Live event</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
