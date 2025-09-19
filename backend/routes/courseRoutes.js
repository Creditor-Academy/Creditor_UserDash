const express = require('express');
const router = express.Router();

// Mock data storage (in a real implementation, this would be a database)
let courses = [];
let modules = [];
let lessons = [];
let nextCourseId = 1;
let nextModuleId = 1;
let nextLessonId = 1;

// Helper function to simulate database operations
const findCourseById = (id) => courses.find(course => course.id == id);
const findModuleById = (id) => modules.find(module => module.id == id);
const findModulesByCourseId = (courseId) => modules.filter(module => module.courseId == courseId);
const findLessonsByModuleId = (moduleId) => lessons.filter(lesson => lesson.moduleId == moduleId);

// Export the data storage and helper functions for use in other modules
module.exports = router;
module.exports.courses = courses;
module.exports.modules = modules;
module.exports.lessons = lessons;
module.exports.nextCourseId = nextCourseId;
module.exports.nextModuleId = nextModuleId;
module.exports.nextLessonId = nextLessonId;
module.exports.findCourseById = findCourseById;
module.exports.findModuleById = findModuleById;
module.exports.findModulesByCourseId = findModulesByCourseId;
module.exports.findLessonsByModuleId = findLessonsByModuleId;

// GET /api/course/getAllCourses - Get all courses
router.get('/getAllCourses', (req, res) => {
  console.log('📚 Getting all courses');
  res.json({
    success: true,
    data: courses
  });
});

// GET /api/course/getCourses - Get user courses
router.get('/getCourses', (req, res) => {
  console.log('📚 Getting user courses');
  res.json({
    success: true,
    data: courses
  });
});

// GET /api/course/getCourseById/:courseId - Get course by ID
router.get('/getCourseById/:courseId', (req, res) => {
  const { courseId } = req.params;
  console.log('📚 Getting course by ID:', courseId);
  
  const course = findCourseById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }
  
  // Add modules to course
  const courseModules = findModulesByCourseId(courseId);
  const modulesWithLessons = courseModules.map(module => ({
    ...module,
    lessons: findLessonsByModuleId(module.id)
  }));
  
  res.json({
    success: true,
    data: {
      ...course,
      modules: modulesWithLessons
    }
  });
});

// POST /api/course/createCourse - Create a new course
router.post('/createCourse', (req, res) => {
  try {
    const courseData = req.body;
    console.log('🆕 Creating new course:', courseData.title);
    
    const newCourse = {
      id: nextCourseId++,
      ...courseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    courses.push(newCourse);
    
    console.log('✅ Course created successfully:', newCourse.id);
    res.status(201).json({
      success: true,
      data: newCourse
    });
  } catch (error) {
    console.error('❌ Failed to create course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course'
    });
  }
});

// PUT /api/course/editCourse/:courseId - Update course
router.put('/editCourse/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const updateData = req.body;
    console.log('✏️ Updating course:', courseId);
    
    const courseIndex = courses.findIndex(c => c.id == courseId);
    if (courseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    courses[courseIndex] = {
      ...courses[courseIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Course updated successfully:', courseId);
    res.json({
      success: true,
      data: courses[courseIndex]
    });
  } catch (error) {
    console.error('❌ Failed to update course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course'
    });
  }
});

// DELETE /api/course/:courseId/delete - Delete course
router.delete('/:courseId/delete', (req, res) => {
  try {
    const { courseId } = req.params;
    console.log('🗑️ Deleting course:', courseId);
    
    const courseIndex = courses.findIndex(c => c.id == courseId);
    if (courseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Remove course
    courses.splice(courseIndex, 1);
    
    // Remove associated modules
    modules = modules.filter(module => module.courseId != courseId);
    
    // Remove associated lessons
    lessons = lessons.filter(lesson => {
      const module = findModuleById(lesson.moduleId);
      return !module || module.courseId != courseId;
    });
    
    console.log('✅ Course deleted successfully:', courseId);
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('❌ Failed to delete course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
});

// Module routes
// POST /api/course/:courseId/modules/create - Create module
router.post('/:courseId/modules/create', (req, res) => {
  try {
    const { courseId } = req.params;
    const moduleData = req.body;
    console.log('🆕 Creating module for course:', courseId);
    
    // Check if course exists
    const course = findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const newModule = {
      id: nextModuleId++,
      courseId: parseInt(courseId),
      ...moduleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    modules.push(newModule);
    
    console.log('✅ Module created successfully:', newModule.id);
    res.status(201).json({
      success: true,
      data: newModule
    });
  } catch (error) {
    console.error('❌ Failed to create module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create module'
    });
  }
});

// GET /api/course/:courseId/modules/getAllModules - Get all modules for course
router.get('/:courseId/modules/getAllModules', (req, res) => {
  try {
    const { courseId } = req.params;
    console.log('📚 Getting modules for course:', courseId);
    
    // Check if course exists
    const course = findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const courseModules = findModulesByCourseId(courseId);
    const modulesWithLessons = courseModules.map(module => ({
      ...module,
      lessons: findLessonsByModuleId(module.id)
    }));
    
    res.json({
      success: true,
      data: modulesWithLessons
    });
  } catch (error) {
    console.error('❌ Failed to get modules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get modules'
    });
  }
});

// PUT /api/course/:courseId/modules/:moduleId/update - Update module
router.put('/:courseId/modules/:moduleId/update', (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const updateData = req.body;
    console.log('✏️ Updating module:', moduleId);
    
    // Check if course exists
    const course = findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const moduleIndex = modules.findIndex(m => m.id == moduleId && m.courseId == courseId);
    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    modules[moduleIndex] = {
      ...modules[moduleIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Module updated successfully:', moduleId);
    res.json({
      success: true,
      data: modules[moduleIndex]
    });
  } catch (error) {
    console.error('❌ Failed to update module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update module'
    });
  }
});

// DELETE /api/course/:courseId/modules/:moduleId/delete - Delete module
router.delete('/:courseId/modules/:moduleId/delete', (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    console.log('🗑️ Deleting module:', moduleId);
    
    // Check if course exists
    const course = findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const moduleIndex = modules.findIndex(m => m.id == moduleId && m.courseId == courseId);
    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Remove module
    modules.splice(moduleIndex, 1);
    
    // Remove associated lessons
    lessons = lessons.filter(lesson => lesson.moduleId != moduleId);
    
    console.log('✅ Module deleted successfully:', moduleId);
    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('❌ Failed to delete module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete module'
    });
  }
});

// Lesson routes
// POST /api/course/:courseId/modules/:moduleId/lesson/create-lesson - Create lesson
router.post('/:courseId/modules/:moduleId/lesson/create-lesson', (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const lessonData = req.body;
    console.log('🆕 Creating lesson for module:', moduleId);
    
    // Check if course exists
    const course = findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if module exists
    const module = findModuleById(moduleId);
    if (!module || module.courseId != courseId) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    const newLesson = {
      id: nextLessonId++,
      moduleId: parseInt(moduleId),
      courseId: parseInt(courseId),
      ...lessonData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    lessons.push(newLesson);
    
    console.log('✅ Lesson created successfully:', newLesson.id);
    res.status(201).json({
      success: true,
      data: newLesson
    });
  } catch (error) {
    console.error('❌ Failed to create lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lesson'
    });
  }
});

// Default export is the router for backward compatibility
module.exports = router;
