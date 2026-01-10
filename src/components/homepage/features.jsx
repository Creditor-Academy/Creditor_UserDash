"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Layout,
  Video,
  BookOpen,
  BarChart,
  UserCheck,
  Globe,
  Rocket,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const products = [
  {
    id: 1,
    icon: Layout,
    title: "Athena Editor",
    category: "Course Creation",
    tagline: "Build SCORM courses faster",
    impact: "Reduce course build time by 80%",
    description:
      "Create compliant SCORM courses with AI-assisted structuring and assessments.",
    highlights: ["SCORM 1.2 & 2004", "AI Outlining", "Drag & Drop"],
  },
  {
    id: 2,
    icon: Zap,
    title: "Athena Studio",
    category: "Visual Content",
    tagline: "Design learning content instantly",
    impact: "10× faster content design",
    description:
      "AI-powered design studio for slides, infographics, and learning assets.",
    highlights: ["Templates", "Brand Matching", "AI Graphics"],
  },
  {
    id: 3,
    icon: Video,
    title: "Virtual Instructor",
    category: "Live Training",
    tagline: "Scale instructor-led training",
    impact: "70% reduction in prep effort",
    description:
      "Run global live sessions with AI summaries, analytics, and engagement tools.",
    highlights: ["Live AI Notes", "Breakout Rooms", "Global Delivery"],
  },
  {
    id: 4,
    icon: Globe,
    title: "Athena LMS",
    category: "LMS & Academies",
    tagline: "Manage learner journeys",
    impact: "Zero development overhead",
    description:
      "AI-powered LMS with learning paths, certifications, and compliance automation.",
    highlights: ["Gamification", "AI Paths", "Certifications"],
  },
  {
    id: 5,
    icon: BarChart,
    title: "Athena Webinar",
    category: "Live Training",
    tagline: "Analytics-driven sessions",
    impact: "Data-backed ROI",
    description:
      "Deep analytics webinar tool tracking learner attention, emotions, and engagement scores.",
    highlights: ["Attention Tracking", "Engagement Scoring", "AI Reels"],
    color: "cyan",
  },
  {
    id: 6,
    icon: UserCheck,
    title: "AI Support Agents",
    category: "AI Support",
    tagline: "24/7 lifelike support",
    impact: "70% staff reduction",
    description:
      "Multilingual AI avatars with contextual memory for constant learner assistance.",
    highlights: ["Voice Cloning", "Context Memory", "70+ Languages"],
    color: "indigo",
  },
  {
    id: 7,
    icon: Globe,
    title: "Athena LMS",
    category: "LMS & Academies",
    tagline: "Manage learner journeys",
    impact: "Zero dev costs",
    description:
      "Full-scale LXP/LMS with AI-personalized paths and compliance automation.",
    highlights: ["Gamification", "Path Personalization", "Auto-Grading"],
    color: "violet",
  },
  {
    id: 8,
    icon: Rocket,
    title: "Academy Builder",
    category: "LMS & Academies",
    tagline: "Launch branded portals fast",
    impact: "Launch in hours",
    description:
      "No-code builder for training portals. Includes AI SEO and layout optimization.",
    highlights: ["No-Code Builder", "SEO Optimized", "White-labeling"],
    color: "teal",
  },
];

const categories = [
  "All",
  "Course Creation",
  "Live Training",
  "LMS & Academies",
];

export default function Marketplace() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeCat, setActiveCat] = useState("All");

  const filtered =
    activeCat === "All"
      ? products
      : products.filter((p) => p.category === activeCat);

  return (
    <section className="bg-[#EAF4FF] py-24 px-6 text-[#0B3C6D]">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Modular Learning Products
            </h2>
            <p className="text-[#3B5B7A] text-lg">
              Choose the exact Athena tools you need to build your learning
              ecosystem.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
                  activeCat === c
                    ? "bg-[#1677FF] text-white border-[#1677FF]"
                    : "bg-white text-[#3B5B7A] border-[#D6E6F5] hover:border-[#1677FF]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -6 }}
              onClick={() => setActiveProduct(p)}
              className="cursor-pointer bg-white border border-[#D6E6F5] rounded-3xl p-6 shadow-sm hover:shadow-lg transition"
            >
              <div className="mb-6 flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-[#EAF4FF] text-[#1677FF]">
                  <p.icon size={22} />
                </div>
                {/* <span className="text-xs text-[#3B5B7A] font-semibold">
                  0{p.id}
                </span> */}
              </div>

              <h3 className="text-lg font-bold mb-1">{p.title}</h3>
              <p className="text-sm text-[#3B5B7A] mb-4">{p.tagline}</p>

              <div className="pt-4 border-t border-[#D6E6F5] flex justify-between items-center">
                <span className="text-xs font-semibold text-[#1677FF]">
                  {p.impact}
                </span>
                <ChevronRight size={16} className="text-[#1677FF]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DRAWER */}
      <AnimatePresence>
        {activeProduct && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setActiveProduct(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 p-8 border-l border-[#D6E6F5]"
            >
              <button
                onClick={() => setActiveProduct(null)}
                className="mb-8 text-sm font-semibold text-[#1677FF]"
              >
                ← Back
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-[#EAF4FF] text-[#1677FF]">
                  <activeProduct.icon size={30} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{activeProduct.title}</h3>
                  <p className="text-sm text-[#3B5B7A]">
                    {activeProduct.category}
                  </p>
                </div>
              </div>

              <p className="text-[#3B5B7A] mb-6">{activeProduct.description}</p>

              <div className="flex flex-wrap gap-2 mb-8">
                {activeProduct.highlights.map((h) => (
                  <span
                    key={h}
                    className="px-3 py-1 rounded-lg bg-[#EAF4FF] text-xs text-[#0B3C6D]"
                  >
                    {h}
                  </span>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-[#EAF4FF] mb-10">
                <div className="flex items-center gap-2 text-[#1677FF] font-semibold mb-1">
                  <ShieldCheck size={18} /> Enterprise Impact
                </div>
                <p className="text-sm text-[#3B5B7A]">{activeProduct.impact}</p>
              </div>

              <button className="w-full bg-[#1677FF] hover:bg-blue-600 text-white py-4 rounded-2xl font-semibold">
                Configure & Buy
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
