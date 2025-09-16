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
  { id: 'business-woman', name: 'Business Woman', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/business_women.png', description: 'Professional female executive' },
  { id: 'business-man', name: 'Business Man', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/business_man.png', description: 'Professional male executive' },
  { id: 'teacher-male', name: 'Teacher Male', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/Teacher+male.png', description: 'Educational instructor (male)' },
  { id: 'teacher', name: 'Teacher Female', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/Teacher.png', description: 'Educational instructor (female)' },
  { id: 'manager-male', name: 'Manager Male', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/Manager+male.png', description: 'Team leader avatar (male)' },
  { id: 'manager', name: 'Manager Female', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/Manager.png', description: 'Team leader avatar (female)' },
];

const BACKGROUND_OPTIONS = [
  { id: 'workspace', name: 'Workspace', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/Workspace.jpg', description: 'Modern workspace environment' },
  { id: 'empty-room', name: 'Empty Room', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/Empty+room.jpg', description: 'Minimal empty room setting' },
  { id: 'library', name: 'Library', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/Library.jpg', description: 'Quiet study environment' },
  { id: 'meeting', name: 'Meeting Room', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/Meeting.jpg', description: 'Professional meeting space' },
  { id: 'office-blue', name: 'Office (Blue)', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/Office_blue.jpg', description: 'Blue-themed office environment' },
  { id: 'office', name: 'Office', image: 'https://athena-user-assets.s3.eu-north-1.amazonaws.com/Scenario_assests/Office.jpg', description: 'Professional office environment' },
];

const CreateScenario = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { moduleId, editingScenario } = location.state || {};

  const [form, setForm] = useState({
    title: '',
    description: '',
    avatar: 'business-woman',
    background: 'workspace',
    totalAttempts: 3,
  });
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdScenario, setCreatedScenario] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Decision state for step 2 - Enhanced for branching simulation
  const [decisions, setDecisions] = useState([
    {
      id: 1,
      title: 'Decision Point 1',
      description: 'Enter the opening scenario or first decision point...',
      choices: [
        { 
          id: 1, 
          text: 'Choice 1', 
          outcome: 'What happens with this choice?', 
          points: 0,
          feedback: 'Immediate feedback for this choice',
          nextDecisionId: null,
          branchType: 'neutral'
        }
      ],
      level: 1,
      branchPath: 'main'
    }
  ]);

  // Track decision tree structure
  const [decisionTree, setDecisionTree] = useState({});
  const [currentBranch, setCurrentBranch] = useState('main');

  // Initialize form with editing data if available
  useEffect(() => {
    if (editingScenario) {
      setForm({
        title: editingScenario.title || '',
        description: editingScenario.description || '',
        avatar: editingScenario.avatar || 'business-woman',
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


  const handlePreview = () => {
    setShowPreview(true);
  };

  const getAvatarImage = (avatarId) => {
    // Find the avatar from predefined AWS options
    const preset = AVATAR_OPTIONS.find((opt) => opt.id === avatarId);
    if (preset && typeof preset.image === 'string') {
      return preset.image;
    }
    // Fallback to first avatar if not found
    return AVATAR_OPTIONS[0].image;
  };

  const getBackgroundImage = (backgroundId) => {
    // Find the background from predefined options
    const preset = BACKGROUND_OPTIONS.find((opt) => opt.id === backgroundId);
    if (preset && typeof preset.image === 'string') {
      return preset.image;
    }
    // Fallback to first available option if not found
    return BACKGROUND_OPTIONS[0]?.image || '';
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
        // Go to step 3 for preview
        setStep(3);
      } else if (step === 3) {
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

  const handleAddDecision = (parentDecisionId = null, branchPath = 'main') => {
    const newDecision = {
      id: Math.max(...decisions.map(d => d.id)) + 1,
      title: '',
      description: '',
      choices: [
        { id: 1, text: '', outcome: '', points: 0, feedback: '', nextDecisionId: null, branchType: 'neutral' },
        { id: 2, text: '', outcome: '', points: 0, feedback: '', nextDecisionId: null, branchType: 'neutral' },
        { id: 3, text: '', outcome: '', points: 0, feedback: '', nextDecisionId: null, branchType: 'neutral' }
      ],
      level: parentDecisionId ? decisions.find(d => d.id === parentDecisionId)?.level + 1 || 2 : 1,
      branchPath: branchPath,
      parentDecisionId: parentDecisionId
    };
    setDecisions([...decisions, newDecision]);
  };

  const handleAddBranch = (parentDecisionId, choiceId) => {
    const parentDecision = decisions.find(d => d.id === parentDecisionId);
    const choice = parentDecision.choices.find(c => c.id === choiceId);
    const newBranchPath = `${parentDecision.branchPath}_${choiceId}`;
    
    // Update the choice to point to new decision
    const updatedDecisions = decisions.map(d => {
      if (d.id === parentDecisionId) {
        return {
          ...d,
          choices: d.choices.map(c => 
            c.id === choiceId ? { ...c, nextDecisionId: Math.max(...decisions.map(d => d.id)) + 1 } : c
          )
        };
      }
      return d;
    });
    
    // Add new decision for the branch
    const newDecision = {
      id: Math.max(...decisions.map(d => d.id)) + 1,
      title: `Branch from "${choice.text.substring(0, 30)}..."`,
      description: '',
      choices: [
        { id: 1, text: '', outcome: '', points: 0, feedback: '', nextDecisionId: null, branchType: 'neutral' },
        { id: 2, text: '', outcome: '', points: 0, feedback: '', nextDecisionId: null, branchType: 'neutral' },
        { id: 3, text: '', outcome: '', points: 0, feedback: '', nextDecisionId: null, branchType: 'neutral' }
      ],
      level: parentDecision.level + 1,
      branchPath: newBranchPath,
      parentDecisionId: parentDecisionId
    };
    
    setDecisions([...updatedDecisions, newDecision]);
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
          choices: [...d.choices, { 
            id: newChoiceId, 
            text: '', 
            outcome: '', 
            points: 0,
            feedback: '',
            nextDecisionId: null,
            branchType: 'neutral'
          }]
        };
      }
      return d;
    }));
  };

  const handleRemoveChoice = (decisionId, choiceId) => {
    setDecisions(decisions.map(d => {
      if (d.id === decisionId) {
        const updatedChoices = d.choices.filter(c => c.id !== choiceId);
        if (updatedChoices.length >= 1) {
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

  const getBranchTypeColor = (branchType) => {
    switch (branchType) {
      case 'success': return 'border-green-500 bg-green-50 text-green-700';
      case 'failure': return 'border-red-500 bg-red-50 text-red-700';
      case 'neutral': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      default: return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  const getBranchTypeIcon = (branchType) => {
    switch (branchType) {
      case 'success': return '✅';
      case 'failure': return '❌';
      case 'neutral': return '⚠️';
      default: return '📝';
    }
  };

  const renderFlowchart = () => {
    const mainDecisions = decisions.filter(d => d.level === 1);
    
    return (
      <div className="flowchart">
        {mainDecisions.map(decision => (
          <div key={decision.id} className="flowchart-branch">
            {renderFlowchartNode(decision)}
          </div>
        ))}
      </div>
    );
  };

  // New function to render all choices horizontally at the same level
  const renderChoicesHorizontally = (choices, level) => {
    return (
      <div className="flowchart-choices-horizontal" data-level={level}>
        {choices.map((choice, cIdx) => (
          <div key={choice.id} className="flowchart-choice-wrapper">
            {/* Choice Node */}
            <div className="flowchart-choice-node">
              <div className={`flowchart-choice-badge ${getBranchTypeColor(choice.branchType)}`}>
                {getBranchTypeIcon(choice.branchType)}
              </div>
              <div className="flowchart-choice-text">{choice.text}</div>
            </div>
            
            {/* Connection line from choice to next decision */}
            {choice.nextDecisionId ? (
              <div className="flowchart-choice-connector">
                <div className="flowchart-choice-arrow">↓</div>
              </div>
            ) : (
              <div className="flowchart-choice-connector">
                <div className="flowchart-end-arrow">●</div>
              </div>
            )}
            
            {/* Next Decision or End */}
            {choice.nextDecisionId ? (
              <div className="flowchart-next-decision">
                {decisions.find(d => d.id === choice.nextDecisionId) && (
                  (() => {
                    const nextDecision = decisions.find(d => d.id === choice.nextDecisionId);
                    return (
                      <div className="flowchart-node-container" data-level={nextDecision.level}>
                        {/* Decision Node */}
                        <div className="flowchart-decision-node">
                          <div className="flowchart-decision-title">
                            <div className="flowchart-level-badge">L{nextDecision.level}</div>
                            <div className="flowchart-decision-text">{nextDecision.title}</div>
                          </div>
                        </div>
                        
                        {/* Connection line from decision to choices */}
                        <div className="flowchart-decision-connector"></div>
                        
                        {/* Choices Container - Horizontal Layout */}
                        {renderChoicesHorizontally(nextDecision.choices, nextDecision.level)}
                      </div>
                    );
                  })()
                )}
              </div>
            ) : (
              <div className="flowchart-end-node">
                <div className="flowchart-end-text">End</div>
                <div className={`flowchart-end-badge ${getBranchTypeColor(choice.branchType)}`}>
                  {getBranchTypeIcon(choice.branchType)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderFlowchartNode = (decision) => {
    return (
      <div className="flowchart-node-container" data-level={decision.level}>
        {/* Decision Node */}
        <div className="flowchart-decision-node">
          <div className="flowchart-decision-title">
            <div className="flowchart-level-badge">L{decision.level}</div>
            <div className="flowchart-decision-text">{decision.title}</div>
          </div>
        </div>
        
        {/* Connection line from decision to choices */}
        <div className="flowchart-decision-connector"></div>
        
        {/* Choices Container - Horizontal Layout for ALL levels */}
        {renderChoicesHorizontally(decision.choices, decision.level)}
      </div>
    );
  };

  const renderDecisionTree = () => {
    const mainDecisions = decisions.filter(d => d.level === 1);
    
    return mainDecisions.map(decision => (
      <div key={decision.id} className="space-y-4">
        {renderDecisionNode(decision)}
        {renderChildDecisions(decision.id)}
      </div>
    ));
  };

  const renderChildDecisions = (parentId) => {
    const children = decisions.filter(d => d.parentDecisionId === parentId);
    return children.map(child => (
      <div key={child.id} className="ml-8 border-l-2 border-gray-200 pl-4">
        {renderDecisionNode(child)}
        {renderChildDecisions(child.id)}
      </div>
    ));
  };

  const renderDecisionNode = (decision) => {
    return (
      <Card key={decision.id} className="border-l-4 border-l-purple-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                {decision.level}
              </div>
              <CardTitle className="text-lg text-gray-900">{decision.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
                Level {decision.level}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
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
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
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
                <div key={choice.id} className={`border-2 rounded-lg p-4 transition-colors ${getBranchTypeColor(choice.branchType)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getBranchTypeIcon(choice.branchType)}</span>
                      <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {cIdx + 1}
                      </div>
                      <span className="text-sm font-medium">Choice {cIdx + 1}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddBranch(decision.id, choice.id)}
                        className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 font-medium"
                      >
                        <ArrowRight className="w-3 h-3 mr-1" />
                        Add Branch
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleRemoveChoice(decision.id, choice.id)}
                        disabled={decision.choices.length === 1}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">Branch Type</label>
                      <select
                        value={choice.branchType}
                        onChange={e => handleChoiceChange(decision.id, choice.id, 'branchType', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
                      >
                        <option value="neutral">⚠️ Neutral</option>
                        <option value="success">✅ Success</option>
                        <option value="failure">❌ Failure</option>
                      </select>
                    </div>
                    
                    
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Next Action</label>
                      <select
                        value={choice.nextDecisionId && choice.nextDecisionId !== 'pending' ? 'continue' : 'end'}
                        onChange={e => {
                          if (e.target.value === 'end') {
                            handleChoiceChange(decision.id, choice.id, 'nextDecisionId', null);
                          } else {
                            // Will be handled when user selects a specific decision
                            handleChoiceChange(decision.id, choice.id, 'nextDecisionId', 'pending');
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
                      >
                        <option value="end">End Scenario</option>
                        <option value="continue">Continue to Next Decision</option>
                      </select>
                    </div>
                    
                    {choice.nextDecisionId === 'pending' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Select Next Decision</label>
                        <select
                          value={choice.nextDecisionId || ''}
                          onChange={e => handleChoiceChange(decision.id, choice.id, 'nextDecisionId', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                          <option value="">Choose a decision...</option>
                          {decisions
                            .filter(d => d.id !== decision.id) // Don't allow self-reference
                            .map(d => (
                              <option key={d.id} value={d.id}>
                                Level {d.level}: {d.title}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                    
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
                  
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Immediate Feedback</label>
                    <Input
                      placeholder="Feedback shown immediately after choice"
                      value={choice.feedback}
                      onChange={e => handleChoiceChange(decision.id, choice.id, 'feedback', e.target.value)}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  
                  {choice.nextDecisionId && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      <span className="font-medium">Branches to:</span> Decision {choice.nextDecisionId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Step 3: Preview and Flowchart
  if (step === 3) {
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
                  <h1 className="text-xl font-semibold text-gray-900">Preview Scenario</h1>
                  <p className="text-sm text-gray-600">Review your scenario and flowchart before publishing</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="px-3 py-1">
                  Step 3 of 3
                </Badge>
                <Button onClick={handleNext} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Publishing...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Publish Scenario
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
            {/* Scenario Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-purple-600" />
                  Scenario Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{form.title}</h3>
                    <p className="text-gray-600 mb-4">{form.description}</p>
                    <div className="space-y-2 text-sm">
                      <div><strong>Total Attempts:</strong> {form.totalAttempts}</div>
                      <div><strong>Decision Points:</strong> {decisions.length}</div>
                      <div><strong>Total Choices:</strong> {decisions.reduce((acc, d) => acc + d.choices.length, 0)}</div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative w-32 h-40 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img 
                        src={getBackgroundImage(form.background)} 
                        alt="Background" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <img 
                          src={getAvatarImage(form.avatar)} 
                          alt="Avatar" 
                          className="w-16 h-20 object-contain mx-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decision Tree Flowchart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  Decision Tree Flowchart
                </CardTitle>
                <p className="text-sm text-gray-600">Visual representation of your branching scenario</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
                  <div className="flowchart-container">
                    {renderFlowchart()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decision Points List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-600" />
                  Decision Points Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {decisions.map((decision, dIdx) => (
                    <div key={decision.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">Level {decision.level}: {decision.title}</h4>
                        <Badge variant="outline">Decision {dIdx + 1}</Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{decision.description}</p>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-gray-700">Choices:</h5>
                        {decision.choices.map((choice, cIdx) => (
                          <div key={choice.id} className={`p-3 rounded-lg border-l-4 ${getBranchTypeColor(choice.branchType)}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{cIdx + 1}. {choice.text}</span>
                                <span className="text-lg">{getBranchTypeIcon(choice.branchType)}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {choice.nextDecisionId ? `→ Decision ${choice.nextDecisionId}` : 'End Scenario'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              <strong>Outcome:</strong> {choice.outcome}
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Feedback:</strong> {choice.feedback}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
                Step 2 of 3
              </Badge>
                <Button onClick={handleNext} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Next: Preview
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
            {/* Decision Tree Header */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Brain className="w-5 h-5 mr-2" />
                  Branching Decision Tree
                </CardTitle>
                <p className="text-sm text-blue-600">
                  Create complex branching scenarios with multiple decision levels. Each choice can lead to different paths with immediate feedback.
                </p>
              </CardHeader>
            </Card>


            {/* Decision Tree */}
            {renderDecisionTree()}
            
            
            {/* Branch Type Legend */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-700">Branch Type Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">✅</span>
                    <span className="text-green-700 font-medium">Success Path</span>
                    <span className="text-gray-500">- Leads to positive outcomes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">❌</span>
                    <span className="text-red-700 font-medium">Failure Path</span>
                    <span className="text-gray-500">- Ends scenario or leads to negative outcomes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">⚠️</span>
                    <span className="text-yellow-700 font-medium">Neutral Path</span>
                    <span className="text-gray-500">- Continues scenario with mixed results</span>
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
                Step 1 of 3
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
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* AWS Avatars */}
                    {AVATAR_OPTIONS.map(avatar => (
                      <div
                        key={avatar.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          form.avatar === avatar.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setForm(prev => ({ ...prev, avatar: avatar.id }))}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-20 bg-gray-200 rounded mb-3 flex items-center justify-center overflow-hidden">
                            <img
                              src={avatar.image}
                              alt={avatar.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 text-center mb-1">{avatar.name}</h4>
                          <p className="text-xs text-gray-600 text-center leading-tight">{avatar.description}</p>
                        </div>
                      </div>
                    ))}
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
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Predefined Backgrounds */}
                    {BACKGROUND_OPTIONS.map(background => (
                      <div
                        key={background.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          form.background === background.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setForm(prev => ({ ...prev, background: background.id }))}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-12 bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            <img
                              src={background.image}
                              alt={background.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 text-center mb-1">{background.name}</h4>
                          <p className="text-xs text-gray-600 text-center leading-tight">{background.description}</p>
                        </div>
                      </div>
                    ))}
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
                      <div className="w-32 h-56">
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

// Flowchart Styles (inline for now, can be moved to CSS file later)
const flowchartStyles = `
  .flowchart {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .flowchart-branch {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    margin-bottom: 40px;
  }
  
  .flowchart-branch:not(:last-child) {
    border-bottom: 2px dashed #e5e7eb;
    padding-bottom: 40px;
  }
  
  .flowchart-node-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px 0;
    position: relative;
  }
  
  /* Add visual depth for nested levels - only for main decision containers */
  .flowchart-branch .flowchart-node-container[data-level="2"] {
    background: rgba(139, 92, 246, 0.05);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(139, 92, 246, 0.2);
  }
  
  .flowchart-branch .flowchart-node-container[data-level="3"] {
    background: rgba(59, 130, 246, 0.05);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }
  
  .flowchart-branch .flowchart-node-container[data-level="4"] {
    background: rgba(16, 185, 129, 0.05);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }
  
  /* Remove background for nested decisions within choices */
  .flowchart-next-decision .flowchart-node-container[data-level] {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
  }
  
  .flowchart-decision-node {
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    min-width: 200px;
    text-align: center;
    position: relative;
  }
  
  .flowchart-decision-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .flowchart-level-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .flowchart-decision-text {
    font-weight: 600;
    font-size: 14px;
  }
  
  .flowchart-decision-connector {
    width: 2px;
    height: 20px;
    background: #cbd5e1;
    margin: 10px auto;
  }
  
  .flowchart-choices-horizontal {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 20px;
    margin-top: 20px;
    width: 100%;
    flex-wrap: wrap;
    position: relative;
  }
  
  /* Ensure all levels use horizontal layout */
  .flowchart-choices-horizontal .flowchart-choices-horizontal {
    margin-top: 10px;
  }
  
  /* Force horizontal layout for all nested levels */
  .flowchart-choices-horizontal[data-level] {
    display: flex !important;
    flex-direction: row !important;
    justify-content: center !important;
    align-items: flex-start !important;
    gap: 20px !important;
    flex-wrap: wrap !important;
  }
  
  /* Ensure nested decision choices are also horizontal */
  .flowchart-next-decision .flowchart-choices-horizontal {
    display: flex !important;
    flex-direction: row !important;
    justify-content: center !important;
    align-items: flex-start !important;
    gap: 15px !important;
    flex-wrap: wrap !important;
  }
  
  /* Make sure L2 choices appear horizontally like L1 */
  .flowchart-choice-wrapper .flowchart-next-decision {
    position: relative;
    width: 100%;
  }
  
  .flowchart-choice-wrapper .flowchart-next-decision .flowchart-choices-horizontal {
    position: relative;
    width: 100%;
    margin-top: 15px;
  }
  
  .flowchart-choice-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    min-width: 180px;
    max-width: 250px;
  }
  
  .flowchart-choice-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    min-width: 160px;
    text-align: center;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }
  
  .flowchart-choice-node:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .flowchart-choice-connector {
    display: flex;
    justify-content: center;
    margin: 10px 0;
  }
  
  .flowchart-choice-arrow {
    font-size: 18px;
    color: #6b7280;
    font-weight: bold;
  }
  
  .flowchart-end-arrow {
    font-size: 16px;
    color: #ef4444;
    font-weight: bold;
  }
  
  .flowchart-choice-badge {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    min-width: 32px;
    text-align: center;
  }
  
  .flowchart-choice-text {
    font-size: 13px;
    color: #374151;
    font-weight: 500;
    line-height: 1.4;
    word-wrap: break-word;
  }
  
  .flowchart-next-decision {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    position: relative;
    width: 100%;
  }
  
  .flowchart-next-decision::before {
    content: '';
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 15px;
    background: #cbd5e1;
  }
  
  /* Ensure nested decisions also display choices horizontally */
  .flowchart-next-decision .flowchart-node-container {
    margin: 0;
    background: transparent;
    border: none;
    padding: 0;
    width: 100%;
  }
  
  .flowchart-next-decision .flowchart-decision-node {
    margin-bottom: 10px;
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .flowchart-next-decision .flowchart-choices-horizontal {
    margin-top: 10px;
    display: flex !important;
    flex-direction: row !important;
    justify-content: center !important;
    align-items: flex-start !important;
    gap: 15px !important;
    flex-wrap: wrap !important;
  }
  
  /* Make nested decision choices smaller and more compact */
  .flowchart-next-decision .flowchart-choice-wrapper {
    min-width: 120px;
    max-width: 180px;
  }
  
  .flowchart-next-decision .flowchart-choice-node {
    padding: 8px 12px;
    min-width: 100px;
    font-size: 11px;
  }
  
  .flowchart-next-decision .flowchart-choice-text {
    font-size: 11px;
  }
  
  .flowchart-end-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f3f4f6;
    border: 2px solid #d1d5db;
    border-radius: 12px;
    min-width: 120px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .flowchart-end-text {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
  }
  
  .flowchart-end-badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
  }
  
  /* Add visual indicators for decision level depth */
  .flowchart-node-container[data-level="1"] .flowchart-decision-node {
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  
  .flowchart-node-container[data-level="2"] .flowchart-decision-node {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  .flowchart-node-container[data-level="3"] .flowchart-decision-node {
    background: linear-gradient(135deg, #10b981, #34d399);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  .flowchart-node-container[data-level="4"] .flowchart-decision-node {
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .flowchart-choices-horizontal {
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .flowchart-choice-wrapper {
      min-width: 150px;
      max-width: 200px;
    }
    
    .flowchart-decision-node,
    .flowchart-choice-node {
      min-width: 140px;
    }
    
    .flowchart-decision-text,
    .flowchart-choice-text {
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    .flowchart-choices-horizontal {
      gap: 12px;
    }
    
    .flowchart-choice-wrapper {
      min-width: 120px;
      max-width: 160px;
    }
    
    .flowchart-choice-node {
      padding: 8px 12px;
      min-width: 120px;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = flowchartStyles;
  document.head.appendChild(styleSheet);
}
