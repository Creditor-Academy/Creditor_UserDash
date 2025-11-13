import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Search,
  Loader2,
  FolderOpen,
  Star,
  Gem,
  Video,
  Award,
  ShoppingCart,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAllCatalogs as fetchAllCatalogsPrimary } from '@/services/catalogService';
import { fetchUserCourses } from '@/services/courseService';
import {
  getCatalogCourses,
  fetchAllCatalogs as fetchAllCatalogsFallback,
} from '@/services/instructorCatalogService';
import { getUnlockedModulesByUser } from '@/services/modulesService';
import CreditPurchaseModal from '@/components/credits/CreditPurchaseModal';
import { useCredits } from '@/contexts/CreditsContext';
import { useUser } from '@/contexts/UserContext';
import api from '@/services/apiClient';

export function CatalogPage() {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userCourses, setUserCourses] = useState([]);
  const [catalogCourseIdsMap, setCatalogCourseIdsMap] = useState({});
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] =
    useState(false);
  const [selectedCatalogToBuy, setSelectedCatalogToBuy] = useState(null);
  const [buyDetailsOpen, setBuyDetailsOpen] = useState(false);
  const [purchaseNotice, setPurchaseNotice] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [unlockedModules, setUnlockedModules] = useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { userProfile } = useUser();
  const {
    balance: creditsBalance,
    credits: creditsAlt,
    unlockContent,
    refreshBalance,
  } = (typeof useCredits === 'function' ? useCredits() : {}) || {};

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoading(true);
        let data = [];
        try {
          data = await fetchAllCatalogsPrimary();
        } catch (primaryErr) {
          // swallow and try fallback
        }
        if (!Array.isArray(data) || data.length === 0) {
          try {
            data = await fetchAllCatalogsFallback();
          } catch (fallbackErr) {
            // if fallback also fails, rethrow to trigger error UI
            throw fallbackErr;
          }
        }
        // Use the courseCount already set in fetchAllCatalogs; fallback may not include counts
        setCatalogs(data || []);
        // Preload catalog courses for buy-logic
        try {
          const entries = await Promise.all(
            (data || []).map(async c => {
              try {
                const courses = await getCatalogCourses(c.id);
                const ids = (courses || [])
                  .map(
                    course =>
                      course?.id ||
                      course?._id ||
                      course?.courseId ||
                      course?.course_id
                  )
                  .filter(Boolean);
                return [c.id, new Set(ids)];
              } catch {
                return [c.id, new Set()];
              }
            })
          );
          const map = {};
          for (const [k, v] of entries) map[k] = v;
          setCatalogCourseIdsMap(map);
        } catch {}
      } catch (err) {
        console.error('Error fetching catalogs:', err);
        setError('Failed to load catalogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  // Fetch user courses to check enrollment status
  useEffect(() => {
    const fetchUserCoursesData = async () => {
      try {
        const courses = await fetchUserCourses();
        setUserCourses(courses || []);
      } catch (err) {
        console.error('Error fetching user courses:', err);
        setUserCourses([]);
      }
    };

    fetchUserCoursesData();
  }, []);

  // Fetch unlocked modules to check for individual lesson purchases
  useEffect(() => {
    const fetchUnlockedModules = async () => {
      if (!userProfile?.id) return;

      try {
        // Fetch unlocked modules (same API as My Lessons page)
        const modules = await getUnlockedModulesByUser(userProfile.id);
        console.log(`[DEBUG] Fetched unlocked modules:`, modules);
        console.log(`[DEBUG] First module structure:`, modules[0]);
        setUnlockedModules(modules || []);
      } catch (err) {
        console.error('Error fetching unlocked modules:', err);
        setUnlockedModules([]);
      }
    };

    fetchUnlockedModules();
  }, [userProfile?.id]);

  const categories = Array.from(
    new Set((catalogs || []).map(catalog => catalog.category || 'General'))
  );

  const filteredCatalogs = (catalogs || []).filter(catalog => {
    const matchesSearch =
      catalog.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      catalog.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      (catalog.category || 'General') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Helper function to check if user has purchased the entire catalog (enrolled in ALL courses)
  const hasPurchasedEntireCatalog = catalog => {
    const userCourseIds = new Set(
      (userCourses || [])
        .map(c => c?.id || c?._id || c?.courseId || c?.course_id)
        .filter(Boolean)
    );
    const catalogCourseIds = catalogCourseIdsMap[catalog.id] || new Set();

    // Check if user is enrolled in ALL courses within this catalog
    const catalogCourseIdsList = Array.from(catalogCourseIds);
    const enrolledCoursesInCatalog = catalogCourseIdsList.filter(courseId =>
      userCourseIds.has(courseId)
    );

    console.log(
      `[DEBUG] Catalog ${catalog.name}: ${enrolledCoursesInCatalog.length}/${catalogCourseIdsList.length} courses enrolled`
    );

    // User has purchased entire catalog if enrolled in all courses
    return (
      catalogCourseIdsList.length > 0 &&
      enrolledCoursesInCatalog.length === catalogCourseIdsList.length
    );
  };

  // Helper function to check if user is enrolled in catalog or has purchased any lessons
  const isEnrolledInCatalog = catalog => {
    console.log(
      `[DEBUG] Checking enrollment for catalog: ${catalog.name} (ID: ${catalog.id})`
    );

    // Check if user is enrolled in any course in this catalog
    const userCourseIds = new Set(
      (userCourses || [])
        .map(c => c?.id || c?._id || c?.courseId || c?.course_id)
        .filter(Boolean)
    );
    const catalogCourseIds = catalogCourseIdsMap[catalog.id] || new Set();

    console.log(`[DEBUG] User course IDs:`, Array.from(userCourseIds));
    console.log(`[DEBUG] Catalog course IDs:`, Array.from(catalogCourseIds));

    // Check for course enrollment
    for (const id of catalogCourseIds) {
      if (userCourseIds.has(id)) {
        console.log(
          `[DEBUG] User is enrolled in course ${id} - hiding buy button`
        );
        return true;
      }
    }

    // Check for individual lesson purchases from courses in this catalog
    console.log(`[DEBUG] Unlocked modules count:`, unlockedModules.length);
    console.log(`[DEBUG] First module structure:`, unlockedModules[0]);

    const catalogCourseIdsList = Array.from(catalogCourseIds);
    const hasLessonPurchasesFromCatalog = unlockedModules.some(module => {
      // Get course_id from the module data
      const courseId = module.course_id || module.courseId;
      console.log(`[DEBUG] Module ${module.module_id} -> Course ${courseId}`);

      const belongsToCatalog =
        courseId && catalogCourseIdsList.includes(courseId);
      if (belongsToCatalog) {
        console.log(
          `[DEBUG] Module ${module.module_id} belongs to catalog course ${courseId}`
        );
      }

      return belongsToCatalog;
    });

    console.log(
      `[DEBUG] Has lesson purchases from catalog:`,
      hasLessonPurchasesFromCatalog
    );

    if (hasLessonPurchasesFromCatalog) {
      console.log(
        `[DEBUG] User has purchased lessons from this catalog - hiding buy button`
      );
      return true;
    }

    console.log(
      `[DEBUG] No enrollment or lesson purchases - showing buy button`
    );
    return false;
  };

  // Helper function to calculate catalog price in credits
  const getCatalogPriceCredits = catalog => {
    // Free catalogs and class recordings should never show a price or buy button
    if (isFreeCourse(catalog) || isClassRecording(catalog)) return 0;

    const catalogName = (catalog.name || '').toLowerCase();

    // Specific pricing for premium catalogs
    if (
      catalogName.includes('become private') &&
      catalogName.includes('sov 101')
    ) {
      return 14000; // Become Private + SOV 101
    } else if (catalogName.includes('operate private')) {
      return 14000; // Operate Private
    } else if (
      (catalogName.includes('business credit') ||
        catalogName.includes('i want')) &&
      (catalogName.includes('remedy') ||
        catalogName.includes('private merchant'))
    ) {
      return 14000; // Business credit + I want Remedy Now + Private Merchant
    } else if (catalogName.includes('financial freedom')) {
      return 14000; // Financial Freedom
    } else if (catalogName.includes('master class')) {
      return 69; // Master Class
    }

    // Default price for all other catalogs
    return 2800;
  };

  // Handle buy catalog click
  const handleBuyCatalogClick = catalog => {
    const price = getCatalogPriceCredits(catalog);
    const currentBalance = Number.isFinite(creditsBalance)
      ? creditsBalance
      : (creditsAlt ?? 0);
    const courseIdsSet = catalogCourseIdsMap[catalog.id] || new Set();
    const coursesCount = courseIdsSet.size || 0;

    setSelectedCatalogToBuy({ ...catalog, priceCredits: price, coursesCount });

    if ((currentBalance || 0) >= (price || 0) && price > 0) {
      // User has enough credits - show purchase confirmation
      setBuyDetailsOpen(true);
    } else {
      // User doesn't have enough credits - show insufficient credits modal
      setShowInsufficientCreditsModal(true);
    }
  };

  const closeAllModals = () => {
    setBuyDetailsOpen(false);
    setShowCreditsModal(false);
    setShowInsufficientCreditsModal(false);
    setSelectedCatalogToBuy(null);
    setIsPurchasing(false);
    setIsDescriptionExpanded(false);
  };

  // 1. Free Courses
  const freeCourseNames = ['Roadmap Series', 'Start Your Passive Income Now'];
  const isFreeCourse = catalog =>
    freeCourseNames.some(
      name => (catalog.name || '').trim().toLowerCase() === name.toLowerCase()
    );
  const freeCourses = filteredCatalogs.filter(isFreeCourse);

  // 2. Master Class
  const isMasterClass = catalog =>
    (catalog.name || '').toLowerCase().includes('master class');
  const masterClasses = filteredCatalogs.filter(isMasterClass);

  // 3. Premium Courses (Become Private + SOV 101, Operate Private, Business credit + I want, Financial Freedom)
  const premiumCourseNames = [
    'Become Private',
    'SOV 101',
    'Operate Private',
    'Business credit',
    'I want',
    'Financial Freedom',
  ];
  const isPremiumCourse = catalog =>
    premiumCourseNames.some(name =>
      (catalog.name || '').toLowerCase().includes(name.toLowerCase())
    );

  // Custom sorting function for premium courses
  const getPremiumCourseOrder = catalogName => {
    const name = catalogName.toLowerCase();
    if (name.includes('become private') || name.includes('sov 101')) {
      return 1; // First priority
    } else if (name.includes('operate private')) {
      return 2; // Second priority
    } else if (name.includes('business credit') || name.includes('i want')) {
      return 3; // Third priority
    } else if (name.includes('financial freedom')) {
      return 4; // Fourth priority
    }
    return 5; // Default for any other premium courses
  };

  const premiumCatalogs = filteredCatalogs
    .filter(
      catalog =>
        isPremiumCourse(catalog) &&
        !isFreeCourse(catalog) &&
        !isMasterClass(catalog)
    )
    .sort(
      (a, b) => getPremiumCourseOrder(a.name) - getPremiumCourseOrder(b.name)
    );

  // 4. Class Recordings
  const isClassRecording = catalog =>
    (catalog.name || '').toLowerCase().includes('class recording') ||
    (catalog.name || '').toLowerCase().includes('class recordings') ||
    (catalog.name || '').toLowerCase().includes('course recording') ||
    (catalog.name || '').toLowerCase().includes('course recordings') ||
    (catalog.name || '').toLowerCase().includes('recordings') ||
    (catalog.name || '').toLowerCase().includes('recording');
  const classRecordings = filteredCatalogs.filter(
    catalog =>
      isClassRecording(catalog) &&
      !isFreeCourse(catalog) &&
      !isMasterClass(catalog) &&
      !isPremiumCourse(catalog)
  );

  // 5. Catch-all for catalogs that don't fit any special group
  const otherCatalogs = filteredCatalogs.filter(
    catalog =>
      !isFreeCourse(catalog) &&
      !isMasterClass(catalog) &&
      !isPremiumCourse(catalog) &&
      !isClassRecording(catalog)
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-6 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="font-medium">Loading catalogs...</span>
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
          <div className="container py-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="bg-red-100 p-4 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-2 bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const CatalogCard = ({
    catalog,
    badgeColor,
    badgeText,
    gradientFrom,
    gradientTo,
    buttonClass,
  }) => {
    const isEnrolled = isEnrolledInCatalog(catalog);
    const hasPurchasedEntire = hasPurchasedEntireCatalog(catalog);
    const catalogPrice = getCatalogPriceCredits(catalog);
    const currentBalance = Number.isFinite(creditsBalance)
      ? creditsBalance
      : (creditsAlt ?? 0);
    const canAfford = currentBalance >= catalogPrice && catalogPrice > 0;

    return (
      <div
        key={catalog.id}
        className="group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-200"
      >
        <div
          className={`aspect-video w-full relative overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientTo}`}
        >
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
            className={`absolute inset-0 flex items-center justify-center ${gradientFrom.replace('50', '100')} ${gradientTo.replace('100', '200')}`}
            style={{ display: catalog.thumbnail ? 'none' : 'flex' }}
          >
            <FolderOpen className="h-16 w-16 opacity-80" />
          </div>
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientFrom.replace('50', '400')} ${gradientTo.replace('100', '500')}`}
          ></div>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {catalog.name}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}
            >
              {badgeText}
            </span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">
            {catalog.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>
                {catalog._count?.catalog_courses !== undefined
                  ? catalog._count.catalog_courses
                  : catalog.catalog_courseCount !== undefined
                    ? catalog.catalog_courseCount
                    : catalog.courseCount || 0}{' '}
                courses
              </span>
            </span>
            {catalogPrice > 0 && !isMasterClass(catalog) && (
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <span>{catalogPrice}</span>
                <span className="text-[10px] leading-4 px-1.5 py-0.5 rounded-md border border-blue-200 bg-blue-50 text-blue-600 font-semibold tracking-wider">
                  CP
                </span>
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              className={`flex-1 h-11 ${buttonClass} ${hasPurchasedEntire ? 'ring-2 ring-offset-2 ring-emerald-400' : ''}`}
              asChild
            >
              <Link
                to={`/dashboard/catalog/${catalog.id}`}
                state={{ catalog: catalog }}
                className="flex items-center justify-center"
              >
                {hasPurchasedEntire ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Open Catalog
                  </>
                ) : (
                  'Explore Catalog'
                )}
              </Link>
            </Button>

            {catalogPrice > 0 &&
              !isEnrolled &&
              (!isMasterClass(catalog) ||
                (isMasterClass(catalog) &&
                  (catalog.name || '')
                    .toLowerCase()
                    .includes('private merchant'))) && (
                <Button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBuyCatalogClick(catalog);
                  }}
                  className="h-11 px-4 rounded-lg text-sm font-semibold shadow-sm border transition-all duration-200 bg-white text-green-700 border-green-300 hover:bg-green-50"
                >
                  Buy Catalog
                </Button>
              )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="container py-8 max-w-7xl">
          {purchaseNotice && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 text-green-800 px-4 py-2 text-sm">
              {purchaseNotice}
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Course Catalogs
              </h1>
              <p className="text-gray-500 mt-1">
                Browse our collection of learning paths
              </p>
            </div>
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Search catalogs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80 py-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {freeCourses.length +
            masterClasses.length +
            premiumCatalogs.length +
            classRecordings.length +
            otherCatalogs.length ===
          0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No catalogs found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Free Courses section commented out - courses moved elsewhere */}
              {/* {freeCourses.length > 0 && (
                <div>
                  <div className="flex flex-col mb-6">
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-blue-500 mr-2" />
                      <h2 className="text-2xl font-semibold text-gray-900">Free Courses</h2>
                    </div>
                    <span className="text-sm text-gray-500 ml-7">Start your learning journey with these free resources</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {freeCourses.map((catalog) => (
                      <CatalogCard 
                        key={catalog.id}
                        catalog={catalog}
                        badgeColor="bg-blue-100 text-blue-800"
                        badgeText="Free"
                        gradientFrom="from-blue-50"
                        gradientTo="to-blue-100"
                        buttonClass="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200"
                      />
                    ))}
                  </div>
                </div>
              )} */}

              {masterClasses.length > 0 && (
                <div>
                  <div className="flex flex-col mb-6">
                    <div className="flex items-center mb-2">
                      <Award className="h-5 w-5 text-green-700 mr-2" />
                      <h2 className="text-2xl font-semibold text-gray-900">
                        Master Classes
                      </h2>
                    </div>
                    <span className="text-sm text-gray-500 ml-7">
                      In-depth expert-led sessions for advanced learning
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {masterClasses.map(catalog => (
                      <CatalogCard
                        key={catalog.id}
                        catalog={catalog}
                        badgeColor="bg-green-100 text-green-800"
                        badgeText="Master Class"
                        gradientFrom="from-green-50"
                        gradientTo="to-green-100"
                        buttonClass="w-full bg-green-700 hover:bg-green-800 text-white font-medium transition-all duration-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {premiumCatalogs.length > 0 && (
                <div>
                  <div className="flex flex-col mb-6">
                    <div className="flex items-center mb-2">
                      <Gem className="h-5 w-5 text-purple-500 mr-2" />
                      <h2 className="text-2xl font-semibold text-gray-900">
                        Premium Courses
                      </h2>
                    </div>
                    <span className="text-sm text-gray-500 ml-7">
                      Comprehensive courses for professional development
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {premiumCatalogs.map(catalog => (
                      <CatalogCard
                        key={catalog.id}
                        catalog={catalog}
                        badgeColor="bg-purple-100 text-purple-800"
                        badgeText="Premium"
                        gradientFrom="from-purple-50"
                        gradientTo="to-indigo-100"
                        buttonClass="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Street Smart (Recordings) section intentionally disabled for now */}
              {/* {classRecordings.length > 0 && (
                <div>
                  <div className="flex flex-col mb-6">
                    <div className="flex items-center mb-2">
                      <Video className="h-5 w-5 text-green-600 mr-2" />
                      <h2 className="text-2xl font-semibold text-gray-900">Street Smart ( Class recording by Paulmichael Rowland )</h2>
                    </div>
                    <span className="text-sm text-gray-500 ml-7">Archive of past class sessions for review</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classRecordings.map((catalog) => (
                      <CatalogCard 
                        key={catalog.id}
                        catalog={catalog}
                        badgeColor="bg-green-100 text-green-800"
                        badgeText="Recording"
                        gradientFrom="from-green-50"
                        gradientTo="to-emerald-100"
                        buttonClass="w-full bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200"
                      />
                    ))}
                  </div>
                </div>
              )} */}

              {otherCatalogs.length > 0 && (
                <div>
                  <div className="flex flex-col mb-6">
                    <div className="flex items-center mb-2">
                      <FolderOpen className="h-5 w-5 text-gray-600 mr-2" />
                      <h2 className="text-2xl font-semibold text-gray-900">
                        All Catalogs
                      </h2>
                    </div>
                    <span className="text-sm text-gray-500 ml-7">
                      Other catalogs available for browsing
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherCatalogs.map(catalog => (
                      <CatalogCard
                        key={catalog.id}
                        catalog={catalog}
                        badgeColor="bg-gray-100 text-gray-800"
                        badgeText="Catalog"
                        gradientFrom="from-gray-50"
                        gradientTo="to-gray-100"
                        buttonClass="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium transition-all duration-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Buy details modal when user has enough credits */}
      {buyDetailsOpen && selectedCatalogToBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeAllModals}
          />
          <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-lg p-6">
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Confirm Catalog Purchase
                </h3>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {selectedCatalogToBuy.name}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {(() => {
                  const description =
                    selectedCatalogToBuy.description ||
                    'Complete catalog with multiple courses';
                  const maxLength = 200; // Character limit for truncated description

                  if (description.length <= maxLength) {
                    return description;
                  }

                  return (
                    <div>
                      {isDescriptionExpanded
                        ? description
                        : `${description.substring(0, maxLength)}...`}
                      <button
                        onClick={() =>
                          setIsDescriptionExpanded(!isDescriptionExpanded)
                        }
                        className="ml-2 text-blue-600 hover:text-blue-800 font-medium text-xs underline"
                      >
                        {isDescriptionExpanded ? 'View Less' : 'View More'}
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Courses List */}
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Courses included (
                  {selectedCatalogToBuy.coursesCount ??
                    (selectedCatalogToBuy.courses?.length || 0)}
                  ):
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {(selectedCatalogToBuy.courses || [])
                    .slice(0, 5)
                    .map((course, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-gray-600 flex items-center"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        {course.title || course.name || `Course ${idx + 1}`}
                      </div>
                    ))}
                  {(selectedCatalogToBuy.courses?.length || 0) > 5 && (
                    <div className="text-xs text-gray-500 italic">
                      +{(selectedCatalogToBuy.courses?.length || 0) - 5} more
                      courses
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Total Cost:
                </span>
                <span className="text-lg font-bold text-green-600">
                  {selectedCatalogToBuy.priceCredits || 0} credits
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Your Balance:
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {Number.isFinite(creditsBalance)
                    ? creditsBalance
                    : (creditsAlt ?? 0)}{' '}
                  credits
                </span>
              </div>
              <div className="border-t border-blue-200 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    After Purchase:
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {(Number.isFinite(creditsBalance)
                      ? creditsBalance
                      : (creditsAlt ?? 0)) -
                      (selectedCatalogToBuy.priceCredits || 0)}{' '}
                    credits
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-4 w-4 text-yellow-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> Buying this catalog will unlock all
                    courses and their modules at once. You'll have immediate
                    access to all content.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeAllModals}
                className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={isPurchasing}
                onClick={async () => {
                  if (isPurchasing) return; // Prevent multiple clicks

                  try {
                    setIsPurchasing(true);

                    // Call unlock API for catalog
                    await unlockContent(
                      'CATALOG',
                      selectedCatalogToBuy.id,
                      selectedCatalogToBuy.priceCredits
                    );

                    // Additionally unlock recording courses for eligible titles within this catalog
                    try {
                      const courseIdsSet =
                        catalogCourseIdsMap[selectedCatalogToBuy.id] ||
                        new Set();
                      const coursesList = Array.from(courseIdsSet);
                      // We don't have course titles here reliably; this is a best-effort: fetch courses by id when needed
                      // If APIs aren't available, this block safely no-ops
                      try {
                        const details = await Promise.all(
                          coursesList.map(async cid => {
                            try {
                              const res = await api.get(
                                `/api/course/getCourseById/${cid}`
                              );
                              return res?.data?.data || res?.data;
                            } catch {
                              _ => null;
                            }
                            return null;
                          })
                        );
                        for (const course of details || []) {
                          const title = course?.title || course?.name;
                          if (
                            title &&
                            title.trim &&
                            title.trim() &&
                            [
                              'become private',
                              'sovereignty 101',
                              'sov 101',
                              'operate private',
                              'business credit',
                              'i want remedy now',
                              'private merchant',
                            ].some(k => title.toLowerCase().includes(k))
                          ) {
                            // best-effort unlock of recording sibling
                            const mapTitle = title.toLowerCase();
                            let recId = null;
                            if (mapTitle.includes('become private'))
                              recId = 'a188173c-23a6-4cb7-9653-6a1a809e9914';
                            else if (mapTitle.includes('operate private'))
                              recId = '7b798545-6f5f-4028-9b1e-e18c7d2b4c47';
                            else if (mapTitle.includes('business credit'))
                              recId = '199e328d-8366-4af1-9582-9ea545f8b59e';
                            else if (mapTitle.includes('private merchant'))
                              recId = 'd8e2e17f-af91-46e3-9a81-6e5b0214bc5e';
                            else if (
                              mapTitle.includes('sovereignty 101') ||
                              mapTitle.includes('sov 101')
                            )
                              recId = 'd5330607-9a45-4298-8ead-976dd8810283';
                            if (recId) {
                              try {
                                await unlockContent('COURSE', recId, 0);
                              } catch {}
                            }
                          }
                        }
                      } catch {}
                    } catch (e) {
                      console.warn(
                        '[Catalog] Optional recording unlock failed:',
                        e?.message || e
                      );
                    }

                    // Refresh balance to show updated credits
                    if (refreshBalance) {
                      await refreshBalance();
                    }

                    // Refresh user courses to update enrollment status
                    try {
                      const updatedCourses = await fetchUserCourses();
                      setUserCourses(updatedCourses || []);
                    } catch (err) {
                      console.error(
                        'Error refreshing user courses after purchase:',
                        err
                      );
                    }

                    // Refresh unlocked modules
                    try {
                      if (userProfile?.id) {
                        const modules = await getUnlockedModulesByUser(
                          userProfile.id
                        );
                        setUnlockedModules(modules || []);
                      }
                    } catch (err) {
                      console.error(
                        'Error refreshing unlocked modules after purchase:',
                        err
                      );
                    }

                    // Show success notice
                    setPurchaseNotice(
                      `Successfully purchased catalog: ${selectedCatalogToBuy.name}. All included courses are now unlocked.`
                    );
                    closeAllModals();
                    setTimeout(() => setPurchaseNotice(''), 4000);
                  } catch (error) {
                    console.error('Failed to purchase catalog:', error);
                    setPurchaseNotice(
                      `Failed to purchase catalog: ${error.message}`
                    );
                    setTimeout(() => setPurchaseNotice(''), 4000);
                  } finally {
                    setIsPurchasing(false);
                  }
                }}
                className={`px-4 py-2 rounded-md text-white text-sm ${
                  isPurchasing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPurchasing ? 'Processing...' : 'Confirm & Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient credits modal */}
      {showInsufficientCreditsModal && selectedCatalogToBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeAllModals}
          />
          <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md p-6">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="bg-orange-100 p-2 rounded-full mr-3">
                  <ShoppingCart className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Insufficient Credits
                </h3>
              </div>
            </div>

            <div className="text-sm text-gray-700 mb-6 space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900 mb-2">
                  Purchase Details:
                </div>
                <div>
                  <span className="font-medium">Catalog:</span>{' '}
                  {selectedCatalogToBuy.name}
                </div>
                <div>
                  <span className="font-medium">Price:</span>{' '}
                  {selectedCatalogToBuy.priceCredits || 0} credits
                </div>
                <div>
                  <span className="font-medium">Your balance:</span>{' '}
                  {Number.isFinite(creditsBalance)
                    ? creditsBalance
                    : (creditsAlt ?? 0)}{' '}
                  credits
                </div>
                <div>
                  <span className="font-medium">Courses included:</span>{' '}
                  {selectedCatalogToBuy.coursesCount ?? 0} courses
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <div className="bg-orange-100 p-1 rounded-full mr-2">
                    <svg
                      className="h-3 w-3 text-orange-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-orange-800">
                    You need more credits
                  </span>
                </div>
                <p className="text-orange-700 text-xs">
                  You need{' '}
                  {(selectedCatalogToBuy.priceCredits || 0) -
                    (Number.isFinite(creditsBalance)
                      ? creditsBalance
                      : (creditsAlt ?? 0))}{' '}
                  more credits to purchase this catalog.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeAllModals}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Close insufficient credits modal and open credit purchase modal
                  setShowInsufficientCreditsModal(false);
                  setShowCreditsModal(true);
                }}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              >
                Buy Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit purchase modal */}
      {showCreditsModal && (
        <CreditPurchaseModal
          open={showCreditsModal}
          onClose={() => setShowCreditsModal(false)}
          balance={Number.isFinite(creditsBalance) ? creditsBalance : undefined}
        />
      )}
    </div>
  );
}

export default CatalogPage;
