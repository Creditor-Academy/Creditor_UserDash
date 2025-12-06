import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  ChevronLeft,
  Loader2,
  Lock,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import LessonListenerUnlockModal from '@/components/lessonlistener/LessonListenerUnlockModal';
import { motion, AnimatePresence } from 'framer-motion';

// Voice options with full details
const VOICE_OPTIONS = [
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    characteristics: ['Clear', 'Professional', 'Warm'],
    tagline: 'Calm instructor, great for structured walkthroughs',
    img: 'https://i.pravatar.cc/150?img=40',
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    characteristics: ['Energetic', 'Engaging', 'Motivational'],
    tagline: 'High-energy coach for quick momentum',
    img: 'https://i.pravatar.cc/150?img=60',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    characteristics: ['Soft', 'Friendly', 'Approachable'],
    tagline: 'Supportive guide for foundational topics',
    img: 'https://i.pravatar.cc/150?img=32',
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    characteristics: ['Confident', 'Clear', 'Authoritative'],
    tagline: 'Authoritative presenter for technical details',
    img: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    characteristics: ['Vibrant', 'Youthful', 'Interactive'],
    tagline: 'Interactive partner for back-and-forth learning',
    img: 'https://i.pravatar.cc/150?img=47',
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    characteristics: ['Casual', 'Conversational', 'Relaxed'],
    tagline: 'Casual explainer for conversational lessons',
    img: 'https://i.pravatar.cc/150?img=68',
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    characteristics: ['Deep', 'Authoritative', 'Professional'],
    tagline: 'Executive tone for strategy and decisioning',
    img: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    characteristics: ['Balanced', 'Versatile', 'Adaptable'],
    tagline: 'Versatile choice for mixed content',
    img: 'https://i.pravatar.cc/150?img=20',
  },
  {
    id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    characteristics: ['Friendly', 'Approachable', 'Natural'],
    tagline: 'Natural, approachable tone for everyday topics',
    img: 'https://i.pravatar.cc/150?img=15',
  },
];

const LESSON_BLOCKS = [
  {
    type: 'headline',
    title: 'Credit Optimization Blueprint',
    subtitle: 'Build a plan to raise your score and lower your costs',
    details: [
      'Focus: utilization, payment history, inquiries, and account mix.',
      'Outcome: predictable, low-variance score gains over 90 days.',
      'Constraint: avoid new hard pulls unless they materially lower APR.',
    ],
  },
  {
    type: 'textImage',
    title: 'Utilization Wins',
    body: 'Keep revolving utilization under 10-30% across cards. Distribute balances, request limit increases, and schedule mid-cycle payments to keep reported utilization low.',
    details: [
      'Target: total and per-card utilization under 10% for reporting dates.',
      'Move balances away from cards with tight limits to spread exposure.',
      'Request soft-pull limit increases on clean accounts every 90 days.',
    ],
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
  },
  {
    type: 'timeline',
    title: '90-Day Credit Sprint',
    steps: [
      'Week 1: Pull reports, dispute clear errors, set autopay',
      'Week 2-3: Pay down high-utilization cards, add mid-cycle payments',
      'Week 4-6: Add a no-fee card or authorized user for more capacity',
      'Week 7-12: Keep utilization low, avoid hard pulls, age accounts',
    ],
    highlights: [
      'Anchor statement dates; pay 3-5 days before to control reported balance.',
      'Stagger payments so every high-APR card gets touched twice per cycle.',
      'If adding a card, prefer no-fee, soft-pull prequal, and high limit potential.',
    ],
  },
  {
    type: 'checklist',
    title: 'Optimization Checklist',
    items: [
      'Set autopay to at least statement minimums',
      'Schedule two payments per cycle on high-balance cards',
      'Dispute obvious errors (duplicates, misreported limits)',
      'Avoid new hard inquiries unless essential',
    ],
    notes: [
      'Keep one small recurring charge on low-utilization cards to show activity.',
      'If a dispute is filed, track bureau responses and follow up within 30 days.',
      'Pause new financing unless it directly lowers utilization or APR.',
    ],
  },
  {
    type: 'cta',
    title: 'Next Up',
    action: 'Plan your next statement date actions',
    note: 'Pick 2 cards to pay mid-cycle and update limits if eligible',
    detail:
      'Capture statement dates, set two mid-cycle payments, and pre-request soft limit increases on clean tradelines.',
  },
];

const LessonListener = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const TOTAL_BARS = 60;

  // Feature unlock state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingUnlock, setCheckingUnlock] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const [bars, setBars] = useState(
    Array.from({ length: TOTAL_BARS }, () => Math.random() * 50 + 15)
  );

  // Experience state
  const [mode, setMode] = useState('select'); // select | blocks
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  const [stack, setStack] = useState(LESSON_BLOCKS);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);

  // Check if feature is unlocked
  useEffect(() => {
    // Always require unlock when entering the page; no API call
    setIsUnlocked(false);
    setShowUnlockModal(true);
    setCheckingUnlock(false);
  }, [userProfile?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(
        Array.from({ length: TOTAL_BARS }, () => Math.random() * 60 + 10)
      );
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    navigate(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/preview`
    );
  };

  const handleStart = () => {
    if (!selectedVoiceId) return;
    setMode('blocks');
  };

  const handleNextBlock = () => {
    setStack(prev => {
      if (!prev.length) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
    setActiveBlockIndex(0);
  };

  // Reset stack when entering blocks mode
  useEffect(() => {
    if (mode !== 'blocks') return;
    setStack(LESSON_BLOCKS);
    setActiveBlockIndex(0);
  }, [mode]);

  // Show locked state if not unlocked
  if (checkingUnlock) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking feature access...</p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Lesson Listener is Locked
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            This premium feature allows you to convert your lessons into
            natural-sounding speech with AI-powered voice synthesis. Unlock it
            to access 9 professional voices and enhance your learning
            experience.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                Unlock Cost: 500 Credits
              </span>
            </div>
            <p className="text-sm text-blue-700">
              One-time payment to unlock forever
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={handleBack} className="px-6">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Lesson
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              onClick={() => setShowUnlockModal(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Unlock Feature
            </Button>
          </div>
        </div>
        <LessonListenerUnlockModal
          open={showUnlockModal}
          onOpenChange={setShowUnlockModal}
          onUnlockSuccess={() => {
            setIsUnlocked(true);
            setShowUnlockModal(false);
          }}
        />
      </div>
    );
  }

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
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            {mode === 'select' ? (
              <motion.div
                key="voice-select"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="mx-auto max-w-3xl bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-8 text-center space-y-6"
              >
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">
                    Voice Selection
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Choose Your Lesson Voice
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Let’s make learning sound better.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  {VOICE_OPTIONS.map(voice => {
                    const isSelected = selectedVoiceId === voice.id;
                    return (
                      <motion.button
                        key={voice.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedVoiceId(voice.id)}
                        className={`relative w-32 h-40 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 px-3 ${
                          isSelected
                            ? 'border-gray-900 bg-gray-50 shadow-lg shadow-gray-200/80'
                            : 'border-gray-200 hover:border-gray-400 bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={voice.img}
                            alt={voice.name}
                            className="w-14 h-14 rounded-full object-cover border border-gray-200"
                          />
                          {isSelected && (
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] shadow-md">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {voice.name}
                        </div>
                        <p className="text-[11px] text-gray-600 text-center leading-snug">
                          {voice.tagline}
                        </p>
                        <div className="flex gap-1 flex-wrap justify-center">
                          {voice.characteristics.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: selectedVoiceId ? 1 : 0.4 }}
                  className="pt-2"
                >
                  <Button
                    onClick={handleStart}
                    disabled={!selectedVoiceId}
                    className="w-full md:w-auto px-10 py-4 text-lg font-semibold bg-gray-900 hover:bg-gray-800 text-white shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Start Lesson
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="lesson-blocks"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <p className="text-sm text-gray-700 font-semibold">
                    Lesson Blocks
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Your lesson is unfolding
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Cards overlay and cycle as you progress.
                  </p>
                </div>

                <div className="relative h-[520px] max-w-3xl mx-auto">
                  <AnimatePresence>
                    {stack.slice(0, 3).map((block, idx) => {
                      const depth = 3 - idx;
                      return (
                        <motion.div
                          key={`${block.title}-${idx}`}
                          initial={{ opacity: 0, y: 30, scale: 0.97 }}
                          animate={{
                            opacity: 1,
                            y: idx * 16,
                            scale: 1 - idx * 0.03,
                          }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          transition={{ duration: 0.35 }}
                          className="absolute inset-0"
                          style={{ zIndex: depth }}
                        >
                          <div className="rounded-2xl border border-gray-200 shadow-xl bg-white p-6 h-full flex flex-col justify-between">
                            <div className="space-y-4">
                              {block.type === 'headline' && (
                                <div className="space-y-2">
                                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">
                                    Start
                                  </div>
                                  <h3 className="text-2xl font-bold text-gray-900">
                                    {block.title}
                                  </h3>
                                  <p className="text-gray-600 text-sm">
                                    {block.subtitle}
                                  </p>
                                  {block.details && (
                                    <ul className="text-gray-700 text-sm leading-relaxed space-y-1 list-disc list-inside">
                                      {block.details.map(item => (
                                        <li key={item}>{item}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}

                              {block.type === 'textImage' && (
                                <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-center">
                                  <div className="space-y-3">
                                    <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">
                                      Concept
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                      {block.title}
                                    </h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                      {block.body}
                                    </p>
                                    {block.details && (
                                      <ul className="text-gray-700 text-sm leading-relaxed space-y-1 list-disc list-inside">
                                        {block.details.map(item => (
                                          <li key={item}>{item}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                  <div className="relative h-40 rounded-xl overflow-hidden">
                                    <img
                                      src={block.image}
                                      alt={block.title}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/10" />
                                  </div>
                                </div>
                              )}

                              {block.type === 'timeline' && (
                                <div className="space-y-3">
                                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">
                                    Flow
                                  </div>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {block.title}
                                  </h3>
                                  <div className="flex flex-col gap-3">
                                    {block.steps.map((step, sIdx) => (
                                      <div
                                        key={step}
                                        className="flex items-start gap-3"
                                      >
                                        <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                                          {sIdx + 1}
                                        </div>
                                        <div className="text-gray-700 text-sm leading-relaxed">
                                          {step}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  {block.highlights && (
                                    <ul className="text-gray-700 text-sm leading-relaxed space-y-1 list-disc list-inside pt-1">
                                      {block.highlights.map(item => (
                                        <li key={item}>{item}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}

                              {block.type === 'checklist' && (
                                <div className="space-y-3">
                                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">
                                    Quick Wins
                                  </div>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {block.title}
                                  </h3>
                                  <div className="grid sm:grid-cols-2 gap-2">
                                    {block.items.map(item => (
                                      <div
                                        key={item}
                                        className="flex items-start gap-2 rounded-lg border border-gray-200 px-3 py-2 bg-gray-50"
                                      >
                                        <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                                        <span className="text-sm text-gray-700 leading-snug">
                                          {item}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  {block.notes && (
                                    <ul className="text-gray-700 text-sm leading-relaxed space-y-1 list-disc list-inside">
                                      {block.notes.map(item => (
                                        <li key={item}>{item}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}

                              {block.type === 'cta' && (
                                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                                  <div className="space-y-1 text-center md:text-left">
                                    <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">
                                      Next Step
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                      {block.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                      {block.note}
                                    </p>
                                    {block.detail && (
                                      <p className="text-gray-700 text-sm leading-relaxed">
                                        {block.detail}
                                      </p>
                                    )}
                                  </div>
                                  <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3">
                                    {block.action}
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 text-right pt-4">
                              Swipe / Next to continue
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleNextBlock}
                    className="px-6 py-3 border-gray-300 text-gray-800 hover:bg-gray-100"
                  >
                    Next Block
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LessonListener;
