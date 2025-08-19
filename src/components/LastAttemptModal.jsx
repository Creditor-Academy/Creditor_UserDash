import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, BarChart2, Clock, X, Trophy, CheckCircle, XCircle } from "lucide-react";

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
  return <XCircle className="h-6 w-6 text-red-500" />;
}

function getScoreMessage(score) {
  if (score >= 90) return "Excellent! Outstanding performance!";
  if (score >= 80) return "Great job! Well done!";
  if (score >= 70) return "Good work! You passed!";
  return "Keep practicing! You'll do better next time.";
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
    // If rawScore <= totalQuestions, it's likely raw points
    // If rawScore > totalQuestions, it could be either raw points or percentage
    // We need to check if it makes sense as raw points first
    
    const marksPerQuestion = attempt.marksPerQuestion || attempt.marks_per_question || 1;
    const maxPossibleScore = totalQuestions * marksPerQuestion;
    
         // If rawScore <= maxPossibleScore, treat as raw points
     if (rawScore <= maxPossibleScore) {
       scorePercentage = Math.round((rawScore / maxPossibleScore) * 100);
       // Calculate correct answers based on the percentage of questions answered correctly
       correctAnswers = Math.round((rawScore / maxPossibleScore) * totalQuestions);
     } else if (rawScore <= 100) {
       // If rawScore <= 100, treat as percentage
       scorePercentage = Math.round(rawScore);
       correctAnswers = Math.round((scorePercentage / 100) * totalQuestions);
     } else {
       // Fallback: assume it's raw points and calculate percentage
       scorePercentage = Math.round((rawScore / maxPossibleScore) * 100);
       correctAnswers = Math.round((rawScore / maxPossibleScore) * totalQuestions);
     }
  } else if (attempt?.score !== undefined && attempt?.maxScore) {
    // Fallback: use score and maxScore if available
    const rawScore = attempt.score;
    const maxScore = attempt.maxScore;
    
    if (rawScore <= 100 && maxScore === 100) {
      // Already a percentage
      scorePercentage = Math.round(rawScore);
    } else {
      // Calculate percentage
      scorePercentage = Math.round((rawScore / maxScore) * 100);
    }
        } else if (attempt?.score !== undefined) {
     // If we only have a score, try to infer the data
     const rawScore = attempt.score;
     
     // Try to get total questions from various possible fields first
     totalQuestions = attempt.total_questions || attempt.totalQuestions || attempt.questions_count;
     const marksPerQuestion = attempt.marksPerQuestion || attempt.marks_per_question || 3; // Default to 3 marks per question
     
     // If we don't have total questions, calculate it from the score
     if (!totalQuestions) {
       // Assume the score represents the total points earned
       // If each question has 3 marks, then number of questions = score / 3
       totalQuestions = Math.round(rawScore / marksPerQuestion);
       
       // If the calculation doesn't make sense (e.g., score is not divisible by marks per question),
       // try different marks per question values
       if (totalQuestions === 0 || rawScore % marksPerQuestion !== 0) {
         // Try with 1 mark per question
         const questionsWith1Mark = Math.round(rawScore / 1);
         if (questionsWith1Mark > 0 && questionsWith1Mark <= 50) { // Reasonable range
           totalQuestions = questionsWith1Mark;
           marksPerQuestion = 1;
         } else {
           // Try with 2 marks per question
           const questionsWith2Marks = Math.round(rawScore / 2);
           if (questionsWith2Marks > 0 && questionsWith2Marks <= 50) {
             totalQuestions = questionsWith2Marks;
             marksPerQuestion = 2;
           } else {
             // Fallback: assume 1 question with the score as percentage
             totalQuestions = 1;
             marksPerQuestion = rawScore;
           }
         }
       }
     }
     
     const maxPossibleScore = totalQuestions * marksPerQuestion;
     
     // Now calculate percentage and correct answers
     if (rawScore <= 100 && rawScore <= maxPossibleScore) {
       // Could be either percentage or raw points, but since it's <= 100, treat as percentage
       scorePercentage = Math.round(rawScore);
       correctAnswers = Math.round((scorePercentage / 100) * totalQuestions);
     } else {
       // Treat as raw points
       scorePercentage = Math.round((rawScore / maxPossibleScore) * 100);
       correctAnswers = Math.round((rawScore / maxPossibleScore) * totalQuestions);
     }
  }
  
  // Debug logging for calculation results
  console.log('LastAttemptModal - calculation results:', {
    scorePercentage,
    correctAnswers,
    totalQuestions,
    rawScore: attempt?.score,
    maxScore: attempt?.maxScore,
    totalQuestionsFromAttempt: attempt?.total_questions || attempt?.totalQuestions || attempt?.questions_count
  });
  
  const isPassed = scorePercentage >= 70; // Assuming 70% is passing

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between w-full">
            <span className="text-xl font-bold text-gray-900">Quiz Results</span>
            <Button variant="ghost" size="sm" onClick={() => onClose(false)} className="hover:bg-gray-100">
              <X size={18} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {attempt ? (
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
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border-8 border-gray-100 flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${getScoreColor(scorePercentage)}`}>
                      {scorePercentage}%
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {isPassed ? 'PASSED' : 'NOT PASSED'}
                    </div>
                  </div>
                </div>
                {/* Status Icon Overlay */}
                <div className="absolute -top-2 -right-2">
                  {getScoreIcon(scorePercentage)}
                </div>
              </div>

              {/* Score Message */}
              <p className="text-sm text-gray-700 mb-4">
                {getScoreMessage(scorePercentage)}
              </p>

                                            {/* Score Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  {totalQuestions > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm">Correct Answers</span>
                        <span className="font-semibold text-gray-900">
                          {correctAnswers} / {totalQuestions}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            scorePercentage >= 90 ? 'bg-green-500' :
                            scorePercentage >= 80 ? 'bg-blue-500' :
                            scorePercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${scorePercentage}%` }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">Score Information</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {attempt?.score !== undefined ? `${attempt.score} points` : 'No score available'}
                      </div>
                    </div>
                  )}
                  
                  {/* Additional score details */}
                  {attempt?.score !== undefined && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 text-center space-y-1">
                        <div>Raw Score: {attempt.score}</div>
                        {attempt.marksPerQuestion && (
                          <div>Marks per question: {attempt.marksPerQuestion}</div>
                        )}
                        {attempt.total_questions && (
                          <div>Total questions: {attempt.total_questions}</div>
                        )}
                        {attempt.questions_count && (
                          <div>Questions count: {attempt.questions_count}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Attempt Date</p>
                  <p className="text-sm text-gray-900">{formatDate(attempt.attempt_date)}</p>
                </div>
              </div>

              {attempt.quizType && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <Award className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quiz Type</p>
                    <p className="text-sm text-gray-900 capitalize">{attempt.quizType}</p>
                  </div>
                </div>
              )}

              {attempt.timeSpent && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <BarChart2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Time Spent</p>
                    <p className="text-sm text-gray-900">{attempt.timeSpent}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={() => onClose(false)} 
                className="bg-indigo-600 hover:bg-indigo-700 px-8"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No attempt data available.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


