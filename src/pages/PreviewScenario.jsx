import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  ArrowLeft,
  Save,
  Eye,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Circle,
  PartyPopper
} from 'lucide-react';
import { toast } from "sonner";
import { getSpecificScenario } from '@/services/scenarioService';

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

const PreviewScenario = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { scenarioData, scenarioId } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    avatar: '', // api avatar_url
    background: '', // api background_url
    totalAttempts: 3,
  });
  const [decisions, setDecisions] = useState([]);
  
  // Interactive preview state
  const [previewMode, setPreviewMode] = useState(false);
  const [currentDecision, setCurrentDecision] = useState(null);
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [scenarioComplete, setScenarioComplete] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastChoice, setLastChoice] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  // Transform API data to match component format
  const transformApiData = (apiData) => {
    const decisions = apiData.decisions?.map(decision => ({
      id: decision.id,
      level: decision.decisionOrder || 1,
      title: decision.description || '',
      description: decision.description || '',
      choices: decision.choices?.map(choice => ({
        id: choice.id,
        text: choice.text || '',
        branchType: choice.branch_type?.toLowerCase() || 'neutral',
        outcome: choice.feedback || '',
        feedback: choice.feedback || '',
        nextDecisionId: choice.next_decision_id,
        points: choice.points || 0
      })) || []
    })) || [];

    return {
      title: apiData.title || '',
      description: apiData.description || '',
      avatar: apiData.avatar_url || '',
      background: apiData.background_url || '',
      totalAttempts: apiData.max_attempts || 3,
      decisions: decisions
    };
  };

  // Legacy helper removed; we now use URLs directly

  useEffect(() => {
    const loadScenarioData = async () => {
      if (scenarioData) {
        // Data passed from navigation state
        setForm({
          title: scenarioData.title || '',
          description: scenarioData.description || '',
          avatar: scenarioData.avatar_url || scenarioData.avatar || '',
          background: scenarioData.background_url || scenarioData.background || '',
          totalAttempts: scenarioData.max_attempts || scenarioData.totalAttempts || 3,
        });
        setDecisions(scenarioData.decisions || []);
      } else if (scenarioId) {
        // Fetch scenario data by ID
        setFetching(true);
        try {
          const apiData = await getSpecificScenario(scenarioId);
          const transformedData = transformApiData(apiData);
          
          setForm({
            title: transformedData.title,
            description: transformedData.description,
            avatar: transformedData.avatar,
            background: transformedData.background,
            totalAttempts: transformedData.totalAttempts,
          });
          setDecisions(transformedData.decisions);
        } catch (error) {
          console.error('Error fetching scenario:', error);
          toast.error('Failed to load scenario data');
        } finally {
          setFetching(false);
        }
      }
    };

    loadScenarioData();
  }, [scenarioData, scenarioId]);

  const handleBack = () => {
    if (scenarioData) {
      // Coming from create scenario flow
      navigate('/create-scenario', { 
        state: { 
          moduleId: scenarioData?.moduleId,
          editingScenario: scenarioData,
          returnToStep: 2
        } 
      });
    } else {
      // Coming from scenario list
      navigate('/add-quiz');
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      // For frontend demo, just show success and navigate back
      toast.success('Scenario published successfully! (Demo Mode)');
      navigate('/add-quiz');
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Interactive preview functions
  const startPreview = () => {
    setPreviewMode(true);
    setScenarioComplete(false);
    setSelectedChoices([]);
    setTotalPoints(0);
    setShowFeedback(false);
    setLastChoice(null);
    setShowDecisionModal(false);
    
    // Find the first decision (level 1)
    const firstDecision = decisions.find(d => d.level === 1);
    if (firstDecision) {
      setCurrentDecision(firstDecision);
      setShowDecisionModal(true);
    }
  };

  const resetPreview = () => {
    setPreviewMode(false);
    setCurrentDecision(null);
    setSelectedChoices([]);
    setScenarioComplete(false);
    setTotalPoints(0);
    setShowFeedback(false);
    setLastChoice(null);
    setShowDecisionModal(false);
  };

  const handleChoiceSelect = (choice) => {
    if (!currentDecision) return;

    const newSelectedChoices = [...selectedChoices, {
      decisionId: currentDecision.id,
      decisionTitle: currentDecision.title,
      choice: choice,
      points: choice.points || 0
    }];

    setSelectedChoices(newSelectedChoices);
    setTotalPoints(prev => prev + (choice.points || 0));
    setLastChoice(choice);
    setShowFeedback(true);
    setShowDecisionModal(false);

    // Auto-advance after showing feedback
    setTimeout(() => {
      setShowFeedback(false);
      
      // Check if there's a next decision
      if (choice.nextDecisionId) {
        const nextDecision = decisions.find(d => d.id === choice.nextDecisionId);
        if (nextDecision) {
          setCurrentDecision(nextDecision);
          setShowDecisionModal(true);
        } else {
          // End scenario
          setScenarioComplete(true);
          setCurrentDecision(null);
        }
      } else {
        // End scenario
        setScenarioComplete(true);
        setCurrentDecision(null);
      }
    }, 3000); // Show feedback for 3 seconds
  };

  const continueToNextDecision = () => {
    setShowFeedback(false);
    
    if (lastChoice && lastChoice.nextDecisionId) {
      const nextDecision = decisions.find(d => d.id === lastChoice.nextDecisionId);
      if (nextDecision) {
        setCurrentDecision(nextDecision);
        setShowDecisionModal(true);
      } else {
        setScenarioComplete(true);
        setCurrentDecision(null);
      }
    } else {
      setScenarioComplete(true);
      setCurrentDecision(null);
    }
  };

  const getBranchTypeColor = (branchType) => {
    switch (branchType?.toLowerCase()) {
      case 'success': return 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100';
      case 'failure': return 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100';
      case 'neutral': return 'border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100';
      default: return 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100';
    }
  };

  const getBranchTypeIcon = (branchType) => {
    switch (branchType?.toLowerCase()) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'failure':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'neutral':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAvatarImage = (value) => {
    if (!value) return '';
    if (value.startsWith('http')) return value;
    const preset = AVATAR_OPTIONS.find((opt) => opt.id === value);
    return preset?.image || '';
  };

  const getBackgroundImage = (value) => {
    if (!value) return '';
    if (value.startsWith('http')) return value;
    const preset = BACKGROUND_OPTIONS.find((opt) => opt.id === value);
    return preset?.image || '';
  };


  // Enhanced flowchart logic to handle branch tracking and duplicate prevention
  const analyzeBranchStructure = () => {
    const levelConnections = new Map();
    const decisionMap = new Map();
    const visitedDecisions = new Set();
    const decisionPaths = new Map();
    
    decisions.forEach(decision => {
      decisionMap.set(decision.id, decision);
      decisionPaths.set(decision.id, new Set());
    });
    
    const analyzeDecision = (decisionId, currentPath = [], branchType = 'neutral') => {
      if (visitedDecisions.has(decisionId) || currentPath.includes(decisionId)) {
        return;
      }
      
      visitedDecisions.add(decisionId);
      const decision = decisionMap.get(decisionId);
      if (!decision) return;
      
      const pathKey = `${currentPath.join('->')}->${decisionId}`;
      decisionPaths.get(decisionId).add(pathKey);
      
      if (!levelConnections.has(decision.level)) {
        levelConnections.set(decision.level, {
          success: new Set(),
          neutral: new Set(),
          all: new Set(),
          paths: new Map()
        });
      }
      
      const levelData = levelConnections.get(decision.level);
      levelData.all.add(decisionId);
      
      if (!levelData.paths.has(decisionId)) {
        levelData.paths.set(decisionId, new Set());
      }
      levelData.paths.get(decisionId).add(branchType);
      
      decision.choices.forEach(choice => {
        if (choice.nextDecisionId) {
          const nextDecision = decisionMap.get(choice.nextDecisionId);
          if (nextDecision) {
            if (choice.branchType === 'success') {
              levelData.success.add(nextDecision.id);
            } else if (choice.branchType === 'neutral') {
              levelData.neutral.add(nextDecision.id);
            }
            
            analyzeDecision(choice.nextDecisionId, [...currentPath, decisionId], choice.branchType);
          }
        }
      });
    };
    
    const mainDecisions = decisions.filter(d => d.level === 1);
    mainDecisions.forEach(decision => {
      analyzeDecision(decision.id, [], 'neutral');
    });
    
    return { levelConnections, decisionPaths };
  };

  const renderFlowchart = () => {
    const mainDecisions = decisions.filter(d => d.level === 1);
    const { levelConnections } = analyzeBranchStructure();
    const renderedLevels = new Set();
    
    return (
      <div className="flowchart">
        {mainDecisions.map(decision => (
          <div key={decision.id} className="flowchart-branch">
            {renderFlowchartNode(decision, levelConnections, renderedLevels)}
          </div>
        ))}
      </div>
    );
  };

  // New: Columnar level map renderer
  const renderLevelMap = () => {
    if (!decisions || decisions.length === 0) return null;

    const levels = Array.from(new Set(decisions.map(d => d.level))).sort((a,b) => a-b);
    const decisionById = new Map(decisions.map(d => [d.id, d]));

    return (
      <div className="levelmap">
        {levels.map(level => (
          <div key={level} className="levelmap-col">
            <div className="levelmap-col-header">Level {level}</div>
            {decisions.filter(d => d.level === level).map(decision => (
              <div key={decision.id} className="levelmap-decision">
                <div className="levelmap-decision-title">
                  {decision.title}
                </div>
                <div className="levelmap-choices">
                  {decision.choices.map(choice => (
                    <div key={choice.id} className={`levelmap-choice ${choice.branchType?.toLowerCase() || 'neutral'}`}>
                      <div className="levelmap-choice-main">
                        <span className="levelmap-choice-icon">{getBranchTypeIcon(choice.branchType)}</span>
                        <span className="levelmap-choice-text">{choice.text}</span>
                        {choice.points ? (
                          <span className="levelmap-choice-points">+{choice.points}</span>
                        ) : null}
                      </div>
                      <div className="levelmap-next">
                        {choice.nextDecisionId && decisionById.get(choice.nextDecisionId) ? (
                          <>
                            <span className="levelmap-next-pill">L{decisionById.get(choice.nextDecisionId).level}</span>
                            <span className="levelmap-right-arrow" aria-hidden>➜</span>
                          </>
                        ) : (
                          <span className="levelmap-end-pill">End</span>
                        )}
                      </div>
                      {choice.nextDecisionId && decisionById.get(choice.nextDecisionId) && (
                        <div className="levelmap-connector" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderChoicesHorizontally = (choices, level, branchStructure, parentDecisionId = null, renderedLevels) => {
    return (
      <div className="flowchart-choices-horizontal" data-level={level}>
        {choices.map((choice, cIdx) => (
          <div key={choice.id} className="flowchart-choice-wrapper">
            <div className="flowchart-choice-node">
              <div className="flowchart-badges">
                <span className={`pill pill-branch ${choice.branchType?.toLowerCase()}`}>{getBranchTypeIcon(choice.branchType)}</span>
                {typeof choice.points === 'number' && (
                  <span className="pill pill-points">+{choice.points}</span>
                )}
              </div>
              <div className="flowchart-choice-text">{choice.text}</div>
            </div>
            
            {choice.nextDecisionId ? (
              <div className="flowchart-choice-connector">
                <div className="flowchart-choice-arrow">↓</div>
              </div>
            ) : (
              <div className="flowchart-choice-connector">
                <div className="flowchart-end-arrow">●</div>
              </div>
            )}
            
            {choice.nextDecisionId ? (
              <div className="flowchart-next-decision">
                {decisions.find(d => d.id === choice.nextDecisionId) && (
                  (() => {
                    const nextDecision = decisions.find(d => d.id === choice.nextDecisionId);
                    const shouldRenderDecision = shouldRenderDecisionNode(
                      nextDecision, 
                      choice.branchType, 
                      branchStructure, 
                      parentDecisionId,
                      renderedLevels
                    );
                    
                    if (shouldRenderDecision.shouldRender) {
                      renderedLevels.add(nextDecision.level);
                      return (
                        <div className="flowchart-node-container" data-level={nextDecision.level}>
                          <div className="flowchart-decision-node">
                            <div className="flowchart-decision-title">
                              <div className="flowchart-level-badge">L{nextDecision.level}</div>
                              <div className="flowchart-decision-text">{nextDecision.title}</div>
                            </div>
                          </div>
                          
                          <div className="flowchart-decision-connector"></div>
                          
                          {renderChoicesHorizontally(nextDecision.choices, nextDecision.level, branchStructure, nextDecision.id, renderedLevels)}
                        </div>
                      );
                    } else if (shouldRenderDecision.showArrow) {
                      return (
                        <div className="flowchart-reference-arrow">
                          <div className="flowchart-arrow-to-existing">
                            <div className="flowchart-arrow-line">↗</div>
                            <div className="flowchart-arrow-label">→ L{nextDecision.level}: {nextDecision.title}</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
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

  const shouldRenderDecisionNode = (decision, branchType, branchStructure, parentDecisionId, renderedLevels) => {
    if (!decision || !branchStructure) {
      return { shouldRender: true, showArrow: false };
    }
    
    const levelData = branchStructure.get(decision.level);
    if (!levelData) {
      return { shouldRender: true, showArrow: false };
    }
    
    if (renderedLevels && renderedLevels.has(decision.level)) {
      return { shouldRender: false, showArrow: true };
    }

    const decisionPaths = levelData.paths.get(decision.id);
    if (!decisionPaths) {
      return { shouldRender: true, showArrow: false };
    }
    
    const hasSuccessPath = levelData.success.has(decision.id);
    const hasNeutralPath = levelData.neutral.has(decision.id);
    
    if (branchType === 'neutral' && hasSuccessPath) {
      return { shouldRender: false, showArrow: true };
    }
    
    if (branchType === 'neutral' && !hasSuccessPath && hasNeutralPath) {
      return { shouldRender: true, showArrow: false };
    }
    
    if (branchType === 'success') {
      return { shouldRender: true, showArrow: false };
    }
    
    if (branchType === 'failure') {
      return { shouldRender: true, showArrow: false };
    }
    
    return { shouldRender: true, showArrow: false };
  };

  const renderFlowchartNode = (decision, branchStructure, renderedLevels) => {
    if (renderedLevels.has(decision.level)) {
      return (
        <div className="flowchart-reference-arrow">
          <div className="flowchart-arrow-to-existing">
            <div className="flowchart-arrow-line">↗</div>
            <div className="flowchart-arrow-label">→ L{decision.level}: {decision.title}</div>
          </div>
        </div>
      );
    }

    renderedLevels.add(decision.level);
    return (
      <div className="flowchart-node-container" data-level={decision.level}>
        <div className="flowchart-decision-node">
          <div className="flowchart-decision-title">
            <div className="flowchart-level-badge">L{decision.level}</div>
            <div className="flowchart-decision-text">{decision.title}</div>
          </div>
        </div>
        
        <div className="flowchart-decision-connector"></div>
        
        {renderChoicesHorizontally(decision.choices, decision.level, branchStructure, decision.id, renderedLevels)}
      </div>
    );
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Scenario...</h3>
          <p className="text-gray-500">Please wait while we fetch the scenario data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {scenarioData ? 'Back to Edit' : 'Back to List'}
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Preview Scenario</h1>
                <p className="text-sm text-gray-600">Review your scenario and flowchart before publishing</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                Preview
              </Badge>
              {scenarioData && (
                <Button onClick={handlePublish} disabled={loading}>
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Interactive Preview Mode */}
          {previewMode ? (
            <div className="space-y-6">
              {/* Clean Header */}
              <div className="bg-blue-600 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">{form.title}</h2>
                    </div>
                    <div className="text-sm opacity-90">{form.description}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="opacity-90">Score: {totalPoints}</span>
                    </div>
                    <div className="text-sm">
                      <span className="opacity-90">{selectedChoices.length} Completed</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetPreview} className="text-white border-white hover:bg-white hover:text-blue-600">
                      Exit Preview
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Preview Area */}
              <div className="relative bg-gray-100 rounded-lg p-8 min-h-[500px]">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-lg opacity-20"
                  style={{
                    backgroundImage: `url(${getBackgroundImage(form.background)})`
                  }}
                />
                
                <div className="relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Avatar */}
                    <div className="flex justify-center lg:justify-start">
                      <div className="relative">
                        {/* Avatar Image - Overlapping on background */}
                          <div className="w-80 h-[32rem] relative">
                            <img 
                              src={getAvatarImage(form.avatar)} 
                              alt="Avatar" 
                              className="w-full h-full object-cover drop-shadow-lg rounded-lg"
                            />
                          </div>

                      </div>
                    </div>

                    {/* Right Side - Current Decision or Welcome */}
                    <div className="flex items-center">
                      {currentDecision ? (
                        <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-blue-200 max-w-lg w-full">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                              Decision {currentDecision.level}: {currentDecision.title}
                            </h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setCurrentDecision(null)}
                            >
                              ✕
                            </Button>
                          </div>
                          <p className="text-gray-600 mb-6">{currentDecision.description}</p>
                          <div className="space-y-3">
                            {currentDecision.choices.map((choice, index) => (
                              <button
                                key={choice.id}
                                onClick={() => handleChoiceSelect(choice)}
                                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${getBranchTypeColor(choice.branchType)}`}
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl">{getBranchTypeIcon(choice.branchType)}</span>
                                  <div className="flex-1">
                                    <div className="font-medium">{choice.text}</div>
                                    {choice.points > 0 && (
                                      <div className="text-sm opacity-75">+{choice.points} points</div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : scenarioComplete ? (
                        <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-green-200 max-w-lg w-full text-center">
                          <PartyPopper className="w-16 h-16 mx-auto mb-4 text-green-600" />
                          <h3 className="text-2xl font-bold mb-4 text-green-600">Scenario Complete!</h3>
                          <p className="text-gray-600 mb-6">You have successfully completed the interactive preview</p>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="text-2xl font-bold text-green-600 mb-2">Total Score: {totalPoints}</div>
                            <div className="text-sm text-green-700">Decisions Made: {selectedChoices.length}</div>
                          </div>
                          <div className="flex space-x-3">
                            <Button onClick={resetPreview} variant="outline" className="flex-1">
                              Try Again
                            </Button>
                            <Button onClick={resetPreview} className="flex-1 bg-blue-600 hover:bg-blue-700">
                              Exit Preview
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-blue-200 max-w-lg w-full">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                              <Brain className="w-6 h-6 mr-2 text-blue-600" />
                              Welcome to {form.title}
                            </h2>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              Interactive Preview
                            </span>
                          </div>
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            {form.description}
                          </p>
                          <div className="text-center">
                            <p className="text-gray-700 mb-4 font-medium">Ready to experience the scenario?</p>
                            <Button 
                              onClick={() => {
                                const firstDecision = decisions.find(d => d.level === 1);
                                if (firstDecision) {
                                  setCurrentDecision(firstDecision);
                                }
                              }} 
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                            >
                              Begin Interactive Preview
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Toast */}
              {showFeedback && lastChoice && (
                <div className="fixed top-4 right-4 z-50">
                  <div className="bg-white rounded-lg shadow-xl border-2 border-gray-200 p-6 max-w-sm">
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">{getBranchTypeIcon(lastChoice.branchType)}</div>
                      <h3 className="text-lg font-bold mb-2">
                        {lastChoice.branchType?.toLowerCase() === 'success' ? 'Great Choice!' : 
                         lastChoice.branchType?.toLowerCase() === 'failure' ? 'Not Quite Right' : 
                         'Good Choice'}
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-gray-700 text-sm mb-1">{lastChoice.feedback}</p>
                        <div className="text-lg font-bold text-blue-600">
                          +{lastChoice.points || 0} points
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        Total Score: {totalPoints} points
                      </div>
                      <Button 
                        onClick={continueToNextDecision}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Regular Preview Mode */
            <>
          {/* Scenario Overview */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border border-gray-100">
  <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-2xl border-b">
    <CardTitle className="flex items-center text-purple-700 text-xl font-bold">
      <Eye className="w-6 h-6 mr-2 text-purple-600 animate-pulse" />
                Scenario Overview
              </CardTitle>
            </CardHeader>
  <CardContent className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Left Section */}
      <div className="flex flex-col justify-between">
                <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-900">{form.title}</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{form.description}</p>
          <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-lg shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Total Attempts:</span>
              <span className="text-gray-900">{form.totalAttempts}</span>
                  </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Decision Points:</span>
              <span className="text-gray-900">{decisions.length}</span>
                </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Total Choices:</span>
              <span className="text-gray-900">
                {decisions.reduce((acc, d) => acc + d.choices.length, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button 
            onClick={startPreview} 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-transform transform hover:scale-[1.02]"
          >
            <Eye className="w-4 h-4 mr-2" />
            Start Interactive Preview
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex justify-center items-center">
  <div className="relative w-44 h-60 overflow-hidden border-2 border-purple-300 shadow-md group">
    {/* Background */}
                    <img 
                      src={getBackgroundImage(form.background)} 
                      alt="Background" 
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
    
    {/* Avatar */}
    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                      <img 
                        src={getAvatarImage(form.avatar)} 
                        alt="Avatar" 
        className="w-20 h-56 object-cover drop-shadow-lg"
                      />
                    </div>
                  </div>
                </div>

      
              </div>
            </CardContent>
          </Card>

            </>
          )}

          {/* Only show flowchart and details in regular preview mode */}
          {!previewMode && (
            <>
          {/* Decision Tree Flowchart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    Decision Tree Flowchart
              </CardTitle>
              <p className="text-sm text-gray-600">
                Visual representation with smart branch management - neutral branches that connect to existing success levels show as reference arrows
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
                <div className="levelmap-container">
                  {renderLevelMap()}
                </div>
              </div>
              
              {/* Enhanced Legend */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Enhanced Flowchart Features:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded flex items-center justify-center">
                      <span className="text-xs">↗</span>
                    </div>
                    <span><strong>Reference Arrow:</strong> Neutral branch connecting to existing success level</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-200 border border-green-400 rounded flex items-center justify-center">
                      <span className="text-xs">✅</span>
                    </div>
                    <span><strong>Success Path:</strong> Always renders decision nodes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded flex items-center justify-center">
                      <span className="text-xs">⚠️</span>
                    </div>
                    <span><strong>Neutral Path:</strong> Renders if not connected to success</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-200 border border-red-400 rounded flex items-center justify-center">
                      <span className="text-xs">❌</span>
                    </div>
                    <span><strong>Failure Path:</strong> Always renders decision nodes</span>
                  </div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewScenario;

// Flowchart Styles (inline for now, can be moved to CSS file later)
const flowchartStyles = `
  .flowchart {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  /* Container scroll to avoid vertical collapsing on narrow screens */
  .flowchart-container {
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 8px;
  }

  /* Level map (column) styles */
  .levelmap-container { overflow-x: auto; }
  .levelmap {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(300px, 1fr);
    gap: 20px;
    align-items: start;
  }
  .levelmap-col { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; box-shadow: 0 6px 16px rgba(0,0,0,.05); }
  .levelmap-col-header { font-weight: 700; color: #111827; margin-bottom: 10px; font-size: 15px; }
  .levelmap-decision { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; background: #fbfbfb; margin-bottom: 14px; }
  .levelmap-decision-title { font-weight: 600; color: #111827; font-size: 14px; margin-bottom: 10px; }
  .levelmap-choices { display: flex; flex-direction: column; gap: 10px; }
  .levelmap-choice { position: relative; display: flex; align-items: center; justify-content: space-between; border: 2px solid #e5e7eb; background:#fff; border-radius: 12px; padding: 10px 12px; }
  .levelmap-choice.success { border-color: #86efac; background: #f0fdf4; }
  .levelmap-choice.neutral { border-color: #fde68a; background: #fffbeb; }
  .levelmap-choice.failure { border-color: #fca5a5; background: #fef2f2; }
  .levelmap-choice-main { display:flex; align-items:center; gap:8px; }
  .levelmap-choice-icon { font-size: 18px; }
  .levelmap-choice-text { font-size: 14px; color:#374151; font-weight: 500; }
  .levelmap-choice-points { font-size: 12px; font-weight: 700; color:#111827; background:#eef2ff; border:1px solid #e0e7ff; border-radius: 10px; padding:2px 6px; }
  .levelmap-next-pill { background:#eff6ff; color:#1d4ed8; border:1px solid #dbeafe; padding:2px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  .levelmap-end-pill { background:#f3f4f6; color:#374151; border:1px solid #e5e7eb; padding:2px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  .levelmap-right-arrow { margin-left: 6px; color:#6b7280; font-weight: 700; }
  .levelmap-connector { position:absolute; right:-14px; top:50%; transform: translateY(-50%); width: 14px; height: 2px; background: linear-gradient(90deg, rgba(59,130,246,0.2), rgba(59,130,246,0.5)); border-radius: 2px; }
  
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
    display: flex !important;
    flex-direction: row !important;
    justify-content: center !important;
    align-items: flex-start !important;
    gap: 20px !important;
    margin-top: 20px;
    width: 100%;
    flex-wrap: wrap !important;
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
  .flowchart-badges { position:absolute; top:8px; right:8px; display:flex; gap:6px; }
  .pill { display:inline-flex; align-items:center; gap:4px; padding:2px 6px; border-radius:999px; font-size:11px; font-weight:700; border:1px solid transparent; }
  .pill-points { background:#eef2ff; color:#1f2937; border-color:#e0e7ff; }
  .pill-branch.success { background:#ecfdf5; color:#059669; border-color:#a7f3d0; }
  .pill-branch.neutral { background:#fffbeb; color:#d97706; border-color:#fde68a; }
  .pill-branch.failure { background:#fef2f2; color:#dc2626; border-color:#fecaca; }
  
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
  
  /* Reference arrow styles for connecting to existing decisions */
  .flowchart-reference-arrow {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 8px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    min-width: 0;
    position: relative;
  }
  
  .flowchart-arrow-to-existing {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .flowchart-arrow-line {
    font-size: 18px;
    color: #6b7280;
    font-weight: bold;
    animation: pulse 2s infinite;
  }
  
  .flowchart-arrow-label {
    font-size: 12px;
    color: #374151;
    font-weight: 600;
    text-align: center;
    background: transparent;
    padding: 0 4px;
    border-radius: 4px;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
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
    /* Keep horizontal layout even on smaller screens; allow wrapping */
    .flowchart-choices-horizontal {
      flex-direction: row !important;
      align-items: center !important;
      gap: 16px !important;
      flex-wrap: wrap !important;
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
