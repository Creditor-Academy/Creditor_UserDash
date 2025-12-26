/**
 * Course Feedback Form Component
 * Collects student feedback after course completion
 * Tracks engagement, completion, and satisfaction metrics
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, Send, AlertCircle, CheckCircle } from 'lucide-react';

const CourseFeedbackForm = ({ courseId, userId, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    completion_rate: 100,
    quiz_average_score: null,
    time_spent_minutes: 0,
    engagement_score: 75,
    comments: '',
    categories: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [error, setError] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const feedbackCategories = [
    { id: 'CONTENT_QUALITY', label: 'Content Quality' },
    { id: 'DIFFICULTY_LEVEL', label: 'Difficulty Level' },
    { id: 'ENGAGEMENT', label: 'Engagement' },
    { id: 'CLARITY', label: 'Clarity' },
    { id: 'RELEVANCE', label: 'Relevance' },
    { id: 'COMPLETENESS', label: 'Completeness' },
    { id: 'VISUAL_QUALITY', label: 'Visual Quality' },
    { id: 'PACING', label: 'Pacing' },
  ];

  const handleRatingChange = newRating => {
    setFormData(prev => ({ ...prev, rating: newRating }));
  };

  const handleCategoryToggle = categoryId => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name.includes('rate') || name.includes('score')
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate rating
      if (formData.rating < 1 || formData.rating > 5) {
        throw new Error('Please provide a rating');
      }

      const response = await axios.post(
        `/api/feedback/course/${courseId}`,
        {
          ...formData,
          ai_generated: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSubmitStatus('success');
      setExistingFeedback(response.data.data);
      setFormData({
        rating: 0,
        completion_rate: 100,
        quiz_average_score: null,
        time_spent_minutes: 0,
        engagement_score: 75,
        comments: '',
        categories: [],
      });

      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data.data);
      }

      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(
        err.response?.data?.error || err.message || 'Failed to submit feedback'
      );
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent multiple submissions: load existing feedback for this course/user
  useEffect(() => {
    const fetchExisting = async () => {
      if (!courseId) return;
      setLoadingExisting(true);
      try {
        const res = await axios.get(`/api/feedback/course/${courseId}/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.data?.data) {
          setExistingFeedback(res.data.data);
        } else {
          setExistingFeedback(null);
        }
      } catch (err) {
        // 404 means no prior feedback; ignore
        if (err.response?.status !== 404) {
          console.error('Error loading existing feedback:', err);
        }
        setExistingFeedback(null);
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchExisting();
  }, [courseId]);

  if (loadingExisting) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <p className="text-sm text-gray-600">Loading your feedback...</p>
      </div>
    );
  }

  if (existingFeedback) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Feedback already submitted
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          You have already provided feedback for this course. Feedback is
          read-only to keep results consistent.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Rating</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= existingFeedback.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-700">
                {existingFeedback.rating} / 5
              </span>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Completion</p>
            <p className="text-lg font-semibold text-gray-800">
              {existingFeedback.completion_rate || 0}%
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Engagement</p>
            <p className="text-lg font-semibold text-gray-800">
              {existingFeedback.engagement_score || 0}%
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Quiz Score</p>
            <p className="text-lg font-semibold text-gray-800">
              {existingFeedback.quiz_average_score ?? 'N/A'}
            </p>
          </div>
        </div>
        {existingFeedback.feedback_categories && (
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-sm text-gray-800 mt-1">
              {Array.isArray(existingFeedback.feedback_categories)
                ? existingFeedback.feedback_categories.join(', ')
                : existingFeedback.feedback_categories}
            </p>
          </div>
        )}
        {existingFeedback.comment && (
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Comments</p>
            <p className="text-sm text-gray-800 mt-1">
              {existingFeedback.comment}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Course Feedback
        </h2>
        <p className="text-gray-600">
          Help us improve by sharing your experience with this course
        </p>
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">
            Thank you! Your feedback has been recorded.
          </span>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Overall Course Rating *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= formData.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {formData.rating > 0
              ? `${formData.rating} out of 5 stars`
              : 'Click to rate'}
          </p>
        </div>

        {/* Feedback Categories */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            What aspects would you like to comment on? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {feedbackCategories.map(category => (
              <label
                key={category.id}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition"
              >
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Completion Rate */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Course Completion Rate (%)
          </label>
          <input
            type="range"
            name="completion_rate"
            min="0"
            max="100"
            step="10"
            value={formData.completion_rate}
            onChange={handleInputChange}
            className="w-full"
          />
          <p className="mt-2 text-sm text-gray-600">
            {formData.completion_rate}% completed
          </p>
        </div>

        {/* Engagement Score */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Engagement Level (0-100)
          </label>
          <input
            type="range"
            name="engagement_score"
            min="0"
            max="100"
            step="5"
            value={formData.engagement_score}
            onChange={handleInputChange}
            className="w-full"
          />
          <p className="mt-2 text-sm text-gray-600">
            {formData.engagement_score}% engaged
          </p>
        </div>

        {/* Time Spent */}
        <div>
          <label
            htmlFor="time_spent"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Time Spent on Course (minutes)
          </label>
          <input
            type="number"
            id="time_spent"
            name="time_spent_minutes"
            min="0"
            value={formData.time_spent_minutes}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 120"
          />
        </div>

        {/* Quiz Score (Optional) */}
        <div>
          <label
            htmlFor="quiz_score"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Final Quiz Score (Optional, 0-100)
          </label>
          <input
            type="number"
            id="quiz_score"
            name="quiz_average_score"
            min="0"
            max="100"
            step="0.5"
            value={formData.quiz_average_score || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 85.5"
          />
        </div>

        {/* Comments */}
        <div>
          <label
            htmlFor="comments"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Additional Comments
          </label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Share your thoughts about the course, what you liked, what could be improved..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || formData.rating === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your feedback helps us improve course quality
          and create better learning experiences for future students.
        </p>
      </div>
    </div>
  );
};

export default CourseFeedbackForm;
