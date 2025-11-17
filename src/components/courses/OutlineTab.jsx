import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Plus,
  Edit3,
  Save,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import LoadingBuffer from '../LoadingBuffer';

const OutlineTab = ({ 
  courseData, 
  setCourseData, 
  isGenerating, 
  onGenerate,
  expandedModules,
  onToggleModule,
  onUpdateModule,
  onUpdateLesson,
  onAddModule,
  onAddLesson,
  onDeleteModule,
  onDeleteLesson,
  onDragEnd
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Course Info Form */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Course Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Course Title"
            value={courseData.title}
            onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={courseData.subject}
            onChange={(e) => setCourseData(prev => ({ ...prev, subject: e.target.value }))}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Subject</option>
            <option value="react">React</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="nodejs">Node.js</option>
            <option value="database">Database Design</option>
            <option value="ai">Artificial Intelligence</option>
            <option value="web-design">Web Design</option>
            <option value="mobile">Mobile Development</option>
          </select>
        </div>
        
        <textarea
          placeholder="Course Description"
          value={courseData.description}
          onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 mb-4"
          rows="3"
        />
        
        <div className="flex gap-4 mb-4">
          <select
            value={courseData.difficulty}
            onChange={(e) => setCourseData(prev => ({ ...prev, difficulty: e.target.value }))}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          
          <input
            type="text"
            placeholder="Duration (e.g., 4 weeks)"
            value={courseData.duration}
            onChange={(e) => setCourseData(prev => ({ ...prev, duration: e.target.value }))}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={onGenerate}
          disabled={isGenerating || !courseData.title || !courseData.subject}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Course Outline...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate AI Course Outline
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-white rounded-lg border">
          <LoadingBuffer 
            type="generation" 
            message="Creating your comprehensive course outline..." 
            showSparkles={true}
          />
        </div>
      )}

      {/* Course Outline */}
      {courseData.modules.length > 0 && !isGenerating && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Course Outline</h3>
            <button
              onClick={onAddModule}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Module
            </button>
          </div>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="modules" type="module">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {courseData.modules.map((module, index) => (
                    <ModuleItem
                      key={module.id}
                      module={module}
                      index={index}
                      isExpanded={expandedModules.has(module.id)}
                      onToggle={() => onToggleModule(module.id)}
                      onUpdate={(updates) => onUpdateModule(module.id, updates)}
                      onUpdateLesson={(lessonId, updates) => onUpdateLesson(module.id, lessonId, updates)}
                      onAddLesson={() => onAddLesson(module.id)}
                      onDelete={() => onDeleteModule(module.id)}
                      onDeleteLesson={(lessonId) => onDeleteLesson(module.id, lessonId)}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
};

// Module Item Component
const ModuleItem = ({ 
  module, 
  index, 
  isExpanded, 
  onToggle, 
  onUpdate, 
  onUpdateLesson,
  onAddLesson, 
  onDelete,
  onDeleteLesson 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);
  const [editDescription, setEditDescription] = useState(module.description);

  const handleSaveEdit = () => {
    onUpdate({ title: editTitle, description: editDescription });
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={`module-${module.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="border rounded-lg"
        >
          <div className="bg-gray-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div {...provided.dragHandleProps}>
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              
              <button
                onClick={onToggle}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm font-medium"
                    />
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-xs text-gray-600"
                    />
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium">{module.title}</h4>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {isExpanded && (
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-sm">Lessons</h5>
                <button
                  onClick={onAddLesson}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Lesson
                </button>
              </div>
              
              <Droppable droppableId={`lessons-${module.id}`} type="lesson">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {(module.lessons || []).map((lesson, lessonIndex) => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        index={lessonIndex}
                        onUpdate={(updates) => onUpdateLesson(lesson.id, updates)}
                        onDelete={() => onDeleteLesson(lesson.id)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

// Lesson Item Component
const LessonItem = ({ lesson, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(lesson.title);
  const [editDescription, setEditDescription] = useState(lesson.description);
  const [editDuration, setEditDuration] = useState(lesson.duration);

  const handleSaveEdit = () => {
    onUpdate({ 
      title: editTitle, 
      description: editDescription, 
      duration: editDuration 
    });
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={`lesson-${lesson.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-gray-50 p-3 rounded border flex items-center justify-between"
        >
          <div className="flex items-center gap-3 flex-1">
            <div {...provided.dragHandleProps}>
              <GripVertical className="w-3 h-3 text-gray-400" />
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-2 py-1 border rounded text-xs text-gray-600"
                  />
                  <input
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-20 px-2 py-1 border rounded text-xs"
                    placeholder="15 min"
                  />
                </div>
              ) : (
                <div>
                  <h6 className="text-sm font-medium">{lesson.title}</h6>
                  <p className="text-xs text-gray-600">{lesson.description}</p>
                  <span className="text-xs text-blue-600">{lesson.duration}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                >
                  <Save className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default OutlineTab;
