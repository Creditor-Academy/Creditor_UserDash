// Search Service - Placeholder functions (API calls removed)
// All functions now return mock data instead of making API calls

// Helper function to generate mock response
const createMockResponse = data => {
  return Promise.resolve({
    success: true,
    data: data,
    message: 'Mock response - API calls have been removed',
  });
};

export async function search(query) {
  console.log('Mock: Searching for', query);
  return createMockResponse({
    results: [
      {
        id: 'result-1',
        title: `Mock search result for "${query}"`,
        type: 'course',
        description: 'Sample search result',
      },
    ],
    total: 1,
    query: query,
  });
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
