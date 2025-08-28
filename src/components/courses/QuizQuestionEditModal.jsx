import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { updateQuestion } from '@/services/quizServices';

const QuizQuestionEditModal = ({ isOpen, onClose, quizId, question, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const initial = useMemo(() => ({
    question: question?.question || '',
    correct_answer: question?.correct_answer || '',
  }), [question]);

  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  if (!isOpen || !question) return null;

  const handleSave = async () => {
    if (!quizId || !question?.id) return;
    setSaving(true);
    setError(null);
    try {
      // Build payload per API contract
      // text: updated question text
      // correct_answer: updated answer string (comma-separated when multiple)
      // question_type: unchanged (backend requires field present)
      // question_options: derived from existing options with isCorrect set from correct_answer
      const currentQ = (form.question || '').trim();
      const currentA = (form.correct_answer || '').trim();

      const correctSet = new Set(currentA.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
      const existingOptions = Array.isArray(question?.question_options) ? question.question_options : [];
      const question_options = existingOptions.map(opt => ({
        text: String(opt.text || ''),
        isCorrect: correctSet.has(String(opt.text || '').toLowerCase())
      }));

      const payload = {
        text: currentQ,
        correct_answer: currentA,
        question_type: question?.question_type,
        question_options,
      };

      await updateQuestion(quizId, question.id, payload);
      onSaved?.();
      onClose();
    } catch (e) {
      setError(e?.message || 'Failed to update question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Edit Question</h3>
            <p className="text-xs text-gray-500">ID: {question.id}</p>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Question text"
              />
              <Input
                value={form.correct_answer}
                onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
                placeholder="Correct answer (comma-separated for multiple)"
              />
            </CardContent>
          </Card>
        </div>

        <div className="p-4 border-t flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionEditModal;


