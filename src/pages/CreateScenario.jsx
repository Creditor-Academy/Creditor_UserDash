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
import { createScenario, updateScenario, saveScenarioDecisions, createDecisionsBulk, createDecisionChoices } from '@/services/scenarioService';
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
        // Create scenario via API
        const avatarUrl = getAvatarImage(form.avatar);
        const backgroundUrl = getBackgroundImage(form.background);
        
        const scenarioPayload = {
          title: form.title,
          description: form.description,
          max_attempts: form.totalAttempts,
          avatar_url: avatarUrl,
          background_url: backgroundUrl
        };

        const createdScenarioData = await createScenario(scenarioPayload);
        
        // Store the created scenario data
        setCreatedScenario({
          id: createdScenarioData.id || createdScenarioData.scenarioId,
          title: form.title,
          description: form.description,
          avatar: form.avatar,
          background: form.background,
          totalAttempts: form.totalAttempts,
          module_id: moduleId,
          ...createdScenarioData
        });
        
        toast.success('Scenario created successfully!');
        setStep(2);
      } else if (step === 2) {
        // Ensure scenario exists
        const scenarioId = createdScenario?.id || createdScenario?.scenarioId;
        if (!scenarioId) {
          throw new Error('Scenario not found. Please go back and create the scenario first.');
        }

        // 1) Create all decisions in order
        const decisionsPayload = decisions.map((d, index) => ({
          description: d.description || d.title || `Decision ${index + 1}`,
          decisionOrder: index + 1,
        }));

        const createdDecisions = await createDecisionsBulk(scenarioId, decisionsPayload);
        // Build local->server id map based on array order
        const localToServerDecisionId = new Map();
        createdDecisions.forEach((serverDecision, idx) => {
          const localDecision = decisions[idx];
          if (localDecision) {
            localToServerDecisionId.set(localDecision.id, serverDecision.id);
          }
        });

        // Helper mappers
        const mapOutcomeType = (branchType) => {
          if (!branchType) return 'NEUTRAL';
          const bt = String(branchType).toLowerCase();
          if (bt === 'success') return 'SUCCESS';
          if (bt === 'failure') return 'FAILURE';
          return 'NEUTRAL';
        };

        // 2) For each decision, create its choices
        for (let idx = 0; idx < decisions.length; idx++) {
          const decision = decisions[idx];
          const serverDecisionId = localToServerDecisionId.get(decision.id);
          if (!serverDecisionId) continue;

          const choicesPayload = (decision.choices || []).map((c) => {
            const hasNext = c.nextDecisionId !== null && c.nextDecisionId !== undefined && c.nextDecisionId !== 'pending';
            const nextAction = hasNext ? 'CONTINUE' : 'END';
            const mappedNextDecisionId = hasNext ? localToServerDecisionId.get(c.nextDecisionId) || null : null;
            return {
              text: c.text || '',
              outcomeType: mapOutcomeType(c.branchType),
              feedback: c.feedback || '',
              nextAction,
              nextDecisionId: mappedNextDecisionId,
              points: typeof c.points === 'number' ? c.points : parseInt(c.points || 0, 10)
            };
          });

          await createDecisionChoices(serverDecisionId, choicesPayload);
        }

        // Proceed to preview
        const scenarioData = {
          id: scenarioId,
          title: form.title,
          description: form.description,
          avatar: form.avatar,
          background: form.background,
          totalAttempts: form.totalAttempts,
          module_id: moduleId,
          decisions: decisions
        };
        navigate('/preview-scenario', { state: { scenarioData } });
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
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Preview Scenario
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
                    Create & Add Decisions
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
                    <div className="w-48 h-[28rem]">
                      <img 
                        src={getAvatarImage(form.avatar)} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
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

