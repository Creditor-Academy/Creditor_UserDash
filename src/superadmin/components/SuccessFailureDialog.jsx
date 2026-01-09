import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

export default function SuccessFailureDialog({
  isOpen,
  type = 'success', // 'success' or 'error'
  title = '',
  message = '',
  onClose,
  autoCloseDuration = 3000, // 3 seconds
}) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Only auto-close if autoCloseDuration is provided and greater than 0
      if (autoCloseDuration && autoCloseDuration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onClose?.();
          }, 300); // Wait for animation to complete
        }, autoCloseDuration);

        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoCloseDuration, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess
    ? 'rgba(16, 185, 129, 0.95)'
    : 'rgba(239, 68, 68, 0.95)';
  const borderColor = isSuccess ? '#10B981' : '#EF4444';
  const iconColor = isSuccess ? '#10B981' : '#EF4444';
  const lightBgColor = isSuccess
    ? 'rgba(16, 185, 129, 0.1)'
    : 'rgba(239, 68, 68, 0.1)';

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-30' : 'opacity-0'
        }`}
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
      />

      {/* Dialog */}
      <div
        className={`relative pointer-events-auto max-w-md w-full mx-4 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          isVisible
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
        }`}
        style={{
          backgroundColor: colors.bg.secondary,
          borderWidth: '2px',
          borderColor: borderColor,
        }}
      >
        {/* Animated top border accent */}
        <div
          className="h-1 w-full animate-pulse"
          style={{ backgroundColor: borderColor }}
        />

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="p-4 rounded-full animate-bounce"
              style={{ backgroundColor: lightBgColor }}
            >
              {isSuccess ? (
                <CheckCircle size={48} style={{ color: iconColor }} />
              ) : (
                <XCircle size={48} style={{ color: iconColor }} />
              )}
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-2xl font-bold text-center mb-3"
            style={{ color: colors.text.primary }}
          >
            {title}
          </h3>

          {/* Message */}
          <p
            className="text-center text-sm leading-relaxed"
            style={{ color: colors.text.secondary }}
          >
            {message}
          </p>

          {/* Progress bar - only show if auto-close is enabled */}
          {autoCloseDuration && autoCloseDuration > 0 && (
            <div
              className="mt-6 h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(200, 200, 200, 0.2)' }}
            >
              <div
                className="h-full rounded-full animate-pulse"
                style={{
                  backgroundColor: borderColor,
                  animation: `progress ${autoCloseDuration}ms linear forwards`,
                }}
              />
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={e => {
            e.stopPropagation();
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors z-10 cursor-pointer"
          style={{
            color: iconColor,
            backgroundColor: 'transparent',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Close"
          type="button"
        >
          <X size={24} />
        </button>

        {/* Decorative elements */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
          style={{
            backgroundColor: borderColor,
            transform: 'translate(50%, -50%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
          style={{
            backgroundColor: borderColor,
            transform: 'translate(-50%, 50%)',
          }}
        />
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
