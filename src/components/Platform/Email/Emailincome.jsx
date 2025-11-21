import React from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Image as ImageIcon,
  Sparkles,
  Settings,
  Zap,
  ShoppingCart,
  Workflow,
} from 'lucide-react';

const sections = [
  {
    id: 1,
    title: 'Headache‑free marketing and selling',
    description:
      'Create customizable, ready‑made email templates with AI‑generated copy, subject lines, and CTAs that lift your opens, click‑through, and conversion rates.',
    imagePosition: 'right',
    bgColor: 'bg-[#0f4c81]', // dark blue panel with email mock
    type: 'emailBuilder',
  },
  {
    id: 2,
    title: 'Win back abandoned carts with ease',
    description:
      'Send automated emails to customers who leave their cart before completing a purchase so you can boost sales without any extra manual work.',
    imagePosition: 'left',
    bgColor: 'bg-[#8aa2ff]', // light blue card
    type: 'abandonedCart',
  },
  {
    id: 3,
    title: 'Sophisticated sequences made simple',
    description:
      'Build trust and convert your audience with customizable, pre‑built email sequences designed to grab their attention and stand out in crowded inboxes.',
    imagePosition: 'right',
    bgColor: 'bg-[#d0cbbf]', // warm beige card
    type: 'sequences',
  },
  {
    id: 4,
    title: 'Simplify your workflows with easy‑to‑use integrations',
    description:
      'Capture more leads and seamlessly push those leads to your favorite tools — all from Athena.',
    imagePosition: 'left',
    bgColor: 'bg-[#d85b00]', // orange integrations block
    type: 'integrations',
  },
];

export default function Emailincome() {
  return (
    <section className="relative bg-[#0b1736] py-20 sm:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-16 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-16 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-gray-100 mb-4 leading-tight">
            From inbox to income
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Turning email subscribers into paying customers has never been
            easier. Athena email automation tools help you engage and convert
            your audience without complicating your workflow.
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
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-gray-100 mb-4 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
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
                  {item.type === 'emailBuilder' && (
                    <div className="relative z-10 w-[360px] bg-white rounded-xl shadow-xl p-4">
                      <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-40 bg-gray-200 rounded mb-4" />
                      <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                        <div className="h-2 w-5/6 bg-gray-300 rounded mb-2" />
                        <div className="h-2 w-4/6 bg-gray-300 rounded mb-2" />
                        <div className="h-2 w-1/2 bg-gray-300 rounded" />
                      </div>
                      <div className="absolute right-4 top-10 bg-orange-500 text-white text-[10px] px-2 py-1 rounded shadow">
                        Draft your email flow
                      </div>
                    </div>
                  )}

                  {item.type === 'abandonedCart' && (
                    <div className="relative z-10 bg-white/95 rounded-md p-3 shadow-xl w-[320px]">
                      <div className="text-[11px] text-gray-800 mb-2 font-medium flex items-center gap-2">
                        <ShoppingCart className="w-3 h-3" /> Abandoned cart
                      </div>
                      <div className="bg-gray-200 h-1.5 w-3/4 rounded mb-2"></div>
                      <div className="bg-gray-200 h-1.5 w-1/2 rounded mb-3"></div>
                      <div className="border rounded p-3 text-center text-[11px] font-semibold">
                        Reminder email preview
                      </div>
                    </div>
                  )}

                  {item.type === 'sequences' && (
                    <div className="relative z-10 bg-white rounded-md p-4 shadow-xl w-[340px]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[11px] font-semibold text-gray-900">
                          Trigger
                        </div>
                        <Zap className="w-4 h-4 text-gray-700" />
                      </div>
                      <div className="space-y-2">
                        <div className="bg-gray-200 rounded p-2 text-[11px]">
                          Send welcome email
                        </div>
                        <div className="bg-gray-200 rounded p-2 text-[11px]">
                          Delay 1 day
                        </div>
                        <div className="bg-gray-200 rounded p-2 text-[11px]">
                          Send course tips
                        </div>
                        <div className="bg-gray-200 rounded p-2 text-[11px]">
                          Delay 3 days
                        </div>
                        <div className="bg-gray-200 rounded p-2 text-[11px]">
                          Upsell offer
                        </div>
                      </div>
                    </div>
                  )}

                  {item.type === 'integrations' && (
                    <div className="relative z-10 bg-white rounded-md p-4 shadow-xl w-[360px] flex items-center justify-between">
                      <div className="text-[12px] font-semibold flex items-center gap-2">
                        <Workflow className="w-4 h-4" /> Integrations
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-2 bg-gray-100 rounded">
                          Zapier
                        </div>
                        <div className="px-3 py-2 bg-gray-100 rounded">KR</div>
                        <div className="px-3 py-2 bg-gray-100 rounded">
                          Mailchimp
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
