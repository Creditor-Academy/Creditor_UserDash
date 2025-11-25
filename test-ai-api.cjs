const axios = require('axios');

async function testAIAPI() {
  try {
    console.log('Testing AI API endpoints...');
    
    // Test getting all courses (should be empty initially)
    console.log('\n1. Testing GET /api/ai/courses');
    const coursesResponse = await axios.get('http://localhost:5000/api/ai/courses');
    console.log('Response:', coursesResponse.data);
    
    // Test saving lessons
    console.log('\n2. Testing POST /api/ai/lessons');
    const lessonData = {
      courseTitle: "Test Course",
      lessons: [
        {
          title: "Test Lesson",
          description: "Test Description",
          content: "Test Content",
          duration: "15 min",
          keyPoints: ["Point 1", "Point 2"]
        }
      ],
      blockBased: true
    };
    
    const lessonsResponse = await axios.post('http://localhost:5000/api/ai/lessons', lessonData);
    console.log('Response:', lessonsResponse.data);
    
    // Test getting courses again (should now have one course)
    console.log('\n3. Testing GET /api/ai/courses again');
    const coursesResponse2 = await axios.get('http://localhost:5000/api/ai/courses');
    console.log('Response:', coursesResponse2.data);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing AI API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAIAPI();