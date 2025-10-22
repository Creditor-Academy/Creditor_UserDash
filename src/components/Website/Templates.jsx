import React from "react";
import { motion, easeOut } from "framer-motion";

const SERVICES = [
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    image: "/src/assets/template/digital.webp",
    gradient: "from-slate-800/80 via-slate-700/70 to-slate-900/80",
  },
  {
    id: "music-studio",
    title: "Music & Studio",
    image: "/src/assets/template/music.webp",
    gradient: "from-gray-800/80 via-gray-700/70 to-gray-900/80",
  },
  {
    id: "health-care",
    title: "Health Care",
    image: "/src/assets/template/health.webp",
    gradient: "from-zinc-800/80 via-zinc-700/70 to-zinc-900/80",
  },
  {
    id: "real-estate",
    title: "Real Estate",
    image: "/src/assets/template/estate.webp",
    gradient: "from-neutral-800/80 via-neutral-700/70 to-neutral-900/80",
  },
  {
    id: "business-consulting",
    title: "Business Consulting",
    image: "/src/assets/template/business.webp",
    gradient: "from-stone-800/80 via-stone-700/70 to-stone-900/80",
  },
  {
    id: "e-commerce",
    title: "E‑Commerce",
    image: "/src/assets/template/ecommerce.webp",
    gradient: "from-slate-900/80 via-gray-800/70 to-slate-800/80",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: easeOut } },
};

// Inner content animations: slide up items when card becomes visible
const contentContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const contentItemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

export default function Templates() {
  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)"
    }}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-10 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Heading */}
        <div className="max-w-5xl mx-auto text-center mb-12 px-2">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4 leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
            Amazingly websites that convert — tailored for your industry
          </h2>
          <p className="mt-4 text-lg text-white max-w-3xl mx-auto font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>
            Choose a starter layout to launch fast, or go premium with our Cadillac Template — each service card
            shows a live preview and industry‑specific visuals. Fully responsive, animated, and performance focused.
          </p>
        </div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {SERVICES.map((s) => (
            <motion.article
              key={s.id}
              variants={cardVariants}
              className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group"
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <img
                  src={s.image}
                  alt={`${s.title} preview`}
                  className="w-full h-full object-cover object-center filter brightness-75 transition-transform duration-700"
                  style={{ transitionTimingFunction: 'cubic-bezier(.2,.9,.3,1)' }}
                />

                {/* Simple gradient overlay */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 bg-gradient-to-tr ${s.gradient} opacity-80`}
                />
              </div>

              {/* Card content */}
              <motion.div
                variants={contentContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative p-6 sm:p-8 h-56 flex flex-col justify-between"
              >
                <motion.div variants={contentItemVariants}>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white drop-shadow-lg">{s.title}</h3>
                  <p className="mt-2 text-sm text-white/90 max-w-prose drop-shadow">Designed for {s.title.toLowerCase()} businesses — modern layout, speed optimized, and easy to edit.</p>
                </motion.div>

                <motion.div variants={contentItemVariants} className="flex gap-3 items-center flex-wrap">
                  {s.id !== "e-commerce" && (
                    <a
                      href={
                        s.id === "digital-marketing"
                          ? "https://rccreditor.github.io/DigiMarketSimple/"
                          : s.id === "music-studio"
                          ? "https://ankitcreditor.github.io/EchoVerse/"
                          : s.id === "health-care"
                          ? "https://prernacreditor.github.io/Healthcare/"
                          : s.id === "real-estate"
                          ? "https://prernacreditor.github.io/Real-estate-new/"
                          : s.id === "business-consulting"
                          ? "https://ankitcreditor.github.io/ConsultXpert/"
                          : `/templates/starter/${s.id}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/90 text-slate-900 text-sm font-medium shadow hover:scale-105 transform transition-transform duration-200"
                      aria-label={`View Starter Template for ${s.title}`}
                    >
                      View Starter Template
                    </a>
                  )}

                  <a
                    href={
                      s.id === "digital-marketing"
                        ? "https://digital99-nloo.vercel.app/"
                        : s.id === "music-studio"
                        ? "https://princliv.github.io/RhythmicVibe/"
                        : s.id === "health-care"
                        ? "https://healthtemplate-1-93zk.vercel.app/"
                        : s.id === "real-estate"
                        ? "https://prernacreditor.github.io/Real-Estate/"
                        : s.id === "business-consulting"
                        ? "https://prernamishra29.github.io/Illuminant/"
                        : s.id === "e-commerce"
                        ? "https://prernacreditor.github.io/E_Commerce"
                        : `/templates/cadillac/${s.id}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-white/40 text-white text-sm font-semibold backdrop-blur-sm hover:scale-105 transform transition-transform duration-200"
                    aria-label={`View Cadillac Template for ${s.title}`}
                  >
                    View Cadillac Template
                  </a>
                </motion.div>
              </motion.div>

              {/* Hover accent */}
              <div className="absolute -bottom-8 right-6 w-28 h-28 rounded-full bg-white/10 blur-2xl opacity-0 transform rotate-12 transition-all duration-500 pointer-events-none group-hover:opacity-100"></div>
            </motion.article>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-white text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>Want these templates customised? </p>
          <a
            href="/contact"
            className="inline-block mt-4 rounded-full px-6 py-3 bg-white text-blue-900 font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
          >
            Request a custom build
          </a>
        </div>
      </div>
    </section>
  );
}

