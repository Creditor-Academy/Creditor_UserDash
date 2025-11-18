// Search Service - Search for courses and users
import api from './apiClient';
import { fetchAllCourses } from './courseService';
import { fetchAllUsersAdmin } from './userService';

// Helper function to normalize API response
const normalizeResponse = response => {
  // Handle different response structures
  if (response?.data?.data) {
    return response.data.data;
  }
  if (response?.data) {
    return response.data;
  }
  return response;
};

// Helper function to filter items by search query
const filterByQuery = (items, query, fields) => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return items;

  return items.filter(item => {
    return fields.some(field => {
      const value = item[field];
      if (value == null) return false;
      return String(value).toLowerCase().includes(lowerQuery);
    });
  });
};

export async function search(query) {
  const searchQuery = query?.trim() || '';

  if (!searchQuery || searchQuery.length < 2) {
    return {
      results: {
        courses: [],
        users: [],
      },
    };
  }

  try {
    // Try the unified search API endpoint first
    try {
      const response = await api.post('/api/search', {
        query: searchQuery,
      });

      const data = normalizeResponse(response);

      // Ensure the response has the expected structure
      // Expected: { results: { courses: [], users: [] } }
      if (data && data.results) {
        // If results is already in the correct format, return it
        if (data.results.courses || data.results.users) {
          return data;
        }
        // If results is an array, we need to separate courses and users
        if (Array.isArray(data.results)) {
          const courses = data.results.filter(
            item =>
              item.type === 'course' || item.type === 'Course' || !item.type
          );
          const users = data.results.filter(
            item => item.type === 'user' || item.type === 'User'
          );
          return {
            results: {
              courses: courses,
              users: users,
            },
          };
        }
      }
    } catch (unifiedError) {
      // If unified endpoint doesn't exist (404) or fails, fall back to separate searches
      if (unifiedError.response?.status === 404) {
        console.log(
          'Unified search endpoint not found, falling back to separate searches'
        );
      } else {
        console.warn(
          'Unified search failed, falling back to separate searches:',
          unifiedError
        );
      }

      // Fallback: Search courses and users separately
      const [coursesData, usersData] = await Promise.allSettled([
        fetchAllCourses().catch(() => []),
        fetchAllUsersAdmin().catch(() => []),
      ]);

      const allCourses =
        coursesData.status === 'fulfilled' ? coursesData.value || [] : [];
      const allUsers =
        usersData.status === 'fulfilled' ? usersData.value || [] : [];

      // Filter courses by title
      const filteredCourses = filterByQuery(allCourses, searchQuery, [
        'title',
        'name',
        'description',
      ]);

      // Filter users by name and email
      const filteredUsers = filterByQuery(allUsers, searchQuery, [
        'first_name',
        'last_name',
        'email',
        'name',
      ]);

      return {
        results: {
          courses: filteredCourses,
          users: filteredUsers,
        },
      };
    }

    // Fallback: return empty results if structure doesn't match
    return {
      results: {
        courses: [],
        users: [],
      },
    };
  } catch (error) {
    console.error('Search error:', error);

    // Final fallback: return empty results
    return {
      results: {
        courses: [],
        users: [],
      },
    };
  }
}

// Enhanced search function that includes course and module data
export async function searchWithCoursesAndModules(query) {
  console.log('Mock: Searching with courses and modules for', query);
  return createMockResponse({
    results: [
      {
        id: 'course-1',
        title: `Mock course for "${query}"`,
        type: 'course',
        modules: [{ id: 'module-1', title: 'Sample Module' }],
      },
    ],
    total: 1,
    query: query,
  });
}

// Search specifically for users with their enrolled courses and modules
export async function searchUsersWithEnrollments(query) {
  console.log('Mock: Searching users with enrollments for', query);
  return createMockResponse({
    results: [
      {
        id: 'user-1',
        name: `Mock user for "${query}"`,
        type: 'user',
        enrollments: [{ courseId: 'course-1', courseName: 'Sample Course' }],
      },
    ],
    total: 1,
    query: query,
  });
}

// Search for courses with their modules
export async function searchCoursesWithModules(query) {
  console.log('Mock: Searching courses with modules for', query);
  return createMockResponse({
    results: [
      {
        id: 'course-1',
        title: `Mock course for "${query}"`,
        type: 'course',
        modules: [{ id: 'module-1', title: 'Sample Module' }],
      },
    ],
    total: 1,
    query: query,
  });
}
