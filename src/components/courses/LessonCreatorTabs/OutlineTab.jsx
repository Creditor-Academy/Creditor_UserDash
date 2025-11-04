import React from 'react';
import { BookOpen, FileText, Clock, Users, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OutlineTab = ({ modules, lessons, onModuleSelect, onLessonSelect }) => {
  return (
    <div className="p-6 overflow-y-auto h-full bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Course Structure Overview
          </h3>
          <p className="text-gray-600">
            Review and navigate through your course modules and lessons. Click
            on any item to edit its content.
          </p>
        </div>

        <div className="space-y-6">
          {modules.map((module, moduleIndex) => (
            <Card
              key={module.id}
              className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onModuleSelect(module.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900">
                        Module {moduleIndex + 1}: {module.title}
                      </CardTitle>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Module Statistics */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>
                      {lessons.filter(l => l.moduleId === module.id).length}{' '}
                      lessons
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {lessons
                        .filter(l => l.moduleId === module.id)
                        .reduce((total, lesson) => {
                          const duration = parseInt(lesson.duration) || 15;
                          return total + duration;
                        }, 0)}{' '}
                      min total
                    </span>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="space-y-2">
                  {lessons
                    .filter(lesson => lesson.moduleId === module.id)
                    .map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-colors cursor-pointer"
                        onClick={e => {
                          e.stopPropagation();
                          onLessonSelect(lesson.id);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                            {lessonIndex + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {lesson.title}
                            </h4>
                            {lesson.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                    ))}
                </div>

                {lessons.filter(l => l.moduleId === module.id).length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No lessons in this module yet
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {modules.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Course Outline Available
            </h3>
            <p className="text-gray-600">
              Please generate a course outline first to see the structure here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlineTab;
