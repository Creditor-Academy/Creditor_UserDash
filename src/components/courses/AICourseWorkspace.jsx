import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  Image, 
  FileText, 
  Search,
  Upload,
  Sparkles,
  Download,
  Copy,
  Plus,
  Edit3,
  Save,
  RefreshCw,
  Wand2,
  Check,
  Eye,
  Trash2,
  ArrowRight
} from 'lucide-react';
import bytezAPI from '../../services/bytezAPI';
import AIImageGenerator from './AIImageGenerator';
import AISummarizationTool from './AISummarizationTool';
import AIQuestionAnswering from './AIQuestionAnswering';
import { AIFeatureAccessProvider } from './AIFeatureAccess';
import LoadingBuffer from '../LoadingBuffer';

const AICourseWorkspace = ({ isOpen, onClose, courseData, onSave }) => {
  const [activeTab, setActiveTab] = useState('outline');
  const [outlines, setOutlines] = useState([]);
  const [images, setImages] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [qaResults, setQaResults] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const handleSaveCourse = async (status = 'PUBLISHED') => {
    if (!courseData.title || !courseData.description) {
      alert('Please fill in the course title and description');
      return;
    }

    setIsGenerating(true);
    console.log('AICourseWorkspace - handleSaveCourse called with status:', status, 'courseData:', courseData);
    
    try {
      const finalCourseData = {
        ...courseData,
        course_status: status,
        outlines,
        images,
        summaries,
        qaResults,
        isAIGenerated: true,
        aiMetadata: {
          generatedOutlines: outlines,
          generatedImages: images,
          generatedSummaries: summaries,
          aiQaResults: qaResults,
          createdAt: new Date().toISOString()
        }
      };
      
      await onSave(finalCourseData);
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: 'outline', label: 'Course Outline', icon: BookOpen, color: 'blue', enabled: true },
    { id: 'images', label: 'Image Generator', icon: Image, color: 'purple', enabled: true },
    { id: 'summarize', label: 'Summarization', icon: FileText, color: 'green', enabled: true },
    { id: 'qa', label: 'AI Q&A', icon: Search, color: 'orange', enabled: true }
  ];

  // Course Outline Generator
  const OutlineGenerator = () => {
    const [formData, setFormData] = useState({
      title: courseData?.title || '',
      subject: '',
      description: courseData?.description || '',
      difficulty: courseData?.difficulty || 'intermediate',
      duration: courseData?.duration || '4'
    });
    const [editingId, setEditingId] = useState(null);

    // Generate topic-specific modules and lessons based on subject
    const generateTopicSpecificModules = (subject, title, difficulty) => {
      const topicTemplates = {
        'react': {
          modules: [
            {
              id: 1,
              title: 'React Fundamentals',
              lessons: ['What is React?', 'JSX Syntax', 'Components and Props', 'State Management', 'Event Handling']
            },
            {
              id: 2,
              title: 'Component Lifecycle & Hooks',
              lessons: ['Class Components', 'Functional Components', 'useState Hook', 'useEffect Hook', 'Custom Hooks']
            },
            {
              id: 3,
              title: 'Advanced React Patterns',
              lessons: ['Context API', 'Higher-Order Components', 'Render Props', 'Error Boundaries', 'Code Splitting']
            },
            {
              id: 4,
              title: 'State Management',
              lessons: ['Redux Basics', 'Redux Toolkit', 'Context vs Redux', 'Zustand', 'State Best Practices']
            },
            {
              id: 5,
              title: 'React Router & Navigation',
              lessons: ['React Router Setup', 'Route Components', 'Dynamic Routing', 'Protected Routes', 'Navigation Guards']
            },
            {
              id: 6,
              title: 'Testing & Deployment',
              lessons: ['Jest & React Testing Library', 'Component Testing', 'Integration Tests', 'Build Process', 'Deployment Strategies']
            }
          ]
        },
        'javascript': {
          modules: [
            {
              id: 1,
              title: 'JavaScript Fundamentals',
              lessons: ['Variables & Data Types', 'Functions', 'Objects & Arrays', 'Control Flow', 'Error Handling']
            },
            {
              id: 2,
              title: 'ES6+ Features',
              lessons: ['Arrow Functions', 'Destructuring', 'Template Literals', 'Modules', 'Promises & Async/Await']
            },
            {
              id: 3,
              title: 'DOM Manipulation',
              lessons: ['Selecting Elements', 'Event Listeners', 'Dynamic Content', 'Form Handling', 'Local Storage']
            },
            {
              id: 4,
              title: 'Advanced JavaScript',
              lessons: ['Closures', 'Prototypes', 'This Keyword', 'Call/Apply/Bind', 'Design Patterns']
            },
            {
              id: 5,
              title: 'Asynchronous JavaScript',
              lessons: ['Callbacks', 'Promises', 'Async/Await', 'Fetch API', 'Error Handling']
            },
            {
              id: 6,
              title: 'Modern Development',
              lessons: ['NPM & Package Management', 'Webpack Basics', 'Babel', 'Testing with Jest', 'Debugging Tools']
            }
          ]
        },
        'python': {
          modules: [
            {
              id: 1,
              title: 'Python Basics',
              lessons: ['Syntax & Variables', 'Data Types', 'Control Structures', 'Functions', 'Error Handling']
            },
            {
              id: 2,
              title: 'Data Structures',
              lessons: ['Lists & Tuples', 'Dictionaries & Sets', 'List Comprehensions', 'Iterators', 'Generators']
            },
            {
              id: 3,
              title: 'Object-Oriented Programming',
              lessons: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Magic Methods']
            },
            {
              id: 4,
              title: 'File Handling & Modules',
              lessons: ['File I/O', 'CSV & JSON', 'Creating Modules', 'Package Management', 'Virtual Environments']
            },
            {
              id: 5,
              title: 'Libraries & Frameworks',
              lessons: ['NumPy Basics', 'Pandas for Data', 'Requests for APIs', 'Flask/Django Intro', 'Testing with pytest']
            },
            {
              id: 6,
              title: 'Advanced Topics',
              lessons: ['Decorators', 'Context Managers', 'Multithreading', 'Regular Expressions', 'Best Practices']
            }
          ]
        },
        'nodejs': {
          modules: [
            {
              id: 1,
              title: 'Node.js Fundamentals',
              lessons: ['What is Node.js?', 'NPM & Package.json', 'Modules & Require', 'File System', 'Path Module']
            },
            {
              id: 2,
              title: 'Asynchronous Programming',
              lessons: ['Callbacks', 'Promises', 'Async/Await', 'Event Loop', 'Error Handling']
            },
            {
              id: 3,
              title: 'Express.js Framework',
              lessons: ['Express Setup', 'Routing', 'Middleware', 'Request/Response', 'Template Engines']
            },
            {
              id: 4,
              title: 'Database Integration',
              lessons: ['MongoDB with Mongoose', 'SQL with Sequelize', 'Database Design', 'Queries & Relations', 'Data Validation']
            },
            {
              id: 5,
              title: 'Authentication & Security',
              lessons: ['JWT Tokens', 'Passport.js', 'Password Hashing', 'CORS', 'Security Best Practices']
            },
            {
              id: 6,
              title: 'Deployment & Production',
              lessons: ['Environment Variables', 'Process Management', 'Docker', 'Cloud Deployment', 'Monitoring']
            }
          ]
        },
        'html': {
          modules: [
            {
              id: 1,
              title: 'HTML Fundamentals',
              lessons: ['HTML Structure', 'Tags & Elements', 'Attributes', 'Document Structure', 'Semantic HTML']
            },
            {
              id: 2,
              title: 'CSS Basics',
              lessons: ['CSS Syntax', 'Selectors', 'Properties', 'Box Model', 'Layout Basics']
            },
            {
              id: 3,
              title: 'Advanced CSS',
              lessons: ['Flexbox', 'Grid Layout', 'Responsive Design', 'Animations', 'CSS Variables']
            },
            {
              id: 4,
              title: 'Modern CSS',
              lessons: ['CSS Preprocessors', 'PostCSS', 'CSS Frameworks', 'Component Architecture', 'Performance']
            },
            {
              id: 5,
              title: 'Web Standards',
              lessons: ['Accessibility', 'SEO Basics', 'Performance Optimization', 'Cross-browser Compatibility', 'Best Practices']
            },
            {
              id: 6,
              title: 'Project & Deployment',
              lessons: ['Portfolio Website', 'Responsive Design Project', 'CSS Architecture', 'Build Tools', 'Deployment']
            }
          ]
        },
        'vue': {
          modules: [
            {
              id: 1,
              title: 'Vue.js Fundamentals',
              lessons: ['Vue Instance', 'Template Syntax', 'Directives', 'Event Handling', 'Data Binding']
            },
            {
              id: 2,
              title: 'Components',
              lessons: ['Component Basics', 'Props & Events', 'Slots', 'Dynamic Components', 'Component Communication']
            },
            {
              id: 3,
              title: 'Vue Router',
              lessons: ['Routing Setup', 'Dynamic Routes', 'Navigation Guards', 'Route Parameters', 'Nested Routes']
            },
            {
              id: 4,
              title: 'State Management',
              lessons: ['Vuex Basics', 'State, Mutations, Actions', 'Modules', 'Pinia', 'State Patterns']
            },
            {
              id: 5,
              title: 'Advanced Vue',
              lessons: ['Composition API', 'Custom Directives', 'Mixins', 'Plugins', 'Performance Optimization']
            },
            {
              id: 6,
              title: 'Testing & Deployment',
              lessons: ['Unit Testing', 'Component Testing', 'E2E Testing', 'Build Process', 'Deployment Strategies']
            }
          ]
        },
        'angular': {
          modules: [
            {
              id: 1,
              title: 'Angular Fundamentals',
              lessons: ['Angular Architecture', 'Components', 'Templates', 'Data Binding', 'Directives']
            },
            {
              id: 2,
              title: 'Services & Dependency Injection',
              lessons: ['Services', 'Dependency Injection', 'HTTP Client', 'Observables', 'RxJS Basics']
            },
            {
              id: 3,
              title: 'Routing & Navigation',
              lessons: ['Router Setup', 'Route Parameters', 'Guards', 'Lazy Loading', 'Child Routes']
            },
            {
              id: 4,
              title: 'Forms & Validation',
              lessons: ['Template-driven Forms', 'Reactive Forms', 'Validation', 'Custom Validators', 'Form Arrays']
            },
            {
              id: 5,
              title: 'Advanced Angular',
              lessons: ['Pipes', 'Interceptors', 'Animations', 'PWA Features', 'Performance Optimization']
            },
            {
              id: 6,
              title: 'Testing & Deployment',
              lessons: ['Unit Testing', 'Integration Testing', 'E2E Testing', 'Build Optimization', 'Deployment']
            }
          ]
        },
        'machinelearning': {
          modules: [
            {
              id: 1,
              title: 'ML Fundamentals',
              lessons: ['What is Machine Learning?', 'Types of ML', 'Data Preprocessing', 'Feature Engineering', 'Model Evaluation']
            },
            {
              id: 2,
              title: 'Supervised Learning',
              lessons: ['Linear Regression', 'Logistic Regression', 'Decision Trees', 'Random Forest', 'SVM']
            },
            {
              id: 3,
              title: 'Unsupervised Learning',
              lessons: ['K-Means Clustering', 'Hierarchical Clustering', 'PCA', 'Association Rules', 'Anomaly Detection']
            },
            {
              id: 4,
              title: 'Deep Learning',
              lessons: ['Neural Networks', 'CNN', 'RNN', 'LSTM', 'Transfer Learning']
            },
            {
              id: 5,
              title: 'ML Tools & Libraries',
              lessons: ['Scikit-learn', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy']
            },
            {
              id: 6,
              title: 'ML in Production',
              lessons: ['Model Deployment', 'MLOps', 'Model Monitoring', 'A/B Testing', 'Ethics in ML']
            }
          ]
        },
        'datascience': {
          modules: [
            {
              id: 1,
              title: 'Data Science Fundamentals',
              lessons: ['Data Science Process', 'Statistics Basics', 'Probability', 'Data Types', 'Research Methods']
            },
            {
              id: 2,
              title: 'Data Collection & Cleaning',
              lessons: ['Data Sources', 'Web Scraping', 'APIs', 'Data Cleaning', 'Missing Data Handling']
            },
            {
              id: 3,
              title: 'Exploratory Data Analysis',
              lessons: ['Descriptive Statistics', 'Data Visualization', 'Correlation Analysis', 'Hypothesis Testing', 'Statistical Inference']
            },
            {
              id: 4,
              title: 'Machine Learning for Data Science',
              lessons: ['Predictive Modeling', 'Classification', 'Regression', 'Clustering', 'Model Selection']
            },
            {
              id: 5,
              title: 'Data Visualization & Communication',
              lessons: ['Matplotlib', 'Seaborn', 'Plotly', 'Dashboard Creation', 'Storytelling with Data']
            },
            {
              id: 6,
              title: 'Big Data & Deployment',
              lessons: ['Big Data Tools', 'Spark', 'Cloud Platforms', 'Model Deployment', 'Business Intelligence']
            }
          ]
        }
      };

      // Get topic-specific template or create generic one
      const subjectKey = subject.toLowerCase();
      const template = topicTemplates[subjectKey];
      
      if (template) {
        return template.modules;
      }

      // Generic template for other subjects
      return [
        {
          id: 1,
          title: `Introduction to ${title}`,
          lessons: ['Course Overview', 'Learning Objectives', 'Prerequisites', 'Getting Started', 'Basic Concepts']
        },
        {
          id: 2,
          title: `${title} Fundamentals`,
          lessons: ['Core Principles', 'Key Terminology', 'Foundation Knowledge', 'Essential Skills', 'Basic Techniques']
        },
        {
          id: 3,
          title: `Practical ${title}`,
          lessons: ['Hands-on Examples', 'Real-world Applications', 'Best Practices', 'Common Patterns', 'Project Work']
        },
        {
          id: 4,
          title: `Advanced ${title}`,
          lessons: ['Advanced Techniques', 'Optimization Strategies', 'Industry Standards', 'Expert Tips', 'Complex Scenarios']
        },
        {
          id: 5,
          title: `${title} in Practice`,
          lessons: ['Case Studies', 'Problem Solving', 'Troubleshooting', 'Performance', 'Maintenance']
        },
        {
          id: 6,
          title: 'Assessment and Next Steps',
          lessons: ['Knowledge Check', 'Practical Projects', 'Final Assessment', 'Career Paths', 'Continued Learning']
        }
      ];
    };

    const generateOutline = async () => {
      setIsGenerating(true);
      
      try {
        // Use Bytez API for intelligent course outline generation
        const response = await bytezAPI.generateCourseOutline({
          title: formData.title,
          subject: formData.subject,
          description: formData.description,
          targetAudience: courseData?.targetAudience,
          difficulty: formData.difficulty,
          duration: formData.duration
        });

        let generatedContent = response.generated_text || response.text || '';
        
        // Try to parse JSON response for structured outline
        let parsedOutline = null;
        try {
          // Look for JSON in the response
          const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedOutline = JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          console.log('Could not parse JSON, using fallback structure');
        }

        // Generate topic-specific modules and lessons
        const topicModules = generateTopicSpecificModules(formData.subject, formData.title, formData.difficulty);
        
        const newOutline = {
          id: Date.now(),
          title: formData.title,
          subject: formData.subject,
          modules: parsedOutline?.modules || topicModules,
          generatedContent: generatedContent.substring(0, 500),
          createdAt: new Date().toISOString(),
          isAIGenerated: true
        };
        
        setOutlines([...outlines, newOutline]);
      } catch (error) {
        console.error('Outline generation failed:', error);
        
        // Fallback outline
        const fallbackOutline = {
          id: Date.now(),
          title: formData.title,
          subject: formData.subject,
          modules: [
            {
              id: 1,
              title: `Introduction to ${formData.subject || formData.title}`,
              lessons: ['Overview', 'Key Concepts', 'Getting Started']
            },
            {
              id: 2,
              title: `Core ${formData.subject || formData.title} Principles`,
              lessons: ['Fundamentals', 'Best Practices', 'Common Patterns']
            },
            {
              id: 3,
              title: `Advanced ${formData.subject || formData.title}`,
              lessons: ['Advanced Techniques', 'Real-world Applications', 'Case Studies']
            }
          ],
          createdAt: new Date().toISOString(),
          error: 'AI generation failed, showing fallback outline'
        };
        
        setOutlines([...outlines, fallbackOutline]);
      }
      
      setIsGenerating(false);
    };

    const deleteOutline = (id) => {
      setOutlines(outlines.filter(outline => outline.id !== id));
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Generate Course Outline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Course Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subject Area</option>
              <option value="react">React</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="nodejs">Node.js</option>
              <option value="html">HTML & CSS</option>
              <option value="vue">Vue.js</option>
              <option value="angular">Angular</option>
              <option value="typescript">TypeScript</option>
              <option value="php">PHP</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="flutter">Flutter</option>
              <option value="reactnative">React Native</option>
              <option value="mongodb">MongoDB</option>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="aws">AWS</option>
              <option value="docker">Docker</option>
              <option value="kubernetes">Kubernetes</option>
              <option value="devops">DevOps</option>
              <option value="machinelearning">Machine Learning</option>
              <option value="datascience">Data Science</option>
              <option value="cybersecurity">Cybersecurity</option>
              <option value="blockchain">Blockchain</option>
              <option value="ui-ux">UI/UX Design</option>
              <option value="digitalmarketing">Digital Marketing</option>
              <option value="projectmanagement">Project Management</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
          </div>
          <textarea
            placeholder="Course Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 mb-4"
            rows="3"
          />
          <button
            onClick={generateOutline}
            disabled={isGenerating || !formData.title || !formData.subject}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Outline
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {/* Loading State for Outline Generation */}
          {isGenerating && (
            <div className="bg-white rounded-lg border">
              <LoadingBuffer 
                type="generation" 
                message="Creating your course outline..." 
                showSparkles={true}
              />
            </div>
          )}
          {outlines.map((outline) => (
            <div key={outline.id} className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold">{outline.title}</h4>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-500 hover:text-blue-600">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteOutline(outline.id)}
                    className="p-2 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {outline.modules.map((module) => (
                  <div key={module.id} className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-medium">{module.title}</h5>
                    <ul className="text-sm text-gray-600 mt-1">
                      {module.lessons.map((lesson, idx) => (
                        <li key={idx}>• {lesson}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'outline':
        return <OutlineGenerator />;
      case 'images':
        return <AIImageGenerator onImagesGenerated={setImages} />;
      case 'summarize':
        return <AISummarizationTool onSummariesGenerated={setSummaries} />;
      case 'qa':
        return <AIQuestionAnswering onFeatureUse={(feature, data) => setQaResults(prev => [data, ...prev])} />;
      default:
        return <OutlineGenerator />;
    }
  };

  return (
    <AIFeatureAccessProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-50 rounded-xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden"
        >
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">AI Course Creation Workspace</h2>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              All Features Enabled
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => tab.enabled && setActiveTab(tab.id)}
                  disabled={!tab.enabled}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-50 text-${tab.color}-700 border-b-2 border-${tab.color}-500`
                      : tab.enabled 
                        ? 'text-gray-500 hover:text-gray-700' 
                        : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.enabled && <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'outline' && <OutlineGenerator />}
          {activeTab === 'images' && <AIImageGenerator />}
          {activeTab === 'summarize' && <AISummarizationTool />}
          {activeTab === 'qa' && <AIQuestionAnswering onFeatureUse={(feature, data) => setQaResults(prev => [data, ...prev])} />}
        </div>

        {/* Footer */}
        <div className="bg-white border-t px-6 py-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => handleSaveCourse('DRAFT')}
              disabled={isGenerating}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSaveCourse('PUBLISHED')}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </div>
        </motion.div>
      </motion.div>
    </AIFeatureAccessProvider>
  );
};

export default AICourseWorkspace;
