import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, TrendingUp } from 'lucide-react';

export function NewYearWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if modal has been shown this year
    const currentYear = new Date().getFullYear();
    const key = `newYearWelcomeSeen_${currentYear}`;
    const hasSeen = localStorage.getItem(key);

    if (!hasSeen) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    const currentYear = new Date().getFullYear();
    const key = `newYearWelcomeSeen_${currentYear}`;
    localStorage.setItem(key, 'true');
    setIsOpen(false);
  };

  const handleStartJourney = () => {
    handleClose();
    // Navigate to courses or dashboard
    window.location.href = '/dashboard/courses';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <Target className="h-12 w-12 text-yellow-500 relative z-10" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Welcome to a New Year of Learning 🎯
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Fresh start, new goals, endless growth opportunities await you.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Set New Goals</p>
              <p className="text-sm text-gray-600">
                Define what you want to achieve this year
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Track Progress</p>
              <p className="text-sm text-gray-600">
                Monitor your learning journey and celebrate milestones
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleStartJourney}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Start My Learning Journey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewYearWelcomeModal;
