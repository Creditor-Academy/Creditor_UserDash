import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, BookOpen, Trophy, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getQuizResults } from "@/services/quizService";
// Results are derived from the submit response passed via navigation state

function QuizResultsPage() {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const moduleId = searchParams.get('module');
  const category = searchParams.get('category');
  
  // Get results data from navigation state
  const { quizResults, answers, quizSession, startedAt } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeResults = async () => {
      try {
        setIsLoading(true);
        
        if (quizResults) {
          // Use the provided navigation state
          setQuizData(quizSession || {});
          setResults(quizResults);
          console.log('Quiz results loaded from navigation state:', { quizResults, answers, quizSession, startedAt });
          return;
        }
        
        // Fallback: fetch latest results for this quiz
        if (quizId) {
          console.warn('No quiz results in navigation state; fetching latest results for quiz:', quizId);
          const fetched = await getQuizResults(quizId);
          setResults(fetched);
          // Provide minimal quiz info so the page renders
          setQuizData({ quiz: { id: quizId, title: fetched?.quiz?.title || `Quiz ${quizId}` }, title: fetched?.quiz?.title });
          return;
        }
        
        setError('No quiz selected.');
      } catch (err) {
        console.error('Error initializing results:', err);
        setError('Failed to load quiz results');
        toast.error('Failed to load quiz results');
      } finally {
        setIsLoading(false);
      }
    };

    initializeResults();
  }, [quizId, quizResults, quizSession, answers, startedAt]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return <Trophy className="h-8 w-8 text-yellow-500" />;
    if (score >= 80) return <CheckCircle className="h-8 w-8 text-green-500" />;
    if (score >= 70) return <CheckCircle className="h-8 w-8 text-blue-500" />;
    return <XCircle className="h-8 w-8 text-red-500" />;
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Excellent! Outstanding performance!";
    if (score >= 80) return "Great job! Well done!";
    if (score >= 70) return "Good work! You passed!";
    return "Keep practicing! You'll do better next time.";
  };

  // Extract score and other data from results
  // score here represents percentage to display
  let score = 0;
  let totalQuestions = 0;
  let correctAnswers = 0;
  let attemptId = '';
  let detailedAnswers = [];
  
  // Support both wrapped and unwrapped result shapes
  const dataShape = results?.data ?? results;
  if (dataShape) {
    attemptId = dataShape.attempt_id || dataShape.attemptId || '';
    totalQuestions = dataShape.total_questions || dataShape.totalQuestions || 0;
    detailedAnswers = dataShape.answers || dataShape.answerDetails || [];
    // Prefer computing percent from detailed answers
    correctAnswers = Array.isArray(detailedAnswers)
      ? detailedAnswers.filter(a => a?.isCorrect === true || a?.correct === true).length
      : 0;
    if (totalQuestions > 0 && correctAnswers >= 0) {
      score = Math.round((correctAnswers / totalQuestions) * 100);
    } else if (typeof dataShape.score === 'number' && totalQuestions > 0) {
      // If we only have a numeric score and total, derive percent defensively
      const numericScore = dataShape.score;
      // If score seems already like percent, clamp; else estimate percent
      score = numericScore <= 100 ? Math.round(numericScore) : Math.round((numericScore / totalQuestions) * 100);
      correctAnswers = Math.round((score / 100) * totalQuestions);
    }
  }
  
  const remarks = results?.message || '';
  const passingScore = quizData?.quiz?.min_score || quizData?.passingScore || quizData?.min_score || 70;
  const passed = score >= passingScore;
  const answered = Object.keys(answers || {}).length;
  
  // Debug logging to see what we received
  console.log('Quiz Results Page - Data received:', {
    quizResults: results,
    answers: answers,
    quizSession: quizData,
    startedAt: startedAt,
    extractedData: {
      score,
      totalQuestions,
      correctAnswers,
      attemptId,
      detailedAnswers,
      passed,
      answered,
      passingScore
    }
  });
  
  const isPassed = passed;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load results</h3>
          <p className="text-gray-600 mb-4">{error || 'Quiz not found'}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <BookOpen size={16} />
          Back to Quiz
        </Button>
        <Badge variant={category === 'general' ? 'outline' : 'default'}>
          {category === 'general' ? 'Practice Quiz' : 'Assessment Quiz'}
        </Badge>
      </div>

      {/* Main Results Card - Quiz Info Left, Score Right */}
      <Card className="mb-8 shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Left Side - Quiz Information */}
            <div className="p-8 border-r border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
                  <p className="text-lg text-gray-600">{getScoreMessage(score)}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Quiz Title</p>
                      <p className="text-lg font-semibold text-gray-900">{quizData?.quiz?.title || quizData?.title || `Quiz ${quizId}`}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <Clock className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Duration</p>
                      <p className="text-lg font-semibold text-gray-900">{quizData?.quiz?.time_limit || quizData?.timeLimit || 25} minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Passing Score</p>
                      <p className="text-lg font-semibold text-gray-900">{passingScore}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Questions Answered</p>
                      <p className="text-lg font-semibold text-gray-900">{answered} / {totalQuestions}</p>
                    </div>
                  </div>

                  {attemptId && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                      <BookOpen className="h-6 w-6 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Attempt ID</p>
                        <p className="text-sm font-semibold text-gray-900 font-mono">{attemptId}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remarks Display */}
                {remarks && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-lg font-medium text-blue-800">
                      {remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Score Display */}
            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-center items-center">
              <div className="text-center">
                {/* Score Circle */}
                <div className="relative mb-6">
                  <div className="w-48 h-48 rounded-full bg-white shadow-xl border-8 border-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-5xl font-bold mb-2 ${getScoreColor(score)}`}>
                        {score}%
                      </div>
                      <div className="text-lg text-gray-600 font-medium">
                        {isPassed ? 'PASSED' : 'NOT PASSED'}
                      </div>
                    </div>
                  </div>
                  {/* Status Icon Overlay */}
                  
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <Badge 
                    variant={isPassed ? "default" : "destructive"}
                    className={`text-lg px-6 py-2 ${isPassed ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                  >
                    {isPassed ? 'PASSED' : 'FAILED'}
                  </Badge>
                </div>

                {/* Score Breakdown */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Correct Answers</span>
                    <span className="font-semibold text-green-600">
                      {correctAnswers} / {totalQuestions}
                    </span>
                  </div>
                  <Progress value={score} className="h-3" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      {detailedAnswers && detailedAnswers.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              {/* Question Review */}
              <div>
                <h4 className="font-semibold mb-3">Question Review</h4>
                  <div className="space-y-4">
                    {detailedAnswers.map((answer, index) => {
                      // Get the question data from the quiz session or answers
                      const questionData = quizData?.questions?.find(q => 
                        String(q.id) === String(answer.questionId) || 
                        String(q._id) === String(answer.questionId) ||
                        String(q.questionId) === String(answer.questionId)
                      );
                      
                      // Get user's actual answer text from the answers passed via navigation
                      const userAnswerData = answers?.[answer.questionId];
                      
                      // Debug logging for answer data
                      console.log(`Question ${index + 1} answer data:`, {
                        questionId: answer.questionId,
                        userAnswerData,
                        answerData: answer,
                        questionData,
                        isCorrect: answer.isCorrect,
                        correctAnswer: answer.correctAnswer
                      });
                      
                      return (
                        <div key={`${answer.questionId}-${index}`} className="p-4 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                              answer.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              {/* Question Type Badge */}
                              <div className="mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {(() => {
                                    const type = questionData?.type || questionData?.question_type || 'Unknown Type';
                                    const typeMap = {
                                      'mcq': 'Multiple Choice',
                                      'scq': 'Single Choice',
                                      'truefalse': 'True/False',
                                      'fill_blank': 'Fill in the Blank',
                                      'one_word': 'One Word Answer',
                                      'descriptive': 'Descriptive'
                                    };
                                    return typeMap[type.toLowerCase()] || type;
                                  })()}
                                </Badge>
                              </div>
                              
                              {/* Question Text */}
                              <p className="font-medium mb-3 text-lg">
                                {questionData?.question || questionData?.questionText || questionData?.text || questionData?.content || `Question ${index + 1}`}
                              </p>
                              
                              {/* Options Display for MCQ/SCQ questions */}
                              {questionData?.options && Array.isArray(questionData.options) && questionData.options.length > 0 && (
                                <div className="space-y-2 mb-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                                  {questionData.options.map((option, optIndex) => {
                                    const optionText = option?.text || option?.label || option?.value || String(option);
                                    const optionId = option?.id || option?._id || option?.optionId || option?.value || optIndex;
                                    
                                    // Check if this option was selected by user
                                    const isSelected = Array.isArray(userAnswerData) 
                                      ? userAnswerData.some(ans => String(ans) === String(optionId) || String(ans) === String(optIndex))
                                      : String(userAnswerData) === String(optionId) || String(userAnswerData) === String(optIndex);
                                    
                                    // Determine option styling based on selection and correctness
                                    let optionStyle = "p-2 rounded border";
                                    if (isSelected && answer.isCorrect) {
                                      optionStyle += " bg-green-100 border-green-300 text-green-800";
                                    } else if (isSelected && !answer.isCorrect) {
                                      optionStyle += " bg-red-100 border-red-300 text-red-800";
                                    } else {
                                      optionStyle += " bg-gray-50 border-gray-200 text-gray-700";
                                    }
                                    
                                    return (
                                      <div key={optIndex} className={optionStyle}>
                                        <span className="font-medium">{optionText}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Your Answer display for text/optionless questions (fill-ups, one-word, descriptive, etc.) */}
                              {(() => {
                                const typeLower = (questionData?.type || questionData?.question_type || '').toLowerCase();
                                const hasOptions = Array.isArray(questionData?.options) && questionData.options.length > 0;
                                const isTextualType = [
                                  'fill_blank', 'fill_ups', 'fill in the blank', 'fillintheblank',
                                  'one_word', 'oneword', 'one word',
                                  'descriptive', 'text', 'essay', 'long_answer', 'long answer'
                                ].includes(typeLower);
                                const shouldShow = isTextualType || !hasOptions;
                                if (!shouldShow) return null;

                                const fromResult = Array.isArray(answer?.selected)
                                  ? answer.selected
                                  : (answer?.selected != null ? [answer.selected] : undefined);
                                const fromState = Array.isArray(userAnswerData)
                                  ? userAnswerData
                                  : (userAnswerData != null ? [userAnswerData] : []);
                                const values = fromResult ?? fromState;

                                return (
                                  <div className="space-y-2 mb-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Your Answer:</p>
                                    {values && values.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {values.map((val, i) => (
                                          <span key={i} className="px-2 py-1 rounded bg-gray-100 border border-gray-200 text-gray-800">
                                            {String(val)}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-500">No answer</span>
                                    )}
                                  </div>
                                );
                              })()}
                    
                              
                              
                              {/* Correct Answer Display for Text-based questions */}
                              {!answer.isCorrect && (answer.correctAnswer || answer.correct_answer || questionData?.correct_answer) && (
                                <div className="space-y-2 mb-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Correct Answer:</p>
                                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="font-medium text-green-800">
                                      {(() => {
                                        const correctAns = answer.correctAnswer || answer.correct_answer || questionData?.correct_answer;
                                        return Array.isArray(correctAns) ? correctAns.join(', ') : String(correctAns);
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              </div>
              
              {/* Time Analysis */}
              {results.timeSpent && (
                <div>
                  <h4 className="font-semibold mb-3">Time Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Time Spent</p>
                      <p className="text-lg font-semibold text-blue-800">{results.timeSpent}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Time Remaining</p>
                      <p className="text-lg font-semibold text-green-800">{results.timeRemaining || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Attempt History */}
              {results.attempts && (
                <div>
                  <h4 className="font-semibold mb-3">Attempt History</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">This was attempt #{results.attempts.current} of {results.attempts.max}</p>
                    {results.attempts.previous && (
                      <p className="text-sm text-gray-600 mt-1">
                        Previous best: {results.attempts.previous}%
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        
        
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate(`/dashboard/courses/${moduleId}/modules/${moduleId}/assessments`)}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            View All Assessments
          </Button>
          
          <Button 
            onClick={() => navigate(`/dashboard/quiz/take/${quizId}?module=${moduleId}&category=${category}`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Retake Quiz
          </Button>
        </div>
      </div>


      
    </div>
  );
}

export default QuizResultsPage;