// Utility for converting lesson data to modern format for preview components
// This follows TypeScript best practices and avoids explicit 'any' types

interface LessonBlock {
  id?: string;
  block_id?: string;
  type: string;
  content?: string;
  html_css?: string;
  details?: {
    image_url?: string;
    video_url?: string;
    audio_url?: string;
    pdf_url?: string;
    caption?: string;
    description?: string;
    content?: string;
    section?: string;
  };
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  imageTitle?: string;
  videoTitle?: string;
  audioTitle?: string;
  pdfTitle?: string;
  imageDescription?: string;
  videoDescription?: string;
  audioDescription?: string;
  pdfDescription?: string;
  text?: string;
  order?: number;
  textType?: string;
}

interface BaseLessonData {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  author?: string;
  difficulty?: string;
  introduction?: string;
  intro?: string;
  content?: unknown[];
  subtopics?: string[];
  examples?: string[];
  summary?: string;
  images?: Array<{
    url: string;
    alt: string;
    caption: string;
  }>;
}

interface ModernLessonContent {
  introduction?: string;
  objectives?: string[];
  mainContent?: Array<{
    point: string;
    description: string;
    example?: string;
  }>;
  multimedia?: {
    image?: string | { url: string; alt: string; caption: string };
    video?: { url: string; duration: string };
  };
  qa?: Array<{
    question: string;
    answer: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }>;
  summary?: string;
  keyTakeaways?: string[];
}

interface ModernLessonFormat {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  instructor?: string;
  createdAt?: string;
  content?: ModernLessonContent;
  metadata?: {
    aiGenerated?: boolean;
    generatedAt?: string;
    contentTypes?: string[];
  };
}

export function convertToModernLessonFormat(
  lessonData: BaseLessonData,
  blocks: LessonBlock[],
  isAILesson = false
): ModernLessonFormat {
  const modernContent: ModernLessonContent = {};

  // Extract introduction
  modernContent.introduction =
    lessonData.introduction ||
    lessonData.intro ||
    lessonData.description ||
    "Welcome to this lesson. Let's explore the key concepts together.";

  // Process content blocks
  const mainContentPoints: Array<{
    point: string;
    description: string;
    example?: string;
  }> = [];
  const qaItems: Array<{
    question: string;
    answer: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }> = [];
  const keyTakeaways: string[] = [];

  blocks.forEach((block, index) => {
    switch (block.type) {
      case 'text':
        if (block.content || block.html_css) {
          const content = block.content || block.html_css || '';
          const cleanContent = content.replace(/<[^>]*>/g, '').trim();

          if (cleanContent) {
            mainContentPoints.push({
              point: `Learning Point ${index + 1}`,
              description:
                cleanContent.substring(0, 200) +
                (cleanContent.length > 200 ? '...' : ''),
            });
          }
        }
        break;

      case 'statement':
        if (block.content || block.html_css) {
          const content = block.content || block.html_css || '';
          const cleanContent = content.replace(/<[^>]*>/g, '').trim();

          if (cleanContent) {
            keyTakeaways.push(cleanContent);
          }
        }
        break;

      case 'video':
        if (block.videoUrl || block.details?.video_url) {
          modernContent.multimedia = modernContent.multimedia || {};
          modernContent.multimedia.video = {
            url: block.videoUrl || block.details?.video_url || '',
            duration: '5 min',
          };
        }
        break;

      case 'image':
        if (block.imageUrl || block.details?.image_url) {
          modernContent.multimedia = modernContent.multimedia || {};
          modernContent.multimedia.image = {
            url: block.imageUrl || block.details?.image_url || '',
            alt: block.imageTitle || block.details?.caption || 'Lesson image',
            caption: block.imageDescription || block.details?.description || '',
          };
        }
        break;
    }
  });

  // Set main content if we have any
  if (mainContentPoints.length > 0) {
    modernContent.mainContent = mainContentPoints;
  }

  // Handle legacy lesson data structure
  if (lessonData.content && Array.isArray(lessonData.content)) {
    const legacyContent = lessonData.content as Array<{
      point?: string;
      description?: string;
      title?: string;
      subtopic?: string;
      content?: string;
    }>;

    legacyContent.forEach(item => {
      if (item.point && item.description) {
        mainContentPoints.push({
          point: item.point,
          description: item.description,
        });
      } else if (item.title && item.content) {
        mainContentPoints.push({
          point: item.title,
          description: item.content,
        });
      } else if (item.subtopic && item.content) {
        mainContentPoints.push({
          point: item.subtopic,
          description: item.content,
        });
      }
    });
  }

  // Handle subtopics
  if (lessonData.subtopics && Array.isArray(lessonData.subtopics)) {
    lessonData.subtopics.forEach((topic, index) => {
      mainContentPoints.push({
        point: `Topic ${index + 1}`,
        description: topic,
      });
    });
  }

  // Handle examples
  if (lessonData.examples && Array.isArray(lessonData.examples)) {
    lessonData.examples.forEach((example, index) => {
      qaItems.push({
        question: `Example ${index + 1}`,
        answer: example,
        difficulty: 'easy' as const,
      });
    });
  }

  // Set arrays only if they have content
  if (mainContentPoints.length > 0) {
    modernContent.mainContent = mainContentPoints;
  }

  if (qaItems.length > 0) {
    modernContent.qa = qaItems;
  }

  if (keyTakeaways.length > 0) {
    modernContent.keyTakeaways = keyTakeaways;
  }

  // Set summary
  modernContent.summary =
    lessonData.summary ||
    'You have successfully completed this lesson and gained valuable knowledge.';

  // Generate objectives if not present
  if (!modernContent.objectives) {
    modernContent.objectives = [
      'Understand the core concepts covered in this lesson',
      'Apply the knowledge to practical scenarios',
      'Demonstrate mastery of the key learning points',
    ];
  }

  // Handle images from legacy data
  if (
    lessonData.images &&
    Array.isArray(lessonData.images) &&
    lessonData.images.length > 0
  ) {
    modernContent.multimedia = modernContent.multimedia || {};
    modernContent.multimedia.image = lessonData.images[0];
  }

  return {
    id: lessonData.id,
    title: lessonData.title,
    description:
      lessonData.description ||
      'A comprehensive lesson covering essential concepts',
    duration: lessonData.duration || '15 min',
    instructor: lessonData.author || 'Course Instructor',
    createdAt: new Date().toISOString(),
    content: modernContent,
    metadata: {
      aiGenerated: isAILesson,
      generatedAt: isAILesson ? new Date().toISOString() : undefined,
      contentTypes: blocks
        .map(b => b.type)
        .filter((type, index, arr) => arr.indexOf(type) === index),
    },
  };
}
