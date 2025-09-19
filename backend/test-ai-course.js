const fetch = require('node-fetch');

async function testAICourseCreation() {
  try {
    const response = await fetch('http://localhost:5000/api/ai/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test AI Course',
        description: 'A test course created by AI',
        subject: 'Technology',
        targetAudience: 'Beginners',
        difficulty: 'Beginner',
        duration: '2 weeks',
        modules: [
          {
            title: 'Introduction to AI',
            description: 'Basic concepts of AI',
            lessons: [
              {
                title: 'What is AI?',
                intro: 'Introduction to Artificial Intelligence'
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAICourseCreation();