/**
 * My Purchases Service
 *
 * This service aggregates user purchases (modules, courses, catalogs) and organizes them by catalog.
 * Currently uses workarounds for missing backend APIs - see TODO comments for future improvements.
 *
 * Hierarchy: Catalog → Courses → Modules → Lessons
 */

import { getUnlockedModulesByUser } from './modulesService';
import { fetchUserCourses } from './courseService';
import {
  fetchUserUnlockedCatalogs,
  fetchAllCatalogs,
  fetchCatalogCourses,
} from './catalogService';
import { getCatalogCourses as getCatalogCoursesInstructor } from './instructorCatalogService';

/**
 * Get all catalogs that contain a specific course
 *
 * WORKAROUND: Since we don't have GET /api/course/${courseId}/catalogs endpoint,
 * we fetch all catalogs and check which ones contain this course.
 *
 * TODO: Replace with backend API when available:
 * GET /api/course/${courseId}/catalogs
 *
 * @param {string} courseId - ID of the course
 * @returns {Promise<Array>} Array of catalog objects that contain this course
 */
async function getCatalogsForCourse(courseId) {
  try {
    // Fetch all catalogs
    const allCatalogs = await fetchAllCatalogs();
    const catalogsContainingCourse = [];

    // Check each catalog to see if it contains this course
    for (const catalog of allCatalogs) {
      try {
        // Get courses in this catalog
        // Try instructor service first, fallback to regular service
        let courses = [];
        try {
          courses = await getCatalogCoursesInstructor(catalog.id);
        } catch {
          try {
            // Use fetchCatalogCourses from catalogService (already imported)
            courses = await fetchCatalogCourses(catalog.id);
          } catch {
            // If both fail, skip this catalog
            continue;
          }
        }

        // Check if this course is in the catalog
        const courseInCatalog = courses.some(
          c => c.id === courseId || c.course_id === courseId
        );

        if (courseInCatalog) {
          catalogsContainingCourse.push(catalog);
        }
      } catch (error) {
        // If we can't fetch courses for a catalog, skip it
        console.warn(
          `Failed to fetch courses for catalog ${catalog.id}:`,
          error
        );
        continue;
      }
    }

    return catalogsContainingCourse;
  } catch (error) {
    console.error('Error getting catalogs for course:', error);
    return [];
  }
}

/**
 * Infer the purchase type based on what's unlocked
 *
 * Logic:
 * - If user has ALL courses in a catalog → CATALOG purchase
 * - If user has ALL modules in a course → COURSE purchase
 * - Otherwise → MODULE purchase (individual modules)
 *
 * TODO: Replace with backend API when purchase type tracking is available
 * The backend should return purchase type when fetching unlocked items
 *
 * @param {string} catalogId - ID of the catalog
 * @param {Set<string>} unlockedCourseIds - Set of course IDs the user has access to
 * @param {Set<string>} unlockedModuleIds - Set of module IDs the user has access to
 * @param {Array} catalogCourses - All courses in the catalog
 * @param {string} specificCourseId - Specific course we're checking (for module/course purchase)
 * @returns {string} Purchase type: 'CATALOG' | 'COURSE' | 'MODULE'
 */
function inferPurchaseType(
  catalogId,
  unlockedCourseIds,
  unlockedModuleIds,
  catalogCourses,
  specificCourseId
) {
  // Check if user has all courses in the catalog
  const catalogCourseIds = new Set(
    catalogCourses.map(c => c.id || c.course_id).filter(Boolean)
  );
  const hasAllCoursesInCatalog =
    catalogCourseIds.size > 0 &&
    Array.from(catalogCourseIds).every(id => unlockedCourseIds.has(id));

  if (hasAllCoursesInCatalog) {
    return 'CATALOG';
  }

  // If checking a specific course, check if user has all modules in that course
  if (specificCourseId) {
    // TODO: We need to fetch modules for the course to check this
    // For now, if user has the course enrolled, assume COURSE purchase
    // This will be refined when we have module data
    if (unlockedCourseIds.has(specificCourseId)) {
      return 'COURSE';
    }
  }

  // Default to MODULE purchase (individual modules unlocked)
  return 'MODULE';
}

/**
 * Get course ID from a module
 *
 * WORKAROUND: Modules from getUnlockedModulesByUser should have course_id field.
 * If not, we'll need to fetch the course separately.
 *
 * TODO: Verify with backend that course_id is always present in module data
 * If not, we may need: GET /api/module/${moduleId}/course
 *
 * @param {Object} module - Module object
 * @returns {string|null} Course ID or null if not found
 */
function getCourseIdFromModule(module) {
  // Try different possible field names
  return (
    module.course_id ||
    module.courseId ||
    module.course?.id ||
    module.course_id ||
    null
  );
}

/**
 * Aggregate all user purchases and organize by catalog
 *
 * This is the main function that:
 * 1. Fetches unlocked modules, enrolled courses, and unlocked catalogs
 * 2. Maps modules to courses, courses to catalogs
 * 3. Groups purchases by catalog
 * 4. Determines purchase type for each catalog
 *
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} Array of catalog purchase objects with structure:
 * {
 *   catalogId: string,
 *   catalog: Catalog object,
 *   purchaseType: 'CATALOG' | 'COURSE' | 'MODULE',
 *   unlockedItems: {
 *     courseIds: Set<string>,
 *     moduleIds: Set<string>
 *   }
 * }
 */
export async function getMyPurchasesByCatalog(userId) {
  try {
    // Step 1: Fetch all user purchases
    // Fetch unlocked modules (individual module purchases)
    const unlockedModules = await getUnlockedModulesByUser(userId);
    console.log('[MyPurchases] Unlocked modules:', unlockedModules.length);

    // Fetch enrolled courses (course purchases or catalog purchases)
    const enrolledCourses = await fetchUserCourses();
    console.log('[MyPurchases] Enrolled courses:', enrolledCourses.length);

    /**
     * Fetch unlocked catalogs (full catalog purchases)
     *
     * NOTE: This endpoint may not exist on all backends (returns 404).
     * If it fails, we continue without it - we can still detect catalog purchases
     * by checking if user has all courses in a catalog.
     */
    let unlockedCatalogs = [];
    try {
      unlockedCatalogs = await fetchUserUnlockedCatalogs(userId);
      console.log('[MyPurchases] Unlocked catalogs:', unlockedCatalogs.length);
    } catch (error) {
      // 404 means endpoint doesn't exist - this is OK, we'll infer catalog purchases
      if (
        error.message?.includes('404') ||
        error.message?.includes('HTTP error! status: 404')
      ) {
        console.log(
          '[MyPurchases] Unlocked catalogs endpoint not available (404) - will infer catalog purchases from course enrollments'
        );
      } else {
        console.warn('[MyPurchases] Failed to fetch unlocked catalogs:', error);
      }
      // Continue without unlocked catalogs - we can still detect them by checking course enrollments
      unlockedCatalogs = [];
    }

    // Step 2: Create sets for quick lookup
    const unlockedCourseIds = new Set(
      enrolledCourses.map(c => c.id || c._id || c.courseId).filter(Boolean)
    );

    const unlockedModuleIds = new Set(
      unlockedModules
        .map(m => {
          const moduleId = m.module_id || m.id || m.module?.id;
          return moduleId ? String(moduleId) : null;
        })
        .filter(Boolean)
    );

    // Step 3: Map modules to courses, then courses to catalogs
    // Group modules by course
    const modulesByCourse = {};
    unlockedModules.forEach(module => {
      const courseId = getCourseIdFromModule(module);
      if (courseId) {
        if (!modulesByCourse[courseId]) {
          modulesByCourse[courseId] = [];
        }
        modulesByCourse[courseId].push(module);
      }
    });

    // Step 4: Get unique course IDs that have purchased modules
    const coursesWithPurchasedModules = new Set(Object.keys(modulesByCourse));

    // Step 5: For each course with purchased modules, find its catalog(s)
    const catalogMap = new Map(); // catalogId -> purchase data

    // Process courses with purchased modules
    for (const courseId of coursesWithPurchasedModules) {
      // WORKAROUND: Get catalogs for this course
      const catalogs = await getCatalogsForCourse(courseId);

      for (const catalog of catalogs) {
        const catalogId = catalog.id;

        // Initialize catalog entry if not exists
        if (!catalogMap.has(catalogId)) {
          catalogMap.set(catalogId, {
            catalogId,
            catalog,
            purchaseType: null, // Will be determined later
            unlockedItems: {
              courseIds: new Set(),
              moduleIds: new Set(),
            },
          });
        }

        const catalogData = catalogMap.get(catalogId);

        // Add this course to unlocked courses
        catalogData.unlockedItems.courseIds.add(courseId);

        // Add modules from this course
        const modules = modulesByCourse[courseId] || [];
        modules.forEach(module => {
          const moduleId = module.module_id || module.id || module.module?.id;
          if (moduleId) {
            catalogData.unlockedItems.moduleIds.add(String(moduleId));
          }
        });
      }
    }

    // Step 6: Process enrolled courses (course or catalog purchases)
    for (const course of enrolledCourses) {
      const courseId = course.id || course._id || course.courseId;
      if (!courseId) continue;

      // Skip if already processed (has purchased modules)
      if (coursesWithPurchasedModules.has(courseId)) {
        continue;
      }

      // Get catalogs for this course
      const catalogs = await getCatalogsForCourse(courseId);

      for (const catalog of catalogs) {
        const catalogId = catalog.id;

        // Initialize catalog entry if not exists
        if (!catalogMap.has(catalogId)) {
          catalogMap.set(catalogId, {
            catalogId,
            catalog,
            purchaseType: null,
            unlockedItems: {
              courseIds: new Set(),
              moduleIds: new Set(),
            },
          });
        }

        const catalogData = catalogMap.get(catalogId);

        // Add this course to unlocked courses
        catalogData.unlockedItems.courseIds.add(courseId);
      }
    }

    // Step 7: Process unlocked catalogs (full catalog purchases)
    for (const catalog of unlockedCatalogs) {
      const catalogId = catalog.id || catalog.catalog_id;

      if (!catalogMap.has(catalogId)) {
        // Get full catalog details
        try {
          const { fetchCatalogById } = await import('./catalogService');
          const fullCatalog = await fetchCatalogById(catalogId);
          if (fullCatalog) {
            catalogMap.set(catalogId, {
              catalogId,
              catalog: fullCatalog,
              purchaseType: 'CATALOG',
              unlockedItems: {
                courseIds: new Set(),
                moduleIds: new Set(),
              },
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch catalog ${catalogId}:`, error);
        }
      } else {
        // Update existing entry to mark as catalog purchase
        const catalogData = catalogMap.get(catalogId);
        catalogData.purchaseType = 'CATALOG';
      }
    }

    // Step 8: Determine purchase type for each catalog and get course data
    const result = [];

    for (const [catalogId, catalogData] of catalogMap.entries()) {
      // Get all courses in this catalog to determine purchase type
      let catalogCourses = [];
      try {
        catalogCourses = await getCatalogCoursesInstructor(catalogId);
      } catch {
        try {
          // Use fetchCatalogCourses from catalogService (already imported)
          catalogCourses = await fetchCatalogCourses(catalogId);
        } catch (error) {
          console.warn(
            `Failed to fetch courses for catalog ${catalogId}:`,
            error
          );
        }
      }

      // If purchase type not already set (from catalog purchase), infer it
      if (!catalogData.purchaseType) {
        // Get the first course ID from unlocked items to check purchase type
        const firstUnlockedCourseId = Array.from(
          catalogData.unlockedItems.courseIds
        )[0];

        catalogData.purchaseType = inferPurchaseType(
          catalogId,
          unlockedCourseIds,
          unlockedModuleIds,
          catalogCourses,
          firstUnlockedCourseId
        );
      }

      // Convert Sets to Arrays for easier serialization
      result.push({
        catalogId: catalogData.catalogId,
        catalog: catalogData.catalog,
        purchaseType: catalogData.purchaseType,
        unlockedItems: {
          courseIds: Array.from(catalogData.unlockedItems.courseIds),
          moduleIds: Array.from(catalogData.unlockedItems.moduleIds),
        },
      });
    }

    console.log('[MyPurchases] Final result:', result.length, 'catalogs');
    return result;
  } catch (error) {
    console.error('[MyPurchases] Error aggregating purchases:', error);
    throw error;
  }
}

/**
 * Get purchase context for a specific catalog
 *
 * This returns the purchase information for a catalog, which can be passed
 * to CatelogCourses.jsx and CourseView.jsx to determine what's locked/unlocked.
 *
 * @param {string} userId - ID of the user
 * @param {string} catalogId - ID of the catalog
 * @returns {Promise<Object|null>} Purchase context object or null if not found
 */
export async function getPurchaseContextForCatalog(userId, catalogId) {
  try {
    const purchases = await getMyPurchasesByCatalog(userId);
    return purchases.find(p => p.catalogId === catalogId) || null;
  } catch (error) {
    console.error('[MyPurchases] Error getting purchase context:', error);
    return null;
  }
}

export default {
  getMyPurchasesByCatalog,
  getPurchaseContextForCatalog,
};
