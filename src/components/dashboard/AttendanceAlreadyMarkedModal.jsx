import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

const AttendanceAlreadyMarkedModal = ({
  isOpen,
  onClose,
  errorMessage,
  joinLink,
}) => {
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      setIsCountingDown(false);
      return;
    }

    // Start countdown when modal opens
    setIsCountingDown(true);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCountingDown(false);
          // Open the link instantly when countdown reaches 0
          if (joinLink) {
            window.open(joinLink, '_blank');
          }
          // Close the modal immediately after opening link
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 700); // Countdown: 700ms per number (3 -> 2 -> 1 in 2.1 seconds total)

    return () => clearInterval(timer);
  }, [isOpen, joinLink, onClose]);

  // Prevent closing during countdown
  const handleOpenChange = open => {
    if (!open && isCountingDown && countdown > 0) {
      // Don't allow closing during countdown
      return;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[425px] [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-purple-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Attendance Already Marked
            </DialogTitle>
          </div>
          <DialogDescription className="text-left pt-2">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-700 mb-3">
                {errorMessage ||
                  'Attendance for this event has already been marked.'}
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg font-semibold text-purple-600">
                  Joining Again...
                </p>
                {countdown > 0 && (
                  <div className="text-4xl font-bold text-purple-600 animate-pulse">
                    {countdown}
                  </div>
                )}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceAlreadyMarkedModal;
