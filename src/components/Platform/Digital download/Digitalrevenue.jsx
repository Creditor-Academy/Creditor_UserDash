import React from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Mic,
  Image as ImageIcon,
  Presentation,
  Type,
  Sparkles,
  Settings,
} from 'lucide-react';

const sections = [
  {
    id: 1,
    title: 'Attract leads to fuel future growth',
    description:
      'Offer light-commitment digital downloads, such as eBooks, guides, templates, and more, to generate leads and drive demand for your higher-value learning products in the future.',
    imagePosition: 'right',
    bgColor: 'bg-[#d85b00]', // orange block like screenshot
    type: 'contentGrid',
  },
  {
    id: 2,
    title: 'Launch and sell faster than ever',
    description:
      'Repurpose your existing content into a digital download to launch a sellable product in a snap.',
    imagePosition: 'left',
    bgColor: 'bg-[#8aa2ff]', // light purple-blue card
    type: 'uploader',
  },
  {
    id: 3,
    title: 'Promote your digital downloads',
    description:
      'Use the power of AI to create customizable landing pages that highlight your unique expertise, generate new leads, and effectively sell your digital downloads.',
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
            Say hello to a new source of revenue
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Sell digital downloads as standalone products or as add-ons to your
            existing offerings to diversify your income streams and earn more —
            with less effort.
          </p>
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
              <div
                className={`${item.imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1'} flex flex-col justify-center`}
              >
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-gray-50 lg:text-gray-900 mb-4 leading-tight lg:leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-300 lg:text-gray-700 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Visual Side */}
              <div
                className={`${item.imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'}`}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className={`relative rounded-2xl shadow-2xl overflow-hidden h-[320px] lg:h-[360px] flex items-center justify-center group ${item.bgColor}`}
                >
                  {item.type === 'contentGrid' && (
                    <div className="relative z-10 bg-white rounded-md shadow-lg p-3 w-[320px]">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="border rounded p-2 text-center">
                          <span className="text-[10px] font-semibold">
                            Template
                          </span>
                        </div>
                        <div className="border rounded p-2 text-center">
                          <span className="text-[10px] font-semibold">
                            Guides
                          </span>
                        </div>
                        <div className="border rounded p-2 text-center">
                          <span className="text-[10px] font-semibold">
                            How-to docs
                          </span>
                        </div>
                        <div className="border rounded p-2 text-center flex items-center justify-center gap-1">
                          <Mic className="w-3 h-3" />
                          <span className="text-[10px] font-semibold">
                            Audio
                          </span>
                        </div>
                        <div className="border rounded p-2 text-center flex items-center justify-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span className="text-[10px] font-semibold">
                            Imagery
                          </span>
                        </div>
                        <div className="border rounded p-2 text-center">
                          <span className="text-[10px] font-semibold">
                            Spreadsheets
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.type === 'uploader' && (
                    <div className="relative z-10 bg-white/90 rounded-md p-4 shadow-xl w-[340px]">
                      <div className="text-[11px] text-gray-800 mb-2 font-medium">
                        Digital Download file
                      </div>
                      <div className="bg-gray-200 h-1.5 w-3/4 rounded mb-2"></div>
                      <div className="bg-gray-200 h-1.5 w-1/2 rounded mb-4"></div>
                      <div className="border-2 border-dashed border-gray-400 rounded p-6 text-center">
                        <button className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded">
                          <Upload className="w-4 h-4" />
                          <span className="text-xs">Upload file</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {item.type === 'landing' && (
                    <div className="relative z-10 bg-white rounded-md p-4 shadow-xl w-[360px]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[11px] font-semibold text-gray-900">
                          Generating page
                        </div>
                        <div className="bg-blue-200 rounded-full p-2">
                          <Sparkles className="w-3 h-3 text-gray-800" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Settings className="w-4 h-4 text-gray-600" />
                        <span className="text-[11px] text-gray-700">
                          Creating hero section...
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div className="bg-gray-400 h-1.5 rounded-full w-2/3"></div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-gray-300 h-1.5 rounded-full w-1/3"></div>
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
