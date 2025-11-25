import React from 'react';
import { Sparkles, Bot, Image, FileText, Search, BookOpen } from 'lucide-react';

const AICourseBadge = ({ course, variant = 'default' }) => {
  if (!course?.isAIGenerated && !course?.aiMetadata) return null;

  const aiFeatures = [];

  if (course.aiMetadata?.generatedOutlines?.length > 0) {
    aiFeatures.push({
      icon: BookOpen,
      label: 'AI Outline',
      count: course.aiMetadata.generatedOutlines.length,
    });
  }

  if (course.aiMetadata?.generatedImages?.length > 0) {
    aiFeatures.push({
      icon: Image,
      label: 'AI Images',
      count: course.aiMetadata.generatedImages.length,
    });
  }

  if (course.aiMetadata?.generatedSummaries?.length > 0) {
    aiFeatures.push({
      icon: FileText,
      label: 'AI Summaries',
      count: course.aiMetadata.generatedSummaries.length,
    });
  }

  if (course.aiMetadata?.aiSearchResults?.length > 0) {
    aiFeatures.push({
      icon: Search,
      label: 'AI Research',
      count: course.aiMetadata.aiSearchResults.length,
    });
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-800">
            AI-Generated Course
          </span>
          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
            {new Date(
              course.aiMetadata?.createdAt || course.createdAt
            ).toLocaleDateString()}
          </span>
        </div>

        {aiFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {aiFeatures.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full"
              >
                <feature.icon className="w-3 h-3" />
                {feature.count} {feature.label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
      <Sparkles className="w-3 h-3" />
      AI Generated
    </span>
  );
};

export default AICourseBadge;
