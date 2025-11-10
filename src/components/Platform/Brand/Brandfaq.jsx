import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const faqs = [
  {
    id: 1,
    q: 'Can learners do everything on the app without going on the web version?',
    a: `The app is considered an additive complement to the web experience. Learners can use the app to learn on the go and access creators’ content in the most convenient way for them. This includes accessing lessons, interacting in communities, staying up-to-date with push notifications, and enrolling in or purchasing new products.`,
  },
  {
    id: 2,
    q: 'Will my learners be able to access both my courses and communities on the app?',
    a: `Yes, your learners will be able to access both communities and courses on your mobile app.`,
  },
  {
    id: 3,
    q: 'Can my learners download files from lessons?',
    a: `Yes! Both downloads and PDF lesson types are available on Branded Mobile. You can also allow your students to download certain lesson content (videos, PDFs and audio) and they can view it directly on their device.`,
  },
  {
    id: 4,
    q: 'What can I customize with my own branded mobile app?',
    a: `With Branded Mobile, you can customize your app to reflect your company’s brand identity, including the imagery and descriptions on the Google Play and Apple App Store listings. Additionally, you can customize your app name, app icon, and load screen. From within the app, you can choose your app’s primary colours, button styles and text colours.`,
  },
];

export default function Digitalfaq() {
  const [openId, setOpenId] = useState(1);

  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-20 sm:py-24 lg:py-28">
      {/* Light background shade */}

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Heading */}
        <div className="mb-10 sm:mb-14 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-gray-900 leading-tight">
            Frequently asked questions
          </h2>
        </div>

        {/* FAQ List */}
        <div className="divide-y divide-gray-200 rounded-2xl bg-white shadow-xl">
          {faqs.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="px-5 sm:px-6 lg:px-8">
                <button
                  className="w-full flex items-center justify-between py-6 text-left"
                  onClick={() => setOpenId(isOpen ? -1 : item.id)}
                >
                  <span className="text-base sm:text-lg font-medium text-gray-900">
                    {item.q}
                  </span>
                  <span className="text-gray-900">
                    {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 text-sm sm:text-base leading-relaxed text-gray-700">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
