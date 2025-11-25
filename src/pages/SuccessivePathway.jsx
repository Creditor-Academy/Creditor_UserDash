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
} from 'lucide-react';

const financePathway = [
  {
    level: 'Beginner',
    title: 'Personal Finance Basics',
    description:
      'Master the art of budgeting, savings, and money discipline — your foundation for financial success.',
    courses: [
      { name: 'Personal Finance Foundations', price: '₹599' },
      { name: 'Smart Budgeting & Saving Plan', price: '₹499' },
    ],
    color: 'from-sky-100 to-blue-50',
    icon: BookOpen,
    outcome: 'Gain control over your money and spending habits.',
  },
  {
    level: 'Intermediate',
    title: 'Investment & Wealth Building',
    description:
      'Understand equities, mutual funds, and SIPs — create your first diversified investment portfolio.',
    courses: [
      { name: 'Investment & Wealth Building', price: '₹1,099' },
      { name: 'Mutual Fund Strategy Guide', price: '₹899' },
    ],
    color: 'from-green-100 to-emerald-50',
    icon: TrendingUp,
    outcome: 'Start growing your wealth with strategic investments.',
  },
  {
    level: 'Advanced',
    title: 'Financial Analytics & Data Tools',
    description:
      'Analyze financial reports, ROI, and trends using Excel or Power BI to make data-backed decisions.',
    courses: [
      { name: 'Financial Analytics with Excel', price: '₹899' },
      { name: 'Finance Dashboard with Power BI', price: '₹999' },
    ],
    color: 'from-yellow-100 to-amber-50',
    icon: BarChart3,
    outcome: 'Use data to guide smarter financial decisions.',
  },
  {
    level: 'Expert',
    title: 'AI & Quantitative Finance',
    description:
      'Leverage AI and machine learning to automate trading, risk modeling, and portfolio optimization.',
    courses: [
      { name: 'Data-Driven Investing', price: '₹1,499' },
      { name: 'AI in Finance', price: '₹1,299' },
    ],
    color: 'from-indigo-100 to-purple-50',
    icon: LineChart,
    outcome: 'Design your own algorithmic trading or AI finance models.',
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
                      <h3 className="mt-3 text-2xl font-semibold text-gray-900">
                        {stage.title}
                      </h3>
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-gray-200 bg-white shadow-md p-8 text-center space-y-4">
          <Sparkles className="mx-auto h-6 w-6 text-gray-500" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Start your personalized finance roadmap
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take a quick skill assessment — we’ll map your exact stage and
            recommend the perfect finance course to begin with.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition"
          >
            Take Finance Assessment →
          </Link>
        </section>
      </div>
    </div>
  );
}
