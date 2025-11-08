import React, { useMemo, useState } from "react";
import { X, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PollComposer({ isOpen, onClose, onCreate }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [durationHours, setDurationHours] = useState(24);

  const canSubmit = useMemo(() => {
    const trimmed = options.map(o => (o || "").trim()).filter(Boolean);
    return question.trim().length > 0 && trimmed.length >= 2;
  }, [question, options]);

  if (!isOpen) return null;

  const updateOption = (idx, value) => {
    setOptions(prev => prev.map((o, i) => (i === idx ? value : o)));
  };

  const addOption = () => setOptions(prev => [...prev, ""]);
  const removeOption = (idx) => setOptions(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!canSubmit) return;
    const durationMinutes = Number(durationHours) > 0 ? Number(durationHours) * 60 : 0;
    const payload = {
      question: question.trim(),
      options: options.map(o => o.trim()).filter(Boolean),
      allowMultiple,
      // durationMinutes 0 means no explicit end
      durationMinutes: Number(durationMinutes) || 0,
    };
    onCreate?.(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create a poll</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Question</label>
            <Input
              placeholder="What would you like to ask?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Options</label>
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" /> Add option
              </Button>
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                  />
                  {options.length > 2 && (
                    <Button variant="ghost" onClick={() => removeOption(idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Allow multiple answers</label>
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Close after (hours)
            </label>
            <Input
              type="number"
              min={0}
              step={1}
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="mt-1"
            />
            <div className="text-xs text-gray-500 mt-1">Set 0 to keep the poll open.</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>Create poll</Button>
        </div>
      </div>
    </div>
  );
}


