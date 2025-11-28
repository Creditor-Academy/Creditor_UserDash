import React from 'react';
import { TrendingUp, Users, DollarSign, Eye, Zap } from 'lucide-react';

const metrics = [
  {
    icon: Users,
    label: 'Total Users',
    value: '124,582',
    change: '+12.5%',
    positive: true,
    color: 'from-[#22D3EE] to-[#3B82F6]',
  },
  {
    icon: DollarSign,
    label: 'Revenue',
    value: '$2.4M',
    change: '+23.1%',
    positive: true,
    color: 'from-[#16A34A] to-[#22C55E]',
  },
  {
    icon: Eye,
    label: 'Organizations',
    value: '284',
    change: '+8.3%',
    positive: true,
    color: 'from-[#FF6A24] to-[#FFB800]',
  },
  {
    icon: Zap,
    label: 'System Health',
    value: '99.8%',
    change: '+5.7%',
    positive: true,
    color: 'from-[#A66CFF] to-[#EC4899]',
  },
];

export default function HeroAnalytics() {
  return (
    <div className="relative">
      {/* Main Hero Card */}
      <div
        className="rounded-3xl md:rounded-[40px] p-6 md:p-8 lg:p-12 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.01] backdrop-blur-3xl border border-white/[0.1] overflow-hidden relative group"
        style={{
          boxShadow:
            '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset -1px -1px 0 rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Glass Reflection Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent rounded-3xl md:rounded-[40px] pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent rounded-3xl pointer-events-none"></div>

        {/* Animated Gradient Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-500/15 to-transparent rounded-full blur-3xl"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF6A24]/20 to-[#FFB800]/20 border border-[#FF6A24]/30 mb-6">
              <TrendingUp className="w-4 h-4 text-[#FFB800]" />
              <span className="text-sm font-medium text-[#FFB800]">
                Performance Overview
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight text-white">
              Optimize Your
              <br />
              <span className="bg-gradient-to-r from-[#FF6A24] via-[#FFB800] to-[#FF6A24] bg-clip-text text-transparent">
                LMS Metrics
              </span>
            </h1>

            <p className="text-base md:text-lg text-gray-400 mb-6 md:mb-8 leading-relaxed max-w-lg">
              Real-time insights and predictive analytics powered by AI.
              Transform data into actionable intelligence for your learning
              management system.
            </p>

            <button
              className="px-6 md:px-8 py-3 md:py-4 rounded-2xl bg-gradient-to-r from-[#FF6A24] to-[#FFB800] font-semibold text-base md:text-lg text-white hover:shadow-2xl hover:shadow-orange-500/40 transition-all hover:scale-105 hover:-translate-y-1"
              style={{
                boxShadow: '0 10px 40px rgba(255, 106, 36, 0.3)',
              }}
            >
              View Full Report
            </button>
          </div>

          {/* Right Image */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#22D3EE]/20 via-[#A66CFF]/20 to-[#FF6A24]/20 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="relative z-10 w-full h-80 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.1] flex items-center justify-center overflow-hidden"
              style={{
                boxShadow:
                  '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 60px rgba(166, 108, 255, 0.2)',
              }}
            >
              <div className="text-center">
                <TrendingUp className="w-20 h-20 text-white/30 mx-auto mb-4" />
                <p className="text-white/40 text-lg">Analytics Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="group p-6 rounded-3xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.01] backdrop-blur-3xl border border-white/[0.1] hover:border-white/[0.15] transition-all hover:scale-105 hover:-translate-y-2 cursor-pointer relative overflow-hidden"
              style={{
                boxShadow:
                  '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset -1px -1px 0 rgba(0, 0, 0, 0.15)',
                animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
              }}
            >
              {/* Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent rounded-3xl pointer-events-none"></div>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent rounded-3xl pointer-events-none"></div>

              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-transparent group-hover:from-cyan-500/10 transition-all duration-500 rounded-3xl pointer-events-none"></div>

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg text-white relative overflow-hidden group/icon`}
                  style={{
                    boxShadow:
                      '0 8px 24px rgba(255, 106, 36, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl"></div>
                  <Icon className="w-7 h-7 relative z-10 group-hover/icon:scale-110 transition-transform duration-300" />
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
                    metric.positive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  {metric.change}
                </div>
              </div>
              <div className="text-sm text-gray-400 mb-2 relative z-10">
                {metric.label}
              </div>
              <div className="text-3xl font-bold text-white relative z-10">
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
