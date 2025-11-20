import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
  BookOpen,
  Clock,
  Filter,
  Search,
  Award,
  ChevronDown,
  ChevronRight,
  Lock,
  Play,
  FileText,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import {
  fetchUserCourses,
  fetchCourseModules,
} from '../services/courseService';
import { getCourseTrialStatus } from '../utils/trialUtils';
import TrialBadge from '../components/ui/TrialBadge';
import TrialExpiredDialog from '../components/ui/TrialExpiredDialog';
import { useCredits } from '../contexts/CreditsContext';
import { useUser } from '../contexts/UserContext';
import { getUnlockedModulesByUser } from '../services/modulesService';
import api from '../services/apiClient';
import {
  fetchAllCatalogs,
  fetchCatalogCourses,
} from '../services/catalogService';

export function Courses() {
  const { userProfile } = useUser();
  const [courses, setCourses] = useState([]); // Holds fully purchased courses
  const [accessibleCourseIds, setAccessibleCourseIds] = useState(new Set()); // Holds all accessible course IDs (from full purchase or module purchase)
  const [catalogs, setCatalogs] = useState([]);
  const [catalogCoursesMap, setCatalogCoursesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  // Helper function to get a single, consistent ID from a course object
  const getCanonicalCourseId = course => {
    if (!course) return null;
    const id = course.id || course.course_id || course._id;
    return id ? String(id) : null;
  };

  // Recording course IDs to filter out from My Courses
  const RECORDING_COURSE_IDS = [
    'a188173c-23a6-4cb7-9653-6a1a809e9914', // Become Private Recordings
    '7b798545-6f5f-4028-9b1e-e18c7d2b4c47', // Operate Private Recordings
    '199e328d-8366-4af1-9582-9ea545f8b59e', // Business Credit Recordings
    'd8e2e17f-af91-46e3-9a81-6e5b0214bc5e', // Private Merchant Recordings
    'd5330607-9a45-4298-8ead-976dd8810283', // Sovereignty 101 Recordings
    '814b3edf-86da-4b0d-bb8c-8a6da2d9b4df', // I Want Remedy Now Recordings
  ];

  useEffect(() => {
    const fetchAllData = async () => {
      if (!userProfile?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        // Step 1: Fetch all primary data in parallel
        const [userCourses, unlockedModules, allCatalogs] = await Promise.all([
          fetchUserCourses(true), // Get enrolled courses
          getUnlockedModulesByUser(userProfile.id), // Get module purchases
          fetchAllCatalogs(), // Get all catalogs
        ]);

        // Filter out recording courses from the user's purchased list
        const filteredUserCourses = userCourses.filter(
          course => !RECORDING_COURSE_IDS.includes(course.id)
        );
        setCourses(filteredUserCourses);

        // Step 2: Create a combined set of all accessible course IDs
        const purchasedCourseIds = new Set(
          filteredUserCourses.map(getCanonicalCourseId)
        );
        const courseIdsFromModules = new Set(
          unlockedModules.map(mod => getCanonicalCourseId(mod.course))
        );
        const allAccessibleCourseIds = new Set([
          ...purchasedCourseIds,
          ...courseIdsFromModules,
        ]);
        setAccessibleCourseIds(allAccessibleCourseIds);

        // Step 3: Fetch courses for all catalogs to build the map
        // NOTE: This can be slow if there are many catalogs. A future optimization
        // would be a backend endpoint that returns catalogs with their courses.
        const catalogToCourses = {};
        await Promise.all(
          allCatalogs.map(async catalog => {
            try {
              const catalogCourses = await fetchCatalogCourses(catalog.id);
              catalogToCourses[catalog.id] = catalogCourses;
            } catch (err) {
              catalogToCourses[catalog.id] = [];
            }
          })
        );
        setCatalogs(allCatalogs);
        setCatalogCoursesMap(catalogToCourses);
      } catch (err) {
        console.error('Error fetching learning materials:', err);
        setError('Failed to load your learning materials. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userProfile?.id]);

  // Organize courses by catalog based on the new unified logic
  const getCoursesByCatalog = () => {
    const catalogGroups = {};

    // Filter catalogs based on search term first
    const filteredCatalogs = searchTerm
      ? catalogs.filter(
          catalog =>
            catalog.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            catalog.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
      : catalogs;

    filteredCatalogs.forEach(catalog => {
      const coursesInThisCatalog = catalogCoursesMap[catalog.id] || [];
      if (coursesInThisCatalog.length === 0) return;

      // Check if any course in this catalog is accessible
      const hasAccessibleCourse = coursesInThisCatalog.some(course =>
        accessibleCourseIds.has(getCanonicalCourseId(course))
      );

      // Only show the catalog if it contains at least one accessible course
      if (hasAccessibleCourse) {
        catalogGroups[catalog.id] = {
          catalog,
          courses: coursesInThisCatalog.map(catalogCourse => {
            const courseId = getCanonicalCourseId(catalogCourse);
            const isAccessible = accessibleCourseIds.has(courseId);
            // Find the full user course data if it exists (for progress, trial status, etc.)
            const userCourseData = courses.find(
              c => getCanonicalCourseId(c) === courseId
            );

            return {
              ...catalogCourse,
              ...userCourseData, // Merge in progress, trial status, etc.
              isAccessible,
              isLocked: !isAccessible,
            };
          }),
        };
      }
    });

    return catalogGroups;
  };

  // Shimmer skeleton component for loading state
  const CourseCardSkeleton = () => (
    <div className="group flex flex-col border border-gray-200 rounded-2xl bg-white shadow-md overflow-hidden h-full">
      <div className="relative h-48 overflow-hidden bg-gray-200 animate-shimmer"></div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded-md mb-3 w-3/4 animate-shimmer"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full mb-2 animate-shimmer"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full mb-2 animate-shimmer"></div>
          <div className="h-4 bg-gray-200 rounded-md w-5/6 animate-shimmer"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-shimmer"></div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="h-10 bg-gray-200 rounded-md w-full animate-shimmer"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-4 sm:py-6 max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold">My Learning</h1>
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-full"
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Content
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const coursesByCatalog = getCoursesByCatalog();
  const catalogEntries = Object.values(coursesByCatalog);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container py-4 sm:py-6 max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">My Learning</h1>
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search catalogs..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogEntries.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium">
                  Your learning journey begins here
                </h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Purchase courses or modules from the catalog to see them here.
                </p>
                <Link to="/dashboard/catalog">
                  <Button>Browse Catalog</Button>
                </Link>
              </div>
            ) : (
              catalogEntries.map(({ catalog, courses: catalogCourses }) => {
                const accessibleCount = catalogCourses.filter(
                  c => c.isAccessible
                ).length;
                const totalCount = catalogCourses.length;

                return (
                  <Link
                    key={catalog.id}
                    to={`/dashboard/catalog/${catalog.id}`}
                    className="group flex flex-col border border-gray-200 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full hover:border-blue-200 hover:scale-[1.02]"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          catalog.thumbnail ||
                          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000'
                        }
                        alt={catalog.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {catalog.name}
                        </h2>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {catalog.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <BookOpen
                              size={14}
                              className="text-indigo-500 shrink-0"
                            />
                            {totalCount}{' '}
                            {totalCount === 1 ? 'course' : 'courses'}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium text-green-600">
                            <Layers
                              size={14}
                              className="text-green-500 shrink-0"
                            />
                            {accessibleCount} accessible
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 pt-0">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        View Catalog
                      </Button>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Courses;
