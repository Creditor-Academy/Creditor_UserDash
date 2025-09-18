import React, { useEffect, useState } from "react";
import { Video, PlayCircle, Shield, Lock, Briefcase, Store, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchUserCourses } from "@/services/courseService";

// Course IDs provided for recordings
const COURSE_IDS = {
  becomePrivate: "a188173c-23a6-4cb7-9653-6a1a809e9914",
  operatePrivate: "7b798545-6f5f-4028-9b1e-e18c7d2b4c47",
  businessCredit: "199e328d-8366-4af1-9582-9ea545f8b59e",
  privateMerchant: "d8e2e17f-af91-46e3-9a81-6e5b0214bc5e",
  sovereignty101: "d5330607-9a45-4298-8ead-976dd8810283",
};

export default function ClassRecording() {
  const navigate = useNavigate();

  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserCourses = async () => {
      try {
        const courses = await fetchUserCourses();
        const ids = new Set((courses || []).map((c) => c.id));
        setEnrolledCourseIds(ids);
      } catch (e) {
        // Fail silently; no cards will show if we cannot determine enrollment
        setEnrolledCourseIds(new Set());
      } finally {
        setLoading(false);
      }
    };
    loadUserCourses();
  }, []);

  const goToCourseModules = (courseId) => {
    navigate(`/dashboard/courses/${courseId}/modules`);
  };

  const cards = [
    {
      courseId: COURSE_IDS.becomePrivate,
      title: "Become Private Recordings",
      description:
        "Access on‑demand recordings focused on becoming private. Rewatch sessions anytime to reinforce key concepts.",
      action: () => goToCourseModules(COURSE_IDS.becomePrivate),
      actionText: "Watch Now",
    },
    {
      courseId: COURSE_IDS.operatePrivate,
      title: "Operate Private Recordings",
      description:
        "Gain exclusive access to Operate Private sessions for focused, on‑demand learning.",
      action: () => goToCourseModules(COURSE_IDS.operatePrivate),
      actionText: "Watch Now",
    },
    {
      courseId: COURSE_IDS.businessCredit,
      title: "Business Credit Recordings",
      description:
        "Explore recordings that walk through building and managing business credit the right way.",
      action: () => goToCourseModules(COURSE_IDS.businessCredit),
      actionText: "Watch Now",
    },
    {
      courseId: COURSE_IDS.privateMerchant,
      title: "Private Merchant Recordings",
      description:
        "Dive into private merchant recordings to master operations, compliance, and best practices.",
      action: () => goToCourseModules(COURSE_IDS.privateMerchant),
      actionText: "Watch Now",
    },
    {
      courseId: COURSE_IDS.sovereignty101,
      title: "Sovereignty 101 Recordings",
      description:
        "Explore the fundamental principles of digital sovereignty through comprehensive session recordings.",
      action: () => goToCourseModules(COURSE_IDS.sovereignty101),
      actionText: "Watch Now",
    },
  ];

  // Style and icon mapping per course (no video preview)
  const getCardStyle = (courseId) => {
    if (courseId === COURSE_IDS.becomePrivate) {
      return {
        Icon: Shield,
        tabBg: "bg-purple-600",
        tabRing: "ring-purple-300",
        leftAccent: "bg-purple-100",
        rightAccent: "bg-indigo-100",
      };
    }
    if (courseId === COURSE_IDS.operatePrivate) {
      return {
        Icon: Lock,
        tabBg: "bg-indigo-600",
        tabRing: "ring-indigo-300",
        leftAccent: "bg-indigo-100",
        rightAccent: "bg-blue-100",
      };
    }
    if (courseId === COURSE_IDS.businessCredit) {
      return {
        Icon: Briefcase,
        tabBg: "bg-amber-600",
        tabRing: "ring-amber-300",
        leftAccent: "bg-amber-100",
        rightAccent: "bg-orange-100",
      };
    }
    if (courseId === COURSE_IDS.privateMerchant) {
      return {
        Icon: Store,
        tabBg: "bg-emerald-600",
        tabRing: "ring-emerald-300",
        leftAccent: "bg-emerald-100",
        rightAccent: "bg-teal-100",
      };
    }
    return {
      Icon: Crown,
      tabBg: "bg-slate-700",
      tabRing: "ring-slate-300",
      leftAccent: "bg-slate-100",
      rightAccent: "bg-gray-100",
    };
  };

  return (
    <div className="p-4 sm:p-6 w-full max-w-5xl mx-auto">
      <div className="mb-2 flex items-center gap-2 text-2xl font-bold text-gray-800">
        <Video className="h-6 w-6 text-purple-500" />
        Class Recordings
      </div>
      <p className="text-gray-500 mt-1">Access past sessions at your convenience</p>

      {/* Recordings grid gated by enrollment */}
      <div className="mt-6">
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-sm text-gray-600">
            Loading your eligible recordings...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards
              .filter((card) => enrolledCourseIds.has(card.courseId))
              .map((card) => (
                (() => {
                  const style = getCardStyle(card.courseId);
                  const Icon = style.Icon;
                  return (
                    <div
                      key={card.courseId}
                      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all"
                    >
                      {/* Side color accents inspired by reference (behind content) */}
                      <div aria-hidden className="pointer-events-none absolute -left-6 top-10 h-24 w-24 rounded-xl rotate-[-8deg] opacity-50 z-0">
                        <div className={`h-full w-full rounded-xl ${style.leftAccent}`}></div>
                      </div>
                      <div aria-hidden className="pointer-events-none absolute -right-6 bottom-10 h-24 w-24 rounded-xl rotate-[8deg] opacity-50 z-0">
                        <div className={`h-full w-full rounded-xl ${style.rightAccent}`}></div>
                      </div>

                      {/* Top tab with icon (above accents) */}
                      <div className="relative px-4 pt-6 pb-2 z-10">
                        <div className="relative inline-flex">
                          <div className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-white text-xs font-semibold shadow ${style.tabBg} ring-1 ${style.tabRing}`}>
                            <Icon className="h-4 w-4 text-white" />
                            Recordings
                          </div>
                          {/* small notch */}
                          <div className="absolute left-0 -bottom-2 w-6 h-2 bg-black/10 blur-[2px] opacity-20 rounded-b" />
                        </div>
                      </div>

                      {/* Body (above accents) */}
                      <div className="relative px-4 pb-4 z-10">
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                          {card.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-3">{card.description}</p>

                        <div className="mt-4">
                          <button
                            onClick={card.action}
                            className="w-full inline-flex items-center justify-center h-10 rounded-md bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white border border-slate-300 text-sm font-medium transition-colors shadow-sm"
                          >
                            {card.actionText}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ))}
          </div>
        )}

        {/* If none matched */}
        {!loading &&
          cards.filter((c) => enrolledCourseIds.has(c.courseId)).length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-sm text-gray-600">
              No eligible recordings available for your enrolled courses yet.
            </div>
          )}
      </div>

      {/* Sovereignty 101 section (temporarily disabled) */}
      {/**
      <div className="mt-6 bg-[#f8f9ff] border-2 border-[#e4e4fb] rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-start sm:items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-full text-purple-700">
              <PlayCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Sovereignty 101 Recordings</h3>
              <p className="text-gray-600 text-sm mt-1">
                Explore the fundamental principles of digital sovereignty through this comprehensive session recording.
              </p>
            </div>
          </div>
          <div className="sm:self-center">
            <a
              href="#"
              className="inline-block bg-[#6b5cff] hover:bg-[#5b4bde] text-white text-sm font-medium px-4 py-2 rounded-md transition shadow-md w-full sm:w-auto text-center"
            >
              Coming Soon
            </a>
          </div>
        </div>
      </div>
      */}
    </div>
  );
}
