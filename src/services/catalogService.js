import { getAuthHeader } from './authHeader';

// Catalog Service for handling catalog-related API calls

// Helper function to get auth headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  ...getAuthHeader(),
});

/**
 * Fetches all catalogs with optional query parameters
 * @param {Object} params - Query parameters for filtering/sorting
 * @returns {Promise<Array>} - Array of catalog objects
 */
export async function fetchAllCatalogs(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/catalog/getallcatalogs${query ? `?${query}` : ''}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle the nested structure and add course count
    const catalogs = data.data?.catalogs || data.data || [];

    return catalogs.map(catalog => {
      // Log the catalog object to see its structure

      // Get course count from _count.catalog_courses if available
      const courseCount = catalog._count?.catalog_courses || 0;

      return {
        ...catalog,
        catalog_courseCount: courseCount,
        courseCount: courseCount, // Keep both for backward compatibility
      };
    });
  } catch (error) {
    console.error('Error fetching catalogs:', error);
    throw error;
  }
}

/**
 * Fetches a single catalog by ID
 * @param {string} catalogId - ID of the catalog to fetch
 * @returns {Promise<Object|null>} Catalog object or null if not found
 */
export async function fetchCatalogById(catalogId) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/catalog/${catalogId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Error fetching catalog by ID:', error);
    throw error;
  }
}

/**
 * Fetches courses for a specific catalog
 * @param {string} catalogId - ID of the catalog
 * @returns {Promise<Array>} Array of course objects
 */
export async function fetchCatalogCourses(catalogId) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/catalog/${catalogId}/courses`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No courses found for this catalog
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle different response formats
    let courses = [];
    if (data.data) {
      courses = Array.isArray(data.data) ? data.data : data.data.courses || [];
    } else if (Array.isArray(data)) {
      courses = data;
    } else if (data.courses) {
      courses = data.courses;
    }

    // Normalize the course data structure
    return courses
      .map(item => ({
        id: item.id || item.course_id || (item.course ? item.course.id : null),
        title:
          item.title ||
          (item.course
            ? item.course.title
            : `Course ${item.id || item.course_id}`),
        ...(item.thumbnail && { thumbnail: item.thumbnail }),
        ...(item.image && { image: item.image }),
        ...(item.course &&
          item.course.thumbnail && { thumbnail: item.course.thumbnail }),
        ...(item.course && item.course.image && { image: item.course.image }),
      }))
      .filter(item => item.id !== null);
  } catch (error) {
    console.error('Error fetching catalog courses:', error);
    throw error;
  }
}

/**
 * Searches catalogs with optional filters
 * @param {string} searchTerm - Search term for catalog name/description
 * @param {Object} filters - Additional filters (e.g., category)
 * @returns {Promise<Array>} Filtered array of catalogs
 */
export async function searchCatalogs(searchTerm, filters = {}) {
  try {
    const params = new URLSearchParams();

    if (searchTerm) {
      params.append('search', searchTerm);
    }

    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/catalog/getallcatalogs?${params.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const allCatalogs = data.data || [];

    // Apply client-side filtering if backend doesn't support it
    let filteredCatalogs = allCatalogs;

    if (searchTerm) {
      filteredCatalogs = filteredCatalogs.filter(
        catalog =>
          catalog.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          catalog.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category && filters.category !== 'all') {
      filteredCatalogs = filteredCatalogs.filter(
        catalog => catalog.category === filters.category
      );
    }

    return filteredCatalogs;
  } catch (error) {
    console.error('Error searching catalogs:', error);
    throw error;
  }
}

/**
 * Test if the unlock endpoint exists
 * @param {string} userId - ID of the user
 * @returns {Promise<boolean>} True if endpoint exists
 */
export async function testUnlockEndpoint(userId) {
  try {
    console.log('🧪 [CatalogService] Testing unlock endpoint...');
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/payment-order/unlock`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          userId: userId, // Keep as string
          credits_spent: 1,
          unlock_type: 'TEST',
          unlock_id: 'test',
        }),
      }
    );
    console.log('🧪 [CatalogService] Test response status:', response.status);
    return response.status !== 404;
  } catch (error) {
    console.log('🧪 [CatalogService] Test endpoint error:', error);
    return false;
  }
}

/**
 * Unlocks a catalog using credits
 * @param {string} catalogId - ID of the catalog to unlock
 * @param {number} creditsSpent - Number of credits to spend
 * @param {string} userId - ID of the user unlocking the catalog
 * @returns {Promise<Object>} Unlock response data
 */
export async function unlockCatalog(catalogId, creditsSpent, userId) {
  try {
    const unlockData = {
      userId: userId, // Keep as string - don't parse to int
      credits_spent: creditsSpent,
      unlock_type: 'CATALOG',
      unlock_id: catalogId,
    };

    console.log('🚀 [CatalogService] STARTING UNLOCK PROCESS');
    console.log('[CatalogService] Unlocking catalog:', unlockData);
    console.log(
      '[CatalogService] API Base URL:',
      import.meta.env.VITE_API_BASE_URL
    );
    console.log(
      '[CatalogService] Full URL:',
      `${import.meta.env.VITE_API_BASE_URL}/payment-order/unlock`
    );
    console.log('Unlock body', {
      userId,
      creditsSpent,
      unlock_type: 'CATALOG',
      unlock_id: catalogId,
    });

    // Test if the endpoint exists first
    const endpointExists = await testUnlockEndpoint(userId);
    console.log('🧪 [CatalogService] Endpoint exists:', endpointExists);

    // First, let's test if the endpoint exists by making a simple request
    try {
      const testResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/payment-order/credits/balance/${userId}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        }
      );
      console.log(
        '[CatalogService] Test endpoint status:',
        testResponse.status
      );
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('[CatalogService] Test endpoint response:', testData);
      }
    } catch (testError) {
      console.log('[CatalogService] Test endpoint error:', testError);
    }

    // Try using the API client first (same as CreditsContext)
    try {
      console.log('🔄 [CatalogService] Trying with API client...');
      const { default: api } = await import('@/services/apiClient');
      const response = await api.post('/payment-order/unlock', unlockData, {
        withCredentials: true,
      });
      console.log('✅ [CatalogService] API client SUCCESS:', response.data);
      return response.data;
    } catch (apiError) {
      console.log('❌ [CatalogService] API client FAILED:', apiError);
      console.log('🔄 [CatalogService] Trying fetch as fallback...');

      // Fallback to fetch if API client fails
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/payment-order/unlock`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(unlockData),
        }
      );

      console.log('[CatalogService] Fetch response status:', response.status);
      console.log('[CatalogService] Fetch response ok:', response.ok);
      console.log(
        '[CatalogService] Fetch response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          console.log('[CatalogService] Error response data:', errorData);
          errorMessage =
            errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch (parseError) {
          console.log(
            '[CatalogService] Could not parse error response:',
            parseError
          );
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[CatalogService] Fetch unlock response:', data);
      return data;
    }
  } catch (error) {
    console.error('[CatalogService] Error unlocking catalog:', error);
    throw error;
  }
}

/**
 * Fetches user's unlocked catalogs
 *
 * NOTE: This endpoint may not exist on all backends.
 * If it returns 404, the calling code should handle it gracefully.
 *
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} Array of unlocked catalog objects
 * @throws {Error} If the request fails (including 404 if endpoint doesn't exist)
 */
export async function fetchUserUnlockedCatalogs(userId) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/catalog/getUserCatalogsByUserId`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      // If 404, the endpoint doesn't exist - this is expected for some backends
      if (response.status === 404) {
        console.log(
          '[CatalogService] getUserCatalogsByUserId endpoint not available (404)'
        );
        throw new Error(`HTTP error! status: 404 - Endpoint not available`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    // Re-throw the error so calling code can handle it appropriately
    throw error;
  }
}
