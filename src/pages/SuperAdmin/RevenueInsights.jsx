import React from 'react';
import { Package, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function RevenueInsights() {
  return (
    <div
      className="p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/[0.13] via-white/[0.07] to-white/[0.02] backdrop-blur-3xl border border-white/[0.16] h-full relative overflow-hidden group"
      style={{
        boxShadow:
          '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.16), inset -1px -1px 0 rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent rounded-3xl md:rounded-[40px] pointer-events-none"></div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/15 to-transparent rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#22C55E] flex items-center justify-center shadow-lg shadow-green-500/30">
              <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">Revenue</h2>
          </div>

          <div className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-[#16A34A]/20 text-[#22C55E] text-xs font-semibold flex items-center space-x-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.2%</span>
          </div>
        </div>

        {/* Revenue Amount */}
        <div className="mb-6 md:mb-8">
          <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#16A34A] to-[#22C55E] bg-clip-text text-transparent mb-1 md:mb-2">
            $847,392
          </div>
          <p className="text-gray-400 text-xs md:text-sm">
            Total revenue this quarter
          </p>
        </div>

        {/* Visual Card */}
        <div className="relative mb-6 md:mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/20 to-[#22C55E]/10 rounded-3xl blur-2xl"></div>
          <div className="relative p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center justify-center min-h-[280px] md:min-h-[320px]">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-40 md:w-56 lg:w-64 h-40 md:h-56 lg:h-64 bg-gradient-to-br from-[#22D3EE]/40 to-[#A66CFF]/40 rounded-full blur-3xl"></div>
                <div className="relative w-32 md:w-40 lg:w-48 h-32 md:h-40 lg:h-48 bg-gradient-to-br from-[#22D3EE]/20 to-[#A66CFF]/20 rounded-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <Package className="w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs md:text-sm">
              Courses Sold
            </span>
            <span className="font-semibold text-sm md:text-base text-white">
              12,847
            </span>
          </div>
          <div className="h-1.5 md:h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] rounded-full"
              style={{
                width: '78%',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-4 md:mt-6">
            <span className="text-gray-400 text-xs md:text-sm">
              Avg. Course Value
            </span>
            <span className="font-semibold text-sm md:text-base text-white">
              $65.92
            </span>
          </div>
          <div className="h-1.5 md:h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6A24] to-[#FFB800] rounded-full"
              style={{
                width: '92%',
                boxShadow: '0 0 20px rgba(255, 106, 36, 0.5)',
              }}
            ></div>
          </div>
        </div>

        {/* Button */}
        <button className="w-full mt-6 md:mt-8 py-2.5 md:py-3.5 rounded-2xl bg-gradient-to-r from-white/[0.08] to-white/[0.04] border border-white/[0.08] font-medium text-sm md:text-base text-white hover:bg-white/[0.12] transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
          View Detailed Report
        </button>
      </div>
    </div>
  );
}
