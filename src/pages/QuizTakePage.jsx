import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BookOpen, CheckCircle, XCircle, Loader2, AlertTriangle, ChevronLeft } from "lucide-react";
import { submitQuiz, saveAnswer } from "@/services/quizService";
import { toast } from "sonner";

function QuizTakePage() {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const moduleId = searchParams.get('module');
  const category = searchParams.get('category');
  
  // Get quiz data from navigation state
  const { questions: initialQuestions, quizSession, startedAt } = location.state || {};
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  // Load answers from localStorage on component mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`quiz_${quizId}_answers`);
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        setAnswers(parsedAnswers);
        console.log('Loaded saved answers from localStorage:', parsedAnswers);
      } catch (error) {
        console.error('Error parsing saved answers:', error);
      }
    }
  }, [quizId]);

  // Save answers to localStorage whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(answers));
    }
  }, [answers, quizId]);

  // Initialize quiz session from passed data
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have the required data from navigation state
        if (!initialQuestions || !quizSession) {
          toast.error('Quiz session not found. Please start the quiz again.');
          navigate(-1);
          return;
        }
        
        // Set quiz data and questions from navigation state
        setQuizData(quizSession);
        setQuestions(initialQuestions);
        
        // Debug logging to see what data we received
        console.log('Quiz initialized with:', {
          quizSession,
          initialQuestions,
          questionsCount: initialQuestions?.length,
          firstQuestion: initialQuestions?.[0],
          allQuestions: initialQuestions
        });
        
        setQuizStarted(true);
      } catch (error) {
        console.error('Error initializing quiz:', error);
        toast.error('Failed to initialize quiz. Please try again.');
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      initializeQuiz();
    }
  }, [quizId, navigate, initialQuestions, quizSession]);





  const handleAnswer = async (questionId, answer) => {
    // Update local state immediately for responsive UI
    setAnswers(prev => {
      const updated = { ...prev, [questionId]: answer };
      // Persist immediately to localStorage as required
      try {
        localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Format answers for API submission
  const formatAnswersForSubmission = (answersMap) => {
    const formattedAnswers = [];
    
    console.log('Formatting answers for submission. Raw answers:', answersMap);
    console.log('Questions data for formatting:', questions);
    
    Object.entries(answersMap).forEach(([questionId, answer]) => {
      const question = questions.find(q => String(q.id) === String(questionId) || String(q._id) === String(questionId) || String(q.questionId) === String(questionId));
      
      console.log(`Processing question ${questionId}:`, {
        question,
        answer,
        questionType: question?.type,
        backendQuestionType: question?.question_type,
        resolvedType: question.type?.toLowerCase() || question.question_type?.toLowerCase()
      });
      
      if (!question) {
        console.warn(`Question not found for ID: ${questionId}`);
        return;
      }
      
      const formattedAnswer = {
        // Server expects keys: questionId, selectedOptionId (array or null), answer
        questionId: String(question.id ?? questionId),
        selectedOptionId: null,
        answer: null
      };

      // Heuristic: Treat as FILL_UPS if question hints blanks (underscores/meta) and no options
      const textCandidate = question?.question || question?.questionText || question?.text || '';
      const blanksByUnderscoreHeur = (String(textCandidate).match(/_+/g) || []).length;
      const blanksByMetaHeur = Array.isArray(question?.correct_blanks)
        ? question.correct_blanks.length
        : Array.isArray(question?.correctAnswers)
          ? question.correctAnswers.length
          : Array.isArray(question?.correct_answers)
            ? question.correct_answers.length
            : (Number(question?.num_blanks) || 0);
      const looksLikeFillUps = (!Array.isArray(question.options) || question.options.length === 0) && (blanksByUnderscoreHeur > 0 || blanksByMetaHeur > 0);
      console.log(`Question ${questionId} fill-ups detection:`, {
        hasOptions: Array.isArray(question.options) && question.options.length > 0,
        blanksByUnderscore: blanksByUnderscoreHeur,
        blanksByMeta: blanksByMetaHeur,
        looksLikeFillUps,
        questionType: question.question_type || question.type
      });
      if (looksLikeFillUps) {
        // For heuristic fill-ups, ensure we always send an array
        let fillUpsAnswer;
        if (Array.isArray(answer)) {
          // If answer is already an array, use it
          fillUpsAnswer = answer.map(v => String(v).trim()).filter(Boolean);
        } else if (typeof answer === 'string' && answer.includes(',')) {
          // If answer is a comma-separated string, split it
          fillUpsAnswer = answer.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          // If answer is a single value, wrap it in an array
          fillUpsAnswer = [String(answer).trim()].filter(Boolean);
        }
        
        formattedAnswer.answer = fillUpsAnswer;
        console.log(`Heuristic FILL_UPS for ${questionId}:`, { originalAnswer: answer, processedAnswer: fillUpsAnswer });
        formattedAnswers.push(formattedAnswer);
        return;
      }
      
      // Handle different question types - PREFER backend question_type when available
      const questionType = (question.question_type?.toLowerCase()) || (question.type?.toLowerCase());
      switch (questionType) {
        case 'mcq_multiple':
        case 'multiple_choice':
        case 'multiple choice':
        case 'multiplechoice':
          // Multiple choice questions - allow arrays
          {
            const selectedValues = Array.isArray(answer) ? answer : [answer];
            const optionList = Array.isArray(question.options) ? question.options : [];
            const selectedIds = [];
            const selectedTexts = [];
            selectedValues.forEach((val) => {
              let resolved = null;
              let resolvedIndex = -1;
              for (let i = 0; i < optionList.length; i += 1) {
                const opt = optionList[i];
                if (
                  String(opt?.optionId) === String(val) ||
                  String(opt?.id) === String(val) ||
                  String(opt?._id) === String(val) ||
                  String(opt?.value) === String(val) ||
                  String(opt?.text) === String(val) ||
                  String(i) === String(val)
                ) {
                  resolved = opt;
                  resolvedIndex = i;
                  break;
                }
              }
              if (resolved) {
                const idForBackend = resolved.optionId ?? resolved.id ?? resolved._id ?? resolved.value ?? resolvedIndex;
                if (idForBackend != null) selectedIds.push(String(idForBackend));
                selectedTexts.push(resolved.text ?? resolved.label ?? resolved.value ?? String(val));
              } else {
                // Fallback when options don't have matching id/value
                selectedTexts.push(String(val));
              }
            });
            formattedAnswer.selectedOptionId = selectedIds.length > 0 ? selectedIds : null;
            formattedAnswer.answer = selectedTexts;
          }
          console.log(`Multiple choice question ${questionId} formatted:`, formattedAnswer);
          break;

        case 'mcq':
          // MCQ questions - treat as multiple choice by default
          {
            const selectedValues = Array.isArray(answer) ? answer : [answer];
            const optionList = Array.isArray(question.options) ? question.options : [];
            const selectedIds = [];
            const selectedTexts = [];
            selectedValues.forEach((val) => {
              let resolved = null;
              let resolvedIndex = -1;
              for (let i = 0; i < optionList.length; i += 1) {
                const opt = optionList[i];
                if (
                  String(opt?.optionId) === String(val) ||
                  String(opt?.id) === String(val) ||
                  String(opt?._id) === String(val) ||
                  String(opt?.value) === String(val) ||
                  String(opt?.text) === String(val) ||
                  String(i) === String(val)
                ) {
                  resolved = opt;
                  resolvedIndex = i;
                  break;
                }
              }
              if (resolved) {
                const idForBackend = resolved.optionId ?? resolved.id ?? resolved._id ?? resolved.value ?? resolvedIndex;
                if (idForBackend != null) selectedIds.push(String(idForBackend));
                selectedTexts.push(resolved.text ?? resolved.label ?? resolved.value ?? String(val));
              } else {
                // Fallback when options don't have matching id/value
                selectedTexts.push(String(val));
              }
            });
            formattedAnswer.selectedOptionId = selectedIds.length > 0 ? selectedIds : null;
            formattedAnswer.answer = selectedTexts;
          }
          console.log(`MCQ question ${questionId} formatted as multiple choice:`, formattedAnswer);
          break;

        case 'scq':
        case 'mcq_single':
        case 'single_choice':
        case 'single choice':
        case 'singlechoice':
          // Single choice questions - force single value
          {
            const selectedValue = Array.isArray(answer) ? answer[0] : answer;
            const optionList = Array.isArray(question.options) ? question.options : [];
            let resolved = null;
            let resolvedIndex = -1;
            
            for (let i = 0; i < optionList.length; i += 1) {
              const opt = optionList[i];
              if (
                String(opt?.optionId) === String(selectedValue) ||
                String(opt?.id) === String(selectedValue) ||
                String(opt?._id) === String(selectedValue) ||
                String(opt?.value) === String(selectedValue) ||
                String(opt?.text) === String(selectedValue) ||
                String(i) === String(selectedValue)
              ) {
                resolved = opt;
                resolvedIndex = i;
                break;
              }
            }
            
            if (resolved) {
              const idForBackend = resolved.optionId ?? resolved.id ?? resolved._id ?? resolved.value ?? resolvedIndex;
              formattedAnswer.selectedOptionId = idForBackend != null ? [String(idForBackend)] : null;
              formattedAnswer.answer = resolved.text ?? resolved.label ?? resolved.value ?? String(selectedValue);
            } else {
              formattedAnswer.selectedOptionId = null;
              formattedAnswer.answer = String(selectedValue);
            }
          }
          console.log(`Single choice question ${questionId} formatted:`, formattedAnswer);
          break;
          
        case 'truefalse':
        case 'true_false':
        case 'truefalse':
        case 'true-false':
        case 'true false':
          formattedAnswer.selectedOptionId = null;
          {
            // Backend expects a single lowercase string: "true" or "false"
            const s = String(Array.isArray(answer) ? answer[0] : answer).toLowerCase();
            formattedAnswer.answer = s === 'true' ? 'true' : 'false';
          }
          console.log(`True/False question ${questionId} formatted:`, formattedAnswer);
          break;
          
        case 'descriptive':
        case 'text':
        case 'essay':
        case 'long_answer':
        case 'long answer':
          formattedAnswer.selectedOptionId = null;
          // Backend expects a string
          formattedAnswer.answer = Array.isArray(answer) ? answer[0] : String(answer);
          console.log(`Descriptive question ${questionId} formatted:`, formattedAnswer);
          break;
          
        case 'fill_blank':
        case 'fill in the blank':
        case 'fillintheblank':
        case 'fill_ups':
          console.log(`Processing explicit fill-ups question ${questionId}:`, { answer, questionType: question.question_type || question.type });
          formattedAnswer.selectedOptionId = null;
          {
            // Backend expects an ordered array of strings for fill-ups
            let fillUpsAnswer;
            if (Array.isArray(answer)) {
              // If answer is already an array, use it
              fillUpsAnswer = answer.map(v => String(v).trim()).filter(Boolean);
            } else if (typeof answer === 'string' && answer.includes(',')) {
              // If answer is a comma-separated string, split it
              fillUpsAnswer = answer.split(',').map(s => s.trim()).filter(Boolean);
            } else {
              // If answer is a single value, wrap it in an array
              fillUpsAnswer = [String(answer).trim()].filter(Boolean);
            }
            
            formattedAnswer.answer = fillUpsAnswer;
          }
          console.log(`Fill blank question ${questionId} formatted:`, { originalAnswer: answer, processedAnswer: formattedAnswer.answer });
          break;
          
        case 'one_word':
        case 'oneword':
        case 'one word':
        case 'single_word':
        case 'singleword':
        case 'one_word':
          formattedAnswer.selectedOptionId = null;
          formattedAnswer.answer = String(Array.isArray(answer) ? answer[0] : answer).trim();
          console.log(`One word question ${questionId} formatted:`, formattedAnswer);
          break;
          
        case 'matching':
        case 'match':
          formattedAnswer.selectedOptionId = null;
          formattedAnswer.answer = Array.isArray(answer) ? answer : [answer];
          console.log(`Matching question ${questionId} formatted:`, formattedAnswer);
          break;

        default:
          // Default handling - treat as array
          formattedAnswer.selectedOptionId = null;
          formattedAnswer.answer = Array.isArray(answer) ? answer : [answer];
          console.log(`Default question ${questionId} formatted:`, formattedAnswer);
          break;
      }
      
      formattedAnswers.push(formattedAnswer);
    });
    
    console.log('Final formatted answers:', formattedAnswers);
    return formattedAnswers;
  };

  const handleSubmit = async () => {
    // Always read the latest saved answers from localStorage
    let savedAnswers = {};
    try {
      const raw = localStorage.getItem(`quiz_${quizId}_answers`);
      savedAnswers = raw ? JSON.parse(raw) : answers;
    } catch {
      savedAnswers = answers;
    }

    if (!savedAnswers || Object.keys(savedAnswers).length === 0) {
      toast.error('Please answer at least one question before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Format answers for API submission
      const formattedAnswers = formatAnswersForSubmission(savedAnswers);
      
      console.log('Submitting quiz with formatted answers:', formattedAnswers);
      console.log('Raw answers object:', savedAnswers);
      console.log('Questions data:', questions);
      console.log('Answers count:', Object.keys(savedAnswers).length);
      console.log('Total questions:', totalQuestions);
      console.log('Quiz ID:', quizId);
      
      // Validate that we have answers for most questions
      const answeredCount = Object.keys(savedAnswers).length;
      const unansweredCount = totalQuestions - answeredCount;
      
      if (unansweredCount > 0) {
        console.log(`Warning: ${unansweredCount} questions are unanswered`);
      }
      
      // Call the submit quiz API with formatted answers in expected key
      const submitPayload = { answers: formattedAnswers };
      console.log('Submit payload (frontend JSON):', JSON.stringify(submitPayload, null, 2));
      const result = await submitQuiz(quizId, submitPayload);
      console.log('Quiz submission result:', result);
      
      // Clear localStorage after successful submission
      try { localStorage.removeItem(`quiz_${quizId}_answers`); } catch {}
      
      // Extract the response data
      const responseData = result.data || result;
      
      // Validate the response contains scoring information
      if (responseData.score === undefined) {
        console.warn('Quiz submitted but no score received from backend');
        console.warn('Response data:', responseData);
      }
      
      toast.success('Quiz submitted successfully!');
      
      // Navigate to results page with the data from backend
      const navigationState = { 
        quizResults: responseData,
        answers: savedAnswers,
        quizSession: quizData,
        startedAt: startedAt
      };
      
      console.log('Navigating to results page with state:', navigationState);
      
      navigate(`/dashboard/quiz/results/${quizId}?module=${moduleId}&category=${category}`, { 
        state: navigationState
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      
      // Handle specific error cases
      if (error.message?.includes('NO_PENDING_ATTEMPT')) {
        toast.error('No active quiz attempt found. Please start the quiz again.');
      } else if (error.message?.includes('NO_QUESTION_RESPONSES_FOUND')) {
        toast.error('No answers found. Please answer some questions before submitting.');
      } else {
        toast.error('Failed to submit quiz. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    if (!questions[currentQuestion]) return null;
    
    const question = questions[currentQuestion];
    const userAnswer = answers[question.id];
    
    // Debug: Log the current answer state
    console.log('Current question answer state:', {
      questionId: question.id,
      userAnswer,
      answerType: typeof userAnswer,
      isArray: Array.isArray(userAnswer),
      answersObject: answers
    });

    // Debug logging to see what the backend is sending
    console.log('Rendering question:', {
      id: question.id,
      type: question.type,
      backendType: question.question_type,
      question: question.question,
      questionText: question.questionText,
      text: question.text,
      content: question.content,
      questionField: question.question,
      options: question.options,
      allFields: Object.keys(question),
      fullQuestion: question
    });

    // Helper function to render option text
    const renderOptionText = (option) => {
      if (typeof option === 'string') {
        return option;
      } else if (option && typeof option === 'object') {
        return option.text || option.label || option.value || JSON.stringify(option);
      }
      return String(option);
    };

    // Helper function to get option value
    const getOptionValue = (option, index) => {
      if (typeof option === 'string') {
        return option;
      } else if (option && typeof option === 'object') {
        return option.id || option.value || index;
      }
      return index;
    };

    // Handle missing question type - check for backend question_type field
    if (!question.type) {
      // Try to get type from backend field first, then fallback to type field
      const backendType = question.question_type || question.type;
      if (backendType) {
        console.log('Using backend question_type:', backendType);
        // Map backend type to frontend type
        switch (backendType.toUpperCase()) {
          case 'MCQ':
            question.type = 'mcq';
            break;
          case 'MCQ_MULTIPLE':
            question.type = 'mcq_multiple';
            break;
          case 'SCQ':
            question.type = 'scq';
            break;
          case 'TRUE_FALSE':
            question.type = 'true_false';
            break;
          case 'FILL_UPS':
            question.type = 'fill_blank';
            break;
          case 'ONE_WORD':
            question.type = 'one_word';
            break;
          default:
            question.type = backendType.toLowerCase();
        }
        console.log('Mapped question type from', backendType, 'to', question.type);
      } else {
        console.warn('Question type is missing, defaulting to MCQ');
        // Default to MCQ if type is missing - treat as single choice for safety
        if (question.options && Array.isArray(question.options)) {
          return (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={getOptionValue(option, index)}
                    checked={userAnswer === getOptionValue(option, index)}
                    onChange={() => handleAnswer(question.id, getOptionValue(option, index))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">{renderOptionText(option)}</span>
                </label>
              ))}
            </div>
          );
        }
      }
    }

    // Ensure we have the correct type for rendering (prefer backend question_type, fallback to type)
    const renderType = (question.question_type?.toLowerCase()) || (question.type?.toLowerCase());
    console.log('Rendering question with type:', renderType, 'original type:', question.type, 'backend type:', question.question_type, 'options:', question.options);
    console.log('Question type mapping debug:', {
      questionType: question.type,
      backendQuestionType: question.question_type,
      renderType: renderType,
      questionId: question.id
    });
    
    // Debug: Check if this is a multiple choice question
    const isMultipleChoice = renderType === 'mcq_multiple' || 
                            renderType === 'multiple_choice' || 
                            renderType === 'multiple choice' || 
                            renderType === 'multiplechoice';
    console.log('Is multiple choice question?', isMultipleChoice, 'renderType:', renderType);
    
    // Question type handling:
    // - Single choice (SCQ, MCQ_SINGLE, etc.): Radio buttons, only one answer allowed
    // - Multiple choice (MCQ_MULTIPLE, etc.): Checkboxes, multiple answers allowed  
    // - True/False: Radio buttons, only one answer allowed
    // - Text/Descriptive: Text input, single answer
    // - Fill in blanks: Multiple text inputs, array of answers
    switch (renderType) {
      case 'mcq_single':
      case 'scq':
      case 'single_choice':
      case 'single choice':
      case 'singlechoice':
        // Single selection using radio buttons
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={getOptionValue(option, index)}
                  checked={userAnswer === getOptionValue(option, index)}
                  onChange={() => handleAnswer(question.id, getOptionValue(option, index))}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{renderOptionText(option)}</span>
              </label>
            ))}
          </div>
        );

      case 'mcq_multiple':
      case 'multiple_choice':
      case 'multiple choice':
      case 'multiplechoice':
        // Multiple selection using checkboxes - ONLY for explicit multiple choice
        console.log('Rendering multiple choice question. Current answer:', userAnswer, 'Type:', typeof userAnswer, 'Is array:', Array.isArray(userAnswer));
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const value = getOptionValue(option, index);
              const checked = Array.isArray(userAnswer) ? userAnswer.some(v => String(v) === String(value)) : false;
              console.log('Option rendering:', { option, index, value, userAnswer, checked });
              const toggleSelection = (current, val) => {
                // Ensure current is always an array, even if undefined/null
                const currentArr = Array.isArray(current) ? [...current] : [];
                const exists = currentArr.some(v => String(v) === String(val));
                const result = exists ? currentArr.filter(v => String(v) !== String(val)) : [...currentArr, val];
                console.log('Toggle selection:', { current, val, exists, result, currentArr });
                return result;
              };
              return (
                <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name={`question-${question.id}`}
                    value={value}
                    checked={checked}
                    onChange={() => {
                      const newAnswer = toggleSelection(userAnswer, value);
                      console.log('Multiple choice onChange:', { value, userAnswer, newAnswer });
                      handleAnswer(question.id, newAnswer);
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">{renderOptionText(option)}</span>
                </label>
              );
            })}
          </div>
        );

      case 'mcq':
        // Handle MCQ questions - treat as multiple choice by default
        if (question.options && Array.isArray(question.options) && question.options.length > 0) {
          // MCQ with options - treat as multiple choice (mcq_multiple)
          console.log('Rendering MCQ as multiple choice. Current answer:', userAnswer, 'Type:', typeof userAnswer, 'Is array:', Array.isArray(userAnswer));
          return (
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const value = getOptionValue(option, index);
                const checked = Array.isArray(userAnswer) ? userAnswer.some(v => String(v) === String(value)) : false;
                console.log('Option rendering:', { option, index, value, userAnswer, checked });
                const toggleSelection = (current, val) => {
                  // Ensure current is always an array, even if undefined/null
                  const currentArr = Array.isArray(current) ? [...current] : [];
                  const exists = currentArr.some(v => String(v) === String(val));
                  const result = exists ? currentArr.filter(v => String(v) !== String(val)) : [...currentArr, val];
                  console.log('Toggle selection:', { current, val, exists, result, currentArr });
                  return result;
                };
                return (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name={`question-${question.id}`}
                      value={value}
                      checked={checked}
                      onChange={() => {
                        const newAnswer = toggleSelection(userAnswer, value);
                        console.log('MCQ onChange:', { value, userAnswer, newAnswer });
                        handleAnswer(question.id, newAnswer);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">{renderOptionText(option)}</span>
                  </label>
                );
              })}
            </div>
          );
        } else {
          // MCQ with no options - likely a text input question
          return (
            <div>
              <input
                type="text"
                value={userAnswer || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Enter your answer..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">Please provide your answer.</p>
            </div>
          );
        }

      case 'true_false':
      case 'truefalse':
      case 'true-false':
      case 'true false':
        return (
          <div className="space-y-3">
            {['true', 'false'].map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={() => handleAnswer(question.id, option)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 capitalize">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'descriptive':
      case 'text':
      case 'essay':
      case 'long_answer':
      case 'long answer':
        return (
          <div>
            <textarea
              value={userAnswer || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        );
        
      case 'one_word':
        return (
          <div>
            <input
              type="text"
              value={userAnswer || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder="Enter one word answer..."
              maxLength={50}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">Please provide a single word or short phrase answer.</p>
          </div>
        );
        
      case 'fill_blank': {
        const textCandidate = question?.question || question?.questionText || question?.text || '';
        // Detect two or more underscores as a blank
        const blanksByUnderscore = (textCandidate.match(/_{2,}/g) || []).length;
        // Infer from metadata arrays or numeric hint
        const blanksByMeta = Array.isArray(question?.correct_blanks)
          ? question.correct_blanks.length
          : Array.isArray(question?.correctAnswers)
            ? question.correctAnswers.length
            : Array.isArray(question?.correct_answers)
              ? question.correct_answers.length
              : (Number(question?.num_blanks) || 0);
        // Infer from comma-separated correct answers string
        const blanksByAnswersString = typeof question?.correctAnswers === 'string'
          ? question.correctAnswers.split(',').map(s => s.trim()).filter(Boolean).length
          : (typeof question?.correct_answers === 'string'
            ? question.correct_answers.split(',').map(s => s.trim()).filter(Boolean).length
            : 0);
        const blanksCount = Math.max(blanksByUnderscore, blanksByMeta, blanksByAnswersString, 1);

        const toArray = (val) => {
          if (Array.isArray(val)) return [...val];
          if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
          return [];
        };
        const currentValues = toArray(userAnswer);
        while (currentValues.length < blanksCount) currentValues.push('');

        const updateAt = (index, value) => {
          const next = [...currentValues];
          next[index] = value;
          handleAnswer(question.id, next);
        };

        return (
          <div className="space-y-2">
            {Array.from({ length: blanksCount }).map((_, idx) => (
              <input
                key={idx}
                type="text"
                value={currentValues[idx] || ''}
                onChange={(e) => updateAt(idx, e.target.value)}
                placeholder={`Blank ${idx + 1}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ))}
            <p className="text-sm text-gray-500">Answers will be submitted as an array.</p>
          </div>
        );
      }

      case 'fill_ups': {
        const textCandidate = question?.question || question?.questionText || question?.text || '';
        // Detect two or more underscores as a blank
        const blanksByUnderscore = (textCandidate.match(/_{2,}/g) || []).length;
        // Infer from metadata arrays or numeric hint
        const blanksByMeta = Array.isArray(question?.correct_blanks)
          ? question.correct_blanks.length
          : Array.isArray(question?.correctAnswers)
            ? question.correctAnswers.length
            : Array.isArray(question?.correct_answers)
              ? question.correct_answers.length
              : (Number(question?.num_blanks) || 0);
        // Infer from comma-separated correct answers string
        const blanksByAnswersString = typeof question?.correctAnswers === 'string'
          ? question.correctAnswers.split(',').map(s => s.trim()).filter(Boolean).length
          : (typeof question?.correct_answers === 'string'
            ? question.correct_answers.split(',').map(s => s.trim()).filter(Boolean).length
            : 0);
        const blanksCount = Math.max(blanksByUnderscore, blanksByMeta, blanksByAnswersString, 1);

        const toArray = (val) => {
          if (Array.isArray(val)) return [...val];
          if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
          return [];
        };
        const currentValues = toArray(userAnswer);
        while (currentValues.length < blanksCount) currentValues.push('');

        const updateAt = (index, value) => {
          const next = [...currentValues];
          next[index] = value;
          handleAnswer(question.id, next);
        };

        return (
          <div className="space-y-2">
            {Array.from({ length: blanksCount }).map((_, idx) => (
              <input
                key={idx}
                type="text"
                value={currentValues[idx] || ''}
                onChange={(e) => updateAt(idx, e.target.value)}
                placeholder={`Blank ${idx + 1}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ))}
            <p className="text-sm text-gray-500">Answers will be submitted as an array.</p>
          </div>
        );
      }



      default:
        console.warn('Unsupported question type:', question.type, 'Question data:', question);
        return (
          <div className="text-gray-500 italic p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-medium text-yellow-800 mb-2">Question type not supported: {question.type}</p>
            <p className="text-sm text-yellow-700">Please contact support. Question ID: {question.id}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-yellow-700">Show question data</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify(question, null, 2)}
              </pre>
            </details>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Starting quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizData || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Quiz not available</h3>
          <p className="text-gray-600 mb-4">Unable to load quiz data.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft size={16} />
            Back
          </Button>
          <Badge variant={category === 'general' ? 'outline' : 'default'}>
            {category === 'general' ? 'Practice Quiz' : 'Assessment Quiz'}
          </Badge>
        </div>
        

      </div>

      {/* Quiz Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{quizData.title || 'Quiz'}</h1>
            <p className="text-muted-foreground">{quizData.description || 'Test your knowledge'}</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Question {currentQuestion + 1} of {totalQuestions}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {Object.keys(answers).length} answered
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen size={24} />
            Question {currentQuestion + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Text - try multiple possible field names */}
          {(() => {
            const questionText = currentQ?.question || currentQ?.questionText || currentQ?.text || currentQ?.content || currentQ?.title;
            if (questionText) {
              return <p className="text-lg font-medium leading-relaxed">{questionText}</p>;
            } else {
              console.warn('No question text found in question object:', currentQ);
              return (
                <div className="text-red-500 italic p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium">Question text is missing</p>
                  <p className="text-sm">Available fields: {Object.keys(currentQ || {}).join(', ')}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">Show full question data</summary>
                    <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(currentQ, null, 2)}
                    </pre>
                  </details>
                </div>
              );
            }
          })()}
          {renderQuestion()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-3">
          {currentQuestion < totalQuestions - 1 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={() => setShowSubmitConfirm(true)}
              disabled={Object.keys(answers).length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Quiz
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
              <br /><br />
              <strong>Answered Questions:</strong> {Object.keys(answers).length} / {totalQuestions}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Submit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default QuizTakePage;