import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BookOpen, CheckCircle, XCircle, Loader2, AlertTriangle, ChevronLeft } from "lucide-react";
import { submitQuiz, saveAnswer } from "@/services/quizService";
import { toast } from "sonner";

function QuizTakePage() {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('module');
  const category = searchParams.get('category');
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [sequenceOrderMap, setSequenceOrderMap] = useState({}); // { [questionId]: [{id, text, orderIndex}] }

  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  // Helpers to work with CATEGORIZATION questions consistently
  const getQuestionType = (q) => (q?.question_type || q?.type || '').toString().toUpperCase();
  const getCategorizationBuckets = (opts = []) => {
    // Prefer explicit isCategory flag; fall back to category field heuristic
    if (opts.some(o => typeof o?.isCategory === 'boolean')) {
      return {
        categories: opts.filter(o => o?.isCategory === true),
        items: opts.filter(o => o?.isCategory === false),
      };
    }
    if (opts.some(o => 'category' in (o || {}))) {
      return {
        categories: opts.filter(o => !o?.category),
        items: opts.filter(o => !!o?.category),
      };
    }
    // Fallback: split first 3 as categories (legacy heuristic)
    return {
      categories: opts.slice(0, 3),
      items: opts.slice(3),
    };
  };

  const isCategorizationComplete = (q, ans) => {
    if (!q) return true;
    if (getQuestionType(q) !== 'CATEGORIZATION') return true;
    const { items } = getCategorizationBuckets(q.options || []);
    const assignedCount = Object.keys((ans?.categoryAssignments) || {}).length;
    return items.length > 0 ? assignedCount === items.length : true;
  };

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

        // Initialize sequence order map with shuffled options for SEQUENCE questions
        try {
          const seqMap = {};
          const shuffle = (arr) => {
            const copy = [...arr];
            for (let i = copy.length - 1; i > 0; i -= 1) {
              const j = Math.floor(Math.random() * (i + 1));
              [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
          };
          (initialQuestions || []).forEach((q) => {
            const backendType = (q.question_type || q.type || '').toString().toUpperCase();
            if (backendType === 'SEQUENCE' && Array.isArray(q.options) && q.options.length > 0) {
              const shuffled = shuffle(q.options);
              seqMap[q.id] = shuffled.map((opt, idx) => ({
                id: opt.id ?? opt._id ?? String(idx),
                text: opt.text ?? String(opt),
                orderIndex: typeof opt.orderIndex === 'number' ? opt.orderIndex : idx,
              }));
            }
          });
          if (Object.keys(seqMap).length > 0) {
            setSequenceOrderMap(seqMap);
            // initialize answers with shuffled visible order (as array of texts)
            const initialSeqAnswers = {};
            Object.entries(seqMap).forEach(([qid, arr]) => {
              initialSeqAnswers[qid] = arr.map(o => o.text);
            });
            setAnswers((prev) => ({ ...initialSeqAnswers, ...prev }));
          }
        } catch {}
        
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
        case 'sequence': {
          // Use current drag-and-drop order from sequenceOrderMap if available
          const currentOrder = sequenceOrderMap[questionId]
            || (Array.isArray(question.options) ? question.options.map((opt, idx) => ({ id: opt.id ?? opt._id ?? String(idx), text: opt.text ?? String(opt) })) : []);
          const payloadOrder = (currentOrder || []).map((opt, idx) => ({ optionId: String(opt.id), order: idx }));
          formattedAnswer.selectedOptionId = payloadOrder;
          // Optional: include human-readable answer as array of texts (backend ignores or accepts)
          formattedAnswer.answer = currentOrder.map(o => o.text);
          console.log(`Sequence question ${questionId} formatted:`, formattedAnswer);
          break;
        }
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

        case 'categorization': {
          // Build selectedOptionId as an array of { optionId, category }
          // Our stored answer shape is: { categoryAssignments: { [itemId]: categoryId | categoryName } }
          // The start API now includes isCategory flags and IDs for both categories and items
          const q = question;
          const mapping = (answer && typeof answer === 'object') ? answer.categoryAssignments : null;
          const opts = Array.isArray(q?.options) ? q.options : [];
          const categoriesById = new Map();
          const categoriesByText = new Map();
          opts.forEach(o => {
            const id = String(o?.id ?? '');
            const text = String(o?.text ?? '');
            if (o?.isCategory === true || (!('isCategory' in o) && !o?.category)) {
              if (id) categoriesById.set(id, text);
              if (text) categoriesByText.set(text.toLowerCase(), text);
            }
          });
          const payload = [];
          if (mapping && typeof mapping === 'object') {
            Object.entries(mapping).forEach(([itemId, catRef]) => {
              // Resolve category name from either id or already a name
              let categoryName = '';
              const catRefStr = String(catRef ?? '').trim();
              if (categoriesById.has(catRefStr)) {
                categoryName = categoriesById.get(catRefStr) || '';
              } else if (categoriesByText.has(catRefStr.toLowerCase())) {
                categoryName = categoriesByText.get(catRefStr.toLowerCase()) || '';
              } else if (catRefStr) {
                categoryName = catRefStr; // fallback to provided string
              }
              // Ensure the item exists in options and is not a category
              const exists = opts.find(o => String(o?.id) === String(itemId) && (o?.isCategory === false || !!o?.category));
              if (exists && categoryName) {
                payload.push({ optionId: String(itemId), category: String(categoryName) });
              }
            });
          }
          formattedAnswer.selectedOptionId = payload;
          formattedAnswer.answer = null;
          console.log(`Categorization question ${questionId} formatted:`, formattedAnswer);
          break;
        }

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
          case 'CATEGORIZATION':
            question.type = 'categorization';
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
      case 'sequence': {
        // Drag-and-drop ordering UI for SEQUENCE questions
        const qid = question.id;
        const currentOrder = sequenceOrderMap[qid] || (Array.isArray(question.options) ? question.options.map((opt, idx) => ({ id: opt.id ?? String(idx), text: opt.text ?? String(opt), orderIndex: typeof opt.orderIndex === 'number' ? opt.orderIndex : idx })) : []);

        const setOrder = (next) => {
          setSequenceOrderMap((prev) => ({ ...prev, [qid]: next }));
          // Persist user's current visible order as the answer (array of texts)
          handleAnswer(qid, next.map(o => o.text));
        };

        const onDragStart = (e, index) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(index));
        };

        const onDragOver = (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        };

        const onDrop = (e, dropIndex) => {
          e.preventDefault();
          const dragIndex = Number(e.dataTransfer.getData('text/plain'));
          if (Number.isNaN(dragIndex)) return;
          if (dragIndex === dropIndex) return;
          const next = [...currentOrder];
          const [moved] = next.splice(dragIndex, 1);
          next.splice(dropIndex, 0, moved);
          setOrder(next);
        };

        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Drag and drop to arrange in the correct order.</p>
            <div className="space-y-2">
              {currentOrder.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm cursor-move select-none"
                  draggable
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, idx)}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold bg-gray-100 text-gray-700 rounded">{idx + 1}</span>
                    <span className="text-gray-800">{item.text}</span>
                  </div>
                  <span className="text-xs text-gray-400">drag</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500">Your current order will be submitted.</div>
          </div>
        );
      }
      case 'categorization': {
        // Drag-and-drop categorization UI
        const qid = question.id;
        const options = question.options || [];
        
        // Debug logging to see the actual structure
        console.log('Categorization question options:', options);
        console.log('Question data:', question);
        
        // For the API response structure, we need to determine categories vs items differently
        // Try multiple approaches to identify categories vs items
        
        let categories, items;
        
        // Approach 1: Check for explicit isCategory field
        if (options.some(opt => opt.isCategory !== undefined)) {
          categories = options.filter(opt => opt.isCategory === true);
          items = options.filter(opt => opt.isCategory === false);
        }
        // Approach 2: Check for category field (items have category, categories don't)
        else if (options.some(opt => opt.category !== undefined)) {
          categories = options.filter(opt => !opt.category);
          items = options.filter(opt => opt.category);
        }
        // Approach 3: Heuristic based on your example - first 3 are categories
        else if (options.length > 3) {
          categories = options.slice(0, 3);
          items = options.slice(3);
        }
        // Approach 4: If 3 or fewer options, they're all categories
        else {
          categories = options;
          items = [];
        }
        
        console.log('Filtered categories:', categories);
        console.log('Filtered items:', items);
        
        // Initialize answer structure if not exists
        const currentAnswer = answers[qid] || {};
        const categoryAssignments = currentAnswer.categoryAssignments || {};
        
        const handleItemDrop = (itemId, categoryId) => {
          const newAssignments = { ...categoryAssignments, [itemId]: categoryId };
          const newAnswer = { ...currentAnswer, categoryAssignments: newAssignments };
          handleAnswer(qid, newAnswer);
        };
        
        const handleItemRemove = (itemId) => {
          const newAssignments = { ...categoryAssignments };
          delete newAssignments[itemId];
          const newAnswer = { ...currentAnswer, categoryAssignments: newAssignments };
          handleAnswer(qid, newAnswer);
        };
        
        const onDragStart = (e, itemId) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', itemId);
        };
        
        const onDragOver = (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        };
        
        const onDrop = (e, categoryId) => {
          e.preventDefault();
          const itemId = e.dataTransfer.getData('text/plain');
          if (itemId) {
            handleItemDrop(itemId, categoryId);
          }
        };
        
        // Debug: If no categories found, show debug info
        if (categories.length === 0) {
          return (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Debug: No categories found</h4>
                <p className="text-sm text-yellow-700 mb-2">Options structure:</p>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(options, null, 2)}
                </pre>
              </div>
              <div className="text-sm text-gray-600">
                Total options: {options.length}
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => {
                const categoryItems = items.filter(item => categoryAssignments[item.id] === category.id);
                return (
                  <div
                    key={category.id}
                    className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 min-h-[200px]"
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, category.id)}
                  >
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        {category.text}
                      </div>
                    </div>
                    <div className="space-y-2 min-h-[120px]">
                      {categoryItems.map(item => (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm shadow-sm flex items-center justify-between group"
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-gray-800">{item.text}</span>
                          </div>
                          <button
                            onClick={() => handleItemRemove(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {categoryItems.length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-8">
                          Drop items here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Available Items */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Available Items:</h4>
              <div className="flex flex-wrap gap-2">
                {items.map(item => {
                  const isAssigned = categoryAssignments[item.id];
                  if (isAssigned) return null; // Don't show assigned items
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm cursor-move hover:shadow-md transition-shadow select-none"
                      draggable
                      onDragStart={(e) => onDragStart(e, item.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-gray-800">{item.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {items.filter(item => !categoryAssignments[item.id]).length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  All items have been categorized
                </div>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="text-sm text-gray-600">
              Progress: {Object.keys(categoryAssignments).length} / {items.length} items categorized
            </div>
          </div>
        );
      }
      case 'mcq_single':
      case 'scq':
      case 'single_choice':
      case 'single choice':
      case 'singlechoice':
        // Single selection using radio buttons
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">Select all correct answers:</p>
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox 
                  id={`mcq-${index}`}
                  checked={userAnswer?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentAnswers = userAnswer || [];
                    if (checked) {
                      handleAnswer(currentQ.id, [...currentAnswers, option]);
                    } else {
                      handleAnswer(currentQ.id, currentAnswers.filter((a) => a !== option));
                    }
                  }}
                />
                <Label htmlFor={`mcq-${index}`} className="cursor-pointer flex-1 py-2 px-3 rounded border hover:bg-muted/50">
                  {option}
                </Label>
              </div>
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
            <p className="text-sm text-muted-foreground mb-4">Select True or False:</p>
            <RadioGroup 
              value={userAnswer || ""} 
              onValueChange={(value) => handleAnswer(currentQ.id, value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="cursor-pointer py-2 px-4 rounded border hover:bg-muted/50 w-20 text-center">
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="cursor-pointer py-2 px-4 rounded border hover:bg-muted/50 w-20 text-center">
                  False
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'fillup':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Fill in the blank:</p>
            <Input
              value={userAnswer || ""}
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg p-4"
            />
          </div>
        );
        
      case 'one_word':
      case 'oneword':
      case 'one word':
      case 'single_word':
      case 'singleword':
      case 'single word':
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
  const canProceed = !currentQ
    ? true
    : (getQuestionType(currentQ) !== 'CATEGORIZATION' || isCategorizationComplete(currentQ, answers[currentQ?.id]));

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/quiz-instruction/${quizId}?module=${moduleId}&category=${category}`}>
            <ChevronLeft size={16} />
              Back to Instructions
            </Link>
          </Button>
          <Badge variant={category === 'general' ? 'outline' : 'default'}>
            Quiz {quizId} - {category === 'general' ? 'Practice' : 'Assessment'}
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
        </div>
        
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Question {currentQuestion + 1} of {totalQuestions}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Low time warning */}
      {timeRemaining < 300 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <p className="text-red-800 font-medium">
            Warning: Less than 5 minutes remaining! The quiz will auto-submit when time runs out.
          </p>
        </div>
      )}

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Brain size={24} />
            Question {currentQuestion + 1}
            <Badge variant="outline" className="ml-2">
              {currentQ.type.toUpperCase()}
            </Badge>
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
          
          {/* Question Type Instructions */}
          {(() => {
            const renderType = (currentQ.question_type?.toLowerCase()) || (currentQ.type?.toLowerCase());
            
            const getInstruction = (type) => {
              switch (type) {
                case 'mcq_single':
                case 'scq':
                case 'single_choice':
                case 'single choice':
                case 'singlechoice':
                  return "Select the correct answer from the options below.";
                  
                case 'mcq_multiple':
                case 'multiple_choice':
                case 'multiple choice':
                case 'multiplechoice':
                  return "Select all correct answers from the options below.";
                  
                case 'mcq':
                  return currentQ.options && Array.isArray(currentQ.options) && currentQ.options.length > 0
                    ? "Select all correct answers from the options below."
                    : "Enter your answer in the text field below.";
                  
                case 'sequence':
                  return "Drag and drop the items below to arrange them in the correct order.";
                  
                case 'true_false':
                case 'truefalse':
                case 'true-false':
                case 'true false':
                  return "Select whether the statement is true or false.";
                  
                case 'descriptive':
                case 'text':
                case 'essay':
                case 'long_answer':
                case 'long answer':
                  return "Provide a detailed written response to the question.";
                  
                case 'fill_blank':
                case 'fill in the blank':
                case 'fillintheblank':
                case 'fill_ups':
                  return "Fill in the blanks with the correct answers.";
                  
                case 'one_word':
                case 'oneword':
                case 'one word':
                case 'single_word':
                case 'singleword':
                  return "Provide a single word or short phrase answer.";
                  
                case 'matching':
                case 'match':
                  return "Match the items correctly.";
                  
                case 'categorization':
                  return "Drag each item into the correct category container below.";
                  
                default:
                  return "Please provide your answer below.";
              }
            };
            
            const instruction = getInstruction(renderType);
            
            return (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen size={14} />
                    Instructions:
                  </span>
                </p>
                <p className="text-sm text-blue-700 mt-1">{instruction}</p>
              </div>
            );
          })()}
          
          {renderQuestion()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        
        <div className="flex items-center gap-3">
          {currentQuestion < totalQuestions - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed} title={!canProceed ? 'Categorize all items to continue' : undefined}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={() => setShowSubmitConfirm(true)}
              disabled={Object.keys(answers).length === 0 || !canProceed}
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
  );
}

export default QuizTakePage;