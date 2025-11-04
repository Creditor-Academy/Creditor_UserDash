import React, { useState, useEffect } from 'react';
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
  Eye
} from 'lucide-react';

const SCENARIO_TYPES = [
  { label: 'Decision Tree', value: 'DECISION_TREE' },
  { label: 'Role Play', value: 'ROLE_PLAY' },
  { label: 'Case Study', value: 'CASE_STUDY' },
  { label: 'Simulation', value: 'SIMULATION' },
];

const AVATAR_OPTIONS = [
  { id: 'default', name: 'Default Avatar', image: '/default-avatar.png' },
  { id: 'business-woman', name: 'Business Woman', image: '/avatars/business-woman.png' },
  { id: 'business-man', name: 'Business Man', image: '/avatars/business-man.png' },
  { id: 'student', name: 'Student', image: '/avatars/student.png' },
  { id: 'teacher', name: 'Teacher', image: '/avatars/teacher.png' },
  { id: 'manager', name: 'Manager', image: '/avatars/manager.png' },
];

const BACKGROUND_OPTIONS = [
  { id: 'default', name: 'Default Background', image: '/backgrounds/default.jpg' },
  { id: 'office', name: 'Office', image: '/backgrounds/office.jpg' },
  { id: 'classroom', name: 'Classroom', image: '/backgrounds/classroom.jpg' },
  { id: 'meeting-room', name: 'Meeting Room', image: '/backgrounds/meeting-room.jpg' },
  { id: 'library', name: 'Library', image: '/backgrounds/library.jpg' },
  { id: 'outdoor', name: 'Outdoor', image: '/backgrounds/outdoor.jpg' },
];

const ScenarioModal = ({ 
  isOpen, 
  onClose, 
  moduleId, 
  onScenarioCreated, 
  editingScenario = null, 
  onScenarioUpdated = null 
}) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'DECISION_TREE',
    time_estimate: 30,
    avatar: 'default',
    background: 'default',
    instructions: '',
  });
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdScenario, setCreatedScenario] = useState(null);
  
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

  // Reset state when modal opens/closes or when editing scenario changes
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal closes
      setForm({
        title: '',
        description: '',
        type: 'DECISION_TREE',
        time_estimate: 30,
        avatar: 'default',
        background: 'default',
        instructions: '',
      });
      setStep(1);
      setLoading(false);
      setError('');
      setCreatedScenario(null);
      setDecisions([
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
    } else if (editingScenario) {
      // If editing an existing scenario, populate the form
      setForm({
        title: editingScenario.title || '',
        description: editingScenario.description || '',
        type: editingScenario.type || 'DECISION_TREE',
        time_estimate: editingScenario.time_estimate || 30,
        avatar: editingScenario.avatar || 'default',
        background: editingScenario.background || 'default',
        instructions: editingScenario.instructions || '',
      });
      setCreatedScenario(editingScenario);
      if (editingScenario.decisions && editingScenario.decisions.length > 0) {
        setDecisions(editingScenario.decisions);
      }
    }
  }, [isOpen, editingScenario]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    setForm((prev) => ({ ...prev, type: e.target.value }));
  };

  const handleNext = async () => {
    setLoading(true);
    setError('');

    try {
      if (step === 1) {
        // Create or update scenario
        const scenarioData = {
          ...form,
          module_id: moduleId,
        };

        if (editingScenario) {
          // Update existing scenario
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scenario/${editingScenario.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeader(),
            },
            credentials: 'include',
            body: JSON.stringify(scenarioData),
          });

          if (!response.ok) {
            throw new Error('Failed to update scenario');
          }

          const result = await response.json();
          setCreatedScenario(result.data || result);
          onScenarioUpdated && onScenarioUpdated();
        } else {
          // Create new scenario
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scenario`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeader(),
            },
            credentials: 'include',
            body: JSON.stringify(scenarioData),
          });

          if (!response.ok) {
            throw new Error('Failed to create scenario');
          }

          const result = await response.json();
          setCreatedScenario(result.data || result);
          onScenarioCreated && onScenarioCreated();
        }

        setStep(2);
      } else if (step === 2) {
        // Save decisions
        if (createdScenario) {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scenario/${createdScenario.id}/decisions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeader(),
            },
            credentials: 'include',
            body: JSON.stringify({ decisions }),
          });

          if (!response.ok) {
            throw new Error('Failed to save decisions');
          }

          onClose();
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
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

  const handleClose = () => {
    onClose();
  };

  // Step 2: Add decisions UI
  if (step === 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Add Decisions to Scenario</h2>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="space-y-6">
            {decisions.map((decision, dIdx) => (
              <Card key={decision.id} className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Decision {dIdx + 1}</CardTitle>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleRemoveDecision(decision.id)}
                      disabled={decisions.length === 1}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Decision Title</label>
                    <Input
                      placeholder="Enter decision title"
                      value={decision.title}
                      onChange={e => handleDecisionChange(decision.id, 'title', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Decision Description</label>
                    <textarea
                      className="w-full border rounded px-3 py-2 min-h-[80px]"
                      placeholder="Describe the situation or decision point"
                      value={decision.description}
                      onChange={e => handleDecisionChange(decision.id, 'description', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Choices</label>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddChoice(decision.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Choice
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {decision.choices.map((choice, cIdx) => (
                        <div key={choice.id} className="border rounded p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Choice {cIdx + 1}</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleRemoveChoice(decision.id, choice.id)}
                              disabled={decision.choices.length === 2}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Choice Text</label>
                              <Input
                                placeholder="Enter choice text"
                                value={choice.text}
                                onChange={e => handleChoiceChange(decision.id, choice.id, 'text', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Outcome</label>
                              <Input
                                placeholder="Enter outcome description"
                                value={choice.outcome}
                                onChange={e => handleChoiceChange(decision.id, choice.id, 'outcome', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Points</label>
                              <Input
                                type="number"
                                placeholder="Points"
                                value={choice.points}
                                onChange={e => handleChoiceChange(decision.id, choice.id, 'points', parseInt(e.target.value) || 0)}
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
            
            <Button onClick={handleAddDecision} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Decision
            </Button>
          </div>
          
          {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
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
    );
  }

  // Step 1: Scenario details
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-4">
          {editingScenario ? 'Edit Scenario' : 'Create Scenario'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Module ID</label>
            <Input value={moduleId} disabled className="bg-gray-100" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              placeholder="Scenario Title" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 min-h-[80px]"
              placeholder="Describe the scenario"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              name="type" 
              value={form.type} 
              onChange={handleTypeChange} 
              className="w-full border rounded px-3 py-2"
            >
              {SCENARIO_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Estimate (minutes)</label>
            <Input 
              name="time_estimate" 
              type="number" 
              value={form.time_estimate} 
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 min-h-[80px]"
              placeholder="Instructions for the scenario"
            />
          </div>
          
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map(avatar => (
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
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-2 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <span className="text-xs text-center text-gray-600">{avatar.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Background Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
            <div className="grid grid-cols-3 gap-3">
              {BACKGROUND_OPTIONS.map(background => (
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
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                      <Image className="w-6 h-6 text-gray-500" />
                    </div>
                    <span className="text-xs text-center text-gray-600">{background.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleNext} disabled={loading}>
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
  );
};

export default ScenarioModal;
