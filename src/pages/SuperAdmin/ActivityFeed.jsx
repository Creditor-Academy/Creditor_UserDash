import React from 'react';
import { Activity, MoreVertical } from 'lucide-react';

const activities = [
  {
    id: 1,
    title: 'New user registration spike',
    description: '2,847 new users registered in the last 24 hours',
    progress: 87,
    category: 'Users',
    categoryColor: 'from-[#22D3EE] to-[#3B82F6]',
    time: '2 hours ago',
  },
  {
    id: 2,
    title: 'Revenue milestone achieved',
    description: 'Successfully crossed $2M monthly recurring revenue',
    progress: 94,
    category: 'Revenue',
    categoryColor: 'from-[#16A34A] to-[#22C55E]',
    time: '5 hours ago',
  },
  {
    id: 3,
    title: 'System performance optimized',
    description: 'API response time improved by 45% after optimization',
    progress: 72,
    category: 'System',
    categoryColor: 'from-[#A66CFF] to-[#EC4899]',
    time: '1 day ago',
  },
  {
    id: 4,
    title: 'New course published',
    description: 'Advanced Python course is now live for all users',
    progress: 68,
    category: 'Courses',
    categoryColor: 'from-[#FF6A24] to-[#FFB800]',
    time: '2 days ago',
  },
];

export default function ActivityFeed() {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-4 md:mb-6">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 md:w-10 h-8 md:h-10 rounded-xl bg-gradient-to-br from-[#A66CFF] to-[#EC4899] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Activity className="w-4 md:w-5 h-4 md:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Recent Activity
            </h2>
            <p className="text-xs md:text-sm text-gray-400">
              Latest updates from your organization
            </p>
          </div>
        </div>

        <button className="px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] font-medium text-sm md:text-base text-white hover:bg-white/[0.1] transition-all hover:scale-105 whitespace-nowrap">
          View All
        </button>
      </div>

      {/* Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {activities.map(activity => (
          <div
            key={activity.id}
            className="group p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/[0.13] to-white/[0.02] backdrop-blur-3xl border border-white/[0.16] hover:border-white/[0.22] transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
            style={{
              boxShadow:
                '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
            }}
          >
            {/* Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent rounded-3xl md:rounded-[32px] pointer-events-none"></div>

            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-transparent group-hover:from-cyan-500/10 transition-all duration-500 rounded-3xl md:rounded-[32px] pointer-events-none"></div>
            {/* Content */}
            <div className="flex items-start justify-between gap-2 md:gap-4 mb-3 md:mb-4 relative z-10">
              <div className="flex-1 min-w-0">
                {/* Title and Description */}
                <div className="flex items-start justify-between gap-2 mb-1 md:mb-2">
                  <h3 className="font-bold text-sm md:text-base leading-tight line-clamp-2 text-white">
                    {activity.title}
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3 line-clamp-2">
                  {activity.description}
                </p>

                {/* Category and Time */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div
                    className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-gradient-to-r ${activity.categoryColor} bg-opacity-20 text-xs font-semibold whitespace-nowrap text-white`}
                  >
                    {activity.category}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              </div>

              {/* More Options */}
              <button className="w-6 md:w-8 h-6 md:h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-all flex-shrink-0">
                <MoreVertical className="w-3 md:w-4 h-3 md:h-4 text-white" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 md:h-1.5 rounded-full bg-white/[0.08] overflow-hidden border border-white/[0.1] relative z-10">
              <div
                className={`h-full bg-gradient-to-r ${activity.categoryColor} rounded-full transition-all duration-1000 relative overflow-hidden`}
                style={{
                  width: `${activity.progress}%`,
                  boxShadow:
                    '0 0 20px rgba(255, 106, 36, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
