import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, BarChart2, Clock, X } from "lucide-react";

function formatDate(value) {
  try {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
  } catch {
    return String(value ?? "-");
  }
}

export default function LastAttemptModal({ isOpen, onClose, attempt }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between w-full">
            <span>Your last attempt Score</span>
            <Button variant="ghost" size="sm" onClick={() => onClose(false)}>
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {attempt ? (
          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 p-4 bg-white">
              <div className="mb-2">
                <div className="text-sm text-gray-500">Quiz</div>
                <div className="text-base font-semibold text-gray-900">{attempt.quizTitle || attempt.quizId}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <BarChart2 size={16} className="text-indigo-500" />
                  <span>Score: <span className="font-medium">{attempt.score}</span></span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Award size={16} className="text-indigo-500" />
                  <span>Type: <span className="font-medium capitalize">{attempt.quizType || "-"}</span></span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock size={16} className="text-indigo-500" />
                  <span>Date: <span className="font-medium">{formatDate(attempt.attempt_date)}</span></span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-gray-500">Attempt ID:</span>
                  <span className="font-mono text-xs">{attempt.attemptId}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => onClose(false)} className="bg-indigo-600 hover:bg-indigo-700">Close</Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">No attempt data available.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}


