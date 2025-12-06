import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, CheckCircle, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// 🔊 Wave badge animation (replaces mic icon on hover)
const WaveBadge = ({ isActive }) => (
  <div className="flex items-end gap-0.5">
    {[6, 10, 14, 10, 6].map((height, idx) => (
      <div
        key={idx}
        className={`w-0.5 rounded-full ${
          isActive ? 'bg-white animate-pulse' : 'bg-white/70'
        }`}
        style={{
          height: `${height}px`,
          animationDelay: `${idx * 0.1}s`,
          animationDuration: '0.8s',
        }}
      />
    ))}
  </div>
);

const LESSON_LISTENER_COST = 500;

const VOICE_OPTIONS = [
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    description:
      'Clear, professional female voice perfect for educational content.',
    characteristics: ['Clear', 'Professional', 'Warm'],
    img: 'https://i.pravatar.cc/150?img=40',
    sampleText: "Welcome back! Let's learn something new today.",
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    description: 'Energetic and engaging voice that keeps learners motivated.',
    characteristics: ['Energetic', 'Engaging', 'Motivational'],
    img: 'https://i.pravatar.cc/150?img=60',
    sampleText: 'Hey there! Ready to dive in and have some fun learning?',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    description: 'Soft and friendly voice ideal for beginner-friendly lessons.',
    characteristics: ['Soft', 'Friendly', 'Approachable'],
    img: 'https://i.pravatar.cc/150?img=32',
    sampleText: "Hi! Let's take it step by step and make it simple.",
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    description:
      'Confident male voice with excellent clarity for technical content.',
    characteristics: ['Confident', 'Clear', 'Authoritative'],
    img: 'https://i.pravatar.cc/150?img=12',
    sampleText:
      "Let's explore the technical side of this concept with confidence.",
  },
  {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    description:
      'Young and vibrant voice perfect for interactive learning experiences.',
    characteristics: ['Vibrant', 'Youthful', 'Interactive'],
    img: 'https://i.pravatar.cc/150?img=47',
    sampleText: "Let's make learning exciting and full of energy!",
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    description:
      'Casual and conversational voice for relaxed learning environments.',
    characteristics: ['Casual', 'Conversational', 'Relaxed'],
    img: 'https://i.pravatar.cc/150?img=68',
    sampleText: "Grab a seat, let's talk through this topic together.",
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    description:
      'Deep and authoritative voice for advanced and professional content.',
    characteristics: ['Deep', 'Authoritative', 'Professional'],
    img: 'https://i.pravatar.cc/150?img=5',
    sampleText:
      "In this session, we'll break down complex ideas with precision.",
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    description:
      'Balanced and versatile voice suitable for all types of content.',
    characteristics: ['Balanced', 'Versatile', 'Adaptable'],
    img: 'https://i.pravatar.cc/150?img=20',
    sampleText:
      'This lesson brings together key concepts in a simple, clear way.',
  },
];

const LessonListenerUnlockModal = ({ open, onOpenChange, onUnlockSuccess }) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(null);
  const [hoveredVoice, setHoveredVoice] = useState(null);

  const playVoiceSample = (voice, autoPlay = false) => {
    if (playingVoice === voice.id && !autoPlay) {
      setPlayingVoice(null);
      return;
    }
    setPlayingVoice(voice.id);
    console.log(`Playing ${voice.name}: "${voice.sampleText}"`);
    setTimeout(() => setPlayingVoice(null), 4000);
  };

  const handleUnlock = async () => {
    setError('');
    setIsUnlocking(true);
    try {
      setSuccess(true);
      setTimeout(() => {
        onUnlockSuccess?.();
        onOpenChange(false);
        setSuccess(false);
      }, 2000);
    } catch {
      setError('Failed to unlock feature. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={e => e.preventDefault()}
        className="
          w-[95vw]
          sm:max-w-5xl
          p-6 sm:p-8
          bg-gradient-to-br from-gray-50 via-white to-gray-100
          rounded-2xl shadow-2xl
          max-h-[90vh]
          overflow-hidden
          flex flex-col
        "
      >
        {/* Header */}
        <DialogHeader className="flex-shrink-0 border-b border-gray-100 pb-3">
          <div className="relative mb-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 blur-xl opacity-25 rounded-full" />
            <DialogTitle className="relative text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-500" />
              Unlock Lesson Listener
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-700">
            Experience next-gen AI voices crafted for immersive learning. Choose
            your guide below.
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-5 pr-1 space-y-8">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Feature Unlocked!
              </h3>
              <p className="text-gray-600 text-sm">
                You can now enjoy AI-powered voice synthesis for all your
                lessons.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Voice Grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {VOICE_OPTIONS.map(voice => {
                  const isHovered = hoveredVoice === voice.id;
                  const isPlaying = playingVoice === voice.id;
                  return (
                    <motion.div
                      key={voice.id}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.3 }}
                      onMouseEnter={() => {
                        setHoveredVoice(voice.id);
                        if (voice.id !== playingVoice)
                          playVoiceSample(voice, true);
                      }}
                      onMouseLeave={() => setHoveredVoice(null)}
                      className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-xl cursor-pointer transition-all duration-500 h-[200px]"
                    >
                      <img
                        src={voice.img}
                        alt={voice.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                          isHovered
                            ? 'opacity-100 scale-110'
                            : 'opacity-60 scale-100'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                      <div className="relative z-10 p-4 flex flex-col justify-end h-full">
                        <h4 className="text-white font-bold text-lg mb-1">
                          {voice.name}
                        </h4>
                        <p className="text-white/90 text-xs mb-1 line-clamp-2">
                          {voice.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {voice.characteristics.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-white/30 text-white text-[10px] rounded-full"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0.9 }}
                        className="absolute top-3 right-3 z-30"
                      >
                        {isHovered || isPlaying ? (
                          <WaveBadge isActive />
                        ) : (
                          <Mic className="w-4 h-4 text-white drop-shadow" />
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Unlock Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-200 bg-white/90 backdrop-blur-md p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base mb-1">
                      Unlock Cost
                    </h3>
                    <p className="text-xs text-gray-600">
                      One-time payment to unlock forever
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {LESSON_LISTENER_COST}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      credits
                    </div>
                  </div>
                </div>
              </motion.div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-2 text-red-700 text-xs">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={isUnlocking}
                >
                  Cancel
                </Button>

                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex-1 text-sm font-medium"
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                >
                  {isUnlocking ? (
                    <>
                      <Lock className="w-3 h-3 mr-1 animate-spin" />{' '}
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-1" /> Unlock with{' '}
                      {LESSON_LISTENER_COST} Credits
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LessonListenerUnlockModal;
