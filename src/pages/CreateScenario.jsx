import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  User, 
  Image, 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  ArrowLeft,
  ArrowRight,
  Play,
  Eye,
  Home,
  Settings
} from 'lucide-react';
import { createScenario, updateScenario, saveScenarioDecisions } from '@/services/scenarioService';
import { getAuthHeader } from '@/services/authHeader';
import { toast } from "sonner";


const AVATAR_OPTIONS = [
  { id: 'default', name: 'Default Avatar', image: '/default-avatar.png', description: 'Generic professional avatar' },
  { id: 'business-woman', name: 'Business Woman', image: '/avatars/business-woman.png', description: 'Professional female executive' },
  { id: 'business-man', name: 'Business Man', image: '/avatars/business-man.png', description: 'Professional male executive' },
  { id: 'student', name: 'Student', image: '/avatars/student.png', description: 'Young learner avatar' },
  { id: 'teacher', name: 'Teacher', image: '/avatars/teacher.png', description: 'Educational instructor' },
  { id: 'manager', name: 'Manager', image: '/avatars/manager.png', description: 'Team leader avatar' },
];

const BACKGROUND_OPTIONS = [
  { id: 'default', name: 'Default Background', image: '/backgrounds/default.jpg', description: 'Clean neutral background' },
  { id: 'office', name: 'Office', image: '/backgrounds/office.jpg', description: 'Professional office environment' },
  { id: 'classroom', name: 'Classroom', image: '/backgrounds/classroom.jpg', description: 'Educational classroom setting' },
  { id: 'meeting-room', name: 'Meeting Room', image: '/backgrounds/meeting-room.jpg', description: 'Conference room environment' },
  { id: 'library', name: 'Library', image: '/backgrounds/library.jpg', description: 'Quiet study environment' },
  { id: 'outdoor', name: 'Outdoor', image: '/backgrounds/outdoor.jpg', description: 'Natural outdoor setting' },
];

const CreateScenario = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { moduleId, editingScenario } = location.state || {};

  const [form, setForm] = useState({
    title: '',
    description: '',
    avatar: 'default',
    background: 'default',
    totalAttempts: 3,
  });
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdScenario, setCreatedScenario] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Decision state for step 2
  const [decisions, setDecisions] = useState([
    {
      id: 1,
      title: '',
      description: '',
      choices: [
        { id: 1, text: '', outcome: '', points: 0 },
        { id: 2, text: '', outcome: '', points: 0 }
      ]
    }
  ]);

  // Initialize form with editing data if available
  useEffect(() => {
    if (editingScenario) {
      setForm({
        title: editingScenario.title || '',
        description: editingScenario.description || '',
        avatar: editingScenario.avatar || 'default',
        background: editingScenario.background || 'default',
        totalAttempts: editingScenario.totalAttempts || 3,
      });
      setCreatedScenario(editingScenario);
      if (editingScenario.decisions && editingScenario.decisions.length > 0) {
        setDecisions(editingScenario.decisions);
      }
    }
  }, [editingScenario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setForm(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setForm(prev => ({ ...prev, background: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const getAvatarImage = (avatarId) => {
    if (avatarId === 'default') {
      return '/default-avatar.png';
    }
    // If it's a base64 string (uploaded image), return it directly
    if (avatarId.startsWith('data:')) {
      return avatarId;
    }
    // Otherwise, return the predefined avatar path
    return `/avatars/${avatarId}.png`;
  };

  const getBackgroundImage = (backgroundId) => {
    if (backgroundId === 'default') {
      return '/backgrounds/default.jpg';
    }
    // If it's a base64 string (uploaded image), return it directly
    if (backgroundId.startsWith('data:')) {
      return backgroundId;
    }
    // Otherwise, return the predefined background path
    return `/backgrounds/${backgroundId}.jpg`;
  };

  const handleNext = async () => {
    setLoading(true);
    setError('');

    try {
      if (step === 1) {
        // For frontend demo, just go to step 2 without API calls
        setCreatedScenario({
          id: 'demo-scenario-id',
          title: form.title,
          description: form.description,
          avatar: form.avatar,
          background: form.background,
          totalAttempts: form.totalAttempts,
          module_id: moduleId
        });
        setStep(2);
      } else if (step === 2) {
        // For frontend demo, just show success and navigate back
        toast.success('Scenario created successfully! (Demo Mode)');
        navigate('/add-quiz');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/add-quiz');
    }
  };

  const handleAddDecision = () => {
    const newDecision = {
      id: Math.max(...decisions.map(d => d.id)) + 1,
      title: '',
      description: '',
      choices: [
        { id: 1, text: '', outcome: '', points: 0 },
        { id: 2, text: '', outcome: '', points: 0 }
      ]
    };
    setDecisions([...decisions, newDecision]);
  };

  const handleRemoveDecision = (decisionId) => {
    if (decisions.length > 1) {
      setDecisions(decisions.filter(d => d.id !== decisionId));
    }
  };

  const handleDecisionChange = (decisionId, field, value) => {
    setDecisions(decisions.map(d => 
      d.id === decisionId ? { ...d, [field]: value } : d
    ));
  };

  const handleAddChoice = (decisionId) => {
    setDecisions(decisions.map(d => {
      if (d.id === decisionId) {
        const newChoiceId = Math.max(...d.choices.map(c => c.id)) + 1;
        return {
          ...d,
          choices: [...d.choices, { id: newChoiceId, text: '', outcome: '', points: 0 }]
        };
      }
      return d;
    }));
  };

  const handleRemoveChoice = (decisionId, choiceId) => {
    setDecisions(decisions.map(d => {
      if (d.id === decisionId) {
        const updatedChoices = d.choices.filter(c => c.id !== choiceId);
        if (updatedChoices.length >= 2) {
          return { ...d, choices: updatedChoices };
        }
      }
      return d;
    }));
  };

  const handleChoiceChange = (decisionId, choiceId, field, value) => {
    setDecisions(decisions.map(d => {
      if (d.id === decisionId) {
        return {
          ...d,
          choices: d.choices.map(c => 
            c.id === choiceId ? { ...c, [field]: value } : c
          )
        };
      }
      return d;
    }));
  };

  // Step 2: Add decisions UI
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Button variant="ghost" onClick={handleBack} className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Create Decision Points</h1>
                  <p className="text-sm text-gray-600">Add interactive decisions to your scenario</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="px-3 py-1">
                  Step 2 of 2
                </Badge>
                <Button onClick={handleNext} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Scenario
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {decisions.map((decision, dIdx) => (
              <Card key={decision.id} className="border-l-4 border-l-purple-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {dIdx + 1}
                      </div>
                      <CardTitle className="text-lg text-gray-900">Decision Point {dIdx + 1}</CardTitle>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleRemoveDecision(decision.id)}
                      disabled={decisions.length === 1}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Decision Title</label>
                      <Input
                        placeholder="Enter decision title"
                        value={decision.title}
                        onChange={e => handleDecisionChange(decision.id, 'title', e.target.value)}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (optional)</label>
                      <Input
                        type="number"
                        placeholder="Minutes"
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Decision Description</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[100px] focus:border-purple-500 focus:ring-purple-500"
                      placeholder="Describe the situation or decision point in detail..."
                      value={decision.description}
                      onChange={e => handleDecisionChange(decision.id, 'description', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">Available Choices</label>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddChoice(decision.id)}
                        className="border-purple-200 text-purple-600 hover:bg-purple-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Choice
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {decision.choices.map((choice, cIdx) => (
                        <div key={choice.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                {cIdx + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-700">Choice {cIdx + 1}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleRemoveChoice(decision.id, choice.id)}
                              disabled={decision.choices.length === 2}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Choice Text</label>
                              <Input
                                placeholder="Enter choice text"
                                value={choice.text}
                                onChange={e => handleChoiceChange(decision.id, choice.id, 'text', e.target.value)}
                                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Outcome Description</label>
                              <Input
                                placeholder="What happens when this choice is made?"
                                value={choice.outcome}
                                onChange={e => handleChoiceChange(decision.id, choice.id, 'outcome', e.target.value)}
                                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Points Awarded</label>
                              <Input
                                type="number"
                                placeholder="Points"
                                value={choice.points}
                                onChange={e => handleChoiceChange(decision.id, choice.id, 'points', parseInt(e.target.value) || 0)}
                                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-2 border-dashed border-purple-300 hover:border-purple-400 transition-colors">
              <CardContent className="p-8 text-center">
                <Button 
                  onClick={handleAddDecision} 
                  variant="outline" 
                  className="w-full h-20 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Plus className="w-6 h-6" />
                    <span className="font-medium">Add Another Decision Point</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 1: Scenario details
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assessments
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {editingScenario ? 'Edit Scenario' : 'Create New Scenario'}
                </h1>
                <p className="text-sm text-gray-600">Design an interactive decision-based assessment</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                Step 1 of 2
              </Badge>
              <Button onClick={handleNext} disabled={loading || !form.title.trim()}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Next: Add Decisions
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  Basic Information
                </CardTitle>
                <Button 
                  onClick={handlePreview}
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scenario Title</label>
                <Input 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  placeholder="Enter a compelling scenario title" 
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[100px] focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Describe the scenario context and learning objectives"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Attempts Allowed</label>
                <Input
                  name="totalAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={form.totalAttempts}
                  onChange={handleChange}
                  placeholder="Number of attempts allowed"
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Number of times students can attempt this scenario (1-10)</p>
              </div>
            </CardContent>
          </Card>

          {/* Visual Settings - Avatar and Background on same line */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="w-5 h-5 mr-2 text-purple-600" />
                Visual Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Avatar Selection */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2 text-purple-600" />
                      Avatar
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {/* Upload Button */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer transition-all hover:border-purple-400 hover:bg-purple-50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload-grid"
                      />
                      <label
                        htmlFor="avatar-upload-grid"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <div className="w-12 h-16 bg-gray-100 rounded mb-2 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-gray-500" />
                        </div>
                        <span className="text-xs text-center text-gray-600">Upload Avatar</span>
                      </label>
                    </div>

                    {/* Predefined Avatars */}
                    {AVATAR_OPTIONS.filter(avatar => avatar.id !== 'default').map(avatar => (
                      <div
                        key={avatar.id}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                          form.avatar === avatar.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setForm(prev => ({ ...prev, avatar: avatar.id }))}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-16 bg-gray-200 rounded mb-2 flex items-center justify-center overflow-hidden">
                            <User className="w-6 h-6 text-gray-500" />
                          </div>
                          <span className="text-xs text-center text-gray-600">{avatar.name}</span>
                        </div>
                      </div>
                    ))}

                    {/* Uploaded Avatar Display */}
                    {form.avatar.startsWith('data:') && (
                      <div className="border-2 border-purple-500 bg-purple-50 rounded-lg p-3">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-16 rounded mb-2 overflow-hidden">
                            <img 
                              src={form.avatar} 
                              alt="Uploaded avatar" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-xs text-center text-gray-600">Your Avatar</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Background Selection */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Image className="w-5 h-5 mr-2 text-purple-600" />
                      Background
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {/* Upload Button */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer transition-all hover:border-purple-400 hover:bg-purple-50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                        id="background-upload-grid"
                      />
                      <label
                        htmlFor="background-upload-grid"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-gray-500" />
                        </div>
                        <span className="text-xs text-center text-gray-600">Upload Background</span>
                      </label>
                    </div>

                    {/* Predefined Backgrounds */}
                    {BACKGROUND_OPTIONS.filter(background => background.id !== 'default').map(background => (
                      <div
                        key={background.id}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                          form.background === background.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setForm(prev => ({ ...prev, background: background.id }))}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                            <Image className="w-6 h-6 text-gray-500" />
                          </div>
                          <span className="text-xs text-center text-gray-600">{background.name}</span>
                        </div>
                      </div>
                    ))}

                    {/* Uploaded Background Display */}
                    {form.background.startsWith('data:') && (
                      <div className="border-2 border-purple-500 bg-purple-50 rounded-lg p-3">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-lg mb-2 overflow-hidden">
                            <img 
                              src={form.background} 
                              alt="Uploaded background" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-xs text-center text-gray-600">Your Background</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Scenario Preview</h2>
              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden">
                {/* Background */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${getBackgroundImage(form.background)})`
                  }}
                >
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex items-center p-8">
                  <div className="flex items-start space-x-6 w-full">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-120">
                        <img 
                          src={getAvatarImage(form.avatar)} 
                          alt="Avatar" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    
                    {/* Chat-like Content Box */}
                    <div className="flex-1">
                      <div className="bg-white bg-opacity-90 rounded-lg p-6 shadow-lg max-w-2xl">
                        <h1 className="text-2xl font-bold mb-3 text-gray-900">
                          {form.title || 'Scenario Title'}
                        </h1>
                        <p className="text-lg mb-6 leading-relaxed text-gray-700">
                          {form.description || 'Scenario description will appear here...'}
                        </p>
                        <Button 
                          size="lg"
                          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Start Scenario
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateScenario;
