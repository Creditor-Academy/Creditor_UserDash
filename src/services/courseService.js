import { getAuthHeader } from '../services/authHeader'; // adjust path as needed
import api from './apiClient'; // Enhanced API client
import axios from 'axios';

export async function fetchAllCourses() {
  try {
    // Use the enhanced API client
    const response = await api.get('/api/course/getAllCourses');

    console.log('fetchAllCourses success response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('fetchAllCourses error response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to fetch courses (${error.response?.status || 'Unknown'})`
    );
  }
}

export async function fetchCourseById(courseId) {
  try {
    // Use the enhanced API client
    const response = await api.get(`/api/course/getCourseById/${courseId}`);

    console.log('fetchCourseById success response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('fetchCourseById error response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to fetch course details (${error.response?.status || 'Unknown'})`
    );
  }
}

export async function fetchUserCourses(withModules = false) {
  try {
    // Use the enhanced API client
    const response = await api.get('/api/course/getCourses');

    console.log('fetchUserCourses success response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('fetchUserCourses error response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to fetch user courses (${error.response?.status || 'Unknown'})`
    );
  }
}

export async function createCourse(courseData) {
  const cleanTitle = (courseData.title || '').trim();
  const cleanDescription =
    (courseData.description || '').trim() ||
    (cleanTitle
      ? `Comprehensive course on ${cleanTitle}.`
      : 'Course description to be updated.');
  const payload = {
    ...courseData,
    title: cleanTitle,
    description: cleanDescription,
  };

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/course/createCourse`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new Error(
      errorData.errorMessage ||
        errorData.message ||
        `Failed to create course (${response.status})`
    );
  }

  const data = await response.json();
  return data;
}

export async function createAICourse(courseData) {
  console.log('createAICourse called with:', courseData);

  // Use EXACT same structure as working CreateCourseModal - no extra fields
  const cleanTitle = (courseData.title || '').trim();
  let cleanDescription = (courseData.description || '').trim();
  // Backend validation requires description to be non-empty
  if (!cleanDescription) {
    cleanDescription = cleanTitle
      ? `Comprehensive course on ${cleanTitle}.`
      : 'Course description to be updated.';
  }

  // Handle thumbnail URL length validation (backend expects ≤ 600 characters)
  let thumbnailUrl = courseData.thumbnail || null;
  if (thumbnailUrl && thumbnailUrl.length > 600) {
    console.warn(
      `⚠️ Thumbnail URL too long (${thumbnailUrl.length} chars, limit: 600)`
    );
    console.log('Original URL:', thumbnailUrl);
    thumbnailUrl = null; // Use fallback for extremely long URLs
  } else if (thumbnailUrl) {
    console.log(
      `✅ Thumbnail URL length OK (${thumbnailUrl.length} chars, limit: 600)`
    );
  }

  const aiCourseData = {
    title: cleanTitle,
    description: cleanDescription,
    learning_objectives: courseData.objectives
      ? courseData.objectives
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
      : [],
    isHidden: false,
    course_status: 'DRAFT',
    estimated_duration: courseData.duration || '4 weeks',
    max_students: Number(courseData.max_students) || 100,
    course_level: 'BEGINNER',
    courseType: 'OPEN',
    lockModules: 'UNLOCKED',
    price: courseData.price || '0',
    requireFinalQuiz: true,
    thumbnail: thumbnailUrl,
  };

  console.log('Sending AI course data:', aiCourseData);

  try {
    // Use the enhanced API client
    const response = await api.post('/api/course/createCourse', aiCourseData);

    console.log('Course created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Full API Error Response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to create AI course (${error.response?.status || 'Unknown'})`
    );
  }
}

export async function updateCourse(courseId, courseData) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/course/editCourse/${courseId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(courseData),
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new Error(
      errorData.message || `Failed to update course (${response.status})`
    );
  }

  const data = await response.json();
  return data;
}

// Create lesson in a module
export async function createLesson(courseId, moduleId, lessonData) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/create-lesson`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(lessonData),
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new Error(
      errorData.message || `Failed to create lesson (${response.status})`
    );
  }

  const data = await response.json();
  return data.data || data;
}

// Update lesson content using PUT method with lesson ID
export async function updateLessonContent(lessonId, contentData) {
  try {
    console.log('Updating lesson content for lesson:', lessonId);
    console.log('Content data:', contentData);

    // Use the enhanced API client instead of raw fetch to avoid CORS issues
    const response = await api.put(
      `/api/lessoncontent/update/${lessonId}`,
      contentData,
      {
        timeout: 30000, // 30 second timeout
      }
    );

    console.log('updateLessonContent success response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('updateLessonContent error response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.message;

    throw new Error(
      backendMessage ||
        `Failed to update lesson content (${error.response?.status || 'Unknown'})`
    );
  }
}

// Create AI-generated modules and lessons for a course
export async function createAIModulesAndLessons(courseId, outlines) {
  console.log(
    'Creating AI modules and lessons for course:',
    courseId,
    'outlines:',
    outlines
  );

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
        title:
          (moduleData.title || `Module ${i + 1}`).length > 150
            ? (moduleData.title || `Module ${i + 1}`).substring(0, 147) + '...'
            : moduleData.title || `Module ${i + 1}`,
        description:
          moduleData.description || 'AI generated module description',
        order: i + 1,
        estimated_duration: 60,
        module_status: 'PUBLISHED',
        price: '0',
      };

      // Only include thumbnail if it has a valid value
      const thumbnailUrl =
        moduleData.thumbnail || moduleData.module_thumbnail_url;
      if (thumbnailUrl && thumbnailUrl.trim() !== '') {
        modulePayload.thumbnail = thumbnailUrl;
      }

      console.log('Module payload being sent:', modulePayload);

      try {
        const createdModule = await createModule(courseId, modulePayload);
        createdModules.push(createdModule);
        console.log('Module created successfully:', createdModule);
      } catch (moduleError) {
        console.error(`Failed to create module ${i + 1}:`, moduleError);
        throw new Error(
          `Failed to create module "${moduleData.title}": ${moduleError.message}`
        );
      }

      // Create lessons for this module if they exist
      if (moduleData.lessons && moduleData.lessons.length > 0) {
        console.log(
          `Creating ${moduleData.lessons.length} lessons for module ${i + 1}`
        );

        for (let j = 0; j < moduleData.lessons.length; j++) {
          const lessonData = moduleData.lessons[j];

          console.log(
            `Creating lesson ${j + 1} in module ${i + 1}:`,
            lessonData.title
          );

          // Generate structured lesson content for AI-generated lessons
          let lessonContent = '';

          // First priority: Use rich content from contentBlocks if available
          if (lessonData.richContent) {
            lessonContent = lessonData.richContent;
            console.log(
              'Using rich content from contentBlocks for lesson:',
              lessonData.title
            );
          }
          // Second priority: Handle new AI-generated lesson structure or generate via prompt
          else if (
            lessonData.heading ||
            lessonData.introduction ||
            lessonData.content ||
            lessonData.summary
          ) {
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

          // If lesson lacks structured content, attempt prompt-to-lesson generation
          try {
            if (
              !lessonData.introduction &&
              !lessonData.content &&
              !lessonData.summary
            ) {
              console.log(
                `📝 Generating lesson content from prompt for: "${lessonData.title}"`
              );
              const { generateLessonFromPrompt } = await import(
                './aiCourseService'
              );
              const gen = await generateLessonFromPrompt(lessonData.title, {
                context: moduleData.title,
              });
              if (gen?.success) {
                lessonData.content = {
                  introduction: gen.data.introduction,
                  mainContent: gen.data.mainContent,
                  examples: gen.data.examples,
                  keyTakeaways: gen.data.keyTakeaways,
                  summary: gen.data.summary,
                };
                console.log(
                  `✅ Lesson content generated successfully for: ${lessonData.title}`
                );
              } else {
                console.warn(
                  `⚠️ Lesson content generation returned no data for: ${lessonData.title}`,
                  gen
                );
              }
            }
          } catch (genErr) {
            console.error('❌ Prompt-to-lesson generation failed:', {
              lesson: lessonData.title,
              error: genErr.message,
              stack: genErr.stack,
            });
            console.warn(
              `⚠️ Skipping prompt-to-lesson generation for "${lessonData.title}": ${genErr.message}`
            );
            // Continue without generated content - lesson creation can still succeed
          }

          // Generate AI-powered lesson description
          let cleanDescription =
            lessonData.introduction || lessonData.content?.introduction;

          if (!cleanDescription) {
            // Fallback to smart template-based descriptions (removed Bytez dependency)
            cleanDescription = lessonData.title.includes('React')
              ? 'React is a frontend framework for building user interfaces.'
              : lessonData.title.includes('JavaScript')
                ? 'JavaScript is a programming language for web development.'
                : lessonData.title.includes('Python')
                  ? 'Python is a versatile programming language.'
                  : lessonData.title.includes('CSS')
                    ? 'CSS is used for styling web pages.'
                    : lessonData.title.includes('HTML')
                      ? 'HTML is the markup language for web pages.'
                      : `${lessonData.title} fundamentals and concepts.`;
          }

          // Auto-generate Q&A pairs and an illustrative image for the lesson
          let qaPairs = [];
          try {
            const { generateQAPairs } = await import('./aiCourseService');
            const qaRes = await generateQAPairs(
              lessonData.title,
              3,
              lessonData.introduction || moduleData.title || ''
            );
            qaPairs = qaRes?.data?.qa || [];
            if (qaPairs.length > 0) {
              console.log(
                `✅ Generated ${qaPairs.length} Q&A pairs for lesson: ${lessonData.title}`
              );
            }
          } catch (qaError) {
            console.error('❌ QA generation failed:', {
              lesson: lessonData.title,
              error: qaError.message,
              stack: qaError.stack,
            });
            console.warn(
              `⚠️ Skipping Q&A generation for "${lessonData.title}": ${qaError.message}`
            );
            // Continue without Q&A pairs - lesson creation can still succeed
          }

          let illustrativeImage = null;
          let imgPrompt = '';
          try {
            if (!lessonData.content?.multimedia?.image) {
              const { generateCourseImage } = await import('./aiCourseService');
              imgPrompt = `Educational illustration for lesson "${lessonData.title}"`;
              console.log(
                `🎨 Generating image for lesson "${lessonData.title}" with prompt: "${imgPrompt}"`
              );
              const imgRes = await generateCourseImage(imgPrompt, {
                style: 'illustration',
                size: '1024x1024',
              });
              if (imgRes?.success && imgRes?.data?.url) {
                illustrativeImage = imgRes.data.url;
                console.log(
                  `✅ Image generated successfully for lesson: ${lessonData.title}`
                );
              } else {
                console.warn(
                  `⚠️ Image generation returned no URL for lesson: ${lessonData.title}`,
                  imgRes
                );
              }
            } else {
              illustrativeImage = lessonData.content.multimedia.image;
              console.log(
                `ℹ️ Using existing image for lesson: ${lessonData.title}`
              );
            }
          } catch (imgError) {
            console.error('❌ Image generation failed:', {
              lesson: lessonData.title,
              error: imgError.message,
              stack: imgError.stack,
              prompt: imgPrompt || 'N/A',
            });
            console.warn(
              `⚠️ Skipping image generation for "${lessonData.title}": ${imgError.message}`
            );
            // Continue without image - lesson creation can still succeed
          }

          const lessonPayload = {
            title: lessonData.title,
            description: cleanDescription,
            order: lessonData.order || j + 1,
            status: 'PUBLISHED',
          };

          // Only include thumbnail if it has a valid value
          const lessonThumbnailUrl =
            lessonData.thumbnail || lessonData.lesson_thumbnail_url;
          if (lessonThumbnailUrl && lessonThumbnailUrl.trim() !== '') {
            lessonPayload.thumbnail = lessonThumbnailUrl;
          }

          console.log('Lesson payload being sent:', lessonPayload);

          try {
            const moduleId =
              createdModules[createdModules.length - 1]?.data?.id ||
              createdModules[createdModules.length - 1]?.id;
            console.log('Using module ID for lesson creation:', moduleId);

            if (!moduleId) {
              throw new Error('Module ID is missing');
            }

            const createdLesson = await createLesson(
              courseId,
              moduleId,
              lessonPayload
            );
            createdLessons.push(createdLesson);

            // Update lesson content using PUT method with proper JSON format
            const lessonId = createdLesson?.data?.id || createdLesson?.id;
            if (lessonContent && lessonId) {
              try {
                // Create content as block-based array matching LessonBuilder format
                // Use lesson ID for consistent block IDs to prevent regeneration on edits
                const baseId = lessonId.replace(/-/g, '').substring(0, 8);
                const contentBlocks = [
                  // Title Block
                  {
                    type: 'text',
                    script: '',
                    block_id: `block_${baseId}_title`,
                    html_css: `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
        <div class="pl-4">
          <h1 class="text-2xl font-bold text-gray-800">${lessonData.title}</h1>
        </div>
      </div>
    `,
                  },
                  // Introduction Block
                  {
                    type: 'text',
                    script: '',
                    block_id: `block_${baseId}_intro`,
                    html_css: `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-2xl"></div>
        <div class="pl-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Introduction</h2>
          <p class="text-base text-gray-700">${lessonData.introduction || lessonData.content?.introduction || `${lessonData.title} is a modern framework for building applications.`}</p>
        </div>
      </div>
    `,
                  },
                  // Main Content Block
                  {
                    type: 'text',
                    script: '',
                    block_id: `block_${baseId}_content`,
                    html_css: `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-green-500 to-teal-500 rounded-l-2xl"></div>
        <div class="pl-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Key Concepts</h2>
          ${
            Array.isArray(lessonData.content?.mainContent)
              ? lessonData.content.mainContent
                  .map(
                    (point, index) =>
                      `<div class="mb-3 p-3 bg-gray-50 rounded-lg">
                <p class="text-base text-gray-700"><strong>${index + 1}.</strong> ${point}</p>
              </div>`
                  )
                  .join('')
              : `<p class="text-base text-gray-700">${lessonData.content?.mainContent || lessonContent.replace(/<[^>]*>/g, ' ').trim()}</p>`
          }
        </div>
      </div>
    `,
                  },
                ];

                // Add Examples Block if available
                if (
                  Array.isArray(lessonData.content?.examples) &&
                  lessonData.content.examples.length > 0
                ) {
                  contentBlocks.push({
                    type: 'text',
                    script: '',
                    block_id: `block_${baseId}_examples`,
                    html_css: `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-purple-500 to-pink-500 rounded-l-2xl"></div>
        <div class="pl-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Examples</h2>
          ${lessonData.content.examples
            .map(
              example =>
                `<div class="mb-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <h4 class="font-semibold text-purple-800 mb-2">${example.title}</h4>
              <p class="text-gray-700">${example.description}</p>
            </div>`
            )
            .join('')}
        </div>
      </div>
    `,
                  });
                }

                // Add Multimedia Block (use generated image if original missing)
                const imageToUse =
                  lessonData.content?.multimedia?.image || illustrativeImage;
                if (imageToUse || lessonData.content?.multimedia?.video) {
                  contentBlocks.push({
                    type: 'text',
                    script: '',
                    block_id: `block_${baseId}_multimedia`,
                    html_css: `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-red-500 to-orange-500 rounded-l-2xl"></div>
        <div class="pl-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Visual Learning</h2>
          ${
            imageToUse
              ? `<div class="mb-4 text-center">
              <img src="${imageToUse}" alt="Lesson illustration" class="max-w-full h-auto rounded-lg shadow-md" />
            </div>`
              : ''
          }
          ${
            lessonData.content?.multimedia?.video
              ? `<div class="mb-4 text-center">
              <video controls class="max-w-full h-auto rounded-lg shadow-md">
                <source src="${lessonData.content.multimedia.video}" type="video/mp4" />
              </video>
            </div>`
              : ''
          }
        </div>
      </div>
    `,
                  });
                }

                // Add Generated Q&A Block (always if we have generated pairs)
                if (qaPairs.length > 0) {
                  contentBlocks.push({
                    type: 'text',
                    script: '',
                    block_id: `block_${baseId}_qa_pairs`,
                    html_css: `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-l-2xl"></div>
        <div class="pl-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Practice Q&A</h2>
          ${qaPairs
            .map(
              (qa, idx) => `
            <div class="mb-4 p-4 bg-cyan-50 rounded-lg border">
              <p class="font-semibold text-cyan-800">Q${idx + 1}. ${qa.question}</p>
              <p class="text-gray-700 mt-1"><span class="font-medium">Answer:</span> ${qa.answer}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `,
                  });
                }

                // Add Q&A Block if available
                if (
                  Array.isArray(lessonData.content?.qa) &&
                  lessonData.content.qa.length > 0
                ) {
                  contentBlocks.push({
                    type: 'text',
                    script:
                      "document.querySelectorAll('.qa-item').forEach(item => { item.addEventListener('click', () => { item.classList.toggle('expanded'); }); });",
                    block_id: `block_${baseId}_qa`,
                    html_css: `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-l-2xl"></div>
        <div class="pl-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Questions & Answers</h2>
          ${lessonData.content.qa
            .map(
              (qa, index) =>
                `<div class="qa-item mb-4 p-4 bg-cyan-50 rounded-lg border cursor-pointer hover:bg-cyan-100 transition">
              <h4 class="font-semibold text-cyan-800 mb-2">Q${index + 1}: ${qa.question}</h4>
              <p class="text-gray-700"><strong>A:</strong> ${qa.answer}</p>
            </div>`
            )
            .join('')}
        </div>
      </div>
    `,
                  });
                }

                // Add Key Takeaways Block if available
                if (
                  Array.isArray(lessonData.content?.keyTakeaways) &&
                  lessonData.content.keyTakeaways.length > 0
                ) {
                  contentBlocks.push({
                    type: 'text',
                    script: '',
                    block_id: `block_${baseId}_takeaways`,
                    html_css: `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-orange-500 to-red-500 rounded-l-2xl"></div>
        <div class="pl-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Key Takeaways</h2>
          <ul class="space-y-3">
            ${lessonData.content.keyTakeaways
              .map(
                (takeaway, index) =>
                  `<li class="flex items-start p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <span class="font-bold text-orange-600 mr-3">${index + 1}.</span>
                <span class="text-gray-700">${takeaway}</span>
              </li>`
              )
              .join('')}
          </ul>
        </div>
      </div>
    `,
                  });
                }

                // Add Summary Block
                contentBlocks.push({
                  type: 'text',
                  script: '',
                  block_id: `block_${baseId}_summary`,
                  html_css: `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-green-500 to-emerald-500 rounded-l-2xl"></div>
        <div class="pl-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
          <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <p class="text-gray-700">${lessonData.content?.summary || lessonData.summary || `${lessonData.title} concepts covered.`}</p>
          </div>
        </div>
      </div>
    `,
                });

                // Backend expects 'content' field with block array
                const contentData = {
                  content: contentBlocks,
                };

                console.log('Updating lesson content for lesson:', lessonId);
                console.log('Content data structure:', {
                  hasContent: !!contentData.content,
                  blocksCount: contentData.content?.length || 0,
                  blockTypes:
                    contentData.content?.map(block => block.type) || [],
                });

                const contentResult = await updateLessonContent(
                  lessonId,
                  contentData
                );
                console.log(
                  'Lesson content updated successfully:',
                  contentResult
                );
              } catch (contentError) {
                console.error('Failed to update lesson content:', contentError);
                console.error('Content error details:', {
                  lessonId: lessonId,
                  error: contentError.message,
                });
                console.warn(
                  'Continuing without lesson content for lesson:',
                  lessonData.title
                );
              }
            } else {
              console.log(
                '✅ Lesson content stored in description field, no separate content needed'
              );
            }
            console.log('Lesson created successfully:', createdLesson);
          } catch (lessonError) {
            console.error(
              `Failed to create lesson ${j + 1} in module ${i + 1}:`,
              lessonError
            );
            // Don't fail the entire process for lesson errors, just log and continue
            console.warn(
              `Skipping lesson "${lessonData.title}" due to error: ${lessonError.message}`
            );
          }
        }
      } else {
        console.log(`No lessons found for module ${i + 1}`);
      }
    }

    // After creating lessons, auto-generate a module quiz using generated content
    try {
      const createdModuleId =
        createdModules[createdModules.length - 1]?.data?.id ||
        createdModules[createdModules.length - 1]?.id;
      if (createdModuleId) {
        const { createQuiz, bulkUploadQuestions } = await import(
          './quizServices'
        );
        const { generateAssessmentQuestions } = await import(
          './aiCourseService'
        );
        const quizTitle = `${moduleData.title} - Knowledge Check`;
        const quizCreateRes = await createQuiz({
          title: quizTitle,
          module_id: createdModuleId,
          max_attempts: 3,
          min_score: 60,
          total_score: 100,
        });
        const quizId = quizCreateRes?.data?.id || quizCreateRes?.id;
        if (quizId) {
          const assess = await generateAssessmentQuestions(moduleData.title, 5);
          const questionsPayload = { questions: assess?.data?.questions || [] };
          if (questionsPayload.questions.length > 0) {
            await bulkUploadQuestions(quizId, questionsPayload);
            console.log(
              '✅ Auto-generated assessment uploaded for module:',
              moduleData.title
            );
          }
        }
      }
    } catch (quizErr) {
      console.warn(
        'Auto-quiz generation skipped:',
        quizErr?.message || quizErr
      );
    }

    console.log(
      `Successfully created ${createdModules.length} modules and ${createdLessons.length} lessons`
    );

    return {
      success: true,
      modules: createdModules,
      lessons: createdLessons,
    };
  } catch (error) {
    console.error('Error creating AI modules and lessons:', error);
    console.error('Error stack:', error.stack);
    throw new Error(
      `Failed to create AI modules and lessons: ${error.message}`
    );
  }
}

export async function fetchCourseUsers(courseId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/getAllUsersByCourseId`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch course users');
  }

  const data = await response.json();
  return data.data || [];
}

export async function fetchCourseModules(courseId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/getAllModules`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch course modules');
  }
  const data = await response.json();
  return data.data || data; // Handle different response structures
}
export async function createModule(courseId, moduleData) {
  console.log('createModule called with:', { courseId, moduleData });

  try {
    // Use the enhanced API client
    const response = await api.post(
      `/api/course/${courseId}/modules/create`,
      moduleData
    );

    console.log('createModule success response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('createModule error response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to create module (${error.response?.status || 'Unknown'})`
    );
  }
}

export async function updateModule(courseId, moduleId, moduleData) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/update`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(moduleData),
    }
  );
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new Error(
      errorData.message || `Failed to update module (${response.status})`
    );
  }
  const data = await response.json();
  return data.data || data;
}

export async function deleteModule(courseId, moduleId, moduleData) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/delete`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'text/plain',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(moduleData),
    }
  );
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new Error(
      errorData.message || `Failed to delete module (${response.status})`
    );
  }
  const data = await response.json();
  return data.data || data;
}

export async function deleteCourse(courseId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/delete`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new Error(
      errorData.message || `Failed to delete course (${response.status})`
    );
  }

  const data = await response.json();
  return data.data || data;
}

export async function unenrollUser(courseId, userId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/courses/${courseId}/unenrollUser`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify({ userId }),
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new Error(
      errorData.message || `Failed to unenroll user (${response.status})`
    );
  }

  const data = await response.json();
  return data;
}

export async function fetchCoursePrice(courseId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/price`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    // If price endpoint doesn't exist, return null to use fallback pricing
    return null;
  }

  const data = await response.json();
  return data.data || data;
}

// Fetch purchased/individually unlocked modules for a given course.
// Optional userId can be supplied to fetch for a specific user (e.g., admin view).
export async function fetchPurchasedModulesByCourse(courseId, userId) {
  if (!courseId)
    throw new Error('fetchPurchasedModulesByCourse: courseId is required');

  const base = import.meta.env.VITE_API_BASE_URL;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };

  // Use the exact backend route first and only
  const url = `${base}/api/course/${encodeURIComponent(courseId)}/modules/getPurchasedModules`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    // Treat 404 as "no purchased modules" rather than an error
    if (response.status === 404) return [];
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json().catch(() => ({}));
    const payload = data?.data ?? data ?? [];
    return Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.items)
        ? payload.items
        : [];
  } catch (err) {
    // Fail silently with [] so UI can continue rendering other courses
    console.warn('[fetchPurchasedModulesByCourse] failed', {
      courseId,
      message: err?.message,
    });
    return [];
  }
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
