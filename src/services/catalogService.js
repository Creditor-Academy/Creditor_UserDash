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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/getallcatalogs${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

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
        courseCount: courseCount // Keep both for backward compatibility
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/${catalogId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/${catalogId}/courses`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

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
      courses = Array.isArray(data.data) ? data.data : (data.data.courses || []);
    } else if (Array.isArray(data)) {
      courses = data;
    } else if (data.courses) {
      courses = data.courses;
    }
    
    // Normalize the course data structure
    return courses.map(item => ({
      id: item.id || item.course_id || (item.course ? item.course.id : null),
      title: item.title || (item.course ? item.course.title : `Course ${item.id || item.course_id}`),
      ...(item.thumbnail && { thumbnail: item.thumbnail }),
      ...(item.image && { image: item.image }),
      ...(item.course && item.course.thumbnail && { thumbnail: item.course.thumbnail }),
      ...(item.course && item.course.image && { image: item.course.image })
    })).filter(item => item.id !== null);
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

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/catalog/getallcatalogs?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const allCatalogs = data.data || [];
    
    // Apply client-side filtering if backend doesn't support it
    let filteredCatalogs = allCatalogs;
    
    if (searchTerm) {
      filteredCatalogs = filteredCatalogs.filter(catalog =>
        catalog.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catalog.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.category && filters.category !== 'all') {
      filteredCatalogs = filteredCatalogs.filter(catalog =>
        catalog.category === filters.category
      );
    }
    
    return filteredCatalogs;
  } catch (error) {
    console.error('Error searching catalogs:', error);
    throw error;
  }
}