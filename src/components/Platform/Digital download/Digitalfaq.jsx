import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const faqs = [
  {
    id: 1,
    q: 'What can I sell as a digital download?',
    a: `Common products offered as digital downloads include eBooks, PDFs, templates, workbooks, guides, spreadsheets, podcasts, and more. The following file types are supported for digital downloads: 3g2, 3gpp, 3gpp2, 3gp, aac, asf, asx, avi, bmp, csv, doc, docx, epub, f4p, f4v, flv, gif, jpeg, jpg, m4a, m4v, m4p, mpe, mpeg, mpeg, mpg, mp2, mp3, mp3g, mp4, mov, mp4, odt, ogg, ogv, ogx, ods, pdf, png, pps, ppt, pptx, qt, rtf, tiff, txt, vri, vivo, wav, webm, webp, wmv, wm, wmx, wvx, xls, xlt, xlsx.`,
  },
  {
    id: 2,
    q: 'How can digital downloads be priced?',
    a: `You can price digital downloads as one-time purchases, bundles, tiered offerings, or include them as lead magnets with optional upsells. Athena supports coupons, sales, and localized currency settings.`,
  },
  {
    id: 3,
    q: 'What is a lead magnet?',
    a: `A lead magnet is a free or low-cost download designed to capture contact information. It helps grow your audience and can feed automated funnels that promote paid products later.`,
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
