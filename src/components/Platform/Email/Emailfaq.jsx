import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const faqs = [
  {
    id: 1,
    q: 'What is email automation?',
    a: `Email automation is a feature that helps you market and sell to your leads. With this feature, you can grow and manage your email list as well as launch automated sales flows and abandoned cart reminder emails designed to help drive and recapture sales.`,
  },
  {
    id: 2,
    q: 'What is the difference between a sales sequence and abandoned cart emails?',
    a: `An abandoned cart email automatically sends a follow-up email to learners who have abandoned their cart, helping you convert missed opportunities into sales. Meanwhile, a sales sequence is a series of emails designed to guide email recipients to purchase your product or service.`,
  },
  {
    id: 3,
    q: 'How does the abandoned cart email work?',
    a: `The abandoned cart email automatically sends a follow-up email to learners who abandon their cart, reminding them to complete their purchase and helping you convert missed opportunities into sales.`,
  },
  {
    id: 4,
    q: 'How does the email sales sequence work?',
    a: `The sales sequence is a series of emails designed to guide email recipients to purchase your product or service. It is a great way to nurture leads and convert them into customers.`,
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
