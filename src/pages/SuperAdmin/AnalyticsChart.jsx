import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsChart() {
  const [activeView, setActiveView] = useState('month');

  const dataPoints =
    activeView === 'month'
      ? [20, 35, 28, 45, 38, 52, 48, 65, 58, 72, 68, 85]
      : [45, 52, 48, 58, 55, 62, 68];

  const maxValue = Math.max(...dataPoints);
  const labels =
    activeView === 'month'
      ? [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-30 md:mb-40">
        <div>
          <div className="flex items-center space-x-2 md:space-x-3 mb-2">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-teal-400/30">
              <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Revenue Analytics
            </h2>
          </div>
          <p className="text-sm md:text-base text-gray-400">
            Track your business growth over time
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 md:space-x-2 p-1 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] relative z-10">
          <button
            onClick={() => setActiveView('week')}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-medium text-sm md:text-base transition-all relative overflow-hidden group ${
              activeView === 'week'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/40 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.1]'
            }`}
          >
            {activeView === 'week' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl"></div>
            )}
            <span className="relative z-10">Week</span>
          </button>
          <button
            onClick={() => setActiveView('month')}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-medium text-sm md:text-base transition-all relative overflow-hidden group ${
              activeView === 'month'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/40 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.1]'
            }`}
          >
            {activeView === 'month' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl"></div>
            )}
            <span className="relative z-10">Month</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[280px] md:h-[340px] lg:h-[380px] mt-6 md:mt-8 flex items-center justify-center">
        <div className="absolute inset-0 flex items-end justify-between px-8 md:px-12 pb-16 md:pb-20">
          {dataPoints.map((value, index) => {
            const height = (value / maxValue) * 100;
            const delay = index * 0.1;

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 group cursor-pointer"
              >
                <div className="relative w-full flex items-end justify-center h-[320px]">
                  <div
                    className="w-full max-w-[40px] rounded-t-2xl bg-gradient-to-t from-[#FF6A24] via-[#FFB800] to-[#22D3EE] relative overflow-hidden transition-all group-hover:scale-105"
                    style={{
                      height: `${height}%`,
                      animation: `slideUp 0.8s ease-out ${delay}s both`,
                      boxShadow:
                        '0 -4px 24px rgba(255, 106, 36, 0.4), 0 0 60px rgba(34, 211, 238, 0.2)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.1] to-white/[0.2]"></div>
                  </div>

                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-3 py-2 rounded-xl bg-white/[0.1] backdrop-blur-xl border border-white/[0.2] shadow-xl">
                      <div className="text-sm font-bold text-white">
                        ${value}k
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-4 font-medium">
                  {labels[index]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis Labels */}
        <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-400 font-medium">
          <span>${maxValue}k</span>
          <span>${Math.round(maxValue * 0.75)}k</span>
          <span>${Math.round(maxValue * 0.5)}k</span>
          <span>${Math.round(maxValue * 0.25)}k</span>
          <span>$0</span>
        </div>

        {/* Grid Lines */}
        <div className="absolute inset-x-0 bottom-12 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent"></div>
        <div className="absolute inset-x-0 bottom-[calc(25%+3rem)] h-px bg-white/[0.03]"></div>
        <div className="absolute inset-x-0 bottom-[calc(50%+3rem)] h-px bg-white/[0.03]"></div>
        <div className="absolute inset-x-0 bottom-[calc(75%+3rem)] h-px bg-white/[0.03]"></div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            height: 0%;
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
