import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  BarChart3,
  LineChart,
  Lock,
} from 'lucide-react';

const financePathway = [
  {
    level: 'Stage 01',
    title: 'Master Class Immersion',
    description:
      'Begin with the flagship Master Class and get the strategic context, frameworks, and rituals required for the private journey.',
    courses: [{ name: 'Master Class', price: 'Included with membership' }],
    color: 'from-slate-100 to-gray-50',
    icon: BookOpen,
    outcome: 'Build the mindset and core systems before you deploy capital.',
    access: {
      label: 'Enter Master Class',
      href: '/dashboard/courses',
      locked: false,
    },
  },
  {
    level: 'Stage 02',
    title: 'Become Private Blueprint',
    description:
      'Secure your foundation with entity structures, compliant documentation, and the executive playbook to operate privately.',
    courses: [{ name: 'Become Private', price: 'Program investment: ₹2,999' }],
    color: 'from-indigo-100 to-blue-50',
    icon: TrendingUp,
    outcome: 'Lock in private status and leverage the associated protections.',
    access: {
      label: 'Unlock Become Private',
      href: '/dashboard/catalog',
      locked: true,
    },
  },
  {
    level: 'Stage 03',
    title: 'Operate Private Systems',
    description:
      'Deploy operations, payment infrastructure, and risk controls so every department functions with private precision.',
    courses: [{ name: 'Operate Private', price: 'Program investment: ₹3,999' }],
    color: 'from-purple-100 to-violet-50',
    icon: BarChart3,
    outcome: 'Run daily business activities inside a fortified ecosystem.',
    access: {
      label: 'Unlock Operate Private',
      href: '/dashboard/catalog',
      locked: true,
    },
  },
  {
    level: 'Stage 04',
    title: 'Financial Freedom Architecture',
    description:
      'Engineer wealth velocity with layered credit, alternative banking strategies, and disciplined reinvestment.',
    courses: [
      { name: 'Financial Freedom', price: 'Program investment: ₹4,499' },
    ],
    color: 'from-emerald-100 to-green-50',
    icon: LineChart,
    outcome: 'Scale responsibly while preserving privacy-first cash flow.',
    access: {
      label: 'Unlock Financial Freedom',
      href: '/dashboard/catalog',
      locked: true,
    },
  },
  {
    level: 'Final Review',
    title: 'Assessment · Am I Eligible for Becoming Private/Credit?',
    description:
      'A concierge-led assessment that audits documentation, revenue, personal credit, and entity readiness before acceptance.',
    courses: [
      { name: 'Executive Assessment', price: 'Included with consultation' },
    ],
    color: 'from-slate-200 to-white',
    icon: Sparkles,
    outcome: 'Receive a curated eligibility dossier and next-step timeline.',
    access: { label: 'Book Assessment', href: '/assessment', locked: true },
  },
];

export default function SuccessivePathway() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 space-y-16">
        {/* Header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">
              Finance Success Pathway
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
              Visual Roadmap to Master Finance
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-gray-600">
              Follow a guided, step-by-step path — from money basics to
              algorithmic finance. Learn visually. Grow practically.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </header>

        {/* Actual Pathway Road */}
        <section className="relative">
          {/* The vertical line (path connector) */}
          <div className="absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-blue-200 via-gray-200 to-indigo-200 rounded-full hidden md:block"></div>

          <div className="flex flex-col space-y-20 relative">
            {financePathway.map((stage, i) => {
              const Icon = stage.icon;
              const isLocked = stage.access?.locked;
              const isLeft = i % 2 === 0;
              const isLast = i === financePathway.length - 1;

              return (
                <div
                  key={stage.level}
                  className={`flex flex-col md:flex-row items-center md:gap-8 ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Connector dot */}
                  <div className="hidden md:flex items-center justify-center relative">
                    <div className="h-6 w-6 rounded-full bg-white border-4 border-blue-400 shadow-md z-10"></div>
                  </div>

                  {/* Stage Card */}
                  <div
                    className={`relative md:w-1/2 rounded-3xl bg-gradient-to-br ${stage.color} border border-gray-200 shadow-md hover:shadow-xl transition transform hover:-translate-y-1`}
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        <Icon className="h-5 w-5 text-gray-700" />
                        {stage.level}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <h3 className="text-2xl font-semibold text-gray-900">
                          {stage.title}
                        </h3>
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            isLocked
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Lock className="h-3.5 w-3.5" />
                              Locked
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Unlocked
                            </>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700 text-sm leading-relaxed">
                        {stage.description}
                      </p>

                      {/* Course Cards */}
                      <div className="mt-4 grid sm:grid-cols-2 gap-3">
                        {stage.courses.map((course, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center rounded-xl bg-white/80 border border-gray-200 px-4 py-3 hover:shadow-md transition"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {course.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {course.price}
                              </p>
                            </div>
                            <button className="text-xs rounded-full bg-gray-900 text-white px-3 py-1 hover:bg-gray-800">
                              Explore
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {stage.outcome}
                      </div>
                      <div className="mt-6 flex flex-col gap-3">
                        {stage.access && !isLocked ? (
                          <Link
                            to={stage.access.href}
                            className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition"
                          >
                            {stage.access.label}
                          </Link>
                        ) : (
                          <button
                            className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-gray-500 bg-white/70 border border-gray-200 cursor-not-allowed"
                            disabled
                          >
                            Unlock previous stage to access
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
      </div>
    </div>
  );
}
