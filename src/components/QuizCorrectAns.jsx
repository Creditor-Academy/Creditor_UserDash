import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, HelpCircle, BookOpen, Award } from 'lucide-react';

const QuizCorrectAns = ({ isOpen, onClose, questions = [], quizTitle = "Quiz" }) => {
  if (!isOpen) return null;

  const getQuestionTypeIcon = (questionType) => {
    switch (questionType) {
      case 'MCQ':
        return <HelpCircle className="h-4 w-4 text-blue-600" />;
      case 'TRUE_FALSE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FILL_UPS':
        return <BookOpen className="h-4 w-4 text-purple-600" />;
      case 'ONE_WORD':
        return <Award className="h-4 w-4 text-orange-600" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getQuestionTypeColor = (questionType) => {
    switch (questionType) {
      case 'MCQ':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TRUE_FALSE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FILL_UPS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ONE_WORD':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCorrectAnswer = (question) => {
    if (question.question_type === 'MCQ') {
      const correctOptions = question.question_options?.filter(option => option.isCorrect) || [];
      return correctOptions.map(option => option.text).join(', ');
    }
    if (question.question_type === 'CATEGORIZATION') {
      // Derive a readable mapping like "Category: item1, item2"
      const opts = Array.isArray(question?.question_options) ? question.question_options : [];
      const categories = opts.filter(o => o?.isCategory === true || (!('isCategory' in (o || {})) && !o?.category));
      const items = opts.filter(o => o?.isCategory === false || (!!o?.category && !o?.isCategory));
      const grouped = new Map();
      items.forEach(it => {
        const cat = String(it?.category || '').trim();
        if (!cat) return;
        if (!grouped.has(cat)) grouped.set(cat, []);
        grouped.get(cat).push(it.text);
      });
      const lines = categories.map(c => {
        const list = grouped.get(c.text) || [];
        return `${c.text}: ${list.join(', ')}`;
      });
      return lines.filter(Boolean).join(' | ');
    }
    return question.correct_answer || 'No answer provided';
  };

  const shouldShowCorrectAnswerSection = (question) => {
    // For MCQ and TRUE_FALSE, we already show the correct options above
    // So we don't need to show the correct_answer field again
    if (question.question_type === 'MCQ' || question.question_type === 'TRUE_FALSE' || question.question_type === 'CATEGORIZATION') {
      return false;
    }
    // For other question types, show the correct_answer field
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            Correct Answers - {quizTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No questions available</h3>
              <p className="text-gray-500 mt-1">This quiz doesn't have any questions yet.</p>
            </div>
          ) : (
            questions.map((question, index) => (
              <Card key={question.id || index} className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                        <Badge className={`${getQuestionTypeColor(question.question_type)} text-xs`}>
                          {getQuestionTypeIcon(question.question_type)}
                          <span className="ml-1">{question.question_type}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.question_score || 0} points
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-800 leading-relaxed">
                        {question.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Category-wise visualization for CATEGORIZATION */}
                  {question.question_type === 'CATEGORIZATION' && Array.isArray(question.question_options) && (
                    <div className="space-y-4 mb-4">
                      {(() => {
                        const opts = question.question_options;
                        const categories = opts.filter(o => o?.isCategory === true || (!('isCategory' in (o || {})) && !o?.category));
                        const items = opts.filter(o => o?.isCategory === false || (!!o?.category && !o?.isCategory));
                        const grouped = new Map();
                        items.forEach(it => {
                          const cat = String(it?.category || '').trim();
                          if (!cat) return;
                          if (!grouped.has(cat)) grouped.set(cat, []);
                          grouped.get(cat).push(it);
                        });
                        const assignedIds = new Set(items.filter(it => it?.category).map(it => String(it.id)));
                        const unassigned = items.filter(it => !assignedIds.has(String(it.id)));
                        return (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {categories.map(cat => (
                                <div key={cat.id} className="group rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-b from-blue-50 to-blue-100/40 p-5 min-h-[160px] shadow-sm">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow">
                                      <span className="inline-block w-2 h-2 bg-white rounded-full mr-2" />
                                      {cat.text}
                                    </div>
                                    <span className="ml-2 inline-flex items-center justify-center text-xs font-semibold text-blue-700 bg-white/70 border border-blue-200 rounded-full h-6 px-2">
                                      {(grouped.get(cat.text) || []).length}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 gap-2 min-h-[90px]">
                                    {(grouped.get(cat.text) || []).length ? (
                                      (grouped.get(cat.text) || []).map(item => (
                                        <div key={item.id} className="bg-white/95 border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm">
                                          <div className="flex items-center">
                                            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                                            <span className="text-gray-800">{item.text}</span>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="flex items-center justify-center text-gray-400 text-sm py-6">No items</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {unassigned.length > 0 && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-xs font-semibold text-gray-800">Unassigned Items</h5>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {unassigned.map(item => (
                                    <div key={item.id} className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-1.5 text-xs">
                                      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2 align-middle" />
                                      <span className="text-gray-800 align-middle">{item.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Options for MCQ and TRUE_FALSE */}
                  {(question.question_type === 'MCQ' || question.question_type === 'TRUE_FALSE') && 
                   question.question_options && question.question_options.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Options:</h4>
                      <div className="grid gap-2">
                        {question.question_options.map((option, optionIndex) => (
                          <div
                            key={option.id || optionIndex}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              option.isCorrect
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              option.isCorrect ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {option.isCorrect ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <span className="flex-1 font-medium">{option.text}</span>
                            {option.isCorrect && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Correct
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Correct Answer - Only show for non-MCQ and non-TRUE_FALSE questions */}
                  {shouldShowCorrectAnswerSection(question) && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-indigo-600" />
                        <h4 className="text-sm font-semibold text-indigo-800">Correct Answer:</h4>
                      </div>
                      <p className="text-indigo-900 font-medium">
                        {formatCorrectAnswer(question)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizCorrectAns;
