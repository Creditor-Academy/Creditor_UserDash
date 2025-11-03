import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const faqs = [
  {
    id: 1,
    q: 'What is a membership on Athena LMS',
    a: `A membership lets you offer ongoing access to multiple learning products like courses, communities, digital downloads, and live sessions — all in one bundled subscription.`,
  },
  {
    id: 2,
    q: 'What is a membership site?',
    a: `A membership site is a subscription-based website where members pay to access gated learning content. These sites often include a mix of courses, a community, and exclusive resources, with new content added regularly to keep members engaged .`,
  },
  {
    id: 3,
    q: 'How are membership sites different from Product Bundles?',
    a: `A Product Bundle is a one-time purchase of multiple learning products, while a membership offers ongoing access to a variety of learning experiences, such as live sessions, communities, and exclusive content delivered on a subscription basis.`,
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
          {faqs.map(item => {
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
                    {isOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
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
