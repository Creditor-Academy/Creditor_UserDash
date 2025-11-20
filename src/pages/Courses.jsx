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
  const [expandedCatalogId, setExpandedCatalogId] = useState(null);
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

  // Auto-expand first catalog when data is loaded
  useEffect(() => {
    if (loading || catalogs.length === 0) return;

    const catalogGroups = getCoursesByCatalog();
    const firstCatalogId = Object.keys(catalogGroups)[0];

    if (firstCatalogId && expandedCatalogId === null) {
      setExpandedCatalogId(firstCatalogId);
    }
  }, [loading, catalogs, catalogCoursesMap, accessibleCourseIds]);

  // Shimmer skeleton component for loading state
  const CourseCardSkeleton = () => (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video relative overflow-hidden bg-gray-200 animate-shimmer"></div>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="h-6 bg-gray-200 rounded-md mb-2 animate-shimmer"></div>
        <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2 animate-shimmer"></div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-4 bg-gray-200 rounded-md w-24 animate-shimmer"></div>
      </CardContent>
      <CardFooter className="pt-2 flex-shrink-0">
        <div className="h-10 bg-gray-200 rounded-md w-full animate-shimmer"></div>
      </CardFooter>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-4 sm:py-6 max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
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
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="p-6 bg-gray-100 animate-shimmer">
                    <div className="h-7 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </Card>
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

          <div className="space-y-6">
            {catalogEntries.length === 0 ? (
              <div className="text-center py-12">
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
                const isExpanded = expandedCatalogId === catalog.id;
                const accessibleCount = catalogCourses.filter(
                  c => c.isAccessible
                ).length;
                const totalCount = catalogCourses.length;

                return (
                  <div key={catalog.id}>
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                      <div
                        className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                        onClick={() =>
                          setExpandedCatalogId(isExpanded ? null : catalog.id)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                              <ShoppingBag size={24} />
                            </div>
                            <div>
                              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                                {catalog.name || 'Catalog'}
                              </h2>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                {catalog.description || ''}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-100 text-blue-700"
                                >
                                  {accessibleCount} of {totalCount} courses
                                  accessible
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-gray-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 sm:p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {catalogCourses.map(course => {
                              const courseId = getCanonicalCourseId(course);
                              return (
                                <div key={courseId} className="relative">
                                  <Card
                                    className={`overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col ${
                                      course.isLocked
                                        ? 'opacity-60 border-gray-300'
                                        : 'border-gray-200'
                                    }`}
                                  >
                                    <div className="aspect-video relative overflow-hidden">
                                      <img
                                        src={
                                          course.image ||
                                          course.thumbnail ||
                                          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000'
                                        }
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                      />
                                      {course.isLocked && (
                                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                          <div className="text-white text-center">
                                            <Lock className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-sm font-medium">
                                              Locked
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <CardHeader className="pb-3 flex-shrink-0">
                                      <CardTitle className="text-base sm:text-lg line-clamp-2">
                                        {course.title}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 flex-1">
                                      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <BookOpen
                                            size={12}
                                            className="sm:w-3.5 sm:h-3.5"
                                          />
                                          <span>
                                            {course.modulesCount ||
                                              course._count?.modules ||
                                              0}{' '}
                                            modules
                                          </span>
                                        </div>
                                      </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 flex-shrink-0">
                                      {course.isLocked ? (
                                        <Button
                                          variant="outline"
                                          className="w-full text-sm sm:text-base"
                                          asChild
                                        >
                                          <Link
                                            to={`/dashboard/catalog/${catalog.id}`}
                                          >
                                            <Lock size={16} className="mr-2" />
                                            View in Catalog
                                          </Link>
                                        </Button>
                                      ) : (
                                        <Link
                                          to={`/dashboard/courses/${courseId}/modules`}
                                          className="w-full"
                                        >
                                          <Button
                                            variant="default"
                                            className="w-full text-sm sm:text-base"
                                          >
                                            Continue Learning
                                          </Button>
                                        </Link>
                                      )}
                                    </CardFooter>
                                  </Card>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
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
