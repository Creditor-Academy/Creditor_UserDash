// Simple in-memory storage for lessons to simulate database behavior
// This is a temporary solution until actual database models are implemented

class LessonStorage {
  constructor() {
    this.courses = [];
    this.lessons = [];
    this.nextCourseId = 1;
    this.nextLessonId = 1;
  }

  // Find or create a course
  async findOrCreateCourse(courseTitle) {
    let course = this.courses.find(c => c.title === courseTitle);
    
    if (!course) {
      course = {
        id: this.nextCourseId++,
        title: courseTitle,
        isAIGenerated: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.courses.push(course);
      console.log('Created new course:', course);
    } else {
      console.log('Found existing course:', course);
    }
    
    return course;
  }

  // Save a lesson
  async saveLesson(lessonData, courseId) {
    const lesson = {
      id: this.nextLessonId++,
      title: lessonData.title,
      description: lessonData.description,
      content: lessonData.content,
      duration: lessonData.duration,
      courseId: courseId,
      isAIGenerated: true,
      keyPoints: lessonData.keyPoints,
      blocks: lessonData.blocks,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.lessons.push(lesson);
    console.log('Saved lesson:', lesson);
    return lesson;
  }

  // Get lessons by course ID
  async getLessonsByCourseId(courseId) {
    return this.lessons.filter(lesson => lesson.courseId === courseId);
  }

  // Get all courses
  async getAllCourses() {
    return this.courses;
  }

  // Get all lessons
  async getAllLessons() {
    return this.lessons;
  }
}

// Export a singleton instance
const lessonStorage = new LessonStorage();
module.exports = lessonStorage;