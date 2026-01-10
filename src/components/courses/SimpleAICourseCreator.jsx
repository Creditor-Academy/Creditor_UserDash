import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Sparkles,
  CheckCircle,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { createSimpleAICourse } from "@/services/aiCourseService";
import { useNavigate } from "react-router-dom";

const SimpleAICourseCreator = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [courseData, setCourseData] = useState({
    title: "Introduction to React",
    description: "Learn React fundamentals with hands-on examples",
    subject: "react",
    targetAudience: "Beginners",
    difficulty: "beginner",
    duration: "1 week",
  });
  const [createdCourse, setCreatedCourse] = useState(null);

  const handleInputChange = (field, value) => {
    setCourseData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCourse = async () => {
    if (!courseData.title.trim()) {
      toast.error("Please enter a course title");
      return;
    }

    setIsCreating(true);
    try {
      console.log("🚀 Creating simple AI course with data:", courseData);

      const result = await createSimpleAICourse(courseData);

      if (result.success) {
        setCreatedCourse(result.data);
        toast.success(
          `AI course created successfully with ${result.data.contentBlocks} content blocks!`,
        );
        console.log("✅ Course created:", result.data);
      } else {
        toast.error(result.error || "Failed to create AI course");
        console.error("❌ Course creation failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Error creating AI course:", error);
      toast.error("An error occurred while creating the AI course");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditLesson = () => {
    if (createdCourse?.editUrl) {
      navigate(createdCourse.editUrl);
    }
  };

  if (createdCourse) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            AI Course Created Successfully! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg mb-3">
              Generated Course Structure:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Course ID:</strong> {createdCourse.courseId}
              </div>
              <div>
                <strong>Module ID:</strong> {createdCourse.moduleId}
              </div>
              <div>
                <strong>Lesson ID:</strong> {createdCourse.lessonId}
              </div>
              <div>
                <strong>Content Blocks:</strong> {createdCourse.contentBlocks}
              </div>
            </div>
          </div>

          {createdCourse.lessonStructure && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-blue-800">
                AI-Generated Lesson Content:
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Lesson:</strong>{" "}
                  {createdCourse.lessonStructure.lesson_title}
                </div>
                <div>
                  <strong>Description:</strong>{" "}
                  {createdCourse.lessonStructure.lesson_description}
                </div>
                <div>
                  <strong>Learning Objectives:</strong>{" "}
                  {createdCourse.lessonStructure.learning_objectives?.length ||
                    0}{" "}
                  objectives
                </div>
                <div>
                  <strong>Content Sections:</strong>{" "}
                  {createdCourse.lessonStructure.content_sections?.length || 0}{" "}
                  sections
                </div>
                <div>
                  <strong>Examples:</strong>{" "}
                  {createdCourse.lessonStructure.examples?.length || 0} examples
                </div>
                <div>
                  <strong>Key Takeaways:</strong>{" "}
                  {createdCourse.lessonStructure.key_takeaways?.length || 0}{" "}
                  takeaways
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleEditLesson}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Lesson Editor
            </Button>
            <Button
              onClick={() => setCreatedCourse(null)}
              variant="outline"
              className="flex-1"
            >
              Create Another Course
            </Button>
          </div>

          <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg">
            <strong>✅ Complete Content Library Implementation:</strong>
            <ul className="mt-2 space-y-1">
              <li>
                • <strong>Text Blocks:</strong> Master heading, heading,
                subheading, paragraph, heading+paragraph combinations
              </li>
              <li>
                • <strong>Statement Blocks:</strong> Important notes with
                statement-c styling
              </li>
              <li>
                • <strong>Quote Blocks:</strong> Inspirational quotes (quote_b)
                and expert quotes (quote_a)
              </li>
              <li>
                • <strong>Image Blocks:</strong> AI-generated illustrations with
                centered and side-by-side layouts
              </li>
              <li>
                • <strong>List Blocks:</strong> Numbered objectives and
                interactive checkbox checklists
              </li>
              <li>
                • <strong>Media Blocks:</strong> YouTube videos, video
                demonstrations, audio summaries
              </li>
              <li>
                • <strong>Resource Blocks:</strong> PDF study guides, external
                links, data tables
              </li>
              <li>
                • <strong>Interactive Elements:</strong> Hover effects,
                animations, gradient designs
              </li>
              <li>
                • <strong>Total: {createdCourse.contentBlocks} blocks</strong>{" "}
                using all 13 content library types
              </li>
              <li>
                • Perfect compatibility with LessonBuilder editing and
                LessonPreview display
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
        <CardTitle className="text-2xl">Create AI-Powered Course</CardTitle>
        <p className="text-gray-600">
          Generate a complete course with 1 module and 1 lesson using AI
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              value={courseData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Introduction to React"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              value={courseData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of what students will learn"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                value={courseData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="react">React</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="nodejs">Node.js</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
                <option value="vue">Vue.js</option>
                <option value="angular">Angular</option>
              </select>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <select
                id="difficulty"
                value={courseData.difficulty}
                onChange={(e) =>
                  handleInputChange("difficulty", e.target.value)
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={courseData.targetAudience}
                onChange={(e) =>
                  handleInputChange("targetAudience", e.target.value)
                }
                placeholder="e.g., Beginners, Developers"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={courseData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="e.g., 1 week, 3 days"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleCreateCourse}
          disabled={isCreating || !courseData.title.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating AI Course...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Course
            </>
          )}
        </Button>

        <div className="text-sm text-gray-600 bg-purple-50 p-4 rounded-lg">
          <strong>🤖 Complete Content Library AI Generation:</strong>
          <ul className="mt-2 space-y-1">
            <li>
              • <strong>13 Content Types:</strong> Text (6 subtypes), Statement
              (5 subtypes), Quote (6 subtypes), Image (3 layouts), List (3
              types), Tables, Interactive, Divider, YouTube, Video, Audio, Link,
              PDF
            </li>
            <li>
              • <strong>AI Images:</strong> AI image generation creates
              contextual illustrations for each section
            </li>
            <li>
              • <strong>Advanced Layouts:</strong> Side-by-side images, centered
              layouts, overlay effects
            </li>
            <li>
              • <strong>Interactive Elements:</strong> Checkbox lists, tables,
              video/audio placeholders
            </li>
            <li>
              • <strong>8 Color Schemes:</strong> Royal Purple, Ocean Breeze,
              Sunset Fire, Deep Ocean, Forest Green, Mystic Purple, Rose Garden,
              Golden Sun
            </li>
            <li>
              • <strong>Professional Design:</strong> Glassmorphism, gradients,
              animations, hover effects
            </li>
            <li>
              • <strong>Pagination Ready:</strong> Master heading → Page break →
              Comprehensive content
            </li>
          </ul>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>Note:</strong> This uses your existing AI services with
          intelligent fallbacks. All generated content is compatible with your
          LessonBuilder editor and can be further customized.
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleAICourseCreator;
