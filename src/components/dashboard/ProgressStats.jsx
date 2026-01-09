import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  CircleDot,
  Clock,
  Lock,
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react';
import { fetchUserProgressOverview } from '@/services/progressService';
import { useUser } from '@/contexts/UserContext';
import ModulesModal from './ModulesModal';

const clamp = (num, min, max) => Math.max(min, Math.min(num, max));

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-100 p-[2px]">
      <div className="relative h-full bg-white rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-gray-200 animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

function SkeletonProgress() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44 mb-4">
        <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

function SkeletonModule() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl border border-gray-200 p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-gray-200 animate-pulse w-9 h-9"></div>
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function useProgressData() {
  const { userProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchProgressData = async () => {
      if (!userProfile?.id) return;

      setLoading(true);
      setError(null);

      try {
        const progressData = await fetchUserProgressOverview();
        if (!ignore) {
          setData(progressData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Unable to load progress data');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProgressData();

    return () => {
      ignore = true;
    };
  }, [userProfile?.id]);

  return { loading, error, data };
}

function CircularProgress({ value = 0, size = 180, stroke = 12 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = clamp(value, 0, 100);
  const offset = circumference - (clamped / 100) * circumference;

  const getMotivationalText = percentage => {
    if (percentage >= 90) return 'Almost there! 🎯';
    if (percentage >= 75) return 'Excellent progress! 🌟';
    if (percentage >= 50) return 'Keep going! 💪';
    if (percentage >= 25) return 'Great start! 🚀';
    if (percentage > 0) return "You've got this! 🌈";
    return "Let's begin! 📚";
  };

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-90 drop-shadow-lg">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F3F4F6"
            strokeWidth={stroke}
            fill="transparent"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-4xl font-bold text-gray-900 leading-none mb-2">
              {clamped}%
            </div>
            <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">
              Overall completion
            </div>
          </motion.div>
        </div>
      </div>
      <motion.p
        className="mt-4 text-sm font-medium text-gray-700 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {getMotivationalText(clamped)}
      </motion.p>
    </div>
  );
}

function SegmentedModuleBars({ modules = [] }) {
  // Sort modules according to requirements
  const sortedModules = [...modules].sort((a, b) => {
    // Priority 1: In-progress modules always first
    const aInProgress = a.progress > 0 && !a.completed;
    const bInProgress = b.progress > 0 && !b.completed;

    if (aInProgress && !bInProgress) return -1;
    if (!aInProgress && bInProgress) return 1;

    // Priority 2: Most recently updated (if timestamp exists)
    if (a.updated_at && b.updated_at) {
      return new Date(b.updated_at) - new Date(a.updated_at);
    }

    // Priority 3: Completed modules over pending (if no timestamp)
    const aCompleted = a.completed;
    const bCompleted = b.completed;

    if (aCompleted && !bCompleted) return -1;
    if (!aCompleted && bCompleted) return 1;

    // Priority 4: Keep original order for same status
    return 0;
  });

  // Display only maximum of 3 modules
  const displayModules = sortedModules.slice(0, 3);

  return (
    <div className="space-y-4">
      {displayModules.map((m, index) => {
        const isCompleted = m.completed;
        const isInProgress = m.progress > 0 && !m.completed;
        const isPending = !isCompleted && m.progress === 0;

        const getProgressColor = () => {
          if (isCompleted) return 'from-emerald-400 to-emerald-600';
          if (isInProgress) return 'from-amber-400 to-orange-500';
          return 'from-gray-300 to-gray-400';
        };

        const getIconColor = () => {
          if (isCompleted) return 'text-emerald-600';
          if (isInProgress) return 'text-amber-600';
          return 'text-gray-400';
        };

        const getBgColor = () => {
          if (isCompleted) return 'bg-emerald-50 border-emerald-200';
          if (isInProgress) return 'bg-amber-50 border-amber-200';
          return 'bg-gray-50 border-gray-200';
        };

        const Icon = isCompleted
          ? CheckCircle2
          : isInProgress
            ? CircleDot
            : Lock;

        return (
          <motion.div
            key={m.module_id}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            {/* Connection line */}
            {index < displayModules.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200 z-0"></div>
            )}

            <div
              className={`relative z-10 rounded-2xl border p-4 transition-all duration-300 hover:shadow-md ${getBgColor()}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon container */}
                <div
                  className={`relative p-2 rounded-xl shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : isInProgress
                        ? 'bg-amber-500'
                        : 'bg-gray-300'
                  }`}
                >
                  <Icon className={`h-5 w-5 text-white`} />
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-600 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900 text-sm leading-tight">
                      {m.title}
                    </h5>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                          Completed
                        </span>
                      )}
                      {isInProgress && (
                        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                          In Progress
                        </span>
                      )}
                      {isPending && (
                        <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative">
                    <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${getProgressColor()} relative`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${clamp(m.progress || 0, 0, 100)}%`,
                        }}
                        transition={{
                          duration: 0.8,
                          ease: 'easeOut',
                          delay: 0.2 + index * 0.1,
                        }}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      </motion.div>
                    </div>
                    {/* Progress percentage inside bar */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white drop-shadow-sm">
                        {clamp(m.progress || 0, 0, 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, onClick }) {
  const getGradientColors = label => {
    switch (label) {
      case 'Courses':
        return 'from-violet-500 to-purple-600';
      case 'Modules':
        return 'from-blue-500 to-cyan-600';
      case 'Lessons':
        return 'from-emerald-500 to-teal-600';
      case 'Completion':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getIconBgGradient = label => {
    switch (label) {
      case 'Courses':
        return 'from-violet-100 to-purple-100';
      case 'Modules':
        return 'from-blue-100 to-cyan-100';
      case 'Lessons':
        return 'from-emerald-100 to-teal-100';
      case 'Completion':
        return 'from-amber-100 to-orange-100';
      default:
        return 'from-gray-100 to-gray-100';
    }
  };

  const getIconColor = label => {
    switch (label) {
      case 'Courses':
        return 'text-violet-600';
      case 'Modules':
        return 'text-blue-600';
      case 'Lessons':
        return 'text-emerald-600';
      case 'Completion':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        y: -4,
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
      whileTap={onClick ? { scale: 0.97 } : {}}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getGradientColors(label)} p-[2px] ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative h-full bg-white rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`relative p-3 rounded-2xl bg-gradient-to-br ${getIconBgGradient(label)} shadow-lg`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            <Icon className={`h-6 w-6 ${getIconColor(label)} relative z-10`} />
          </div>
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {label}
          </span>
        </div>
        <div className="space-y-2">
          <motion.p
            className="text-3xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {value}
          </motion.p>
          <p className="text-sm text-gray-600 font-medium">{subtext}</p>
        </div>
        {onClick && (
          <div className="absolute top-4 right-4">
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BadgeCard({ badge }) {
  const progress = clamp(badge.progress, 0, 100);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      key={badge.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm hover:shadow-md transition-shadow min-h-[160px]"
    >
      <div className="flex-shrink-0 mb-3">
        <div className="relative" style={{ width: 70, height: 70 }}>
          <svg width={70} height={70} className="-rotate-90">
            <circle
              cx={35}
              cy={35}
              r={radius}
              stroke="#E5E7EB"
              strokeWidth={6}
              fill="transparent"
            />
            <motion.circle
              cx={35}
              cy={35}
              r={radius}
              stroke={
                progress === 100
                  ? '#22c55e'
                  : progress >= 50
                    ? '#0ea5e9'
                    : '#f59e0b'
              }
              strokeWidth={6}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900">{progress}%</span>
          </div>
        </div>
      </div>
      <div className="text-center space-y-1 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-center gap-1.5">
          <Award className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-900">
            {badge.title}
          </span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
          {badge.hint}
        </p>
      </div>
    </motion.div>
  );
}

function BadgesGallery({ badges = [] }) {
  const [expanded, setExpanded] = useState(false);
  const items = expanded ? badges : badges.slice(0, 4);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="space-y-0.5">
          <h4 className="text-xl font-semibold text-gray-900">Badges</h4>
          <p className="text-xs text-gray-500">
            Keep collecting milestones as you learn
          </p>
        </div>
        {badges.length > 4 && (
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            {expanded ? 'Show less' : 'View all'}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnimatePresence initial={false}>
          {items.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ProgressStats() {
  const { loading, error, data } = useProgressData();
  const [showModulesModal, setShowModulesModal] = useState(false);

  // Extract data from backend response structure
  const summary = data?.summary || {};
  const overall = data?.overall_completion || {};
  const achievements = data?.achievements || {};
  const currentCourse = data?.current_course;

  // Calculate pending modules: modules that are not completed (includes in-progress)
  // Pending = Total - Completed
  const totalModules = summary.modules?.total || 0;
  const completedModules = summary.modules?.completed || 0;
  const pendingModules = Math.max(0, totalModules - completedModules);

  const highlightStats = [
    {
      icon: Users,
      label: 'Courses',
      value: summary.courses?.enrolled || 0,
      subtext: `${summary.courses?.completed || 0} completed`,
    },
    {
      icon: Briefcase,
      label: 'Modules',
      value: summary.modules?.total || 0,
      subtext: `${summary.modules?.completed || 0} completed`,
      onClick: () => setShowModulesModal(true),
    },
    {
      icon: Clock,
      label: 'Lessons',
      value: summary.lessons?.total || 0,
      subtext: `${summary.lessons?.completed || 0} completed`,
    },
    {
      icon: TrendingUp,
      label: 'Completion',
      value: `${overall.percentage || 0}%`,
      subtext: 'Overall progress',
    },
  ];

  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="col-span-1 lg:col-span-1 rounded-3xl border border-gray-100 bg-gray-50 p-6 sm:p-8 flex flex-col items-center">
            <SkeletonProgress />
          </div>
          <div className="col-span-1 lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
            <SkeletonModule />
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="text-center">
                    <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Your Progress Overview
          </h3>
          <p className="text-sm text-gray-500">
            Real-time snapshot of your learning journey
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-xl border border-blue-100 shadow-sm">
          <TrendingUp className="h-4 w-4 flex-shrink-0 text-blue-600" />
          <span className="whitespace-nowrap font-medium">Auto-refreshed</span>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {highlightStats.map(stat => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="col-span-1 lg:col-span-1 rounded-3xl border border-gray-100 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6 sm:p-8 flex flex-col items-center shadow-lg">
          <div className="flex justify-center mb-6">
            <CircularProgress value={overall.percentage || 0} />
          </div>
          <div className="text-center mb-4 sm:mb-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">
                {summary.modules?.completed || overall.completed_modules || 0}
              </span>{' '}
              completed modules
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">
                {summary.modules?.total || 0}
              </span>{' '}
              total modules
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full mt-auto">
            <div className="rounded-xl bg-white/80 border border-gray-200 p-3 text-center shadow-sm">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                Credits
              </p>
              <p className="text-sm font-bold text-gray-900">
                {achievements.credits_earned || 0}
              </p>
              <p className="text-[10px] text-gray-500">Earned</p>
            </div>
            <div className="rounded-xl bg-white/80 border border-gray-200 p-3 text-center shadow-sm">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                Badges
              </p>
              <p className="text-sm font-bold text-gray-900">
                {achievements.badges_collected || 0}
              </p>
              <p className="text-[10px] text-gray-500">Collected</p>
            </div>
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 space-y-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                Current course
              </p>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 truncate leading-tight">
                {currentCourse?.course_title || 'No course in progress'}
              </h4>
            </div>
            <div className="text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-100 font-medium shadow-sm">
              {currentCourse?.modules_summary?.completed || 0}/
              {currentCourse?.modules_summary?.total || 0} modules
            </div>
          </div>
          <SegmentedModuleBars modules={currentCourse?.modules || []} />
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center group">
                <div className="relative inline-block">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform duration-200">
                    {summary.modules?.total || 0}
                  </p>
                  <div className="absolute -top-1 -right-2 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Total modules
                </p>
              </div>

              <div className="text-center group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl transform scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600 mb-2 group-hover:scale-105 transition-transform duration-200">
                  {summary.modules?.in_progress || 0}
                </p>
                <p className="text-sm font-medium text-amber-700 uppercase tracking-wide">
                  In-progress
                </p>
              </div>

              <div className="text-center group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl transform scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
                <p className="text-2xl sm:text-3xl font-bold text-rose-600 mb-2 group-hover:scale-105 transition-transform duration-200">
                  {pendingModules}
                </p>
                <p className="text-sm font-medium text-rose-700 uppercase tracking-wide">
                  Pending modules
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <BadgesGallery badges={overall.badges} /> */}

      <ModulesModal
        isOpen={showModulesModal}
        onClose={() => setShowModulesModal(false)}
      />
    </div>
  );
}
