import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* =========================
   LOCAL IMAGES
========================= */
import lessonEditor from "../../assets/Lesson.webp";
import canva from "../../assets/analytics.webp";
import vilt from "../../assets/community.webp";
import bookSmart from "../../assets/instruct.jpg";
import webex from "../../assets/chris.jpg";
import aiAgents from "../../assets/Agent.png";
import lms from "../../assets/dashboard.webp";
import websiteBuilder from "../../assets/Courseanalytics.png";

/* =========================
   FLAGSHIP PRODUCTS
========================= */
const features = [
  {
    title: "Athena AI & Non-AI Lesson Editor",
    short: "Create SCORM-compliant courses up to 80% faster",
    who: "Corporate L&D, universities, colleges, NGOs, designers",
    apt: "Compliance, onboarding, upskilling, academics",
    ai: [
      "AI + manual drag-and-drop editor",
      "Auto outlines, quizzes & translations",
      "Full SCORM & accessibility compliance",
    ],
    whyID: "Rapid prototyping with enterprise-grade quality — no coding.",
    whyLD: "Faster rollouts, LMS-ready output, easy updates.",
    pricing: "From $29/month · Free Trial",
    image: lessonEditor,
  },
  {
    title: "Athena AI",
    short: "Professional learning visuals without designers",
    who: "Teachers, students, creators, L&D teams",
    apt: "Slides, infographics, PDFs, visuals",
    ai: [
      "Education-ready templates",
      "AI layout & illustration generation",
      "Instant brand matching",
    ],
    whyID: "Create stunning visuals instantly — zero design skills.",
    whyLD: "Higher engagement with reusable creative assets.",
    pricing: "Freemium · Pro from $19/month",
    image: canva,
  },
  {
    title: "Virtual Instructor AI Platform",
    short: "Live virtual training at global scale",
    who: "Corporates, universities, training providers",
    apt: "Virtual instructor-led training (VILT)",
    ai: [
      "Polls, breakout rooms & recordings",
      "AI transcription & summaries",
      "Sentiment & engagement insights",
    ],
    whyID: "Improve sessions using real-time AI feedback.",
    whyLD: "70% prep-time reduction with global reach.",
    pricing: "From $49/month · Book Demo",
    image: vilt,
  },
  {
    title: "Athena Book SMART AI",
    short: "Convert PDFs into interactive digital books",
    who: "Publishers, authors, knowledge teams",
    apt: "Textbooks, manuals, training guides",
    ai: [
      "PDF upload & conversion",
      "AI layout & content updates",
      "Embedded media & quizzes",
    ],
    whyID: "Add interactivity without rewriting content.",
    whyLD: "Always-current learning materials.",
    pricing: "One-Time or Subscription",
    image: bookSmart,
  },
  {
    title: "Webinar by Athena",
    short: "Analytics-driven webinars & sessions",
    who: "Coaches, speakers, L&D leaders",
    apt: "Webinars, workshops, group training",
    ai: [
      "Attention & emotion tracking",
      "AI sentiment scoring",
      "Automated insights",
    ],
    whyID: "Evidence-based session improvements.",
    whyLD: "Clear ROI & measurable engagement.",
    pricing: "From $39/month",
    image: webex,
  },
  {
    title: "Athena AI Agents",
    short: "24/7 lifelike learner & customer support",
    who: "Support teams, helpdesks",
    apt: "Query handling, escalation",
    ai: [
      "Custom avatars & voice cloning",
      "Multilingual contextual memory",
      "Human escalation",
    ],
    whyID: "Add personalized support to learning flows.",
    whyLD: "70%+ staffing reduction with instant ROI.",
    pricing: "Pay-Per-Use Credits",
    image: aiAgents,
  },
  {
    title: "Athena LMS / LXP",
    short: "Manage complete learner journeys",
    who: "Corporates, universities, NGOs",
    apt: "Certifications, compliance, analytics",
    ai: [
      "AI learning paths",
      "Gamification & analytics",
      "Dropout prediction",
    ],
    whyID: "Instant gamification without dev work.",
    whyLD: "Higher completions & compliance visibility.",
    pricing: "Enterprise Plans",
    image: lms,
  },
  {
    title: "Athena Website & LMS Builder",
    short: "Launch branded academies in hours",
    who: "Businesses, startups, coaches",
    apt: "Training portals & academies",
    ai: [
      "No-code drag & drop",
      "AI layouts, SEO & copy",
      "Tool integrations",
    ],
    whyID: "Full ownership without IT dependency.",
    whyLD: "Scale branded platforms effortlessly.",
    pricing: "From $19/month",
    image: websiteBuilder,
  },
];

export default function Features() {
  const [activeIdx, setActiveIdx] = useState(0);
  const ref = useRef(null);
  const sliderRef = useRef(null);
  useInView(ref, { once: true });

  // Navigate slider
  const goToPrev = () => setActiveIdx((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  const goToNext = () => setActiveIdx((prev) => (prev === features.length - 1 ? 0 : prev + 1));

  // Auto-scroll slider on mobile when activeIdx changes
  useEffect(() => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const activeButton = container.children[activeIdx];
      if (activeButton) {
        const scrollLeft = activeButton.offsetLeft - container.offsetWidth / 2 + activeButton.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [activeIdx]);

  return (
    <section
      ref={ref}
      className="relative bg-[#050b1a] px-4 py-12 md:py-20 overflow-hidden"
    >
      {/* Ambient Glow - matching hero section */}
      <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] bg-indigo-500/20 blur-[120px]" />

      {/* HEADER */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mb-8 md:mb-12 px-2">
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs md:text-sm text-blue-300">
          OUR FLAGSHIP PRODUCTS
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight">
          AI-Powered Powerhouses for Learning & Training
        </h2>
        <p className="mt-3 text-sm md:text-base text-white/70 max-w-xl mx-auto">
          Buy individually, bundle for savings, or subscribe — one unified AI marketplace.
        </p>
      </div>

      {/* MAIN */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
        
        {/* LEFT SELECTOR — MOBILE SLIDER WITH ARROWS, DESKTOP GRID */}
        <div className="w-full lg:w-auto">
          {/* Mobile Slider Container */}
          <div className="relative lg:hidden">
            {/* Left Arrow */}
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white hover:bg-white/20 transition"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Slider */}
            <div
              ref={sliderRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-2 px-12 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {features.map((f, idx) => (
                <motion.button
                  key={f.title}
                  onClick={() => setActiveIdx(idx)}
                  whileTap={{ scale: 0.95 }}
                  className={`snap-center flex-shrink-0
                    h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden border-2 transition-all duration-300
                    ${
                      idx === activeIdx
                        ? "border-blue-400 ring-2 ring-blue-400/40 shadow-lg scale-110"
                        : "border-white/15 hover:border-white/30 bg-white/5 opacity-60"
                    }`}
                >
                  <img
                    src={f.image}
                    alt={f.title}
                    className="h-full w-full object-cover"
                  />
                </motion.button>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white hover:bg-white/20 transition"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dot Indicators - Mobile Only */}
          <div className="flex justify-center gap-1.5 mt-4 lg:hidden">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeIdx 
                    ? "w-6 bg-blue-400" 
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to feature ${idx + 1}`}
              />
            ))}
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-x-4 lg:gap-y-3">
            {features.map((f, idx) => (
              <motion.button
                key={f.title}
                onClick={() => setActiveIdx(idx)}
                whileHover={{ scale: 1.08 }}
                className={`h-28 w-28 rounded-2xl overflow-hidden border transition
                  ${
                    idx === activeIdx
                      ? "border-blue-400 ring-2 ring-blue-400/30 shadow-lg"
                      : "border-white/15 hover:border-white/30 bg-white/5"
                  }`}
              >
                <img
                  src={f.image}
                  alt={f.title}
                  className="h-full w-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="flex-1 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl md:rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-5 sm:p-6 md:p-8 shadow-2xl"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-tight">
                {features[activeIdx].title}
              </h3>

              <p className="mt-1 text-sm md:text-base font-medium bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                {features[activeIdx].short}
              </p>

              <div className="mt-3 md:mt-4 text-xs sm:text-sm text-white/70 space-y-1">
                <div><strong className="text-white">Who:</strong> {features[activeIdx].who}</div>
                <div><strong className="text-white">Apt for:</strong> {features[activeIdx].apt}</div>
              </div>

              <div className="mt-3 md:mt-4 flex flex-wrap gap-1.5 md:gap-2">
                {features[activeIdx].ai.map((item) => (
                  <span
                    key={item}
                    className="text-[10px] sm:text-xs bg-blue-600/20 text-blue-300 border border-white/10 px-2 sm:px-3 py-1 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="rounded-xl md:rounded-2xl border border-white/10 bg-black/30 p-3 md:p-4 text-xs sm:text-sm hover:bg-white/5 transition">
                  <strong className="text-white text-xs sm:text-sm">Why Instructional Designers</strong>
                  <p className="mt-1 text-white/60">{features[activeIdx].whyID}</p>
                </div>
                <div className="rounded-xl md:rounded-2xl border border-white/10 bg-black/30 p-3 md:p-4 text-xs sm:text-sm hover:bg-white/5 transition">
                  <strong className="text-white text-xs sm:text-sm">Why L&D Teams</strong>
                  <p className="mt-1 text-white/60">{features[activeIdx].whyLD}</p>
                </div>
              </div>

              <div className="mt-5 md:mt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <span className="text-sm md:text-base font-medium bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  {features[activeIdx].pricing}
                </span>
                <button className="w-full sm:w-auto rounded-xl bg-blue-600 text-white px-5 md:px-6 py-2.5 text-sm font-medium hover:bg-blue-500 transition">
                  Book Demo
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
