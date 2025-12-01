import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, ChevronLeft, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  speechify,
  createAudioUrl,
  revokeAudioUrl,
} from '@/services/speechifyapi';

// Dummy text for speech synthesis
const DUMMY_TEXT =
  'Welcome to our intelligent learning platform. This is a demonstration of AI-powered voice synthesis. The system can convert any text into natural-sounding speech using advanced neural networks. You can select from multiple voices, each with unique characteristics, to find the perfect match for your learning experience.';

// ElevenLabs voice options for speech synthesis
const SPEECH_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' },
];

const LessonListener = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const TOTAL_BARS = 60;

  // Visual voice avatars for display
  const voiceAvatars = [
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

  // Speech synthesis state
  const [text, setText] = useState(DUMMY_TEXT);
  const [selectedVoiceId, setSelectedVoiceId] = useState(SPEECH_VOICES[0].id);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(
        Array.from({ length: TOTAL_BARS }, () => Math.random() * 60 + 10)
      );
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll carousel - show 3 at a time, so max index is voiceAvatars.length - 3
  useEffect(() => {
    const maxIndex = voiceAvatars.length - 3; // 6 - 3 = 3 (shows: 0-2, 1-3, 2-4, 3-5)
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (maxIndex + 1));
    }, 5000); // Change every 5 seconds (slower)
    return () => clearInterval(interval);
  }, [voiceAvatars.length]);

  const handleBack = () => {
    navigate(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/preview`
    );
  };

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        revokeAudioUrl(audioUrl);
      }
    };
  }, [audioUrl]);

  // Handle audio playback end
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        setCurrentlyPlaying(null);
      };
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioUrl]);

  const handleSpeak = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert to speech.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentlyPlaying(null);

    // Clean up previous audio URL
    if (audioUrl) {
      revokeAudioUrl(audioUrl);
      setAudioUrl(null);
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    try {
      const selectedVoice = SPEECH_VOICES.find(v => v.id === selectedVoiceId);
      const audioBlob = await speechify(text, selectedVoiceId);
      const url = createAudioUrl(audioBlob);

      setAudioUrl(url);
      setCurrentlyPlaying(selectedVoice?.name || 'Unknown');

      // Auto-play the audio
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          setError(
            'Failed to play audio. Please check your browser permissions.'
          );
        });
      }
    } catch (err) {
      console.error('Speech synthesis error:', err);
      setError(err.message || 'Failed to generate speech. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

            {/* Speech Synthesis Controls */}
            <div className="space-y-4 mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-100 shadow-sm">
              <div className="space-y-2">
                <Label
                  htmlFor="text-input"
                  className="text-base font-semibold text-gray-700"
                >
                  Text to Convert
                </Label>
                <Textarea
                  id="text-input"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Enter text to convert to speech..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="voice-select"
                  className="text-base font-semibold text-gray-700"
                >
                  Select Voice
                </Label>
                <Select
                  value={selectedVoiceId}
                  onValueChange={setSelectedVoiceId}
                >
                  <SelectTrigger id="voice-select" className="w-full">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPEECH_VOICES.map(voice => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSpeak}
                disabled={isLoading || !text.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Speech...
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" />
                    Speak
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  {error}
                </div>
              )}

              {currentlyPlaying && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 flex items-center">
                  <Volume2 className="mr-2 h-4 w-4" />
                  <span>
                    Playing voice: <strong>{currentlyPlaying}</strong>
                  </span>
                </div>
              )}

              {/* Hidden audio element for playback */}
              <audio ref={audioRef} style={{ display: 'none' }} />
            </div>
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
                  width: `${(voiceAvatars.length / 3) * 100}%`,
                }}
              >
                {voiceAvatars.map((v, i) => (
                  <div
                    key={v.id}
                    className="flex-shrink-0 flex flex-col items-center space-y-2 group cursor-pointer px-2"
                    style={{ width: `${100 / voiceAvatars.length}%` }}
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
