import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, BarChart2, Clock, X, Trophy, CheckCircle, XCircle, Target, Calendar, Timer } from "lucide-react";

function formatDate(value) {
  try {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(value ?? "-");
  }
}

function getScoreColor(score) {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreIcon(score) {
  if (score >= 90) return <Trophy className="h-6 w-6 text-yellow-500" />;
  if (score >= 80) return <CheckCircle className="h-6 w-6 text-green-500" />;
  if (score >= 70) return <CheckCircle className="h-6 w-6 text-blue-500" />;
  
}

function getScoreMessage(score) {
  if (score >= 90) return "Excellent! Outstanding performance!";
  if (score >= 80) return "Great job! Well done!";
  if (score >= 70) return "Good work! You passed!";
  return "Keep practicing! You'll do better next time.";
}

function getScoreGradient(score) {
  if (score >= 90) return 'from-green-50 to-emerald-50';
  if (score >= 80) return 'from-blue-50 to-cyan-50';
  if (score >= 70) return 'from-yellow-50 to-amber-50';
  return 'from-red-50 to-orange-50';
}

function getProgressBarColor(score) {
  if (score >= 90) return 'bg-gradient-to-r from-green-500 to-emerald-500';
  if (score >= 80) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
  if (score >= 70) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
  return 'bg-gradient-to-r from-red-500 to-orange-500';
}

export default function LastAttemptModal({ isOpen, onClose, attempt }) {
  // Debug logging to see what data we're receiving
  console.log('LastAttemptModal - attempt data:', attempt);
  
  // Calculate score percentage similar to QuizResultsPage.jsx
  let scorePercentage = 0;
  let correctAnswers = 0;
  let totalQuestions = 0;
  
  // Try to get detailed answer information first
  if (attempt?.answers && Array.isArray(attempt.answers)) {
    totalQuestions = attempt.answers.length;
    correctAnswers = attempt.answers.filter(a => a?.isCorrect === true || a?.correct === true).length;
    if (totalQuestions > 0) {
      scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    }
  } else if (attempt?.total_questions && attempt?.score !== undefined) {
    // If we have total questions and a numeric score, calculate percentage
    totalQuestions = attempt.total_questions;
    const rawScore = attempt.score;
    
    // Check if this is a raw score (points) or already a percentage
    const marksPerQuestion = attempt.marksPerQuestion || attempt.marks_per_question || 1;
    const maxPossibleScore = totalQuestions * marksPerQuestion;
    
    if (rawScore <= maxPossibleScore) {
      scorePercentage = Math.round((rawScore / maxPossibleScore) * 100);
      correctAnswers = Math.round((rawScore / maxPossibleScore) * totalQuestions);
    } else if (rawScore <= 100) {
      scorePercentage = Math.round(rawScore);
      correctAnswers = Math.round((scorePercentage / 100) * totalQuestions);
    } else {
      scorePercentage = Math.round((rawScore / maxPossibleScore) * 100);
      correctAnswers = Math.round((rawScore / maxPossibleScore) * totalQuestions);
    }
  } else if (attempt?.score !== undefined && attempt?.maxScore) {
    const rawScore = attempt.score;
    const maxScore = attempt.maxScore;
    
    if (rawScore <= 100 && maxScore === 100) {
      scorePercentage = Math.round(rawScore);
    } else {
      scorePercentage = Math.round((rawScore / maxScore) * 100);
    }
  } else if (attempt?.score !== undefined) {
    const rawScore = attempt.score;
    totalQuestions = attempt.total_questions || attempt.totalQuestions || attempt.questions_count;
    let marksPerQuestion = attempt.marksPerQuestion || attempt.marks_per_question || 3;
    
    if (!totalQuestions) {
      totalQuestions = Math.round(rawScore / marksPerQuestion);
      
      if (totalQuestions === 0 || rawScore % marksPerQuestion !== 0) {
        const questionsWith1Mark = Math.round(rawScore / 1);
        if (questionsWith1Mark > 0 && questionsWith1Mark <= 50) {
          totalQuestions = questionsWith1Mark;
          marksPerQuestion = 1;
        } else {
          const questionsWith2Marks = Math.round(rawScore / 2);
          if (questionsWith2Marks > 0 && questionsWith2Marks <= 50) {
            totalQuestions = questionsWith2Marks;
            marksPerQuestion = 2;
          } else {
            totalQuestions = 1;
            marksPerQuestion = rawScore;
          }
        }
      }
    }
    
    const maxPossibleScore = totalQuestions * marksPerQuestion;
    
    if (rawScore <= 100 && rawScore <= maxPossibleScore) {
      scorePercentage = Math.round(rawScore);
      correctAnswers = Math.round((scorePercentage / 100) * totalQuestions);
    } else {
      scorePercentage = Math.round((rawScore / maxPossibleScore) * 100);
      correctAnswers = Math.round((rawScore / maxPossibleScore) * totalQuestions);
    }
  }
  
  const isPassed = scorePercentage >= 70;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Quiz Results</span>
                <p className="text-sm text-gray-500 mt-1">Detailed performance analysis</p>
              </div>
            </div>
            
          </DialogTitle>
        </DialogHeader>

        {attempt ? (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Score and Main Info */}
              <div className="space-y-6">
                {/* Quiz Title */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {attempt.quizTitle || attempt.quizId || "Quiz"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {attempt.quizType ? attempt.quizType.charAt(0).toUpperCase() + attempt.quizType.slice(1) : "Assessment"} Quiz
                  </p>
                </div>

                {/* Score Display */}
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className={`w-32 h-32 rounded-full border-8 border-white shadow-lg flex items-center justify-center bg-gradient-to-br ${getScoreGradient(scorePercentage)}`}>
                      <div className="text-center">
                        <div className={`text-3xl font-bold mb-1 ${getScoreColor(scorePercentage)}`}>
                          {scorePercentage}%
                        </div>
                        <div className={`text-sm font-medium ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                          {isPassed ? 'PASSED' : 'NOT PASSED'}
                        </div>
                      </div>
                    </div>
                    {/* Status Icon Overlay */}
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                      {getScoreIcon(scorePercentage)}
                    </div>
                  </div>

                  {/* Score Message */}
                  <p className="text-sm text-gray-700 mb-4 font-medium">
                    {getScoreMessage(scorePercentage)}
                  </p>
                </div>

                {/* Score Breakdown */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700 font-medium">Score Breakdown</span>
                    {totalQuestions > 0 && (
                      <span className="text-sm text-gray-500">
                        {correctAnswers}/{totalQuestions} correct
                      </span>
                    )}
                  </div>
                  
                  {totalQuestions > 0 ? (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(scorePercentage)}`}
                          style={{ width: `${scorePercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <div className="text-lg font-semibold text-gray-900">
                        {attempt?.score !== undefined ? `${attempt.score} points` : 'No score available'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Additional Details */}
              <div className="space-y-6">
                {/* Additional Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-600" />
                    Quiz Details
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Attempt Date</p>
                        <p className="text-sm text-gray-900 font-semibold">{formatDate(attempt.attempt_date)}</p>
                      </div>
                    </div>

                    {attempt.quizType && (
                      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600">Quiz Type</p>
                          <p className="text-sm text-gray-900 font-semibold capitalize">{attempt.quizType}</p>
                        </div>
                      </div>
                    )}

                    {attempt.timeSpent && (
                      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Timer className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600">Time Spent</p>
                          <p className="text-sm text-gray-900 font-semibold">{attempt.timeSpent}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional score details */}
                {attempt?.score !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Score Details</h5>
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                      {attempt.marksPerQuestion && (
                        <div>
                          <span className="font-medium">Marks per question:</span> {attempt.marksPerQuestion}
                        </div>
                      )}
                      {attempt.total_questions && (
                        <div>
                          <span className="font-medium">Total questions:</span> {attempt.total_questions}
                        </div>
                      )}
                      {attempt.questions_count && (
                        <div>
                          <span className="font-medium">Questions count:</span> {attempt.questions_count}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Raw Score:</span> {attempt.score}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-12 px-6">
            
            <p className="text-gray-600 text-lg font-medium mb-2">No attempt data available</p>
            <p className="text-gray-500 text-sm">Complete a quiz to see your results here</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}