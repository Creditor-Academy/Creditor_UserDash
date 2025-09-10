import { getAuthHeader } from '../services/authHeader'; // adjust path as needed

export async function fetchAllCourses() {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getAllCourses`, {
      method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  },
  credentials: 'include',
});
  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }
  const data = await response.json();
  return data.data;
}

export async function fetchCourseById(courseId) {
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/getCourseById/${courseId}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  },
  credentials: 'include',
});
if (!response.ok) {
  throw new Error('Failed to fetch course details');
}
const data = await response.json();
return data.data || data;
}

export async function fetchUserCourses(withModules = false) {
  const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/api/course/getCourses`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user courses');
  }
  
  const data = await response.json();
  return data.data;
}

export async function createCourse(courseData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/createCourse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
    body: JSON.stringify(courseData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to create course (${response.status})`);
  }
  
  const data = await response.json();
  return data;
}

export async function createAICourse(courseData) {
  console.log('createAICourse called with:', courseData);
  
  // Use EXACT same structure as working CreateCourseModal - no extra fields
  const aiCourseData = {
    title: courseData.title || '',
    description: courseData.description || '',
    learning_objectives: courseData.objectives ? courseData.objectives.split('\n').map(s => s.trim()).filter(Boolean) : [],
    isHidden: false,
    course_status: 'DRAFT',
    estimated_duration: courseData.duration || '4 weeks',
    max_students: Number(courseData.max_students) || 100,
    course_level: 'BEGINNER',
    courseType: 'OPEN', 
    lockModules: 'UNLOCKED',
    price: courseData.price || '0',
    requireFinalQuiz: true,
    thumbnail: courseData.thumbnail || null
  };

  console.log('Sending AI course data:', aiCourseData);

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/createCourse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
    body: JSON.stringify(aiCourseData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Full API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: errorText
    });
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
      console.error('Parsed error data:', errorData);
    } catch {
      errorData = { message: errorText || 'Unknown error' };
    }
    
    throw new Error(errorData.message || errorText || `Failed to create AI course (${response.status})`);
  }
  
  const data = await response.json();
  console.log('Course created successfully:', data);
  return data;
}

export async function updateCourse(courseId, courseData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/editCourse/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
    body: JSON.stringify(courseData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to update course (${response.status})`);
  }
  
  const data = await response.json();
  return data;
}

// Create lesson in a module
export async function createLesson(courseId, moduleId, lessonData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lessons/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
    body: JSON.stringify(lessonData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to create lesson (${response.status})`);
  }

  const data = await response.json();
  return data.data || data;
}

// Create AI-generated modules and lessons for a course
export async function createAIModulesAndLessons(courseId, outlines) {
  console.log('Creating AI modules and lessons for course:', courseId, 'outlines:', outlines);
  
  if (!outlines || outlines.length === 0) {
    console.log('No outlines provided, skipping module creation');
    return { success: true, modules: [], lessons: [] };
  }

  const createdModules = [];
  const createdLessons = [];

  try {
    // Get the latest outline (most recently generated)
    const latestOutline = outlines[outlines.length - 1];
    console.log('Latest outline:', latestOutline);
    
    if (!latestOutline.modules || latestOutline.modules.length === 0) {
      console.log('No modules in outline, skipping creation');
      return { success: true, modules: [], lessons: [] };
    }

    console.log(`Found ${latestOutline.modules.length} modules to create`);

    // Create each module and its lessons
    for (let i = 0; i < latestOutline.modules.length; i++) {
      const moduleData = latestOutline.modules[i];
      
      console.log(`Creating module ${i + 1}:`, moduleData.title);
      console.log('Module data:', moduleData);
      
      // Create module
      const modulePayload = {
        title: moduleData.title || `Module ${i + 1}`,
        description: moduleData.description || 'test description',
        order: i + 1,
        estimated_duration: 60,
        module_status: 'PUBLISHED',
        thumbnail: 'test thumbnail'
      };
      
      console.log('Module payload being sent:', modulePayload);
      
      try {
        const createdModule = await createModule(courseId, modulePayload);
        createdModules.push(createdModule);
        console.log('Module created successfully:', createdModule);
      } catch (moduleError) {
        console.error(`Failed to create module ${i + 1}:`, moduleError);
        throw new Error(`Failed to create module "${moduleData.title}": ${moduleError.message}`);
      }
      
      // Create lessons for this module if they exist
      if (moduleData.lessons && moduleData.lessons.length > 0) {
        console.log(`Creating ${moduleData.lessons.length} lessons for module ${i + 1}`);
        
        for (let j = 0; j < moduleData.lessons.length; j++) {
          const lessonData = moduleData.lessons[j];
          
          console.log(`Creating lesson ${j + 1} in module ${i + 1}:`, lessonData.title);
          
          const lessonPayload = {
            title: lessonData.title || `Lesson ${j + 1}`,
            description: lessonData.description || '',
            content: lessonData.content || '',
            lesson_order: j + 1,
            duration: lessonData.duration || '20 min',
            isPublished: true
          };
          
          console.log('Lesson payload being sent:', lessonPayload);
          
          try {
            const moduleId = createdModules[createdModules.length - 1]?.id || createdModules[createdModules.length - 1]?._id;
            console.log('Using module ID for lesson creation:', moduleId);
            
            const createdLesson = await createLesson(courseId, moduleId, lessonPayload);
            createdLessons.push(createdLesson);
            console.log('Lesson created successfully:', createdLesson);
          } catch (lessonError) {
            console.error(`Failed to create lesson ${j + 1} in module ${i + 1}:`, lessonError);
            // Don't fail the entire process for lesson errors, just log and continue
            console.warn(`Skipping lesson "${lessonData.title}" due to error: ${lessonError.message}`);
          }
        }
      } else {
        console.log(`No lessons found for module ${i + 1}`);
      }
    }
    
    console.log(`Successfully created ${createdModules.length} modules and ${createdLessons.length} lessons`);
    
    return {
      success: true,
      modules: createdModules,
      lessons: createdLessons
    };
    
  } catch (error) {
    console.error('Error creating AI modules and lessons:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to create AI modules and lessons: ${error.message}`);
  }
}

export async function fetchCourseUsers(courseId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/getAllUsersByCourseId`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch course users');
  }
  
  const data = await response.json();
  return data.data || [];
}

export async function fetchCourseModules(courseId) {
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/getAllModules`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  },
  credentials: 'include',
});
if (!response.ok) {
  throw new Error('Failed to fetch course modules');
}
const data = await response.json();
return data.data || data; // Handle different response structures
}

export async function createModule(courseId, moduleData) {
  console.log('createModule called with:', { courseId, moduleData });
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(moduleData),
    });

    console.log('createModule response status:', response.status);
    console.log('createModule response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('createModule error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Unknown error' };
      }
      
      throw new Error(errorData.message || errorText || `Failed to create module (${response.status})`);
    }

    const data = await response.json();
    console.log('createModule success response:', data);
    return data.data || data;
    
  } catch (error) {
    console.error('createModule caught error:', error);
    throw error;
  }
}

export async function updateModule(courseId, moduleId, moduleData) {
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/update`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  },
  credentials: 'include',
  body: JSON.stringify(moduleData),
});
if (!response.ok) {
  const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
  throw new Error(errorData.message || `Failed to update module (${response.status})`);
}
const data = await response.json();
return data.data || data;
}

export async function deleteModule(courseId, moduleId, moduleData) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'text/plain',
      ...getAuthHeader(),
    },
    credentials: 'include',
    body: JSON.stringify(moduleData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to delete module (${response.status})`);
  }
  const data = await response.json();
  return data.data || data;
}

export async function deleteCourse(courseId) {
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to delete course (${response.status})`);
  }
  
  const data = await response.json();
  return data.data || data;
}

export async function unenrollUser(courseId, userId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/unenrollUser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
    body: JSON.stringify({ userId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to unenroll user (${response.status})`);
  }
  
  const data = await response.json();
  return data;
}

// Example usage in a fetch call:
export async function someApiFunction() {
  const response = await fetch(`${API_BASE}/api/someEndpoint`, {
    method: 'GET', // or 'POST', etc.
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
  });
  // ...existing code...
}