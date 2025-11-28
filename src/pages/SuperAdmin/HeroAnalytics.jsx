import React from 'react';
import { TrendingUp, Users, DollarSign, Eye, Zap } from 'lucide-react';

const metrics = [
  {
    icon: Users,
    label: 'Total Affiliates',
    value: '24',
    change: 'Last month',
    positive: true,
    color: 'from-[#22D3EE] to-[#3B82F6]',
  },
  {
    icon: DollarSign,
    label: 'Active Brands',
    value: '12',
    change: 'Last month',
    positive: true,
    color: 'from-[#A66CFF] to-[#EC4899]',
  },
  {
    icon: Eye,
    label: 'Active Deals',
    value: '36',
    change: 'Last month',
    positive: true,
    color: 'from-[#FF6A24] to-[#FFB800]',
  },
  {
    icon: Zap,
    label: 'Average ROI',
    value: '142%',
    change: 'Last month',
    positive: true,
    color: 'from-[#EC4899] to-[#F43F5E]',
  },
];

export default function HeroAnalytics() {
  return (
    <div className="relative">
      {/* Main Hero Card */}
      <div
        className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.01] backdrop-blur-3xl border border-white/[0.12] overflow-hidden relative"
        style={{
          boxShadow:
            '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Subtle top border glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent pointer-events-none"></div>

        {/* Animated Gradient Background */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-cyan-500/8 via-blue-500/4 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-purple-500/6 to-transparent rounded-full blur-3xl"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-medium text-orange-300">
                Performance Overview
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-white">
              Admin Dashboard
            </h1>

            <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-lg">
              Manage your affiliates, brands, and deals with real-time analytics
              and insights.
            </p>
          </div>

          {/* Right Image */}
          <div className="relative hidden lg:block">
            <div
              className="w-full h-48 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.1] flex items-center justify-center overflow-hidden"
              style={{
                boxShadow:
                  '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-cyan-500/15 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-7 h-7 text-cyan-300" />
                </div>
                <p className="text-gray-400 text-sm font-medium">Analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-5 md:mt-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={`group p-4 rounded-xl bg-gradient-to-br ${metric.color} backdrop-blur-2xl border border-white/[0.2] hover:border-white/[0.3] transition-all hover:scale-102 cursor-pointer relative overflow-hidden`}
              style={{
                boxShadow:
                  '0 6px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
              }}
            >
              {/* Glass Reflection */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.2] to-transparent rounded-xl pointer-events-none"></div>

              <div className="flex items-start justify-between mb-3 relative z-10">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-md text-white relative overflow-hidden`}
                  style={{
                    boxShadow:
                      '0 4px 16px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-lg"></div>
                  <Icon className="w-5 h-5 relative z-10 text-white" />
                </div>
              </div>
              <div className="text-xs text-white/80 mb-2 relative z-10 font-semibold uppercase tracking-tight">
                {metric.label}
              </div>
              <div className="flex items-baseline gap-1.5 relative z-10">
                <div className="text-2xl font-bold text-white">
                  {metric.value}
                </div>
                <div className="text-xs text-white/70 font-medium">
                  {metric.change}
                </div>
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
