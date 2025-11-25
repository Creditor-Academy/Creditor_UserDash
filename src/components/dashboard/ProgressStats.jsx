import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { fetchUserCourses } from "@/services/courseService";
import { useUser } from "@/contexts/UserContext";

const clamp = (num, min, max) => Math.max(min, Math.min(num, max));

function useProgressData(externalData) {
	const { userProfile } = useUser?.() || {};
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [courses, setCourses] = useState([]);

	useEffect(() => {
		let ignore = false;
		if (externalData?.courses?.length) {
			setCourses(externalData.courses);
			return;
		}
		setLoading(true);
		(async () => {
			try {
				const res = await fetchUserCourses?.();
				if (!ignore && Array.isArray(res)) setCourses(res);
			} catch (e) {
				if (!ignore) setError("Unable to load courses");
			} finally {
				if (!ignore) setLoading(false);
			}
		})();
		return () => {
			ignore = true;
		};
	}, [userProfile?.id, externalData?.courses]);

	// Fallback shaping for modules/lessons/badges when not provided
	const shaped = useMemo(() => {
		const shapedCourses = (courses || []).map((c, idx) => {
			const modules = c.modules?.length
				? c.modules
				: [
						{
							id: `m-${idx}-1`,
							title: "Introduction",
							status: "completed",
							progress: 100,
							lessons: 6,
							completedLessons: 6,
						},
						{
							id: `m-${idx}-2`,
							title: "Core Concepts",
							status: "in-progress",
							progress: 45,
							lessons: 10,
							completedLessons: 4,
						},
						{
							id: `m-${idx}-3`,
							title: "Advanced",
							status: "locked",
							progress: 0,
							lessons: 9,
							completedLessons: 0,
						},
				  ];
			const totalModules = modules.length;
			const completedModules = modules.filter((m) => m.status === "completed").length;
			const inProgressModules = modules.filter((m) => m.status === "in-progress").length;
			const lockedModules = modules.filter((m) => m.status === "locked").length;
			const totalLessons = modules.reduce((a, m) => a + (m.lessons || 0), 0);
			const completedLessons = modules.reduce((a, m) => a + (m.completedLessons || 0), 0);
			const unlockedLessons = modules
				.filter((m) => m.status !== "locked")
				.reduce((a, m) => a + (m.lessons || 0), 0);
			const lockedLessons = totalLessons - unlockedLessons;
			const overallProgress =
				totalModules === 0
					? 0
					: Math.round(
							(modules.reduce((a, m) => a + clamp(m.progress || 0, 0, 100), 0) / (totalModules * 100)) *
								100
					  );
			return {
				id: c.id ?? `course-${idx}`,
				title: c.title ?? c.name ?? `Course ${idx + 1}`,
				overallProgress,
				modules,
				stats: {
					totalModules,
					completedModules,
					inProgressModules,
					lockedModules,
					totalLessons,
					completedLessons,
					unlockedLessons,
					lockedLessons,
				},
			};
		});

		// Aggregate across courses
		const totalCourses = shapedCourses.length;
		const totals = shapedCourses.reduce(
			(acc, c) => {
				acc.totalModules += c.stats.totalModules;
				acc.completedModules += c.stats.completedModules;
				acc.inProgressModules += c.stats.inProgressModules;
				acc.lockedModules += c.stats.lockedModules;
				acc.totalLessons += c.stats.totalLessons;
				acc.completedLessons += c.stats.completedLessons;
				acc.unlockedLessons += c.stats.unlockedLessons;
				acc.lockedLessons += c.stats.lockedLessons;
				acc.progressSum += c.overallProgress;
				return acc;
			},
			{
				totalModules: 0,
				completedModules: 0,
				inProgressModules: 0,
				lockedModules: 0,
				totalLessons: 0,
				completedLessons: 0,
				unlockedLessons: 0,
				lockedLessons: 0,
				progressSum: 0,
			}
		);
		const overallCompletion = totalCourses ? Math.round(totals.progressSum / totalCourses) : 0;

		// Credits + badges placeholders (could be sourced from contexts/services)
		const creditsEarned = externalData?.creditsEarned ?? 240;
		const creditsRedeemed = externalData?.creditsRedeemed ?? 300;
		const badges =
			externalData?.badges ??
			[
				{ id: "b1", title: "Starter", progress: 100, hint: "Completed first lesson" },
				{ id: "b2", title: "Streak 7", progress: 65, hint: "7-day learning streak" },
				{ id: "b3", title: "Quiz Whiz", progress: 40, hint: "Score 85%+ on 5 quizzes" },
				{ id: "b4", title: "Attendance", progress: 75, hint: "Attendance 75%+ Badge" },
			];

		return {
			courses: shapedCourses,
			summary: {
				totalCourses,
				totalModules: totals.totalModules,
				unlockedModules: totals.completedModules + totals.inProgressModules,
				inProgressModules: totals.inProgressModules,
				lockedModules: totals.lockedModules,
				totalLessons: totals.totalLessons,
				completedLessons: totals.completedLessons,
				unlockedLessons: totals.unlockedLessons,
				lockedLessons: totals.lockedLessons,
				overallCompletion,
				creditsEarned,
				creditsRedeemed,
				badges,
			},
		};
	}, [courses, externalData]);

	return { loading, error, data: shaped };
}

function CircularProgress({ value = 0, size = 140, stroke = 10 }) {
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	const clamped = clamp(value, 0, 100);
	const offset = circumference - (clamped / 100) * circumference;

	return (
		<div className="relative" style={{ width: size, height: size }}>
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
					transition={{ duration: 1, ease: "easeOut" }}
					strokeLinecap="round"
				/>
				<defs>
					<linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="#0ea5e9" />
						<stop offset="100%" stopColor="#22c55e" />
					</linearGradient>
				</defs>
			</svg>
			<div className="absolute inset-0 grid place-items-center">
				<div className="text-center">
					<div className="text-2xl font-bold text-gray-900">{clamped}%</div>
					<div className="text-xs text-gray-500">Overall completion</div>
				</div>
			</div>
		</div>
	);
}

function SegmentedModuleBars({ modules = [] }) {
	return (
		<div className="space-y-2">
			{modules.map((m) => {
				const color =
					m.status === "completed" ? "bg-emerald-500" : m.status === "in-progress" ? "bg-amber-400" : "bg-rose-400";
				const Icon = m.status === "completed" ? CheckCircle2 : m.status === "in-progress" ? CircleDot : Lock;
				return (
					<div key={m.id} className="space-y-1">
						<div className="flex items-center gap-2">
							<Icon className="h-4 w-4 text-gray-500" />
							<span className="text-sm text-gray-700 truncate">{m.title}</span>
							<span className="ml-auto text-xs text-gray-500">{clamp(m.progress || 0, 0, 100)}%</span>
						</div>
						<div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
							<motion.div
								className={`h-full ${color}`}
								initial={{ width: 0 }}
								animate={{ width: `${clamp(m.progress || 0, 0, 100)}%` }}
								transition={{ duration: 0.8, ease: "easeOut" }}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function StatCard({ icon: Icon, label, value, subtext }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50 to-white p-4"
		>
			<div className="flex items-start gap-3">
				<div className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm">
					<Icon className="h-5 w-5 text-gray-700" />
				</div>
				<div>
					<div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
					<div className="text-xl font-semibold text-gray-900">{value}</div>
					{subtext ? <div className="text-xs text-gray-500 mt-1">{subtext}</div> : null}
				</div>
			</div>
		</motion.div>
	);
}

function BadgeCard({ badge }) {
	return (
		<motion.div
			key={badge.id}
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -12 }}
			className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
		>
			<div className="flex-shrink-0">
				<CircularProgress value={clamp(badge.progress, 0, 100)} size={48} stroke={6} />
			</div>
			<div className="min-w-0">
				<div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
					<Award className="h-4 w-4 text-amber-500" />
					<span className="truncate">{badge.title}</span>
				</div>
				<p className="text-xs text-gray-500 truncate">{badge.hint}</p>
			</div>
		</motion.div>
	);
}

function BadgesGallery({ badges = [] }) {
	const [expanded, setExpanded] = useState(false);
	const items = expanded ? badges : badges.slice(0, 4);
	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h4 className="text-lg font-semibold text-gray-900">Badges</h4>
					<p className="text-xs text-gray-500">Keep collecting milestones as you learn</p>
				</div>
				<button
					type="button"
					onClick={() => setExpanded((prev) => !prev)}
					className="text-xs font-medium text-blue-600 hover:text-blue-700"
				>
					{expanded ? "Show less" : "View all"}
				</button>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
				<AnimatePresence initial={false}>
					{items.map((badge) => (
						<BadgeCard key={badge.id} badge={badge} />
					))}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default function ProgressStats({ data }) {
	const { loading, error, data: shaped } = useProgressData(data);
	const overall = shaped.summary;
	const firstCourse = shaped.courses[0];

	const highlightStats = [
		{
			icon: Users,
			label: "Courses",
			value: overall.totalCourses,
			subtext: "Enrolled",
		},
		{
			icon: Briefcase,
			label: "Modules",
			value: `${overall.totalModules}`,
			subtext: `${overall.unlockedModules} unlocked`,
		},
		{
			icon: Clock,
			label: "Lessons",
			value: overall.totalLessons,
			subtext: `${overall.completedLessons} completed`,
		},
		{
			icon: TrendingUp,
			label: "Completion",
			value: `${overall.overallCompletion}%`,
			subtext: "Overall progress",
		},
	];

	return (
		<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
			<div className="flex flex-wrap items-center gap-3 justify-between">
				<div>
					<h3 className="text-2xl font-semibold text-gray-900">Your Progress Overview</h3>
					<p className="text-sm text-gray-500">Real-time snapshot of your learning journey</p>
				</div>
				<div className="flex items-center gap-2 text-xs text-gray-500">
					<TrendingUp className="h-4 w-4" />
					<span>Auto-refreshed</span>
				</div>
			</div>

			{error ? (
				<div className="p-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm">{error}</div>
			) : null}

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
				{highlightStats.map((stat) => (
					<StatCard key={stat.label} {...stat} />
				))}
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				<div className="col-span-1 xl:col-span-1 rounded-3xl border border-gray-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 flex flex-col items-center text-center">
					<CircularProgress value={overall.overallCompletion} />
					<div className="mt-4 text-sm text-gray-600">
						<span className="font-semibold text-gray-900">{overall.unlockedModules}</span> unlocked modules •{" "}
						<span className="font-semibold text-gray-900">{overall.lockedModules}</span> locked
					</div>
					<div className="mt-5 grid grid-cols-2 gap-4 w-full">
						<div className="rounded-2xl bg-white/70 border border-white p-3 text-left shadow-sm">
							<p className="text-xs text-gray-500">Credits (Earned/Redeemed)</p>
							<p className="text-lg font-semibold text-gray-900">{overall.creditsEarned} / {overall.creditsRedeemed}</p>
						</div>
						<div className="rounded-2xl bg-white/70 border border-white p-3 text-left shadow-sm">
							<p className="text-xs text-gray-500">Badges</p>
							<p className="text-lg font-semibold text-gray-900">{overall.badges?.length || 0}</p>
						</div>
					</div>
				</div>
				<div className="col-span-1 xl:col-span-2 rounded-3xl border border-gray-100 bg-white p-6 space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs uppercase tracking-wide text-gray-500">Current course</p>
							<h4 className="text-lg font-semibold text-gray-900">{firstCourse?.title || "Select a course to begin"}</h4>
						</div>
						<div className="text-xs text-gray-500">
							{firstCourse?.stats?.completedModules ?? 0}/{firstCourse?.stats?.totalModules ?? 0} modules
						</div>
					</div>
					<SegmentedModuleBars modules={firstCourse?.modules || []} />
					<div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 grid grid-cols-3 gap-4 text-xs text-gray-600">
						<div>
							<p className="font-semibold text-gray-900">{overall.totalModules}</p>
							<p>Total modules</p>
						</div>
						<div>
							<p className="font-semibold text-gray-900">{overall.inProgressModules}</p>
							<p>In-progress</p>
						</div>
						<div>
							<p className="font-semibold text-gray-900">{overall.lockedModules}</p>
							<p>Locked</p>
						</div>
					</div>
				</div>
			</div>

			<BadgesGallery badges={overall.badges} />
		</div>
	);
}
