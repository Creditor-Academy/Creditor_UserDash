import React from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  ShieldCheck,
  Cpu,
  Layers,
  Clock,
  Users,
  CheckCircle,
} from 'lucide-react';

const DEFAULT_FEATURES = [
  {
    id: 'speed',
    title: 'Blazing-fast performance',
    desc: 'Optimized builds, CDN-first delivery and pragmatic SSR/ISR where it matters.',
    icon: Rocket,
    accent: 'from-indigo-400 to-indigo-600',
  },
  {
    id: 'secure',
    title: 'Enterprise-grade security',
    desc: 'HTTPS, hardened headers, automated audits and secure auth patterns by default.',
    icon: ShieldCheck,
    accent: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 'scale',
    title: 'Built to scale',
    desc: 'Decoupled services, clean APIs and caching strategies that grow with you.',
    icon: Layers,
    accent: 'from-sky-400 to-sky-600',
  },
  {
    id: 'uptime',
    title: 'Proactive maintenance',
    desc: 'Monitoring, backups and on-call practices to keep your site healthy and fast.',
    icon: Clock,
    accent: 'from-rose-400 to-rose-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
  },
};

export default function WhyChooseUs({
  features = DEFAULT_FEATURES,
  ctaText = 'Get a free quote',
  ctaHref = '#contact',
  secondaryText = 'See case studies',
  secondaryHref = '#case-studies',
  className = '',
}) {
  return (
    <section
      className={`why-choose-us relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-blue-50/50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 ${className}`}
      aria-labelledby="why-choose-us-title"
    >
      {/* Decorative blurred gradient shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-24 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-300/30 to-violet-300/20 blur-3xl transform-gpu opacity-40 dark:from-indigo-700/20 dark:to-violet-700/10"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Headline / CTA */}
          <div className="z-10">
            <span className="inline-flex items-center rounded-full bg-indigo-100/80 text-indigo-600 px-3 py-1.5 text-sm font-semibold dark:bg-indigo-900/30 dark:text-indigo-300">
              <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
              Why choose us
            </span>

            <h2
              id="why-choose-us-title"
              className="mt-8 max-w-xl text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-gray-900 dark:text-gray-100"
            >
              Modern websites that perform — beautiful, secure, and built for
              growth
            </h2>

            <p className="mt-6 text-base text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
              We combine design excellence with engineering discipline: fast
              launches, measurable outcomes, and an ownership mindset. Small
              teams to enterprise — same quality, tailored to your goals.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <strong className="text-gray-900 dark:text-gray-100 font-bold">
                  99.9%
                </strong>
                <span>uptime guarantee</span>
              </span>

              <span className="h-1 w-1 rounded-full bg-gray-400 dark:bg-gray-600" />

              <span>Dedicated onboarding & documentation</span>
            </div>
          </div>

          {/* Right: Features grid */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={containerVariants}
            className="z-10"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map(feature => {
                const Icon = feature.icon;
                return (
                  <motion.article
                    key={feature.id}
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700 p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    tabIndex={0}
                    aria-labelledby={`feature-${feature.id}-title`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 rounded-2xl p-3.5 bg-gradient-to-br ${
                          feature.accent ?? 'from-indigo-400 to-indigo-600'
                        } text-white shadow-lg`}
                        aria-hidden="true"
                      >
                        <Icon className="w-7 h-7" strokeWidth={2} />
                      </div>

                      <div className="flex-1">
                        <h3
                          id={`feature-${feature.id}-title`}
                          className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug"
                        >
                          {feature.title}
                        </h3>

                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {feature.desc}
                        </p>

                        <div className="mt-4 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 text-indigo-600 px-2.5 py-1 text-xs font-semibold dark:bg-indigo-900/30 dark:text-indigo-300">
                            <CheckCircle
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                            Proven
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
