import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const faqs = [
  {
    id: 1,
    q: 'What can you host on Athena LMS?',
    a: `You can host live coaching and webinars that build trust, grow your audience and drive revenue — all in one digital learning product. Set up and promote events that turn your expertise into real relationships and business growth.`,
  },
  {
    id: 2,
    q: 'How can Coaching and Webinars be priced?',
    a: `A coaching session or webinar can be offered for free or for purchase at checkout.`,
  },
  {
    id: 3,
    q: 'What is the difference between Coaching and Webinar, and a live event in Athena LMSCommunities?',
    a: `Coaching and Webinars are digital learning products that can be offered either for free or for purchase, and can be hosted outside of a Athena LMS Community.`,
  },
  {
    id: 4,
    q: 'Do I need an existing video conference platform to host an event?',
    a: `No, Athena LMS integrates with Zoom, Google Meet, and Microsoft Teams, so you can host your events directly from your Athena LMS account.`,
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
