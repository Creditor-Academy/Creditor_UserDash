import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { BookOpen, Clock, Search, Award, Lock, Play, FileText, Layers, ShoppingBag, Sparkles } from "lucide-react";
import { Input } from "../components/ui/input";
import { fetchUserCourses, fetchCourseModules } from '../services/courseService';
import { getCourseTrialStatus } from '../utils/trialUtils';
import TrialBadge from '../components/ui/TrialBadge';
import TrialExpiredDialog from '../components/ui/TrialExpiredDialog';
import { useUser } from '../contexts/UserContext';
import { getUnlockedModulesByUser } from '../services/modulesService';
import { fetchUserUnlockedCatalogs, fetchCatalogCourses } from '../services/catalogService';
import api from '../services/apiClient';

const MOCK_HIERARCHY = [
  {
    id: "catalog-operate",
    name: "Operate Private Collection",
    description: "In-depth playbooks for asset protection, private business ops, and trust workflows.",
    heroImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600",
    tag: "Premium Bundle",
    courses: [
      {
        id: "course-operate",
        title: "Operate Private",
        description: "Hands-on course to help you lawfully conduct business and protect assets.",
        thumbnail: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?q=80&w=1200",
        modules: [
          {
            id: "module-operate-foundations",
            title: "Structuring Foundations",
            description: "Lay the groundwork with entity selection and compliant filings.",
            duration: "35 min",
            lessons: [
              { id: "lesson-operate-101", title: "Welcome & Orientation", duration: "07:30" },
              { id: "lesson-operate-entities", title: "Setting Up Entities", duration: "18:40" },
              { id: "lesson-operate-compliance", title: "Maintaining Compliance", duration: "09:15" },
            ],
          },
          {
            id: "module-operate-advanced",
            title: "Advanced Trust Workflows",
            description: "Learn how to orchestrate layered trusts and custodians.",
            duration: "48 min",
            lessons: [
              { id: "lesson-advanced-overview", title: "Trust Archetypes" },
              { id: "lesson-advanced-funding", title: "Funding Strategies" },
              { id: "lesson-advanced-maintenance", title: "Maintenance Rituals" },
            ],
          },
          {
            id: "module-operate-defense",
            title: "Defense Playbook",
            description: "Respond rapidly to audits, disputes, and account freezes.",
            duration: "29 min",
            lessons: [
              { id: "lesson-defense-audit", title: "Audit Prep" },
              { id: "lesson-defense-litigate", title: "Litigation Shield" },
            ],
          },
        ],
      },
      {
        id: "course-business-trust",
        title: "Business Trust",
        description: "Create and operate business trusts with clarity.",
        thumbnail: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200",
        modules: [
          {
            id: "module-business-setup",
            title: "Forming the Trust",
            description: "Documentation, filings, and trustees.",
            duration: "24 min",
            lessons: [
              { id: "lesson-business-overview", title: "Overview" },
              { id: "lesson-business-filers", title: "Filers & Roles" },
            ],
          },
        ],
      },
      {
        id: "course-growth",
        title: "Free Financial Growth Consultation",
        description: "Roadmap to smarter money management.",
        thumbnail: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1200",
        modules: [
          {
            id: "module-growth-basics",
            title: "Mindset Basics",
            description: "Set the vision for generational wealth.",
            duration: "18 min",
            lessons: [
              { id: "lesson-growth-intro", title: "Mindset Reset" },
              { id: "lesson-growth-plan", title: "Planning Canvas" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "catalog-credit",
    name: "Credit Mastery Catalog",
    description: "Everything you need to master personal and business credit instruments.",
    heroImage: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600",
    tag: "Coming Soon",
    courses: [
      {
        id: "course-credit",
        title: "Credit Masterclass",
        description: "Rebuild, repair, and leverage credit.",
        thumbnail: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200",
        modules: [],
      },
    ],
  },
];

const MOCK_PURCHASED_LESSON_ID = "lesson-operate-entities";

const computeUnlockState = (purchasedLessonId, hierarchy) => {
  if (!purchasedLessonId || !Array.isArray(hierarchy)) return null;

  for (const catalog of hierarchy) {
    for (const course of catalog?.courses || []) {
      for (const module of course?.modules || []) {
        const lessonMatch = (module?.lessons || []).find((lesson) => lesson.id === purchasedLessonId);
        if (lessonMatch) {
          return {
            catalogId: catalog.id,
            courseId: course.id,
            moduleId: module.id,
            lessonId: lessonMatch.id,
          };
        }
      }
    }
  }

  return null;
};

export function Courses() {
  const { userProfile } = useUser();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [progressFilter, setProgressFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [courseModules, setCourseModules] = useState({});
  const [selectedExpiredCourse, setSelectedExpiredCourse] = useState(null);
  const [showTrialDialog, setShowTrialDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  const [myLessons, setMyLessons] = useState([]);
  const [loadingUnlockedContent, setLoadingUnlockedContent] = useState(false);
  const [unlockedModulesLoaded, setUnlockedModulesLoaded] = useState(false);
  const [userCatalogs, setUserCatalogs] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [catalogsLoaded, setCatalogsLoaded] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [catalogCoursesMap, setCatalogCoursesMap] = useState({});
  // Track modules currently being marked as complete
  const [markingCompleteIds, setMarkingCompleteIds] = useState(new Set());
  // Cache for complete module data to avoid repeated API calls
  const [completeModulesCache, setCompleteModulesCache] = useState({});
  // Track modules currently loading for Start Module
  const [loadingStartModuleIds, setLoadingStartModuleIds] = useState(new Set());
  const demoUnlockState = useMemo(
    () => computeUnlockState(MOCK_PURCHASED_LESSON_ID, MOCK_HIERARCHY),
    []
  );
  const demoVisibleCatalogs = useMemo(
    () =>
      demoUnlockState
        ? MOCK_HIERARCHY.filter((catalog) => catalog.id === demoUnlockState.catalogId)
        : [],
    [demoUnlockState]
  );
  const demoCatalog = demoVisibleCatalogs[0];
  const demoCourses = demoCatalog?.courses || [];
  const demoCourse = demoCourses.find((course) => course.id === demoUnlockState?.courseId);
  const demoModules = demoCourse?.modules || [];
  const demoModule = demoModules.find((module) => module.id === demoUnlockState?.moduleId);
  const demoLessons = demoModule?.lessons || [];

  // Helper to format seconds as HH:MM:SS
  function formatTime(secs) {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function parseDuration(durationStr) {
    if (!durationStr) return 0;
    // Format: "60 min"
    const minMatch = durationStr.match(/(\d+)\s*min/);
    if (minMatch) return parseInt(minMatch[1], 10);

    // Format: "1h 45m"
    const hourMinMatch = durationStr.match(/(\d+)\s*h(?:ours?)?\s*(\d+)?\s*m?/i);
    if (hourMinMatch) {
      const hours = parseInt(hourMinMatch[1], 10);
      const mins = hourMinMatch[2] ? parseInt(hourMinMatch[2], 10) : 0;
      return hours * 60 + mins;
    }

    // Format: "15:30" (mm:ss or hh:mm)
    const colonMatch = durationStr.match(/(\d+):(\d+)/);
    if (colonMatch) {
      const first = parseInt(colonMatch[1], 10);
      const second = parseInt(colonMatch[2], 10);
      // If first > 10, assume mm:ss, else hh:mm
      if (first > 10) return first; // mm:ss, ignore seconds
      return first * 60 + second; // hh:mm
    }

    // Format: "8 min read"
    const minReadMatch = durationStr.match(/(\d+)\s*min read/);
    if (minReadMatch) return parseInt(minReadMatch[1], 10);

    return 0;
  }
  // Get time spent for all courses from localStorage
  const getCourseTimes = () => {
    const times = {};
    courses.forEach(course => {
      const t = localStorage.getItem(`course_time_${course.id}`);
      times[course.id] = t ? parseInt(t, 10) : 0;
    });
    return times;
  };
  const [courseTimes, setCourseTimes] = useState(getCourseTimes());
  // Update times when component mounts and when tab regains focus
  useEffect(() => {
    const updateTimes = () => setCourseTimes(getCourseTimes());
    window.addEventListener("focus", updateTimes);
    return () => window.removeEventListener("focus", updateTimes);
  }, []);
  // Update times when route changes to /courses
  useEffect(() => {
    if (location.pathname === "/courses") {
      setCourseTimes(getCourseTimes());
    }
  }, [location.pathname]);

  // Recording course IDs to filter out from My Courses
  const RECORDING_COURSE_IDS = [
    "a188173c-23a6-4cb7-9653-6a1a809e9914", // Become Private Recordings
    "7b798545-6f5f-4028-9b1e-e18c7d2b4c47", // Operate Private Recordings
    "199e328d-8366-4af1-9582-9ea545f8b59e", // Business Credit Recordings
    "d8e2e17f-af91-46e3-9a81-6e5b0214bc5e", // Private Merchant Recordings
    "d5330607-9a45-4298-8ead-976dd8810283", // Sovereignty 101 Recordings
    "814b3edf-86da-4b0d-bb8c-8a6da2d9b4df", // I Want Remedy Now Recordings
  ];

  const loadUnlockedModules = useCallback(async ({ force = false } = {}) => {
    if (!userProfile?.id) return;
    if (loadingUnlockedContent) return;
    if (unlockedModulesLoaded && !force) return;

    setLoadingUnlockedContent(true);
    try {
      console.log('[UI] Fetch unlocked modules for', userProfile.id);
      const data = await getUnlockedModulesByUser(userProfile.id);
      console.log('[UI] Unlocked modules count', Array.isArray(data) ? data.length : 'not-array');
      setMyLessons(data);
      setUnlockedModulesLoaded(true);

      if (Array.isArray(data) && data.length > 0) {
        const uniqueCourseIds = [
          ...new Set(
            data
              .map((lesson) => lesson.module?.course_id || lesson.course?.id || lesson.course_id)
              .filter(Boolean)
          ),
        ];

        if (uniqueCourseIds.length > 0) {
          console.log('[UI] Starting background pre-loading of module data for', uniqueCourseIds.length, 'courses');
          Promise.all(
            uniqueCourseIds.map(async (courseId) => {
              try {
                const modules = await fetchCourseModules(courseId);
                return { courseId, modules };
              } catch (error) {
                console.warn(`Failed to pre-load modules for course ${courseId}:`, error);
                return { courseId, modules: [] };
              }
            })
          )
            .then((courseModulesResults) => {
              const newCache = {};
              courseModulesResults.forEach(({ courseId, modules }) => {
                (modules || []).forEach((module) => {
                  const cacheKey = `${courseId}-${module.id}`;
                  newCache[cacheKey] = module;
                });
              });

              if (Object.keys(newCache).length > 0) {
                setCompleteModulesCache((prev) => ({ ...prev, ...newCache }));
                console.log('[UI] Background cached', Object.keys(newCache).length, 'modules');
              }
            })
            .catch((error) => {
              console.warn('[UI] Background pre-loading failed:', error);
            });
        }
      }
    } catch (error) {
      console.error('[UI] Unlocked modules fetch error', error);
      setMyLessons([]);
    } finally {
      setLoadingUnlockedContent(false);
    }
  }, [userProfile?.id, loadingUnlockedContent, unlockedModulesLoaded]);

  const handleStartModule = useCallback(
    async (moduleAccess) => {
      const module = moduleAccess?.module;
      const courseId =
        module?.course_id ||
        moduleAccess?.course?.id ||
        moduleAccess?.course_id ||
        moduleAccess?.courseId;
      const moduleId = module?.id || moduleAccess?.module_id || moduleAccess?.id;

      if (!moduleId || !courseId) {
        console.warn('[UI] Missing course or module id for start module action', { moduleAccess });
        return;
      }

      const idStr = String(moduleId);
      if (loadingStartModuleIds.has(idStr)) return;

      setLoadingStartModuleIds((prev) => {
        const next = new Set(prev);
        next.add(idStr);
        return next;
      });

      try {
        let completeModule = null;
        const cacheKey = `${courseId}-${moduleId}`;

        if (completeModulesCache[cacheKey]) {
          completeModule = completeModulesCache[cacheKey];
        } else {
          const courseModules = await fetchCourseModules(courseId);
          completeModule = (courseModules || []).find((m) => m.id === moduleId);

          if (completeModule) {
            setCompleteModulesCache((prev) => ({
              ...prev,
              [cacheKey]: completeModule,
            }));
          }
        }

        const primaryModule = completeModule || module;
        let fullUrl = primaryModule?.resource_url || module?.resource_url;

        if (fullUrl && !fullUrl.startsWith('http')) {
          fullUrl = `${import.meta.env.VITE_API_BASE_URL}${fullUrl}`;
        }

        if (fullUrl && fullUrl.includes('s3.amazonaws.com') && !fullUrl.startsWith('https://')) {
          fullUrl = fullUrl.replace('http://', 'https://');
        }

        if (fullUrl) {
          window.open(fullUrl, '_blank', 'noopener,noreferrer');
        } else {
          console.error('No resource URL found for module:', primaryModule || module);
          alert('No content URL available for this lesson. Please contact support.');
        }
      } catch (error) {
        console.error('Error fetching module data:', error);
        alert('Failed to load lesson content. Please try again.');
      } finally {
        setLoadingStartModuleIds((prev) => {
          const next = new Set(prev);
          next.delete(idStr);
          return next;
        });
      }
    },
    [completeModulesCache, fetchCourseModules, loadingStartModuleIds]
  );

  const handleMarkModuleComplete = useCallback(
    async (moduleAccess) => {
      const module = moduleAccess?.module;
      const courseId =
        module?.course_id ||
        moduleAccess?.course?.id ||
        moduleAccess?.course_id ||
        moduleAccess?.courseId;
      const moduleId = module?.id || moduleAccess?.module_id || moduleAccess?.id;

      if (!moduleId || !courseId) return;

      const idStr = String(moduleId);
      if (markingCompleteIds.has(idStr)) return;

      setMarkingCompleteIds((prev) => {
        const next = new Set(prev);
        next.add(idStr);
        return next;
      });

      try {
        console.log('Marking module as complete:', courseId, moduleId);
        await api.post(`/api/course/${courseId}/modules/${moduleId}/mark-complete`);

        setMyLessons((prev) =>
          prev.map((lesson) => {
            const lessonModuleId = lesson.module_id || lesson.module?.id;
            if (lessonModuleId === moduleId) {
              const existingProgress = Array.isArray(lesson?.module?.user_module_progress)
                ? lesson.module.user_module_progress
                : [];

              const progressUpdated = existingProgress.some((entry) => entry?.completed)
                ? existingProgress
                : [...existingProgress, { completed: true, updated_at: new Date().toISOString() }];

              return {
                ...lesson,
                completed: true,
                module: {
                  ...lesson.module,
                  user_module_progress: progressUpdated,
                },
              };
            }
            return lesson;
          })
        );

        console.log('Module marked as complete successfully');
      } catch (error) {
        console.error('Failed to mark module as complete', error);
        alert('Failed to mark lesson as complete. Please try again.');
      } finally {
        setMarkingCompleteIds((prev) => {
          const next = new Set(prev);
          next.delete(idStr);
          return next;
        });
      }
    },
    [markingCompleteIds]
  );

  const loadUserCatalogs = useCallback(async () => {
    if (!userProfile?.id) return;
    if (loadingCatalogs || catalogsLoaded) return;

    setLoadingCatalogs(true);
    setCatalogError("");

    try {
      const data = await fetchUserUnlockedCatalogs(userProfile.id);
      const normalizedCatalogs = (Array.isArray(data) ? data : []).map((entry) => {
        const catalogPayload =
          entry?.catalog ||
          entry?.catalog_data ||
          entry?.catalogDetails ||
          entry?.catalog_detail ||
          entry?.catalogInfo ||
          entry;

        if (!catalogPayload) return null;

        const rawCourses =
          catalogPayload.catalog_courses ||
          catalogPayload.courses ||
          entry?.catalog_courses ||
          entry?.courses ||
          [];

        const normalizedCourses = Array.isArray(rawCourses)
          ? rawCourses
              .map((item) => {
                const coursePayload = item?.course || item?.course_details || item?.courseData || item;
                const courseId =
                  coursePayload?.id ||
                  coursePayload?._id ||
                  coursePayload?.courseId ||
                  coursePayload?.course_id ||
                  item?.course_id ||
                  item?.id;

                if (!courseId) return null;

                return {
                  id: courseId,
                  title: coursePayload?.title || item?.title || 'Course',
                  description: coursePayload?.description || item?.description || '',
                  thumbnail: coursePayload?.thumbnail || coursePayload?.image || item?.thumbnail || '',
                };
              })
              .filter(Boolean)
          : [];

        const catalogId =
          catalogPayload?.id ||
          catalogPayload?._id ||
          catalogPayload?.catalog_id ||
          entry?.catalog_id ||
          entry?.id;

        if (!catalogId) return null;

        return {
          id: catalogId,
          name: catalogPayload?.name || catalogPayload?.title || entry?.name || 'Catalog',
          description: catalogPayload?.description || catalogPayload?.summary || entry?.description || '',
          image: catalogPayload?.thumbnail || catalogPayload?.image || entry?.thumbnail || '',
          tag: catalogPayload?.category || catalogPayload?.tag || '',
          courseCount:
            normalizedCourses.length ||
            catalogPayload?.catalog_courseCount ||
            catalogPayload?._count?.catalog_courses ||
            entry?.catalog_courseCount ||
            entry?.courseCount ||
            0,
          courses: normalizedCourses,
        };
      }).filter(Boolean);

      setUserCatalogs(normalizedCatalogs);

      const initialCoursesMap = {};
      normalizedCatalogs.forEach((catalog) => {
        if (catalog.courses?.length) {
          initialCoursesMap[catalog.id] = catalog.courses;
        }
      });

      if (Object.keys(initialCoursesMap).length > 0) {
        setCatalogCoursesMap((prev) => ({ ...prev, ...initialCoursesMap }));
      }

      const catalogsMissingCourses = normalizedCatalogs.filter(
        (catalog) => catalog.id && (!catalog.courses || catalog.courses.length === 0)
      );

      if (catalogsMissingCourses.length > 0) {
        Promise.all(
          catalogsMissingCourses.map(async (catalog) => {
            try {
              const courses = await fetchCatalogCourses(catalog.id);
              return [catalog.id, courses];
            } catch (error) {
              console.warn(`[UI] Failed to fetch courses for catalog ${catalog.id}:`, error);
              return [catalog.id, []];
            }
          })
        )
          .then((entries) => {
            setCatalogCoursesMap((prev) => {
              const next = { ...prev };
              entries.forEach(([catalogId, courses]) => {
                if (Array.isArray(courses) && courses.length > 0) {
                  next[catalogId] = courses;
                }
              });
              return next;
            });

            setUserCatalogs((prev) =>
              prev.map((catalog) => {
                const entry = entries.find(([catalogId]) => catalogId === catalog.id);
                if (entry && Array.isArray(entry[1]) && entry[1].length > 0) {
                  return {
                    ...catalog,
                    courseCount: entry[1].length,
                    courses: entry[1],
                  };
                }
                return catalog;
              })
            );
          })
          .catch((error) => {
            console.warn('[UI] Background catalog course fetch failed:', error);
          });
      }
    } catch (error) {
      console.error('[UI] User catalogs fetch error', error);
      setCatalogError('Failed to load your catalogs. Please try again later.');
      setUserCatalogs([]);
    } finally {
      setLoadingCatalogs(false);
      setCatalogsLoaded(true);
    }
  }, [userProfile?.id, loadingCatalogs, catalogsLoaded]);

  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);

      if ((tab === 'lessons' || tab === 'modules') && userProfile?.id) {
        loadUnlockedModules();
      }

      if (tab === 'catalogs' && userProfile?.id) {
        loadUserCatalogs();
      }
    },
    [loadUnlockedModules, loadUserCatalogs, userProfile?.id]
  );

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Fetch courses with modules included in a single API call
        const data = await fetchUserCourses(true);
        
        // Filter out recording courses from My Courses
        const filteredData = data.filter(course => !RECORDING_COURSE_IDS.includes(course.id));
        
        // Process each course to add modulesCount, totalDuration, and trial status
        const processedCourses = filteredData.map(course => {
          const modules = course.modules || [];
          // Sum durations using 'estimated_duration' (in minutes)
          const totalDurationMins = modules.reduce((sum, m) => sum + (parseInt(m.estimated_duration, 10) || 0), 0);
          // Convert to seconds for formatTime
          const totalDurationSecs = totalDurationMins * 60;
          
          // Get trial status
          const trialStatus = getCourseTrialStatus(course);
          
          return {
            ...course,
            modulesCount: course._count?.modules || 0, 
            totalDurationSecs,
            image: course.thumbnail || course.image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000",
            trialStatus
          };
        });
        
        setCourses(processedCourses);
        setFilteredCourses(processedCourses);
        
        // Pre-populate courseModules for expanded view
        const modulesMap = {};
        data.forEach(course => {
          if (course.modules) {
            modulesMap[course.id] = course.modules;
          }
        });
        setCourseModules(prev => ({
          ...prev,
          ...modulesMap
        }));
        
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);


  // Update trial status every minute for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCourses(prevCourses => 
        prevCourses.map(course => ({
          ...course,
          trialStatus: getCourseTrialStatus(course)
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleCourseClick = (course) => {
    if (course.trialStatus.isInTrial && course.trialStatus.isExpired) {
      setSelectedExpiredCourse(course);
      setShowTrialDialog(true);
      return;
    }
    // Navigate to course normally
    window.location.href = `/dashboard/courses/${course.id}/modules`;
  };

  const handleCloseTrialDialog = () => {
    setShowTrialDialog(false);
    setSelectedExpiredCourse(null);
  };

  const handleViewModules = (courseId) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }
    setExpandedCourseId(courseId);
    
    // Modules are already loaded in the initial fetch
    // No need for additional API calls
  };

  useEffect(() => {
    let results = courses;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply progress filter
    if (progressFilter !== "all") {
      results = results.filter(course => {
        const progress = course.progress || 0;
        switch (progressFilter) {
          case "not-started":
            return progress === 0;
          case "in-progress":
            return progress > 0 && progress < 100;
          case "completed":
            return progress === 100;
          default:
            return true;
        }
      });
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      results = results.filter(course => course.category === categoryFilter);
    }

    setFilteredCourses(results);
  }, [courses, searchTerm, progressFilter, categoryFilter]);

  const modulesByCourse = useMemo(() => {
    if (!Array.isArray(myLessons) || myLessons.length === 0) {
      return [];
    }

    const grouped = new Map();

    myLessons.forEach((access) => {
      const module = access?.module || {};
      const course = access?.course || module?.course || {};
      const courseId = course?.id || module?.course_id || access?.course_id;

      if (!courseId) return;

      if (!grouped.has(courseId)) {
        grouped.set(courseId, {
          courseId,
          courseTitle: course?.title || 'Course',
          courseDescription: course?.description || '',
          courseThumbnail: course?.thumbnail || course?.image || module?.course_thumbnail || '',
          modules: [],
        });
      }

      grouped.get(courseId).modules.push(access);
    });

    return Array.from(grouped.values()).map((group) => {
      const sortedModules = [...group.modules].sort((a, b) => {
        const orderA = Number(a?.module?.order) || 0;
        const orderB = Number(b?.module?.order) || 0;
        return orderA - orderB;
      });

      const completedCount = sortedModules.filter((lesson) => {
        const progress = lesson?.module?.user_module_progress;
        if (Array.isArray(progress) && progress.length > 0) {
          return progress.some((item) => item?.completed === true);
        }
        return lesson?.completed === true;
      }).length;

      return {
        ...group,
        modules: sortedModules,
        completedCount,
        totalCount: sortedModules.length,
        progress: sortedModules.length > 0 ? Math.round((completedCount / sortedModules.length) * 100) : 0,
      };
    });
  }, [myLessons]);

  const totalModulesUnlocked = useMemo(
    () => modulesByCourse.reduce((sum, group) => sum + (group.totalCount || 0), 0),
    [modulesByCourse]
  );

  const tabsConfig = useMemo(
    () => [
      { id: 'courses', label: 'Courses', icon: BookOpen, isLoading: false },
      {
        id: 'lessons',
        label: 'My Lessons',
        icon: Award,
        isLoading: loadingUnlockedContent && activeTab === 'lessons',
      },
      {
        id: 'modules',
        label: 'Modules',
        icon: Layers,
        isLoading: loadingUnlockedContent && activeTab === 'modules',
      },
      {
        id: 'catalogs',
        label: 'Catalogs',
        icon: ShoppingBag,
        isLoading: loadingCatalogs && activeTab === 'catalogs',
      },
    ],
    [activeTab, loadingUnlockedContent, loadingCatalogs]
  );

  useEffect(() => {
    let selector = '';

    switch (activeTab) {
      case 'courses':
        selector = '.course-card';
        break;
      case 'lessons':
        selector = '.lesson-card';
        break;
      case 'modules':
        selector = '.module-group-card';
        break;
      case 'catalogs':
        selector = '.catalog-card';
        break;
      default:
        selector = '';
    }

    if (!selector) return;

    const cards = document.querySelectorAll(selector);
    cards.forEach((card, index) => {
      card.classList.add('opacity-0');
      setTimeout(() => {
        card.classList.add('animate-fade-in');
        card.classList.remove('opacity-0');
      }, 80 * index);
    });
  }, [activeTab, filteredCourses, myLessons, modulesByCourse, userCatalogs]);

  const renderCourseCard = (course) => (
    <div key={course.id} className="course-card opacity-0">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-200">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={course.image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          {/* Trial Badge Overlay */}
          {course.trialStatus.isInTrial && (
            <div className="absolute top-3 left-3">
              <TrialBadge timeRemaining={course.trialStatus.timeRemaining} />
            </div>
          )}
          {/* Lock Overlay for Expired Trials */}
          {course.trialStatus.isInTrial && course.trialStatus.isExpired && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <Lock className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Trial Expired</p>
              </div>
            </div>
          )}
        </div>

        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-base sm:text-lg line-clamp-2">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm sm:text-base">{course.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 flex-1">
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>{course.modulesCount || 0} modules</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex flex-col gap-2 flex-shrink-0">
          <div className="flex gap-2 w-full">
            <Link to={`/dashboard/courses/${course.id}/modules`} className="flex-1">
              <Button variant="default" className="w-full text-sm sm:text-base">
                Continue Learning
              </Button>
            </Link>
          </div>

          {/* Trial Status Info */}
          {course.trialStatus.isInTrial && !course.trialStatus.isExpired && (
            <div className="text-xs text-center text-gray-600">
              Trial ends: {new Date(course.trialStatus.subscriptionEnd).toLocaleDateString()}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );



  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-4 sm:py-6 max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground text-sm sm:text-base">Loading courses...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-4 sm:py-6 max-w-7xl px-4 sm:px-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs sm:text-sm font-medium text-red-800">Error loading courses</h3>
                  <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container py-4 sm:py-6 max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">My Learning</h1>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} className="mr-2" />
                Filters
              </Button> */}
            </div>
          </div>

          {demoUnlockState && (
            <section className="mb-10">
              <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-blue-100/30 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Demo mode</p>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Single-lesson unlock preview</h2>
                    <p className="text-sm text-gray-600">
                      Full hierarchy stays visible while only the purchased path can expand.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-inner">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Lesson ID: {demoUnlockState.lessonId}
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <span>Level 1 · Catalog</span>
                      <span className="text-gray-400 normal-case">Only the catalog that owns the purchased lesson is visible.</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {demoVisibleCatalogs.map((catalog) => (
                        <div
                          key={catalog.id}
                          className="relative rounded-2xl border border-blue-200 bg-white/90 p-5 shadow-sm"
                        >
                          <div className="flex flex-col gap-3">
                            {catalog.tag && (
                              <div>
                                <Badge className="bg-blue-600/10 text-blue-700">{catalog.tag}</Badge>
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{catalog.name}</h3>
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{catalog.description}</p>
                            </div>
                            <div className="rounded-2xl border border-dashed border-blue-100 bg-blue-50/50 p-4">
                              <p className="text-xs font-semibold uppercase text-blue-600">Includes</p>
                              <p className="text-sm text-gray-700">{catalog.courses.length} courses</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <span>Level 2 · Courses</span>
                      {demoCatalog && (
                        <span className="text-gray-400 normal-case">Inside {demoCatalog.name}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      {demoCourses.map((course) => {
                        const locked = course.id !== demoUnlockState.courseId;
                        return (
                          <div
                            key={course.id}
                            className={`relative rounded-2xl border p-5 transition-all ${
                              locked
                                ? 'border-dashed border-gray-200 bg-white/70 text-gray-500'
                                : 'border-blue-200 bg-white shadow-md shadow-blue-100/70'
                            }`}
                            aria-disabled={locked}
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                <img
                                  src={
                                    course.thumbnail ||
                                    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200"
                                  }
                                  alt={course.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="text-base font-semibold">{course.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                              <Layers className="h-4 w-4" />
                              <span>{course.modules.length} modules</span>
                            </div>
                            {locked && (
                              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/85 backdrop-blur-sm text-gray-600">
                                <Lock className="mb-1 h-5 w-5" />
                                <span className="text-xs font-semibold">Locked</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <span>Level 3 · Modules</span>
                      {demoCourse && (
                        <span className="text-gray-400 normal-case">Inside {demoCourse.title}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {demoModules.map((module) => {
                        const locked = module.id !== demoUnlockState.moduleId;
                        return (
                          <div
                            key={module.id}
                            className={`relative rounded-2xl border p-5 transition-all ${
                              locked
                                ? 'border-dashed border-gray-200 bg-white/70 text-gray-500'
                                : 'border-blue-200 bg-white shadow-md shadow-blue-100/70'
                            }`}
                            aria-disabled={locked}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="text-base font-semibold">{module.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{module.description}</p>
                              </div>
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                {module.duration}
                              </Badge>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                              <BookOpen className="h-4 w-4" />
                              <span>{module.lessons.length} lessons</span>
                            </div>
                            {locked && (
                              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/85 backdrop-blur-sm text-gray-600">
                                <Lock className="mb-1 h-5 w-5" />
                                <span className="text-xs font-semibold">Locked</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <span>Level 4 · Lessons</span>
                      {demoModule && (
                        <span className="text-gray-400 normal-case">Inside {demoModule.title}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {demoLessons.map((lesson) => {
                        const locked = lesson.id !== demoUnlockState.lessonId;
                        return (
                          <div
                            key={lesson.id}
                            className={`relative rounded-2xl border p-4 transition-all ${
                              locked
                                ? 'border-dashed border-gray-200 bg-white/70 text-gray-500'
                                : 'border-blue-200 bg-white shadow-md shadow-blue-100/70'
                            }`}
                            aria-disabled={locked}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{lesson.title}</p>
                                {lesson.duration && (
                                  <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                                )}
                              </div>
                              {!locked && (
                                <Button size="sm" className="gap-1">
                                  <Play className="h-4 w-4" />
                                  Continue
                                </Button>
                              )}
                            </div>
                            {locked && (
                              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/85 backdrop-blur-sm text-gray-600">
                                <Lock className="mb-1 h-5 w-5" />
                                <span className="text-xs font-semibold">Locked</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="mb-6">
            <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-white/80 p-1 shadow-sm backdrop-blur-sm">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
              <button
                    key={tab.id}
                    className={`relative flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.isLoading && (
                      <span className="ml-1 inline-flex items-center justify-center">
                        <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></span>
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-white"></div>
                )}
              </button>
                );
              })}
            </div>
          </div>


          {/* Filters */}
          {/* {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
                  <select
                    value={progressFilter}
                    onChange={(e) => setProgressFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Progress</option>
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Business Law">Business Law</option>
                    <option value="Legal Skills">Legal Skills</option>
                  </select>
                </div>
              </div>
            </div>
          )} */}

          {activeTab === 'courses' && (
            filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course) => renderCourseCard(course))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <h3 className="text-base sm:text-lg font-medium">No courses found</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Try adjusting your search or filter criteria</p>
              </div>
            )
          )}

          {activeTab === 'catalogs' && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-4 text-xs sm:text-sm text-amber-700">
                <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold">Catalog collections you own</p>
                  <p className="text-amber-600/90">
                    {loadingCatalogs && !catalogsLoaded
                      ? 'Fetching your catalog purchases...'
                      : userCatalogs.length > 0
                        ? `You have unlocked ${userCatalogs.length} catalog${userCatalogs.length === 1 ? '' : 's'}. Dive back into curated learning paths.`
                        : 'Unlock curated collections to see them here.'}
                  </p>
                </div>
              </div>

              {loadingCatalogs && !catalogsLoaded ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-amber-200 bg-white py-16 text-sm text-gray-600">
                  <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                  Loading your catalogs...
                </div>
              ) : catalogError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {catalogError}
                </div>
              ) : userCatalogs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {userCatalogs.map((catalog) => {
                    const courses =
                      catalogCoursesMap[catalog.id] && catalogCoursesMap[catalog.id].length > 0
                        ? catalogCoursesMap[catalog.id]
                        : catalog.courses || [];
                    const visibleCourses = courses.slice(0, 3);
                    const remainingCount = Math.max(courses.length - visibleCourses.length, 0);

                    return (
                      <div key={catalog.id} className="catalog-card opacity-0">
                        <Card className="flex h-full flex-col justify-between overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                          <div className="flex flex-col gap-5 p-6">
                            <div className="flex items-start gap-4">
                              <div className="hidden h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 shadow-sm sm:block">
                                {catalog.image ? (
                                  <img
                                    src={catalog.image}
                                    alt={catalog.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-white">
                                    <ShoppingBag size={18} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{catalog.name}</h3>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{catalog.description}</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                  <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                                    {catalog.courseCount} course{catalog.courseCount === 1 ? '' : 's'}
                                  </Badge>
                                  {catalog.tag && (
                                    <Badge variant="outline" className="border-amber-200 text-amber-700">
                                      {catalog.tag}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-xl border border-dashed border-amber-100 bg-amber-50/60 p-4">
                              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Included courses</p>
                              {visibleCourses.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {visibleCourses.map((course) => (
                                    <span
                                      key={course.id || course.title}
                                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-700 shadow-sm"
                                    >
                                      {course.title || 'Course'}
                                    </span>
                                  ))}
                                  {remainingCount > 0 && (
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-600 shadow-sm">
                                      +{remainingCount} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <p className="mt-2 text-xs text-amber-700/80">
                                  Courses will appear once the catalog syncs with your account.
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-6 py-4">
                            <span className="text-xs font-medium text-gray-600">Purchased</span>
                            {catalog.id ? (
                              <Link to={`/dashboard/catalog/${catalog.id}`} className="inline-flex">
                                <Button size="sm" variant="default">
                                  View catalog
                                </Button>
                              </Link>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                View catalog
                              </Button>
                            )}
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-base sm:text-lg font-medium">No catalogs purchased yet</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Explore curated collections in the catalog to unlock bundled learning experiences.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs sm:text-sm text-indigo-700">
                <Layers className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold">Your unlocked modules</p>
                  <p className="text-indigo-600/90">
                    {loadingUnlockedContent && !unlockedModulesLoaded
                      ? 'Checking your module library...'
                      : totalModulesUnlocked > 0
                        ? `Access ${totalModulesUnlocked} module${totalModulesUnlocked === 1 ? '' : 's'} across ${modulesByCourse.length} course${modulesByCourse.length === 1 ? '' : 's'}.`
                        : 'Unlock modules individually or via catalogs to see them here.'}
                  </p>
                </div>
              </div>

              {loadingUnlockedContent && !unlockedModulesLoaded ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-indigo-200 bg-white py-16 text-sm text-gray-600">
                  <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                  Loading your modules...
                </div>
              ) : modulesByCourse.length > 0 ? (
                <div className="space-y-6">
                  {modulesByCourse.map((group) => (
                    <div key={group.courseId} className="module-group-card opacity-0">
                      <Card className="overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex flex-col gap-6 p-6">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-1 items-start gap-4">
                              <div className="hidden h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/80 to-indigo-500/80 shadow-sm sm:block">
                                {group.courseThumbnail ? (
                                  <img
                                    src={group.courseThumbnail}
                                    alt={group.courseTitle}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-white">
                                    <BookOpen size={20} />
                                  </div>
                                )}
                              </div>
            <div>
                                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{group.courseTitle}</h3>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{group.courseDescription}</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                    {group.totalCount} module{group.totalCount === 1 ? '' : 's'}
                                  </Badge>
                                  <Badge variant="outline" className="border-green-200 text-green-700">
                                    {group.completedCount} completed
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="w-full max-w-[220px] rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-indigo-700">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">Progress</span>
                                <span className="font-semibold">{group.progress}%</span>
                              </div>
                              <Progress value={group.progress} className="mt-2 h-2 bg-white" />
                              <p className="mt-2 text-[11px] text-indigo-600/80">
                                Keep learning to unlock next modules and badges.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {group.modules.map((moduleAccess) => {
                              const module = moduleAccess.module;
                              const moduleId = module?.id;
                              const courseId = module?.course_id || group.courseId;
                              const cacheKey = `${courseId}-${moduleId}`;
                              const completeModule = completeModulesCache[cacheKey];
                              const displayModule = completeModule || module;
                              const progressEntries = displayModule?.user_module_progress;
                              const isCompleted =
                                Array.isArray(progressEntries) && progressEntries.some((entry) => entry?.completed);

                              return (
                                <div
                                  key={`${group.courseId}-${moduleAccess.module_id}`}
                                  className="group flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm transition-all duration-300 hover:border-blue-500 hover:shadow-md"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {displayModule?.title || module?.title}
                                      </p>
                                      <p className="mt-1 text-xs text-muted-foreground line-clamp-3">
                                        {displayModule?.description || module?.description}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={isCompleted ? 'default' : 'outline'}
                                      className={isCompleted ? '' : 'border-blue-200 text-blue-600'}
                                    >
                                      {isCompleted ? 'Completed' : 'Unlocked'}
                                    </Badge>
                                  </div>

                                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} />
                                      {module?.estimated_duration || 60} min
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <BookOpen size={12} />
                                      Order {module?.order || '—'}
                                    </span>
                                  </div>

                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <Button
                                      size="sm"
                                      className="min-w-[120px] flex-1 disabled:opacity-60"
                                      disabled={loadingStartModuleIds.has(String(moduleId))}
                                      onClick={() => handleStartModule(moduleAccess)}
                                    >
                                      {loadingStartModuleIds.has(String(moduleId)) ? (
                                        <>
                                          <Clock size={14} className="mr-2 animate-spin" />
                                          Loading
                                        </>
                                      ) : (
                                        <>
                                          <Play size={14} className="mr-2" />
                                          Start
                                        </>
                                      )}
                                    </Button>
                                    <Link
                                      to={`/dashboard/courses/${courseId}/modules/${moduleId}/assessments`}
                                      className="min-w-[120px] flex-1"
                                    >
                                      <Button size="sm" variant="outline" className="w-full">
                                        <FileText size={14} className="mr-2" />
                                        Assessment
                                      </Button>
                                    </Link>
                                    {!isCompleted && (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="min-w-[120px] flex-1 disabled:opacity-60"
                                        disabled={markingCompleteIds.has(String(moduleId))}
                                        onClick={() => handleMarkModuleComplete(moduleAccess)}
                                      >
                                        {markingCompleteIds.has(String(moduleId)) ? 'Marking...' : 'Mark complete'}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-base sm:text-lg font-medium">No modules unlocked yet</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Unlock modules from course pages or explore bundled options in the catalog.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs sm:text-sm text-blue-700">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold">Unlocked Lessons</p>
                  <p className="text-blue-600/90">
                    {loadingUnlockedContent
                      ? 'Fetching your available lessons...'
                      : myLessons.length > 0
                        ? `You have access to ${myLessons.length} lesson${myLessons.length === 1 ? '' : 's'}. Pick up where you left off.`
                        : 'Purchase modules or catalogs to unlock lessons tailored to your journey.'}
                  </p>
                </div>
              </div>

              {loadingUnlockedContent ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-blue-200 bg-white py-16 text-sm text-gray-600">
                  <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  Loading your lessons...
                </div>
              ) : (
                (() => {
                  const combined = myLessons;
                  if (!combined || combined.length === 0) {
                    return (
                      <div className="text-center py-10">
                        <h3 className="text-base sm:text-lg font-medium">No lessons unlocked yet</h3>
                        <p className="text-muted-foreground text-sm sm:text-base">Unlock lessons from the catalog or course pages.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                      {combined.map((access) => {
                        const module = access.module;
                        const courseId =
                          access.module?.course_id || access.course?.id || access.course_id;
                        const cacheKey = `${courseId}-${module?.id}`;
                        const completeModule = completeModulesCache[cacheKey];
                        const displayModule = completeModule || module;
                        const progressEntries = displayModule?.user_module_progress;
                        const isCompleted =
                          Array.isArray(progressEntries) && progressEntries.some((entry) => entry?.completed);
                        
                        return (
                          <div key={`${access.user_id}-${access.module_id}`} className="lesson-card h-full opacity-0">
                            <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                              <div className="relative aspect-video overflow-hidden">
                                <img
                                  src={
                                    displayModule?.thumbnail ||
                                    module?.thumbnail ||
                                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"
                                  }
                                  alt={displayModule?.title || module?.title || 'Lesson'}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                                {isCompleted && (
                                  <div className="absolute left-2 top-2">
                                    <div className="rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white shadow-sm">
                                      Completed
                                    </div>
                                  </div>
                                )}
                                <div className="absolute right-2 top-2">
                                  <div className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-gray-800 shadow-sm">
                                    {access.course?.title || 'Course'}
                                  </div>
                                </div>
                            </div>
                              
                              <div className="flex min-h-[170px] flex-grow flex-col px-6 pb-2 pt-4">
                                <CardHeader className="px-0 pt-0 pb-2">
                                  <CardTitle className="min-h-[56px] text-lg line-clamp-2">
                                    {displayModule?.title || module?.title}
                                  </CardTitle>
                                  <CardDescription className="min-h-[60px] text-sm line-clamp-3">
                                    {displayModule?.description || module?.description}
                                  </CardDescription>
                            </CardHeader>
                                <CardContent className="space-y-3 px-0 pb-0 pt-0">
                                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <BookOpen size={14} />
                                      <span>Order: {module?.order || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock size={14} />
                                      <span>{module?.estimated_duration || 60} min</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    <span>Course: {access.course?.title || 'Course'}</span>
                                  </div>
                                </CardContent>
                              </div>
                              
                              <div className="mt-auto px-6 pb-4">
                                <CardFooter className="flex flex-col gap-2 p-0">
                              <Button 
                                    className="w-full disabled:opacity-60"
                                    disabled={loadingStartModuleIds.has(String(module?.id))}
                                    onClick={() => handleStartModule(access)}
                                  >
                                    {loadingStartModuleIds.has(String(module?.id)) ? (
                                      <>
                                        <Clock size={16} className="mr-2 animate-spin" />
                                        Loading...
                                      </>
                                    ) : (
                                      <>
                                <Play size={16} className="mr-2" />
                                Start Module
                                      </>
                                    )}
                              </Button>
                                  <Link to={`/dashboard/courses/${courseId}/modules/${module?.id}/assessments`} className="w-full">
                                <Button variant="outline" className="w-full">
                                  <FileText size={16} className="mr-2" />
                                  Start Assessment
                                </Button>
                              </Link>
                                  {!isCompleted ? (
                                    <Button
                                      variant="secondary"
                                      className="w-full disabled:opacity-60"
                                      disabled={markingCompleteIds.has(String(module?.id))}
                                      onClick={() => handleMarkModuleComplete(access)}
                                    >
                                      {markingCompleteIds.has(String(module?.id)) ? 'Marking...' : 'Mark as Complete'}
                                    </Button>
                                  ) : (
                                    <div className="flex w-full items-center justify-center">
                                      <Badge className="px-3 py-1">Completed</Badge>
                                    </div>
                                  )}
                            </CardFooter>
                              </div>
                          </Card>
                        </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Trial Expired Dialog */}
      <TrialExpiredDialog 
        isOpen={showTrialDialog}
        onClose={handleCloseTrialDialog}
        course={selectedExpiredCourse}
      />
    </div>
  );
}

export default Courses;