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
				lockedModules: totals.lockedModules,
				totalLessons: totals.totalLessons,
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

function CircularProgress({ value = 0, size = 140, stroke = 10, compact = false }) {
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
					<div className={`${compact ? "text-lg" : "text-2xl"} font-bold text-gray-900`}>{clamped}%</div>
					<div className={`${compact ? "text-[10px]" : "text-xs"} text-gray-500`}>
						{compact ? "Completed" : "Overall completion"}
					</div>
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
			className="rounded-2xl bg-gray-50 border border-gray-100 p-6"
		>
			<div className="flex items-center gap-3">
				<div className="p-2 rounded-lg bg-white border border-gray-100">
					<Icon className="h-5 w-5 text-gray-700" />
				</div>
				<div>
					<div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
					<div className="text-xl font-semibold text-gray-900">{value}</div>
				</div>
			</div>
			{subtext ? <div className="mt-2 text-xs text-gray-500">{subtext}</div> : null}
		</motion.div>
	);
}

function BadgesGallery({ badges = [] }) {
	const [expanded, setExpanded] = useState(false);
	const items = expanded ? badges : badges.slice(0, 3);
	return (
		<div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-7 shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<h4 className="text-lg font-semibold text-gray-900">Badges</h4>
				<button
					type="button"
					onClick={() => setExpanded((v) => !v)}
					className="text-xs text-blue-600 hover:underline"
				>
					{expanded ? "Show less" : "View all"}
				</button>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
				<AnimatePresence initial={false}>
					{items.map((b) => (
						<motion.div
							key={b.id}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="rounded-2xl border border-gray-100 p-5 bg-gray-50/60 group relative"
						>
							<div className="flex flex-col items-center text-center gap-3">
								<div className="flex items-center gap-2">
									<Award className="h-4 w-4 text-amber-500" />
									<div className="text-sm font-medium text-gray-900" title={b.hint}>
										{b.title}
									</div>
								</div>
								<div className="relative" title={b.hint}>
									<CircularProgress value={clamp(b.progress, 0, 100)} size={82} stroke={8} compact />
								</div>
								<div className="text-xs text-gray-600 leading-relaxed max-w-[140px]">{b.hint}</div>
							</div>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default function ProgressStats({ data }) {
	const { error, data: shaped } = useProgressData(data);
	const overall = shaped.summary;
	const firstCourse = shaped.courses[0];

	return (
		<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
			<div className="flex items-center justify-between mb-8 md:mb-10">
				<h3 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">Your Progress Overview</h3>
				<div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
					<TrendingUp className="h-4 w-4" />
					<span>Real‑time metrics</span>
				</div>
			</div>

			{error ? (
				<div className="p-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm">{error}</div>
			) : null}

			<div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
				{/* Left column */}
				<div className="xl:col-span-5 space-y-8">
					<div className="flex flex-col items-center justify-center bg-gradient-to-t from-sky-50/40 via-white to-white rounded-3xl border border-gray-100 p-8">
					<CircularProgress value={overall.overallCompletion} />
						<div className="mt-4 text-base text-gray-600">
							<span className="font-semibold text-gray-900">{overall.unlockedModules}</span> unlocked •{" "}
							<span className="font-semibold text-gray-900">{overall.lockedModules}</span> locked
						</div>
					</div>

					{/* Current course */}
					<div>
						<div className="flex items-center gap-2 mb-2">
							<BookOpen className="h-5 w-5 text-gray-700" />
							<div className="text-sm text-gray-600">Current course</div>
						</div>
						<div className="rounded-3xl border border-gray-100 p-5 md:p-6 shadow-sm bg-white">
							<div className="flex items-center justify-between mb-4">
								<div className="text-lg font-semibold text-gray-900 truncate">{firstCourse?.title || "—"}</div>
								<div className="text-sm text-gray-500">
									{firstCourse?.stats?.completedModules ?? 0}/{firstCourse?.stats?.totalModules ?? 0} modules
								</div>
							</div>
							<SegmentedModuleBars modules={firstCourse?.modules || []} />
							<div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
								<div className="flex items-center gap-1">
									<span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span> Completed
								</div>
								<div className="flex items-center gap-1">
									<span className="inline-block h-2 w-2 rounded-full bg-amber-400"></span> In‑progress
								</div>
								<div className="flex items-center gap-1">
									<span className="inline-block h-2 w-2 rounded-full bg-rose-400"></span> Locked
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right: Clean stat cards */}
				<div className="xl:col-span-7 space-y-8">
					<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
						<StatCard icon={Users} label="Courses" value={`${overall.totalCourses}`} />
						<StatCard
							icon={Briefcase}
							label="Modules (E/U/L)"
							value={`${overall.totalModules} / ${overall.unlockedModules} / ${overall.lockedModules}`}
						/>
						<StatCard
							icon={Clock}
							label="Lessons (E/U/L)"
							value={`${overall.totalLessons} / ${overall.unlockedLessons} / ${overall.lockedLessons}`}
						/>
						<StatCard icon={TrendingUp} label="Completion" value={`${overall.overallCompletion}%`} />
						<StatCard icon={Award} label="Credits (E/R)" value={`${overall.creditsEarned} / ${overall.creditsRedeemed}`} />
						<StatCard icon={CircleDot} label="Badge tracks" value={`${overall.badges?.length || 0}`} />
					</div>

					<div className="grid grid-cols-1 xl:grid-cols-1">
						<BadgesGallery badges={overall.badges} />
					</div>
				</div>
			</div>

		</div>
	);
}
