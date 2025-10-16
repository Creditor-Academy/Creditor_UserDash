import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, Clock, GraduationCap, ChevronDown, BookOpen, Loader2, CheckCircle, XCircle, Award, BarChart2, HelpCircle, Play, Users } from "lucide-react";
import { fetchCourseModules } from "@/services/courseService";
import { getModuleQuizzes, getQuizRemainingAttempts, getQuizResults, getUserLatestQuizAttempt } from "@/services/quizService";
import { fetchQuizCorrectAnswers } from "@/services/quizServices";
import { getModuleScenariosNew, getScenarioRemainingAttempts } from "@/services/scenarioService";
import ScanerioLastAttempt from "@/pages/ScanerioLastAttempt";
import FinalScanrioscore from "@/pages/FinalScanrioscore";
import LastAttemptModal from "@/components/LastAttemptModal";
import QuizCorrectAns from "@/components/QuizCorrectAns";

// Assessment sections - Quiz and Scenarios
const assessmentSections = [
  {
    id: "quiz",
    title: "Module Assessments",
    icon: <GraduationCap size={20} className="text-indigo-600" />,
    description: "Test your knowledge with quizzes and track your progress",
    color: "bg-indigo-50 border-indigo-200"
  },
  {
    id: "scenario",
    title: "Interactive Scenarios",
    icon: <Users size={20} className="text-emerald-600" />,
    description: "Practice decision-making with realistic scenarios",
    color: "bg-emerald-50 border-emerald-200"
  }
];

function ModuleAssessmentsView() {
  const { moduleId, courseId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Set quiz section to be open by default
  const [openSections, setOpenSections] = useState({ quiz: true, scenario: true });
  const [module, setModule] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [filteredScenarios, setFilteredScenarios] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState({});
  const [error, setError] = useState("");
  const [isLastAttemptOpen, setIsLastAttemptOpen] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(null);
  const [isCorrectAnswersOpen, setIsCorrectAnswersOpen] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [loadingCorrectAnswers, setLoadingCorrectAnswers] = useState({});
  const [scenarioAttempts, setScenarioAttempts] = useState({}); // { [scenarioId]: {remainingAttempts, maxAttempts, attempted} }
  const [lastScenarioOpen, setLastScenarioOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [hoveredScenarioId, setHoveredScenarioId] = useState(null);
  const [stickyScenarioId, setStickyScenarioId] = useState(null);
  const stickyTimerRef = useRef(null);
  const [finalScoreOpen, setFinalScoreOpen] = useState(false);

  const handleScenarioMouseEnter = (id) => {
    if (stickyTimerRef.current) {
      clearTimeout(stickyTimerRef.current);
      stickyTimerRef.current = null;
    }
    setHoveredScenarioId(id);
    setStickyScenarioId(null);
  };

  const handleScenarioMouseLeave = (id) => {
    setHoveredScenarioId(null);
    setStickyScenarioId(id);
    if (stickyTimerRef.current) clearTimeout(stickyTimerRef.current);
    stickyTimerRef.current = setTimeout(() => {
      setStickyScenarioId(null);
    }, 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        console.log("Fetching data for module:", moduleId, "course:", courseId);
        
        // Fetch module, quizzes, and scenarios in parallel
        const [modules, quizzesResponse, scenariosResponse] = await Promise.all([
          fetchCourseModules(courseId),
          getModuleQuizzes(moduleId),
          getModuleScenariosNew(moduleId)
        ]);
        
        console.log("Modules response:", modules);
        console.log("Quizzes response:", quizzesResponse);
        console.log("Scenarios response:", scenariosResponse);
        
        const foundModule = modules.find(m => m.id === moduleId);
        if (foundModule) {
          setModule(foundModule);
          console.log("Found module:", foundModule);
        } else {
          setError("Module not found");
          console.log("Module not found for ID:", moduleId);
        }
        
        // quizzesResponse is now always an array
        if (Array.isArray(quizzesResponse)) {
          setQuizzes(quizzesResponse);
          setFilteredQuizzes(quizzesResponse);
          
          // Fetch quiz attempts for each quiz
          await fetchQuizAttempts(quizzesResponse);
        } else {
          setQuizzes([]);
          setFilteredQuizzes([]);
        }
        
        // Handle scenarios response
        if (Array.isArray(scenariosResponse)) {
          setScenarios(scenariosResponse);
          setFilteredScenarios(scenariosResponse);
          // Fetch remaining attempts for each scenario
          const map = {};
          await Promise.all(
            scenariosResponse.map(async (sc) => {
              try {
                const r = await getScenarioRemainingAttempts(sc.id);
                map[sc.id] = r;
              } catch (e) {
                map[sc.id] = { remainingAttempts: sc.max_attempts ?? 0, maxAttempts: sc.max_attempts ?? 0, attempted: 0 };
              }
            })
          );
          setScenarioAttempts(map);
        } else {
          setScenarios([]);
          setFilteredScenarios([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load module, quizzes, and scenarios");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (courseId && moduleId) {
      fetchData();
    }
  }, [courseId, moduleId]);



  const fetchQuizAttempts = async (quizzesList) => {
    try {
      const attemptsData = {};
      
      for (const quiz of quizzesList) {
        const quizId = quiz.quizId || quiz.id;
        console.log(`Processing quiz:`, { quiz, quizId });
        if (quizId) {
          try {
            // Try to fetch attempts for this quiz
            const response = await getQuizRemainingAttempts(quizId);
            attemptsData[quizId] = response;
            console.log(`Quiz ${quizId} attempts:`, response);
          } catch (error) {
            console.error(`Error fetching attempts for quiz ${quizId}:`, error);
            
            // If it's a 404 error, the quiz might not exist or the endpoint might be different
            if (error.message?.includes('404')) {
              console.log(`Quiz ${quizId} not found or endpoint not available, setting default values`);
              // Set default values for quizzes that can't be fetched
              attemptsData[quizId] = { 
                remainingAttempts: 3, // Assume 3 attempts available
                maxAttempts: 3, 
                attempted: false,
                error: 'API endpoint not found'
              };
            } else {
              // For other errors, set conservative default values
              attemptsData[quizId] = { 
                remainingAttempts: 0, 
                maxAttempts: 3, 
                attempted: false,
                error: error.message
              };
            }
          }
        }
      }
      
      setQuizAttempts(attemptsData);
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
    }
  };

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleViewCorrectAnswers = async (quizId, quizTitle) => {
    setLoadingCorrectAnswers(prev => ({ ...prev, [quizId]: true }));
    try {
      const answers = await fetchQuizCorrectAnswers(quizId);
      setCorrectAnswers(answers);
      setIsCorrectAnswersOpen(true);
    } catch (error) {
      console.error('Error fetching correct answers:', error);
      setError('Failed to load correct answers');
    } finally {
      setLoadingCorrectAnswers(prev => ({ ...prev, [quizId]: false }));
    }
  };

  const getQuizStatus = (quiz) => {
    const quizId = quiz.quizId || quiz.id;
    const attempts = quizAttempts[quizId];
    
    if (!attempts) {
      return { status: 'LOADING', icon: <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' };
    }
    
    // If there's an error in the attempt data, show as available
    if (attempts.error) {
      console.log(`Quiz ${quizId} has error:`, attempts.error);
      return { status: 'NOT_ATTEMPTED', icon: <BookOpen className="h-4 w-4 text-blue-600" />, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' };
    }
    
    if (attempts.remainingAttempts === 0) {
      return { status: 'MAX_ATTEMPTS', icon: <Award className="h-4 w-4 text-indigo-600" />, color: 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border border-indigo-200' };
    }
    
    if (!attempts.attempted) {
      return { status: 'NOT_ATTEMPTED', icon: <BookOpen className="h-4 w-4 text-blue-600" />, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' };
    }
    
    if (attempts.remainingAttempts > 0) {
      return { status: 'ATTEMPTED', icon: <Clock className="h-4 w-4 text-yellow-600" />, color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' };
    }
    
    return { status: 'UNKNOWN', icon: <BookOpen className="h-4 w-4 text-gray-600" />, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' };
  };



  const getStatusText = (quiz) => {
    const quizId = quiz.quizId || quiz.id;
    const attempts = quizAttempts[quizId];
    
    if (!attempts) {
      return 'Loading...';
    }
    
    // If there's an error, show as available
    if (attempts.error) {
      return 'Available';
    }
    
    if (attempts.remainingAttempts === 0) {
      return 'Completed';
    }
    
    if (!attempts.attempted) {
      return 'Not Attempted';
    }
    
    if (attempts.remainingAttempts > 0) {
      return `${attempts.remainingAttempts} Attempt${attempts.remainingAttempts > 1 ? 's' : ''} Left`;
    }
    
    return 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <main className="flex-1">
          <div className="container py-6 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto" />
                <p className="text-muted-foreground text-lg">Loading module assessments...</p>
                <p className="text-sm text-gray-500">Preparing your learning materials</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <main className="flex-1">
          <div className="container py-6 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4 max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Failed to load assessments</h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <div className="space-x-3">
                  <Button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-700">
                    Try Again
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/dashboard/courses/${courseId}/modules`}>
                      Back to Modules
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  console.log("Rendering with quizzes:", quizzes, "filtered:", filteredQuizzes);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="flex-1">
        <div className="container py-8 max-w-7xl">
                     <div className="flex items-center gap-4 mb-8">
             <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="border-gray-300 hover:bg-gray-100 flex items-center gap-1">
               <ChevronLeft size={16} />
               <span>Back</span>
             </Button>
             <div className="flex-1">
               <h1 className="text-2xl font-bold text-gray-900">{module?.title || 'Module Assessments'}</h1>
               <p className="text-sm text-gray-500">Test your knowledge now — finish the quiz to unlock the next step!</p>
             </div>
           </div>

          

          {/* Assessment Sections */}
          {assessmentSections.map((section) => (
            <Collapsible
              key={section.id}
              open={openSections[section.id]}
              onOpenChange={() => toggleSection(section.id)}
              className="mb-8"
            >
              <CollapsibleTrigger asChild>
                <Card className={`cursor-pointer transition-all duration-300 ${section.color} border-2 ${openSections[section.id] ? 'border-indigo-300 shadow-md' : 'border-transparent hover:border-indigo-200'}`}>
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                          {section.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                            {section.title}
                          </CardTitle>
                          <p className="text-gray-600 text-sm">{section.description}</p>
                        </div>
                      </div>
                                             <div className="flex items-center gap-3">
                         <ChevronDown 
                           size={20} 
                           className={`transition-transform duration-200 text-gray-500 ${
                             openSections[section.id] ? 'rotate-180' : ''
                           }`}
                         />
                       </div>
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <Card className="mt-0 border-t-0 rounded-t-none shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    {section.id === 'quiz' && (
                      <div className="space-y-6">
                        
                        
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg text-gray-800">Available Quizzes</h3>
                          <span className="text-sm text-gray-500">
                            {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'} available
                          </span>
                        </div>
                        
                        {filteredQuizzes.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-700">No quizzes available</h3>
                                                         <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                               Check back later for quizzes or contact your instructor.
                             </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredQuizzes.map((quiz, index) => {
                              console.log(`Rendering quiz ${index}:`, quiz);
                              const quizStatus = getQuizStatus(quiz);
                              const statusText = getStatusText(quiz);
                              const isLocked = quizStatus.status === 'MAX_ATTEMPTS';
                              
                              return (
                                <div key={quiz.quizId || quiz.id || index} className="block group">
                                                                     <Card className={`h-full transition-all duration-300 border overflow-hidden ${
                                     isLocked 
                                       ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 hover:shadow-md cursor-default' 
                                       : 'border-gray-200 hover:shadow-lg cursor-pointer group-hover:border-indigo-300'
                                   }`}>
                                    <CardContent className="p-6">
                                      <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600`}>
                                          {quizStatus.icon}
                                        </div>
                                        <Badge className={`${quizStatus.color} transition-colors`}>
                                          {statusText}
                                        </Badge>
                                      </div>
                                      
                                                                             <h4 className={`font-bold text-lg mb-2 transition-colors ${
                                         isLocked ? 'text-indigo-800' : 'text-gray-800 group-hover:text-indigo-600'
                                       }`}>
                                        {quiz.title || `Quiz ${quiz.quizId || quiz.id || index}`}
                                      </h4>
                                                                             <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                         {quiz.description || 'Test your knowledge on this topic'}
                                       </p>
                                      
                                      {/* Quiz Details */}
                                      <div className="space-y-2 mb-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Award size={14} className="text-indigo-500" />
                                          <span>Max Score: {quiz.maxScore || 100}</span>
                                        </div>
                                        {quiz.score !== null && quiz.score !== undefined && (
                                          <div className="flex items-center gap-2 text-gray-600">
                                            <BarChart2 size={14} className="text-indigo-500" />
                                            <span>Your Score: {quiz.score}</span>
                                          </div>
                                        )}
                                        {quiz.attemptDate && (
                                          <div className="flex items-center gap-2 text-gray-600">
                                            <Clock size={14} className="text-indigo-500" />
                                            <span>Attempted: {new Date(quiz.attemptDate).toLocaleDateString()}</span>
                                          </div>
                                        )}
                                        
                                        {/* Attempt Information */}
                                        {quizAttempts[quiz.quizId || quiz.id] && (
                                          <div className="flex items-center gap-2 text-gray-600">
                                            <BarChart2 size={14} className="text-indigo-500" />
                                            <span>
                                              {(() => {
                                                const qid = quiz.quizId || quiz.id;
                                                const a = quizAttempts[qid];
                                                const used = typeof a.attemptedCount === 'number'
                                                  ? a.attemptedCount
                                                  : (a.maxAttempts - a.remainingAttempts);
                                                return `${used}/${a.maxAttempts} attempts used`;
                                              })()}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {isLocked ? (
                                        <div className="mt-4 space-y-3">
                                                                                     <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
                                             <div className="flex items-center gap-3">
                                               <div className="p-2 bg-indigo-100 rounded-full">
                                                 <CheckCircle size={16} className="text-indigo-600" />
                                               </div>
                                               <div>
                                                 <span className="text-sm font-semibold text-indigo-800 block">Quiz completed</span>
                                                 <span className="text-xs text-indigo-600">You've successfully completed all attempts for this quiz</span>
                                               </div>
                                             </div>
                                           </div>
                                          <div className="space-y-3">
                                            <button
                                              type="button"
                                              onClick={async () => {
                                                try {
                                                  const latest = await getUserLatestQuizAttempt(quiz.quizId || quiz.id);
                                                  setLastAttempt(latest);
                                                  setIsLastAttemptOpen(true);
                                                } catch (e) {
                                                  setLastAttempt(null);
                                                  setIsLastAttemptOpen(true);
                                                }
                                              }}
                                              className="w-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 border border-indigo-500 rounded-lg px-4 py-3 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                                            >
                                              <div className="flex items-center justify-center gap-2">
                                                <BarChart2 size={16} />
                                                View Final Score
                                              </div>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleViewCorrectAnswers(quiz.quizId || quiz.id, quiz.title)}
                                              disabled={loadingCorrectAnswers[quiz.quizId || quiz.id]}
                                              className="w-full text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-300 rounded-lg px-4 py-3 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              <div className="flex items-center justify-center gap-2">
                                                {loadingCorrectAnswers[quiz.quizId || quiz.id] ? (
                                                  <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                  <BookOpen size={16} />
                                                )}
                                                {loadingCorrectAnswers[quiz.quizId || quiz.id] ? 'Loading...' : 'View Correct Answers'}
                                              </div>
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        (() => {
                                          const qid = quiz.quizId || quiz.id;
                                          const a = quizAttempts[qid];
                                          const hasAttempted = a?.attempted || (a && (a.maxAttempts - a.remainingAttempts) > 0);
                                          
                                          const viewResults = async () => {
                                            try {
                                              const results = await getQuizResults(qid);
                                                                                             navigate(`/dashboard/quiz/results/${qid}?module=${moduleId}`, {
                                                state: {
                                                  quizResults: results,
                                                  quizSession: { quiz: { id: qid, title: quiz.title } }
                                                }
                                              });
                                            } catch (e) {
                                                                                             // Fallback: just navigate to results; page can fetch
                                               navigate(`/dashboard/quiz/results/${qid}?module=${moduleId}`);
                                            }
                                          };
                                          const viewLatestScore = async () => {
                                            try {
                                              const latest = await getUserLatestQuizAttempt(qid);
                                              setLastAttempt(latest);
                                              setIsLastAttemptOpen(true);
                                            } catch (e) {
                                              setLastAttempt(null);
                                              setIsLastAttemptOpen(true);
                                            }
                                          };
                                          
                                          return (
                                            <div className="mt-4 flex items-center gap-3">
                                                                                             <Link 
                                                 to={`/dashboard/quiz/instruction/${qid}?module=${moduleId}`}
                                                 state={{ quiz }}
                                                 className="block"
                                               >
                                                <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700 transition-colors">
                                                  <span>{hasAttempted ? 'Retake Quiz' : 'Start Quiz'}</span>
                                                  <ChevronLeft className="w-4 h-4 ml-1 rotate-180 transition-transform group-hover:translate-x-1" />
                                                </div>
                                              </Link>
                                              {hasAttempted && (
                                                <button
                                                  type="button"
                                                  onClick={viewLatestScore}
                                                  className="text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 bg-white hover:bg-gray-50"
                                                >
                                                  View Score
                                                </button>
                                              )}
                                                
                                            </div>
                                          );
                                        })()
                                      )}
                                      </CardContent>
                                    </Card>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {section.id === 'scenario' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg text-gray-800">Available Scenarios</h3>
                          <span className="text-sm text-gray-500">
                            {filteredScenarios.length} {filteredScenarios.length === 1 ? 'scenario' : 'scenarios'} available
                          </span>
                        </div>
                        
                        {filteredScenarios.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-700">No scenarios available</h3>
                            <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                              Check back later for interactive scenarios or contact your instructor.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-6">
                            {filteredScenarios.map((scenario, index) => (
                              <div
                                key={scenario.id || index}
                                className="block group"
                                onMouseEnter={() => handleScenarioMouseEnter(scenario.id)}
                                onMouseLeave={() => handleScenarioMouseLeave(scenario.id)}
                              >
                                <Card className="h-64 transition-all duration-300 border overflow-hidden border-gray-200 hover:shadow-xl cursor-pointer group hover:border-emerald-400 hover:scale-[1.02]">
                                  <CardContent className="p-0 relative h-full">
                                    {/* Full Background Image */}
                                    <div 
                                      className="absolute inset-0 bg-cover bg-center"
                                      style={{
                                        backgroundImage: `url(${scenario.background_url || 'https://via.placeholder.com/400x200?text=Scenario+Background'})`
                                      }}
                                    >
                                      {/* Darker Overlay for better text readability */}
                                      <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 group-hover:bg-opacity-60"></div>
                                    </div>
                                    
                                    {/* Attempts Counter - Top Right (remaining) */}
                                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                                      <Badge className="bg-white/90 text-gray-800 hover:bg-white border-0 shadow-md">
                                        <Award size={12} className="mr-1" />
                                        {(() => {
                                          const a = scenarioAttempts[scenario.id] || {};
                                          const remaining = a.remainingAttempts ?? scenario.max_attempts ?? 0;
                                          const attemptedCount = a.attempted ?? 0;
                                          if (attemptedCount <= 0) return 'Not started';
                                          return remaining > 0
                                            ? `${remaining} attempt${remaining === 1 ? '' : 's'} remaining`
                                            : 'No attempts left';
                                        })()}
                                      </Badge>
                                    </div>
                                    
                                    {/* Content Container */}
                                    <div className="relative z-10 h-full flex items-center px-6 pt-10"> 
                                      {/* Avatar - Left Side */}
                                      <div className="flex-shrink-0 mr-3">
                                        <div className="w-44 h-48 relative">
                                          <img
                                            src={
                                              scenario.avatar_url && scenario.avatar_url.trim() !== "" 
                                                ? scenario.avatar_url 
                                                : "https://placehold.co/120x120/png"
                                            } 
                                            alt="Scenario Avatar"
                                            className="w-full h-full object-contain bg-transparent"
                                          />
                                        </div>
                                      </div>

                                      {/* Title, Description and Button - Right Side (Speech bubble) */}
                                      <div className="flex-1 flex flex-col justify-between h-full">
                                        <div className="relative max-w-[80%] md:max-w-[75%]">
                                          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-5">
                                            <h4 className="font-bold text-xl mb-1 text-gray-900 line-clamp-2">{scenario.title}</h4>
                                            <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{scenario.description}</p>
                                            <div className="absolute -left-2 top-6 w-4 h-4 bg-white/90 rotate-45 shadow-md"></div>
                                          </div>
                                        </div>
                                        
                                        {/* Start Button and Last Score */}
                                      
                                          {(() => {
                                            const a = scenarioAttempts[scenario.id] || {};
                                            const remaining = a.remainingAttempts ?? scenario.max_attempts ?? 0;
                                            const isLocked = remaining <= 0;
                                            return (
                                              <>
                                                <div className="absolute bottom-4 right-4 z-20">
                                                  <Button
                                                    disabled={isLocked}
                                                    className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-300 ${isLocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/40 hover:scale-110'}`}
                                                    onClick={() => navigate(`/dashboard/scenario/take/${scenario.id}?module=${moduleId}`)}
                                                  >
                                                    <Play size={18} className="ml-1" />
                                                  </Button>
                                                </div>
                                                {/* Hover/Sticky View Score handled below card */}
                                              </>
                                            );
                                          })()}
                                          </div>

                                      </div>
                                    
                                  </CardContent>
                                </Card>

                                {/* Hover/Sticky action below card, bottom-right */}
                                {(() => {
                                  const a = scenarioAttempts[scenario.id] || {};
                                  const attemptedCount = a.attempted ?? 0;
                                  const remaining = a.remainingAttempts ?? scenario.max_attempts ?? 0;
                                  const isLocked = remaining <= 0;
                                  const baseVisible = hoveredScenarioId===scenario.id || stickyScenarioId===scenario.id;
                                  // If locked and attempted at least once → show "View Answers"; if attempted and not locked → show "View Last Score"
                                  if (!baseVisible) return (
                                    <div className="mt-2 flex justify-end opacity-0 -translate-y-1 pointer-events-none transition-all duration-300" />
                                  );
                                  if (attemptedCount > 0 && isLocked) {
                                    return (
                                      <div className="mt-2 flex justify-end transition-all duration-300 opacity-100 translate-y-0">
                                        <Button
                                          variant="outline"
                                          className="h-9 px-3 bg-green border-green-300 hover:bg-green-50 shadow"
                                          onClick={() => { setSelectedScenario(scenario); setFinalScoreOpen(true); }}
                                        >
                                          View Answers
                                        </Button>
                                      </div>
                                    );
                                  }
                                  if (attemptedCount > 0) {
                                    return (
                                      <div className="mt-2 flex justify-end transition-all duration-300 opacity-100 translate-y-0">
                                        <Button
                                          variant="outline"
                                          className="h-9 px-3 bg-white border-gray-300 hover:bg-gray-50 shadow"
                                          onClick={() => { setSelectedScenario(scenario); setLastScenarioOpen(true); }}
                                        >
                                          View Last Score
                                        </Button>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="mt-2 flex justify-end opacity-0 -translate-y-1 pointer-events-none transition-all duration-300" />
                                  );
                                })()}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </main>
      <LastAttemptModal isOpen={isLastAttemptOpen} onClose={setIsLastAttemptOpen} attempt={lastAttempt} />
      <ScanerioLastAttempt isOpen={lastScenarioOpen} onClose={setLastScenarioOpen} scenario={selectedScenario} />
      <FinalScanrioscore isOpen={finalScoreOpen} onClose={setFinalScoreOpen} scenarioId={selectedScenario?.id} />
      <QuizCorrectAns 
        isOpen={isCorrectAnswersOpen} 
        onClose={() => setIsCorrectAnswersOpen(false)} 
        questions={correctAnswers}
        quizTitle={module?.title || 'Quiz'}
      />
    </div>
  );
}

export default ModuleAssessmentsView;