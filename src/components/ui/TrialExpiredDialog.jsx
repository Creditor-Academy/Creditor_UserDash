import React from 'react';
import { X, Lock, CreditCard } from 'lucide-react';

const TrialExpiredDialog = ({ isOpen, onClose, course }) => {
  if (!isOpen) return null;

  const handleEnrollClick = () => {
    // You can implement enrollment logic here
    // For now, we'll just close the dialog
    console.log('Redirect to enrollment for course:', course?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Trial Expired</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your trial period has ended
            </h3>
            <p className="text-gray-600">
              To continue accessing "{course?.title || 'this course'}", please enroll and make payment.
            </p>
          </div>

          {/* Course Info */}
          {course && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <img
                  src={course.image || course.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"}
                  alt={course.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-1">{course.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {course.description || 'No description available'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">What you'll get:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Unlimited access to all course content
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Downloadable resources and materials
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Certificate of completion
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Lifetime access to updates
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleEnrollClick}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialExpiredDialog;
