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
} from 'lucide-react';
import { fetchUserProgressOverview } from '@/services/progressService';
import { useUser } from '@/contexts/UserContext';
import ModulesModal from './ModulesModal';

const clamp = (num, min, max) => Math.max(min, Math.min(num, max));

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

function CircularProgress({ value = 0, size = 140, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = clamp(value, 0, 100);
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
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
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 leading-none mb-1">
            {clamped}%
          </div>
          <div className="text-[10px] uppercase tracking-wide text-gray-500">
            Overall completion
          </div>
        </div>
      </div>
    </div>
  );
}

function SegmentedModuleBars({ modules = [] }) {
  return (
    <div className="space-y-3">
      {modules.map(m => {
        const color = m.completed
          ? 'bg-emerald-500'
          : m.progress > 0
            ? 'bg-amber-400'
            : 'bg-rose-400';
        const Icon = m.completed
          ? CheckCircle2
          : m.progress > 0
            ? CircleDot
            : Lock;
        return (
          <div key={m.module_id} className="space-y-2">
            <div className="flex items-center gap-2 min-w-0">
              <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate flex-1">
                {m.title}
              </span>
              <span className="text-xs font-medium text-gray-600 flex-shrink-0 bg-gray-50 px-2 py-0.5 rounded">
                {clamp(m.progress || 0, 0, 100)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className={`h-full ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${clamp(m.progress || 0, 0, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, onClick }) {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{subtext}</p>
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
      subtext: `${summary.modules?.unlocked || 0} unlocked`,
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
      <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
            Your Progress Overview
          </h3>
          <p className="text-sm text-gray-500">
            Real-time snapshot of your learning journey
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
          <TrendingUp className="h-4 w-4 flex-shrink-0" />
          <span className="whitespace-nowrap">Auto-refreshed</span>
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
        <div className="col-span-1 lg:col-span-1 rounded-3xl border border-gray-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 sm:p-6 flex flex-col items-center">
          <div className="flex justify-center mb-4">
            <CircularProgress value={overall.percentage || 0} />
          </div>
          <div className="text-center mb-4 sm:mb-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">
                {overall.unlocked_modules || 0}
              </span>{' '}
              unlocked modules
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">
                {overall.locked_modules || 0}
              </span>{' '}
              locked
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
        <div className="col-span-1 lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                Current course
              </p>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {currentCourse?.course_title || 'No course in progress'}
              </h4>
            </div>
            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 whitespace-nowrap">
              {currentCourse?.modules_summary?.completed || 0}/
              {currentCourse?.modules_summary?.total || 0} modules
            </div>
          </div>
          <SegmentedModuleBars modules={currentCourse?.modules || []} />
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                {summary.modules?.total || 0}
              </p>
              <p className="text-xs text-gray-600">Total modules</p>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <p className="text-lg sm:text-xl font-bold text-amber-600 mb-1">
                {summary.modules?.in_progress || 0}
              </p>
              <p className="text-xs text-gray-600">In-progress</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-bold text-rose-600 mb-1">
                {summary.modules?.locked || 0}
              </p>
              <p className="text-xs text-gray-600">Locked</p>
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
