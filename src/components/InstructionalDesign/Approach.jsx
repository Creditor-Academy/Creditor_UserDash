import React from 'react';
import {
  Search,
  Lightbulb,
  Code,
  Rocket,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

const Approach = () => {
  const steps = [
    {
      number: '01',
      title: 'Discover',
      label: '01 — Discover',
      icon: Search,
      summary: 'Needs analysis, stakeholder interviews',
      headline: 'Turn scattered ideas into a clear learning mandate.',
      color: 'from-sky-500 to-sky-600',
      accent: 'bg-sky-500/10',
      border: 'border-sky-300/60',
      details: [
        'Needs analysis, stakeholder interviews',
        'Define goals & metrics',
        'Identify learner needs',
        'Review existing content',
        'Analyze constraints',
        'Produce discovery brief',
      ],
    },
    {
      number: '02',
      title: 'Design',
      label: '02 — Design',
      icon: Lightbulb,
      summary: 'Storyboarding, prototype development',
      headline:
        'Architect the learning journey before a single pixel is built.',
      color: 'from-sky-500 to-sky-600',
      accent: 'bg-sky-500/10',
      border: 'border-sky-300/60',
      details: [
        'Storyboarding, prototype development',
        'Map learning outcomes',
        'Create curriculum flow',
        'Build storyboards',
        'Draft visual style',
        'Develop prototype',
      ],
    },
    {
      number: '03',
      title: 'Develop',
      label: '03 — Develop',
      icon: Code,
      summary: 'Course build, review cycles',
      headline: 'Bring the blueprint to life with polished learning content.',
      color: 'from-sky-500 to-sky-600',
      accent: 'bg-sky-500/10',
      border: 'border-sky-300/60',
      details: [
        'Course build, review cycles',
        'Build course modules',
        'Add interactivities',
        'Produce multimedia',
        'Implement assessments',
        'Conduct QA reviews',
      ],
    },
    {
      number: '04',
      title: 'Deploy',
      label: '04 — Deploy',
      icon: Rocket,
      summary: 'LMS integration, launch',
      headline: 'Launch with confidence and zero technical headaches.',
      color: 'from-sky-500 to-sky-600',
      accent: 'bg-sky-500/10',
      border: 'border-sky-300/60',
      details: [
        'LMS integration, launch',
        'Upload to LMS',
        'Configure settings',
        'Test functionality',
        'Train administrators',
        'Launch course',
      ],
    },
    {
      number: '05',
      title: 'Measure & Iterate',
      label: '05 — Measure & Iterate',
      icon: TrendingUp,
      summary: 'Analytics, ROI tracking, maintenance',
      headline: 'Use data to turn a good course into a great one.',
      color: 'from-sky-500 to-sky-600',
      accent: 'bg-sky-500/10',
      border: 'border-sky-300/60',
      details: [
        'Analytics, ROI tracking, maintenance',
        'Track engagement',
        'Review performance data',
        'Gather feedback',
        'Optimize content',
        'Update regularly',
      ],
    },
  ];

  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeStep = steps[activeIndex];

  const progress = ((activeIndex + 1) / steps.length) * 100;

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #e0f2ff 0%, #eff6ff 40%, #ffffff 100%)',
      }}
    >
      {/* Soft light blue shapes */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 -left-16 w-72 h-72 bg-sky-200 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-100 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-sky-100 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-xs font-medium tracking-[0.18em] uppercase text-sky-700">
              Our Process
            </span>
          </div>
          <h2
            className="mt-6 text-4xl md:text-5xl lg:text-6xl font-normal text-slate-900 leading-tight"
            style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
          >
            From idea to impact,
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-700 via-sky-500 to-sky-400">
              every step is intentional.
            </span>
          </h2>
          <p
            className="mt-5 text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            We combine strategy, learning science, and sharp execution to build
            experiences your learners actually want to complete — and your
            stakeholders can measure.
          </p>
        </div>

        {/* Progress + quick step pills */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-600 tracking-[0.16em] uppercase">
              Step {activeIndex + 1} of {steps.length}
            </p>
            <p className="text-xs text-slate-500">
              {activeStep.label}:{' '}
              <span className="font-medium">{activeStep.title}</span>
            </p>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Clickable mini pills */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {steps.map((step, index) => (
              <button
                key={step.number}
                onClick={() => setActiveIndex(index)}
                className={`px-3 py-1 rounded-full text-xs border transition-all duration-200 flex items-center gap-1
                  ${
                    index === activeIndex
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-sky-500 hover:text-sky-800 hover:bg-sky-900/5'
                  }
                `}
              >
                <span className="font-semibold">{step.number}</span>
                <span className="hidden sm:inline">· {step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop / large screen layout */}
        <div className="hidden lg:grid grid-cols-12 gap-10 items-start">
          {/* Left: Timeline navigation */}
          <div className="col-span-5 relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-4 w-px bg-gradient-to-b from-sky-300 via-sky-100 to-transparent" />

            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={step.number}
                    onClick={() => setActiveIndex(index)}
                    className={`group relative w-full flex items-start gap-4 rounded-2xl px-4 py-4 transition-all duration-300 text-left
                      ${
                        isActive
                          ? 'bg-white shadow-lg border border-sky-200 scale-[1.02]'
                          : 'bg-white/70 border border-slate-100 hover:bg-sky-900/5 hover:border-sky-200 hover:shadow-md hover:shadow-sky-100'
                      }
                    `}
                  >
                    {/* Timeline dot */}
                    <div className="relative mt-1">
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${
                          isActive
                            ? 'border-sky-500 bg-sky-500'
                            : 'border-sky-200 bg-white'
                        }`}
                      />
                      {isActive && (
                        <div className="absolute inset-0 -m-2 rounded-full bg-sky-300/40 blur-sm" />
                      )}
                    </div>

                    {/* Step meta */}
                    <div className="flex-1 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-sky-700/80 mb-1">
                          {step.label}
                        </p>
                        <div className="flex items-center gap-2">
                          <h3
                            className="text-lg font-normal text-slate-900"
                            style={{
                              fontFamily: 'Georgia, Times New Roman, serif',
                            }}
                          >
                            {step.title}
                          </h3>
                          <Icon
                            className={`w-5 h-5 transition-transform duration-300 ${
                              isActive
                                ? 'scale-110 opacity-100 text-sky-600'
                                : 'opacity-60 text-slate-500 group-hover:translate-x-0.5'
                            }`}
                            strokeWidth={2}
                          />
                        </div>
                        <p
                          className="mt-1 text-sm text-slate-600"
                          style={{ fontFamily: 'Arial, sans-serif' }}
                        >
                          {step.summary}
                        </p>
                      </div>

                      <ChevronRight
                        className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                          isActive
                            ? 'text-sky-500 translate-x-0'
                            : 'text-slate-400 group-hover:translate-x-1'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Helper text */}
            <p className="mt-4 text-xs text-slate-500">
              Click through each phase to see how we work and what you get at
              every step.
            </p>
          </div>

          {/* Right: Active step details + CTA in this column */}
          <div className="col-span-7 flex flex-col gap-6">
            <div className="relative rounded-3xl border border-sky-100 bg-white shadow-xl transition-all duration-300 animate-[fadeIn_0.4s_ease-out] hover:shadow-2xl hover:shadow-sky-100">
              <div className="absolute -top-10 -right-16 w-48 h-48 bg-sky-100 rounded-full blur-3xl opacity-70" />

              <div className="relative p-8 lg:p-10 space-y-6">
                {/* Badge & title */}
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.22em] uppercase text-sky-600 mb-2">
                      {activeStep.label}
                    </p>
                    <h3
                      className="text-3xl font-normal text-slate-900"
                      style={{
                        fontFamily: 'Georgia, Times New Roman, serif',
                      }}
                    >
                      {activeStep.title}
                    </h3>
                    <p
                      className="mt-3 text-sm md:text-base text-slate-700 max-w-xl"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      {activeStep.headline}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div
                      className={`inline-flex items-center justify-center px-4 py-2 rounded-full border text-xs font-semibold tracking-[0.18em] uppercase text-sky-700 ${activeStep.border} bg-sky-50`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
                      Phase {activeStep.number}
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-sky-100 bg-sky-50">
                      <activeStep.icon className="w-6 h-6 text-sky-600" />
                    </div>
                  </div>
                </div>

                {/* Two-column bullets */}
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-600">
                      What happens in this phase
                    </p>
                    <ul className="space-y-2">
                      {activeStep.details.map((item, idx) => {
                        if (idx === 0) return null;
                        return (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-sm text-slate-700"
                            style={{ fontFamily: 'Arial, sans-serif' }}
                          >
                            <span className="mt-1 inline-flex w-1.5 h-1.5 rounded-full bg-sky-400" />
                            <span>{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div
                      className={`rounded-2xl p-4 border ${activeStep.border} ${activeStep.accent} backdrop-blur-sm`}
                    >
                      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-700 mb-1">
                        This phase delivers
                      </p>
                      <p
                        className="text-sm text-slate-800"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        {activeStep.details[0]}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4">
                      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-700 mb-1">
                        How it helps you
                      </p>
                      <p
                        className="text-sm text-slate-700"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        Each phase ends with tangible outputs — not just
                        meetings. You&apos;ll always know what we&apos;re
                        working on, what&apos;s next, and how it connects back
                        to your learning and business goals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop CTA: centered under the right card */}
            <div className="flex justify-center">
              <a
                href="/contact"
                aria-label="Start your project and go to the contact page"
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm md:text-base shadow-lg shadow-sky-200 bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400 transition-all duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span className="absolute -inset-10 bg-gradient-to-r from-sky-300/30 via-sky-200/20 to-transparent rotate-12 blur-3xl group-hover:translate-x-6 transition-transform duration-300" />
                <span className="relative inline-flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(16,185,129,0.25)] animate-pulse" />
                  <span>Start Your Project</span>
                  <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile / tablet layout */}
        <div className="lg:hidden space-y-6 mt-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeIndex;

            return (
              <details
                key={step.number}
                className="group rounded-2xl border border-sky-100 bg-white/80 backdrop-blur-md overflow-hidden transition-all duration-300 hover:bg-sky-900/5"
                open={isActive}
                onClick={() => setActiveIndex(index)}
              >
                <summary className="list-none flex items-center justify-between gap-3 px-4 py-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-sky-600 border border-sky-500 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {step.number}
                        </span>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-sky-300/40 blur-md opacity-0 group-open:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold tracking-[0.22em] uppercase text-sky-700">
                        {step.label}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <h3
                          className="text-base font-normal text-slate-900"
                          style={{
                            fontFamily: 'Georgia, Times New Roman, serif',
                          }}
                        >
                          {step.title}
                        </h3>
                        <Icon className="w-4 h-4 text-sky-600" />
                      </div>
                      <p
                        className="text-xs text-slate-600"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        {step.summary}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform duration-200" />
                </summary>

                <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                  <p
                    className="text-xs text-slate-600 mb-3"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    {step.summary}
                  </p>
                  <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4 space-y-3">
                    <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-slate-700">
                      In this phase
                    </p>
                    <ul className="space-y-2">
                      {step.details.map(item => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs text-slate-700"
                          style={{ fontFamily: 'Arial, sans-serif' }}
                        >
                          <span className="mt-1 inline-flex w-1.5 h-1.5 rounded-full bg-sky-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            );
          })}

          {/* Mobile CTA: centered below the accordion list */}
          <div className="mt-10 text-center">
            <a
              href="/contact"
              aria-label="Start your project and go to the contact page"
              className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm md:text-base shadow-lg shadow-sky-200 bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400 transition-all duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="absolute -inset-10 bg-gradient-to-r from-sky-300/30 via-sky-200/20 to-transparent rotate-12 blur-3xl group-hover:translate-x-6 transition-transform duration-300" />
              <span className="relative inline-flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(16,185,129,0.25)] animate-pulse" />
                <span>Start Your Project</span>
                <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </a>
            <p className="mt-3 text-xs text-slate-500">
              We can adapt this process to fit your timelines, tools, and team.
            </p>
          </div>
        </div>
      </div>

      {/* Simple keyframes for fadeIn (if you want, add in global CSS instead) */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Approach;
