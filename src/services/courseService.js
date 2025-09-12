import { getAuthHeader } from '../services/authHeader'; // adjust path as needed
import axios from 'axios';

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
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/create-lesson`, {
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

// Create lesson content
export async function createLessonContent(lessonContentData) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/lessoncontent/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(lessonContentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Failed to create lesson content (${response.status})`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error creating lesson content:', error);
    throw error;
  }
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
        title: (moduleData.title || `Module ${i + 1}`).length > 150 ? 
               (moduleData.title || `Module ${i + 1}`).substring(0, 147) + '...' : 
               (moduleData.title || `Module ${i + 1}`),
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
          
          // Generate structured lesson content for AI-generated lessons
          let lessonContent = '';
          
          // First priority: Use rich content from contentBlocks if available
          if (lessonData.richContent) {
            lessonContent = lessonData.richContent;
            console.log('Using rich content from contentBlocks for lesson:', lessonData.title);
          }
          // Second priority: Handle new AI-generated lesson structure
          else if (lessonData.heading || lessonData.introduction || lessonData.content || lessonData.summary) {
            // Build structured HTML content for AI lessons
            if (lessonData.heading) {
              lessonContent += `<h1 class="text-3xl font-bold mb-6 text-slate-800">${lessonData.heading}</h1>\n\n`;
            }
            
            if (lessonData.introduction) {
              lessonContent += `<div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">\n`;
              lessonContent += `<h3 class="text-lg font-semibold text-blue-800 mb-2">Introduction</h3>\n`;
              lessonContent += `<p class="text-blue-700">${lessonData.introduction}</p>\n`;
              lessonContent += `</div>\n\n`;
            }
            
            if (lessonData.content && Array.isArray(lessonData.content)) {
              lessonContent += `<h2 class="text-2xl font-bold mb-4 text-slate-800">Key Learning Points</h2>\n\n`;
              lessonData.content.forEach((point, index) => {
                lessonContent += `<div class="bg-gray-50 border border-gray-200 p-4 mb-4 rounded-lg">\n`;
                lessonContent += `<h4 class="text-lg font-semibold text-gray-800 mb-2">${index + 1}. ${point.title}</h4>\n`;
                lessonContent += `<p class="text-gray-700">${point.description}</p>\n`;
                lessonContent += `</div>\n\n`;
              });
            }
            
            if (lessonData.images && Array.isArray(lessonData.images)) {
              lessonContent += `<h2 class="text-2xl font-bold mb-4 text-slate-800">Visual Learning</h2>\n\n`;
              lessonData.images.forEach((image, index) => {
                lessonContent += `<div class="mb-6 text-center">\n`;
                lessonContent += `<img src="${image.url}" alt="${image.alt}" class="w-full max-w-2xl mx-auto rounded-lg shadow-md mb-3" />\n`;
                lessonContent += `<p class="text-sm text-slate-600 italic">${image.caption}</p>\n`;
                lessonContent += `</div>\n\n`;
              });
            }
            
            if (lessonData.summary) {
              lessonContent += `<div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">\n`;
              lessonContent += `<h3 class="text-lg font-semibold text-green-800 mb-2">Summary</h3>\n`;
              lessonContent += `<p class="text-green-700">${lessonData.summary}</p>\n`;
              lessonContent += `</div>\n\n`;
            }
          } else {
            // Fallback to old format for backward compatibility
            if (lessonData.intro) {
              lessonContent += `${lessonData.intro}\n\n`;
            }
            if (lessonData.subtopics && lessonData.subtopics.length > 0) {
              lessonContent += `## Key Topics:\n\n`;
              lessonData.subtopics.forEach((topic, index) => {
                lessonContent += `### ${index + 1}. ${topic}\n\n`;
              });
            }
            if (lessonData.examples && lessonData.examples.length > 0) {
              lessonContent += `## Examples:\n\n`;
              lessonData.examples.forEach((example, index) => {
                lessonContent += `**Example ${index + 1}:** ${example}\n\n`;
              });
            }
            if (lessonData.summary) {
              lessonContent += `## Summary:\n\n${lessonData.summary}`;
            }
          }

          const lessonPayload = {
            title: (lessonData.title || `Lesson ${j + 1}`).length > 150 ? 
                   (lessonData.title || `Lesson ${j + 1}`).substring(0, 147) + '...' : 
                   (lessonData.title || `Lesson ${j + 1}`),
            description: lessonContent || lessonData.intro || `This lesson covers ${lessonData.title || 'key concepts'}.`,
            order: j + 1,
            status: 'PUBLISHED'
          };
          
          console.log('Lesson payload being sent:', lessonPayload);
          
          try {
            const moduleId = createdModules[createdModules.length - 1]?.id || createdModules[createdModules.length - 1]?._id;
            console.log('Using module ID for lesson creation:', moduleId);
            
            const createdLesson = await createLesson(courseId, moduleId, lessonPayload);
            createdLessons.push(createdLesson);
            
            // Create lesson content if we have structured content
            if (lessonContent && createdLesson?.data?.id) {
              try {
                const lessonContentPayload = {
                  lesson_id: createdLesson.data.id,
                  content: lessonContent,
                  content_type: 'html'
                };
                
                console.log('Creating lesson content for lesson:', createdLesson.data.id);
                console.log('Lesson content payload:', lessonContentPayload);
                
                const contentResult = await createLessonContent(lessonContentPayload);
                console.log('Lesson content created successfully:', contentResult);
              } catch (contentError) {
                console.error('Failed to create lesson content:', contentError);
                console.error('Content error details:', {
                  lessonId: createdLesson.data.id,
                  contentLength: lessonContent.length,
                  error: contentError.message
                });
                // Don't fail the entire process, just log the error
                console.warn('Continuing without lesson content for lesson:', lessonData.title);
              }
            } else {
              console.warn('No lesson content to create for lesson:', lessonData.title, {
                hasContent: !!lessonContent,
                hasLessonId: !!createdLesson?.data?.id
              });
            }
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