import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LessonListener = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const TOTAL_BARS = 60;

  const voices = [
    { id: 1, img: 'https://i.pravatar.cc/150?img=40', label: 'Mentor' },
    { id: 2, img: 'https://i.pravatar.cc/150?img=60', label: 'Instructor' },
    { id: 3, img: 'https://i.pravatar.cc/150?img=32', label: 'Narrator' },
    { id: 4, img: 'https://i.pravatar.cc/150?img=12', label: 'Guide' },
    { id: 5, img: 'https://i.pravatar.cc/150?img=47', label: 'Teacher' },
    { id: 6, img: 'https://i.pravatar.cc/150?img=68', label: 'Coach' },
  ];

  const [bars, setBars] = useState(
    Array.from({ length: TOTAL_BARS }, () => Math.random() * 50 + 15)
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(
        Array.from({ length: TOTAL_BARS }, () => Math.random() * 60 + 10)
      );
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll carousel - show 3 at a time, so max index is voices.length - 3
  useEffect(() => {
    const maxIndex = voices.length - 3; // 6 - 3 = 3 (shows: 0-2, 1-3, 2-4, 3-5)
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (maxIndex + 1));
    }, 5000); // Change every 5 seconds (slower)
    return () => clearInterval(interval);
  }, [voices.length]);

  const handleBack = () => {
    navigate(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/preview`
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Back Button - Fixed at top left */}
      <div className="absolute top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="bg-white/90 hover:bg-white shadow-md border border-gray-200/50 backdrop-blur-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Lesson
        </Button>
      </div>

      {/* Minimal animated sound lines background - sharper on right side */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
        <div
          className="flex items-center w-full max-w-5xl justify-between px-12"
          style={{ marginTop: '-10%' }}
        >
          {bars.map((h, i) => {
            const gradient =
              i > TOTAL_BARS / 2
                ? 'linear-gradient(180deg, rgba(37, 99, 235, 0.9) 0%, rgba(139, 92, 246, 0.9) 50%, rgba(37, 99, 235, 0.6) 100%)'
                : 'linear-gradient(180deg, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(59, 130, 246, 0.3) 100%)';
            const opacity = i > TOTAL_BARS / 2 ? 0.8 : 0.3;

            return (
              <div
                key={i}
                style={{
                  height: `${h}px`,
                  transition: 'height 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: gradient,
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                  opacity,
                }}
                className="w-[2px] rounded-full"
              />
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-5xl grid md:grid-cols-2 items-center gap-16">
          {/* Left: Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
              Listen to your lessons{' '}
              <span className="text-blue-600">in intelligent voices</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Experience AI-assisted learning that adapts tone, clarity, and
              pace — designed for your understanding.
            </p>
          </div>

          {/* Right: Mic + voice avatars - Straight horizontal layout */}
          <div className="relative flex flex-col items-center justify-center space-y-8">
            {/* Mic */}
            <div className="relative w-32 h-32 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center shadow-lg shadow-blue-200/50">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50"></div>
              <Mic className="w-8 h-8 text-blue-600 relative z-10" />
              {/* Pulse effect */}
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
            </div>

            {/* Voice avatars - Carousel showing 3 at a time */}
            <div className="relative w-full max-w-2xl overflow-hidden mx-auto">
              <div
                className="flex items-center transition-transform duration-1000 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / 3)}%)`,
                  width: `${(voices.length / 3) * 100}%`,
                }}
              >
                {voices.map((v, i) => (
                  <div
                    key={v.id}
                    className="flex-shrink-0 flex flex-col items-center space-y-2 group cursor-pointer px-2"
                    style={{ width: `${100 / voices.length}%` }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                      <img
                        src={v.img}
                        alt={v.label}
                        className="w-20 h-20 rounded-full border-2 border-blue-300 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:border-blue-500"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                      {v.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonListener;
