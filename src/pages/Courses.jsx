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
  FolderOpen,
  CheckCircle,
  Loader2,
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
import { getMyPurchasesByCatalog } from '../services/myPurchasesService';
import api from '../services/apiClient';

export function Courses() {
  const { userProfile } = useUser();

  // State for catalog-based view (replacing course/lesson tabs)
  const [catalogPurchases, setCatalogPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCatalogs, setFilteredCatalogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Legacy state (kept for compatibility, may be removed later)
  const location = useLocation();
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [courseModules, setCourseModules] = useState({});
  const [selectedExpiredCourse, setSelectedExpiredCourse] = useState(null);
  const [showTrialDialog, setShowTrialDialog] = useState(false);
  /**
   * Fetch user purchases organized by catalog
   *
   * This replaces the old course/lesson fetching logic.
   * Now we show catalogs that contain user's purchased items (modules, courses, or full catalogs).
   */
  useEffect(() => {
    const fetchPurchases = async () => {
      if (!userProfile?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Fetch purchases organized by catalog
        // This service aggregates modules, courses, and catalogs the user has purchased
        const purchases = await getMyPurchasesByCatalog(userProfile.id);

        console.log('[Courses] Fetched catalog purchases:', purchases);

        setCatalogPurchases(purchases);
        setFilteredCatalogs(purchases);
      } catch (err) {
        console.error('[Courses] Error fetching purchases:', err);
        setError('Failed to load your purchases. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [userProfile?.id]);

  /**
   * Filter catalogs based on search term and category
   *
   * This replaces the old course filtering logic.
   * Now we filter the catalogs that contain user's purchases.
   */
  useEffect(() => {
    let results = catalogPurchases;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        purchase =>
          purchase.catalog.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          purchase.catalog.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter(
        purchase =>
          (purchase.catalog.category || 'General') === selectedCategory
      );
    }

    setFilteredCatalogs(results);
  }, [catalogPurchases, searchTerm, selectedCategory]);

  /**
   * Get categories from catalog purchases for filter dropdown
   */
  const categories = Array.from(
    new Set(
      catalogPurchases.map(purchase => purchase.catalog.category || 'General')
    )
  );

  /**
   * Get purchase type badge info
   *
   * Returns badge color and text based on purchase type
   */
  const getPurchaseTypeBadge = purchaseType => {
    switch (purchaseType) {
      case 'CATALOG':
        return {
          color: 'bg-green-100 text-green-800',
          text: 'Full Catalog',
        };
      case 'COURSE':
        return {
          color: 'bg-blue-100 text-blue-800',
          text: 'Course Purchase',
        };
      case 'MODULE':
        return {
          color: 'bg-purple-100 text-purple-800',
          text: 'Module Purchase',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          text: 'Purchased',
        };
    }
  };

  // Shimmer skeleton component for loading state
  const CourseCardSkeleton = () => (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video relative overflow-hidden bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
      </div>

      <CardHeader className="pb-3 flex-shrink-0">
        <div className="h-6 bg-gray-200 rounded-md mb-2 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded-md w-full mb-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded-md w-24 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex flex-col gap-2 flex-shrink-0">
        <div className="h-10 bg-gray-200 rounded-md w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
        </div>
      </CardFooter>
    </Card>
  );

  /**
   * Loading state - Show skeleton cards
   */
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1">
          <div className="container py-8 max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                <p className="text-gray-500 mt-1">
                  Your purchased catalogs, courses, and modules
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white animate-pulse"
                >
                  <div className="aspect-video w-full bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  /**
   * Error state - Show error message
   */
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1">
          <div className="container py-8 max-w-7xl px-4 sm:px-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading your purchases
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /**
   * Main render - Display catalogs with user purchases
   *
   * This replaces the old course/lesson tabs view.
   * Now shows catalogs that contain user's purchased items.
   */
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="container py-8 max-w-7xl px-4 sm:px-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-500 mt-1">
                Your purchased catalogs, courses, and modules
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search catalogs..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Catalog Cards Grid */}
          {filteredCatalogs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="mx-auto max-w-md">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No purchases yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Purchase modules, courses, or catalogs to see them here.
                </p>
                <Link to="/dashboard/catalog">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Catalogs
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogs.map(purchase => {
                const { catalog, purchaseType, unlockedItems } = purchase;
                const badge = getPurchaseTypeBadge(purchaseType);

                // Get course count for display
                const courseCount =
                  catalog._count?.catalog_courses ||
                  catalog.catalog_courseCount ||
                  catalog.courseCount ||
                  0;

                return (
                  <div
                    key={catalog.id}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-200"
                  >
                    {/* Catalog Image */}
                    <div className="aspect-video w-full relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      {catalog.thumbnail ? (
                        <img
                          src={catalog.thumbnail}
                          alt={catalog.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={e => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
                        style={{ display: catalog.thumbnail ? 'none' : 'flex' }}
                      >
                        <FolderOpen className="h-16 w-16 opacity-80 text-gray-400" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
                    </div>

                    {/* Catalog Content */}
                    <div className="p-5 space-y-3">
                      {/* Title and Badge */}
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 flex-1">
                          {catalog.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${badge.color}`}
                        >
                          {badge.text}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {catalog.description}
                      </p>

                      {/* Course Count and Unlocked Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{courseCount} courses</span>
                        </span>
                        {purchaseType === 'MODULE' && (
                          <span className="flex items-center gap-1 text-purple-600 font-medium">
                            <span>
                              {unlockedItems.moduleIds.length} modules
                            </span>
                          </span>
                        )}
                        {purchaseType === 'COURSE' && (
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <span>
                              {unlockedItems.courseIds.length} courses
                            </span>
                          </span>
                        )}
                      </div>

                      {/* View Catalog Button */}
                      <div className="pt-2">
                        <Button
                          className="w-full h-11 bg-gray-800 hover:bg-gray-900 text-white font-medium transition-all duration-200"
                          asChild
                        >
                          <Link
                            to={`/dashboard/catalog/${catalog.id}`}
                            state={{
                              catalog: catalog,
                              purchaseContext: purchase, // Pass purchase context
                            }}
                            className="flex items-center justify-center"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Catalog
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Trial Expired Dialog (kept for compatibility) */}
      <TrialExpiredDialog
        isOpen={showTrialDialog}
        onClose={() => setShowTrialDialog(false)}
        course={selectedExpiredCourse}
      />
    </div>
  );
}

export default Courses;
