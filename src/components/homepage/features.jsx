"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* =========================
   PRODUCT DATA
========================= */
const products = [
  {
    id: 1,
    title: "Athena AI & Non-AI Lesson Editor",
    category: "Course Creation",
    badge: "Best Seller",
    badgeColor: "from-yellow-400 to-orange-500",
    // price: "$29 / month",
    tagline: "Build SCORM courses 80% faster",
    description:
      "AI + manual lesson editor for compliance, onboarding, and academic courses.",
    whoCanUse: "Corporate L&D teams, universities, colleges, NGOs, freelance instructional designers, and trainers building web-based courses.",
    aptFor: "Creating professional, interactive, SCORM-compliant e-learning courses for compliance training, onboarding, upskilling, and academic programs.",
    keyFeatures: [
      "Dual-mode (AI-assisted or manual) drag-and-drop editor",
      "Built-in quizzes, multimedia, and full SCORM compliance",
      "AI auto-generates lesson outlines, content suggestions, assessments",
      "Translations and accessibility optimizations"
    ],
    costSavings: "Reduces course creation from weeks to hours (up to 80% faster). Eliminates separate authoring tools and specialists – save tens of thousands annually on vendors and revisions.",
    whyDesignersLove: "Rapid prototyping, consistent high-quality output, and no need for coding or external help – deliver compliant courses like a pro team.",
    whyLDTLove: "Consistent quality, easy updates, and seamless LMS integration for faster rollout and better compliance tracking.",
    freeTrial: true,
  },
  {
    id: 2,
    title: "Athena AI",
    category: "Visual Content",
    badge: "Popular",
    badgeColor: "from-pink-400 to-rose-500",
    // price: "Freemium | Premium from $19/month",
    tagline: "Design learning visuals instantly",
    description:
      "Create slides, infographics, PDFs, and posters without designers.",
    whoCanUse: "Teachers, students, YouTube creators, digital marketers, classroom trainers, and L&D professionals needing visuals fast.",
    aptFor: "Designing slides, infographics, interactive PDFs, posters, social media graphics, and training materials.",
    keyFeatures: [
      "Intuitive education-tailored studio with reusable templates",
      "AI for layout suggestions and custom illustrations from text",
      "Image enhancement, background removal, and instant brand matching"
    ],
    costSavings: "No graphic designer hires needed ($5,000–$20,000 savings per project). Produce assets 10x faster.",
    whyDesignersLove: "Professional visuals on demand without design skills – elevate courses with engaging, custom graphics instantly.",
    whyLDTLove: "Higher learner engagement through stunning materials; reusable assets free up budget for core content.",
  },
  {
    id: 3,
    title: "Virtual Instructor AI-Powered Platform",
    category: "Live Training",
    badge: "Enterprise",
    badgeColor: "from-purple-400 to-indigo-500",
    // price: "From $49/month | Book Demo",
    tagline: "Live training at global scale",
    description:
      "Run AI-powered virtual instructor-led training programs.",
    whoCanUse: "Corporations, universities/colleges, and training providers running virtual or hybrid programs.",
    aptFor: "Delivering live virtual instructor-led training (VILT) at scale.",
    keyFeatures: [
      "Full features: polls, breakout rooms, whiteboards, recording",
      "AI for real-time transcription and summaries",
      "Sentiment analysis, chat moderation, and personalized recommendations"
    ],
    costSavings: "Cuts prep time by 70%, reduces trainers needed, and eliminates travel/venue costs.",
    whyDesignersLove: "Enhance sessions with AI insights for better content refinement.",
    whyLDTLove: "Global reach, detailed engagement reports, and experiences rivaling in-person training.",
  },
  {
    id: 4,
    title: "Athena Book SMART AI Platform",
    category: "Digital Books",
    badge: "New",
    badgeColor: "from-green-400 to-emerald-500",
    // price: "One-Time or Subscription",
    tagline: "Turn PDFs into interactive books",
    description:
      "Convert manuals and textbooks into interactive digital content.",
    whoCanUse: "Publishers, authors, textbook writers, corporate knowledge managers, and content creators.",
    aptFor: "Transforming static PDFs/manuals into interactive digital resources with annual updates.",
    keyFeatures: [
      "Upload and convert; embed media, quizzes, navigation",
      "AI redesigns layouts and updates content/trends",
      "Adds interactivity and generates covers"
    ],
    costSavings: "Annual editions from $50,000+ to a fraction; updates in days, not months.",
    whyDesignersLove: "Easy interactivity without rewrites – keep materials fresh.",
    whyLDTLove: "Dynamic training manuals that stay current and engaging.",
  },
  {
    id: 5,
    title: "Webinar by Athena",
    category: "Live Training",
    badge: "Trending",
    badgeColor: "from-cyan-400 to-blue-500",
    // price: "From $39/month",
    tagline: "Analytics-driven webinars",
    description:
      "Measure engagement, attention, and sentiment in sessions.",
    whoCanUse: "Life coaches, speakers, counselors, sales trainers, and L&D leaders.",
    aptFor: "Webinars and group sessions with deep analytics.",
    keyFeatures: [
      "Track participation, emotions, attention",
      "AI sentiment tracking and highlight reels",
      "Engagement scoring and follow-up insights"
    ],
    costSavings: "Data-driven refinement reduces trial-and-error sessions.",
    whyDesignersLove: "Evidence-based improvements to content.",
    whyLDTLove: "Measurable ROI and stronger connections.",
  },
  {
    id: 6,
    title: "Athena AI Agents (Lifelike Avatars)",
    category: "AI Support",
    badge: "AI Powered",
    badgeColor: "from-blue-400 to-cyan-500",
    // price: "Pay-Per-Use Credits",
    tagline: "24/7 lifelike learner & customer support",
    description:
      "Human-like AI agents for learner & customer support.",
    whoCanUse: "Customer service, helpdesks, counseling, and learner support teams.",
    aptFor: "24/7 human-like support and query handling.",
    keyFeatures: [
      "Custom avatars: appearance, voice cloning, personality",
      "Expressive, multilingual, contextual memory",
      "Human escalation when needed"
    ],
    costSavings: "Reduces staffing by 70%+; instant ROI.",
    whyDesignersLove: "Add personalized support to courses.",
    whyLDTLove: "Boost satisfaction and free agents for complex issues.",
  },
  {
    id: 7,
    title: "Athena LMS/LXP",
    category: "LMS & Academies",
    badge: "Core Platform",
    badgeColor: "from-indigo-400 to-purple-500",
    // price: "Enterprise Plans",
    tagline: "Manage learner journeys",
    description:
      "AI-powered LMS for certifications, analytics, and compliance.",
    whoCanUse: "Corporations, universities, training companies, NGOs.",
    aptFor: "Managing full learner journeys at scale.",
    keyFeatures: [
      "User management, certifications, mobile access, gamification",
      "AI builds courses and personalizes paths",
      "Auto-grades and predicts risks"
    ],
    costSavings: "No custom development ($100,000+ savings); lower dropouts.",
    whyDesignersLove: "Instant gamification and adaptive learning.",
    whyLDTLove: "Higher completions, compliance analytics.",
  },
  {
    id: 8,
    title: "Athena Website & LMS Builder",
    category: "LMS & Academies",
    badge: "Fast Launch",
    badgeColor: "from-teal-400 to-green-500",
    // price: "From $19/month",
    tagline: "Launch branded academies fast",
    description:
      "No-code builder for training portals & academies.",
    whoCanUse: "Small businesses, coaches, universities, startups.",
    aptFor: "Launching branded training portals/academies.",
    keyFeatures: [
      "No-code drag-and-drop builder",
      "AI layouts, copy, SEO optimization",
      "Tool integration capabilities"
    ],
    costSavings: "Eliminates $10,000–$50,000 dev fees; launch in hours.",
    whyDesignersLove: "Full ownership for custom experiences.",
    whyLDTLove: "Scalable branded platforms without IT.",
  },
];

export default function Features() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    "Course Creation",
    "Visual Content",
    "Live Training",
    "Digital Books",
    "AI Support",
    "LMS & Academies",
  ];

  const filtered =
    category === "All"
      ? products
      : products.filter((p) => p.category === category);

  return (
    <section className="bg-[#0b1220] py-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm">
            ATHENA AI MARKETPLACE
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-white">
            AI Products for Learning & Training
          </h2>
          <p className="mt-3 text-gray-400 max-w-2xl mx-auto text-sm">
            Buy modular AI tools individually or combine them into complete learning ecosystems.
          </p>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-md text-sm border transition
                ${
                  category === c
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white/5 text-gray-300 border-white/10 hover:border-blue-400"
                }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <motion.button
              key={p.id}
              whileHover={{ y: -4 }}
              onClick={() => setActiveProduct(p)}
              className="bg-white/5 border border-white/10 rounded-xl p-5 text-left hover:border-blue-400 hover:bg-white/10 transition"
            >
              <span className={`inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r ${p.badgeColor} text-white mb-3`}>
                {p.badge}
              </span>

              <h3 className="text-sm font-semibold text-white leading-tight">
                {p.title}
              </h3>

              <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                {p.tagline}
              </p>

              <div className="mt-4 text-xs text-blue-400">
                View details →
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* RIGHT SLIDER */}
      <AnimatePresence>
        {activeProduct && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/70 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProduct(null)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#0b1220] z-50 flex flex-col border-l border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setActiveProduct(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 pt-8 pb-44 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                <span className={`inline-block mb-4 px-3 py-1 rounded-full text-xs bg-gradient-to-r ${activeProduct.badgeColor} text-white`}>
                  {activeProduct.badge}
                </span>

                <h3 className="text-xl font-semibold text-white mb-2">
                  {activeProduct.title}
                </h3>

                <p className="text-sm text-blue-400 mb-6">
                  {activeProduct.tagline}
                </p>

                {/* Who Can Use It */}
                {activeProduct.whoCanUse && (
                  <div className="mb-6">
                    <h4 className="text-xs uppercase text-gray-400 mb-2 font-medium tracking-wide">Who Can Use It</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {activeProduct.whoCanUse}
                    </p>
                  </div>
                )}

                {/* Apt For */}
                {activeProduct.aptFor && (
                  <div className="mb-6">
                    <h4 className="text-xs uppercase text-gray-400 mb-2 font-medium tracking-wide">Apt For</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {activeProduct.aptFor}
                    </p>
                  </div>
                )}

                {/* Key Features & AI Power */}
                {activeProduct.keyFeatures && (
                  <div className="mb-6">
                    <h4 className="text-xs uppercase text-gray-400 mb-3 font-medium tracking-wide">Key Features & AI Power</h4>
                    <ul className="space-y-2">
                      {activeProduct.keyFeatures.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cost & Time Savings */}
                {activeProduct.costSavings && (
                  <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-400/20">
                    <h4 className="text-xs uppercase text-blue-300 mb-2 font-medium tracking-wide">Cost & Time Savings</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {activeProduct.costSavings}
                    </p>
                  </div>
                )}

                {/* Why Instructional Designers Love It */}
                {activeProduct.whyDesignersLove && (
                  <div className="mb-6">
                    <h4 className="text-xs uppercase text-gray-400 mb-2 font-medium tracking-wide">Why Instructional Designers Love It</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {activeProduct.whyDesignersLove}
                    </p>
                  </div>
                )}

                {/* Why L&D Teams Love It */}
                {activeProduct.whyLDTLove && (
                  <div className="mb-6">
                    <h4 className="text-xs uppercase text-gray-400 mb-2 font-medium tracking-wide">Why L&D Teams Love It</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {activeProduct.whyLDTLove}
                    </p>
                  </div>
                )}

              </div>

              {/* Fixed CTA */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-6 py-5 bg-gradient-to-t from-[#0b1220] via-[#0b1220] to-[#0b1220]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Pricing</p>
                    <p className="text-base font-semibold text-blue-400">
                      {activeProduct.price}
                    </p>
                  </div>
                  {activeProduct.freeTrial && (
                    <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-400/30">
                      Free Trial Available
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded-md transition font-medium">
                    Add to Cart
                  </button>
                  <button className="px-4 py-2.5 rounded-md text-sm border border-blue-400/40 text-blue-300 hover:bg-blue-400/10 transition font-medium">
                    Learn More
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
