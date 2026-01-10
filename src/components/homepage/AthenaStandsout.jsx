import React from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

const AthenaStandsout = () => {
  const platforms = [
    {
      name: "Articulate 360",
      pricing: "$1,199–$1,749 per user/year",
      authoring: "Advanced suite",
      ai: "AI assist",
      branching: "Full branching",
      community: "Basic discuss",
      chat: "No",
      live: "Integrations only",
      attendance: "Completion logs",
      notes: "Premium authoring",
    },
    {
      name: "iSpring Learn + Suite",
      pricing: "$27–$96 per user/year (scales down for 300+)",
      authoring: "Interactive suite",
      ai: "Basic AI",
      branching: "Full scenarios",
      community: "Forums basic",
      chat: "No",
      live: "Zoom integration",
      attendance: "Progress logs",
      notes: "Compliance teams",
    },
    {
      name: "TalentLMS",
      pricing: "Free (5 users) → $1,788–$6,948/year",
      authoring: "Drag-drop basic",
      ai: "AI content",
      branching: "No branching",
      community: "Social light",
      chat: "Group chat",
      live: "Zoom/Webex",
      attendance: "Completion only",
      notes: "SMB onboarding",
    },
    {
      name: "LearnWorlds",
      pricing: "$288–$2,988/year (+5% fee on Starter)",
      authoring: "Advanced builder",
      ai: "Strong AI",
      branching: "Limited branching",
      community: "Communities",
      chat: "Group messaging",
      live: "Native + Zoom",
      attendance: "Completion only",
      notes: "Course sellers",
    },
    {
      name: "Absorb LMS",
      pricing: "Custom/enterprise (~$15K–$100K+/year)",
      authoring: "Simple editor",
      ai: "Add-on AI",
      branching: "No",
      community: "Forums basic",
      chat: "No",
      live: "Zoom integrations",
      attendance: "Advanced logs",
      notes: "Enterprise focus",
    },
    {
      name: "MoodleCloud (SaaS)",
      pricing: "$160–$1,980/year (50–750 users)",
      authoring: "Plugins basic",
      ai: "Plugins only",
      branching: "Plugins",
      community: "Forums/chats",
      chat: "Plugins",
      live: "Plugins (BBB)",
      attendance: "Plugins tracking",
      notes: "Budget DIY",
    },
    {
      name: "LMS Athena",
      pricing: "Tiered/custom (~$500–$5K/year per org/portal)",
      authoring: "AI-first authoring",
      ai: "Prompt-to-module",
      branching: "Light scenarios",
      community: "Rich feeds",
      chat: "DMs, polls",
      live: "Native multi-TZ",
      attendance: "Class attendance",
      notes: "Integrated AI/social",
      highlight: true,
    },
  ];

  const headers = [
    "Platform",
    "Pricing 2025 (Annual)",
    "Authoring",
    "AI Creator",
    "Branching",
    "Community",
    "Chat/Polls",
    "Live Scheduler",
    "Attendance",
    "Best For",
  ];

  return (
    <section
      id="athena-stands-out"
      className="relative py-20 px-4 bg-gradient-to-br from-white via-slate-50 to-sky-50 text-slate-900 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 w-80 h-80 bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(56,189,248,0.12),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.14),transparent_36%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-sky-100 backdrop-blur">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span className="text-xs uppercase tracking-[0.2em] text-slate-700">
              Why Athena stands out
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-slate-900">
            See Athena side-by-side with other platforms
          </h2>
          <p className="text-slate-700 max-w-3xl mx-auto">
            Purpose-built for AI-first authoring, native social, and live
            experiences— without bolting on a dozen plugins.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="bg-white/90 border border-slate-200 rounded-2xl shadow-xl overflow-hidden backdrop-blur"
        >
          <div className="px-6 py-5 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Comparison table
              </p>
              <h3 className="text-xl font-semibold mt-1 text-slate-900">
                Platforms vs. Athena (annual pricing snapshot)
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-sky-100 to-cyan-100 border border-sky-200 text-xs font-semibold text-slate-800 shadow-sm">
              <Crown className="w-4 h-4" />
              LMS Athena
            </div>
          </div>

          <div className="overflow-visible">
            <table className="w-full text-[13px] text-left text-slate-800 leading-relaxed">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[11px] tracking-[0.08em]">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 border-b border-slate-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {platforms.map((p) => (
                  <tr
                    key={p.name}
                    className={`transition-colors ${
                      p.highlight
                        ? "bg-gradient-to-r from-sky-50 via-cyan-50 to-sky-50 border-y border-sky-200 shadow-inner shadow-sky-200/60"
                        : "hover:bg-slate-50 border-b border-slate-100"
                    }`}
                  >
                    <td className="px-4 py-4 font-semibold flex items-center gap-2 align-top whitespace-normal break-words">
                      {p.highlight && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                          <Crown className="w-3 h-3" />
                          Athena
                        </span>
                      )}
                      {p.name}
                    </td>
                    <td className="px-4 py-4 align-top whitespace-normal break-words">
                      {p.pricing}
                    </td>
                    <td className="px-4 py-4 align-top whitespace-normal break-words">
                      {p.authoring}
                    </td>
                    <td className="px-4 py-4 align-top whitespace-normal break-words">
                      {p.ai}
                    </td>
                    <td className="px-4 py-4 align-top whitespace-normal break-words">
                      {p.branching}
                    </td>
                    <td className="px-4 py-4 align-top whitespace-normal break-words">
                      {p.community}
                    </td>
                    <td className="px-4 py-4 align-top whitespace-normal break-words">
                      {p.chat}
                    </td>
                    <td className="px-4 py-4 align-top whitespace-normal break-words">
                      {p.live}
                    </td>
                    <td className="px-4 py-4 align-top whitespace-normal break-words">
                      {p.attendance}
                    </td>
                    <td className="px-4 py-4 align-top whitespace-normal break-words text-slate-700">
                      {p.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-sky-500 to-cyan-400 rounded-2xl shadow-xl p-[1px]"
        >
          <div className="bg-white rounded-2xl h-full w-full p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-sky-700">
                Built to stand out
              </p>
              <h3 className="text-2xl font-semibold text-slate-900">
                Athena bundles AI-first authoring, social, and live into one
                LMS.
              </h3>
              <p className="text-slate-700 max-w-3xl">
                Skip patchwork plugins—launch faster with native creation,
                community, and classroom-ready attendance and scheduling.
              </p>
            </div>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold shadow-lg shadow-sky-300/60 hover:-translate-y-0.5 transition-transform"
            >
              Talk to us
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AthenaStandsout;
