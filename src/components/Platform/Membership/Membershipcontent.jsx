import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Image as ImageIcon } from 'lucide-react';

const sections = [
  {
    id: 1,
    title: 'Recurring revenue',
    description:
      'With a membership business model, you can turn your one-time digital product sales into subscription offerings to create more predictable income and growth. This gives you steady monthly revenue you can count on instead of dealing with unpredictable sales cycles.',
    imagePosition: 'right',
    bgColor: 'bg-[#d85b00]', // orange block like screenshot
    type: 'contentGrid',
  },
  {
    id: 2,
    title: 'Long-term retention',
    description:
      'Seamlessly integrate our lead generation tools into frictionless funnels and customized learning environments to effortlessly engage leads and nurture them into loyal advocates.',
    imagePosition: 'left',
    bgColor: 'bg-[#8aa2ff]', // light purple-blue card
    type: 'uploader',
  },
  {
    id: 3,
    title: 'Building a community',
    description:
      'Include exclusive access to your LMS Athena community in your membership, giving members the chance to engage with like-minded peers, industry professionals, and your team’s expertise through live Q&As and peer discussions — fostering a sense of belonging, support, and long-term engagement.',
    imagePosition: 'right',
    bgColor: 'bg-[#d0cbbf]', // warm beige like screenshot
    type: 'landing',
  },
];

export default function Digitalrevenue() {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 via-blue-50/50 to-white py-20 sm:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-gray-900 mb-4 leading-tight">
          How are memberships different
           <span className="block">from other content?</span>
          </h2>
         
        </motion.div>

        {/* Sections */}
        <div className="space-y-20 lg:space-y-28">
          {sections.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                item.imagePosition === 'left' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content Side */}
              <div className={`${item.imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1'} flex flex-col justify-center`}>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-gray-50 lg:text-gray-900 mb-4 leading-tight lg:leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-300 lg:text-gray-700 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Visual Side */}
              <div className={`${item.imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'}`}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className={`relative flex items-center justify-center group`}
                >
                  {item.type === 'contentGrid' && (
                    <div className="relative z-10 rounded-none shadow-lg p-0 w-[420px]">
                      {/* Blue panel with enhanced charts */}
                      <div className="w-full h-64 bg-[#0f4c81] rounded-none overflow-hidden p-6 flex items-start justify-start gap-4">
                        {/* Mini line chart */}
                        <div className="bg-white rounded-none shadow-md p-3">
                          <div className="text-[9px] text-gray-600 mb-1">Revenue Over Time</div>
                          <svg viewBox="0 0 180 90" className="w-44 h-24">
                            <polyline fill="none" stroke="#9ca3af" strokeWidth="1" points="0,70 160,70" />
                            <polyline fill="none" stroke="#9ca3af" strokeWidth="1" points="0,50 160,50" />
                            <polyline fill="none" stroke="#9ca3af" strokeWidth="1" points="0,30 160,30" />
                            <polyline fill="none" stroke="#374151" strokeWidth="2" points="10,65 40,58 70,52 100,46 130,35 160,28" />
                            <g fill="#374151">
                              <circle cx="10" cy="65" r="1.5" />
                              <circle cx="40" cy="58" r="1.5" />
                              <circle cx="70" cy="52" r="1.5" />
                              <circle cx="100" cy="46" r="1.5" />
                              <circle cx="130" cy="35" r="1.5" />
                              <circle cx="160" cy="28" r="1.5" />
                            </g>
                          </svg>
                          {/* Small bar chart */}
                          <svg viewBox="0 0 180 60" className="w-44 h-16">
                            <rect x="10" y="30" width="18" height="28" fill="#d1d5db" />
                            <rect x="40" y="24" width="18" height="34" fill="#9ca3af" />
                            <rect x="70" y="18" width="18" height="40" fill="#6b7280" />
                            <rect x="100" y="14" width="18" height="44" fill="#4b5563" />
                            <rect x="130" y="10" width="18" height="48" fill="#374151" />
                          </svg>
                        </div>
                        {/* Donut by payment type */}
                        <div className="bg-white rounded-none shadow-md p-3 w-32 flex flex-col items-center">
                          <div className="text-[9px] text-gray-600 mb-1">By Payment Type</div>
                          <svg viewBox="0 0 36 36" className="w-16 h-16">
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="6"></circle>
                            <path d="M18 18 m 0 -15.915 a 15.915 15.915 0 1 1 0 31.83" fill="none" stroke="#111827" strokeWidth="6" strokeDasharray="75 25" strokeDashoffset="25"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.type === 'uploader' && (
                    <div className="relative z-10 bg-white rounded-none p-4 shadow-xl w-[360px]">
                      {/* Gold Membership mock card */}
                      <div className="bg-white rounded-none border shadow-sm w-full p-3">
                        <div className="text-[12px] font-semibold text-gray-900 mb-2 flex items-center justify-between">
                          <span>Gold Membership</span>
                          <span className="w-4 h-4 rounded-full bg-gray-200 inline-block" />
                        </div>
                        <div className="text-[10px] text-gray-500 mb-1">PRODUCTS</div>
                        <ul className="space-y-2">
                          {["Mastering the Art of Digital Design","Crafting Engaging User Experiences","Innovative Strategies for Web Aesthetics"].map((t,i)=> (
                            <li key={i} className="flex items-center gap-2 text-[11px] text-gray-800">
                              <span className="w-3 h-3 rounded-full border-2 border-gray-300 inline-block" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-3 flex justify-start">
                        <button className="inline-flex items-center gap-2 bg-[#f2994a] hover:bg-[#e68935] text-white px-4 py-2 text-xs font-semibold rounded">
                          Add new product
                        </button>
                      </div>
                    </div>
                  )}

                  {item.type === 'landing' && (
                    <div className="relative z-10 bg-[#c9c0ac] rounded-none p-6 shadow-xl w-[420px]">
                      <div className="bg-white rounded-none p-4 shadow flex flex-col gap-3 w-full">
                        {/* Header meta */}
                        <div className="flex items-center justify-between text-[10px] text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-5 h-5 rounded-full bg-gray-200" />
                            <span className="text-gray-800">Lily Lee</span>
                            <span className="text-gray-400">@lio_lily</span>
                            <span className="ml-2 inline-block text-[9px] bg-pink-200 text-gray-800 px-2 py-0.5 rounded">Moderator</span>
                          </div>
                          <span>22 mins ago</span>
                        </div>
                        {/* Body */}
                        <div className="text-[11px] text-gray-800">
                          1 hour to go! Join us live for a deep dive into Strategic Planning—you won’t want to miss it.
                        </div>
                        {/* Footer */}
                        <div className="flex items-center gap-3 text-[10px] text-gray-600">
                          <span>❤️ 12</span>
                          <span>💬 7</span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <span className="inline-block bg-[#d9b4c3] text-gray-900 text-[11px] font-semibold px-3 py-1 rounded">Announcements</span>
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
