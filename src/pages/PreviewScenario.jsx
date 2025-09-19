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
  Settings
} from 'lucide-react';
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

const PreviewScenario = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { scenarioData } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    avatar: 'business-woman',
    background: 'workspace',
    totalAttempts: 3,
  });
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    if (scenarioData) {
      setForm({
        title: scenarioData.title || '',
        description: scenarioData.description || '',
        avatar: scenarioData.avatar || 'business-woman',
        background: scenarioData.background || 'workspace',
        totalAttempts: scenarioData.totalAttempts || 3,
      });
      setDecisions(scenarioData.decisions || []);
    }
  }, [scenarioData]);

  const handleBack = () => {
    navigate('/create-scenario', { 
      state: { 
        moduleId: scenarioData?.moduleId,
        editingScenario: scenarioData,
        returnToStep: 2
      } 
    });
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

  const getAvatarImage = (avatarId) => {
    const preset = AVATAR_OPTIONS.find((opt) => opt.id === avatarId);
    if (preset && typeof preset.image === 'string') {
      return preset.image;
    }
    return AVATAR_OPTIONS[0].image;
  };

  const getBackgroundImage = (backgroundId) => {
    const preset = BACKGROUND_OPTIONS.find((opt) => opt.id === backgroundId);
    if (preset && typeof preset.image === 'string') {
      return preset.image;
    }
    return BACKGROUND_OPTIONS[0]?.image || '';
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

  const renderChoicesHorizontally = (choices, level, branchStructure, parentDecisionId = null, renderedLevels) => {
    return (
      <div className="flowchart-choices-horizontal" data-level={level}>
        {choices.map((choice, cIdx) => (
          <div key={choice.id} className="flowchart-choice-wrapper">
            <div className="flowchart-choice-node">
              <div className={`flowchart-choice-badge ${getBranchTypeColor(choice.branchType)}`}>
                {getBranchTypeIcon(choice.branchType)}
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Edit
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
                Enhanced Decision Tree Flowchart
              </CardTitle>
              <p className="text-sm text-gray-600">
                Visual representation with smart branch management - neutral branches that connect to existing success levels show as reference arrows
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
                <div className="flowchart-container">
                  {renderFlowchart()}
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
