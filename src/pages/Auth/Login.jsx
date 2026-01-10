import React, { useState, useEffect, useContext, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import loginBg from '/loginbg.png';

import './login.css';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  Snowflake,
  CloudSnow,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MdModeNight } from 'react-icons/md';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { SignUp } from '@/pages/Auth/SignUp';
import { storeAccessToken } from '@/services/tokenService';
import seasonalThemeConfig from '@/config/seasonalThemeConfig';
import { SeasonalThemeContext } from '@/contexts/SeasonalThemeContext';

function ForgotPassword({ onBack, email, onEmailChange }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: email.toLowerCase(),
      });
      toast.success('Password reset link sent!');
    } catch {
      toast.error('Failed to send reset link');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Label>Email Address</Label>
      <Input value={email} onChange={e => onEmailChange(e.target.value)} />

      <Button type="submit">Send Reset Link</Button>

      <Button type="button" variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sign In
      </Button>
    </form>
  );
}

export function Login() {
  const { setAuth } = useAuth();
  const { activeTheme, setTheme } = useContext(SeasonalThemeContext);

  const isSeasonalEnabled = seasonalThemeConfig.isEnabled;
  const isSeasonalActive =
    isSeasonalEnabled &&
    activeTheme === 'active';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);
  const [animateImage, setAnimateImage] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [snowflakes, setSnowflakes] = useState([]);
  const [floatingSnowflakes, setFloatingSnowflakes] = useState([]);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Audio refs
  const winterAmbienceRef = useRef(null);
  const snowSoundRef = useRef(null);
  const windSoundRef = useRef(null);

  // Initialize audio with local sound files
  useEffect(() => {
    // Use local sound files from public/sound/ directory
    winterAmbienceRef.current = new Audio('/sound/showfall.mp3');
    snowSoundRef.current = new Audio('/sound/snowfall.mp3');
    windSoundRef.current = new Audio('/sound/wind.mp3');

    // Set audio properties
    [winterAmbienceRef.current, snowSoundRef.current, windSoundRef.current].forEach(audio => {
      if (audio) {
        audio.loop = true;
        audio.volume = volume;
        audio.preload = 'auto';
        audio.muted = true; // Start muted to avoid autoplay restrictions
      }
    });

    // Cleanup on unmount
    return () => {
      [winterAmbienceRef.current, snowSoundRef.current, windSoundRef.current].forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (winterAmbienceRef.current && snowSoundRef.current && windSoundRef.current) {
      winterAmbienceRef.current.volume = volume;
      snowSoundRef.current.volume = volume;
      windSoundRef.current.volume = volume;
    }
  }, [volume]);

  // Handle sound play/pause when winter theme changes OR mute state changes
  useEffect(() => {
    if (isSeasonalActive) {
      if (isSoundMuted) {
        // If sound is muted, mute all sounds
        muteAllSounds();
      } else {
        // If sound is NOT muted, try to play all sounds
        if (hasUserInteracted) {
          // If user has interacted, we can play sounds
          playAllSounds();
        } else {
          // If no interaction yet, keep muted but ready to play
          unmuteAllSoundsButKeepPaused();
        }
      }
    } else {
      // If winter theme is not active, pause all sounds
      pauseAllSounds();
    }
  }, [isSeasonalActive, isSoundMuted, hasUserInteracted]);

  const playAllSounds = async () => {
    try {
      if (winterAmbienceRef.current && snowSoundRef.current && windSoundRef.current) {
        // Ensure audio is unmuted
        winterAmbienceRef.current.muted = false;
        snowSoundRef.current.muted = false;
        windSoundRef.current.muted = false;
        
        // Try to play with error handling
        const playPromises = [
          winterAmbienceRef.current.play().catch(e => {
            console.warn('Winter ambience play error:', e);
            return null;
          }),
          snowSoundRef.current.play().catch(e => {
            console.warn('Snow sound play error:', e);
            return null;
          }),
          windSoundRef.current.play().catch(e => {
            console.warn('Wind sound play error:', e);
            return null;
          })
        ];
        
        await Promise.all(playPromises);
      }
    } catch (err) {
      console.warn('Sound playback error:', err);
    }
  };

  const pauseAllSounds = () => {
    [winterAmbienceRef.current, snowSoundRef.current, windSoundRef.current].forEach(audio => {
      if (audio) {
        audio.pause();
      }
    });
  };

  const muteAllSounds = () => {
    [winterAmbienceRef.current, snowSoundRef.current, windSoundRef.current].forEach(audio => {
      if (audio) {
        audio.muted = true;
      }
    });
  };

  const unmuteAllSoundsButKeepPaused = () => {
    [winterAmbienceRef.current, snowSoundRef.current, windSoundRef.current].forEach(audio => {
      if (audio) {
        audio.muted = false;
      }
    });
  };

  const unmuteAndPlayAllSounds = () => {
    [winterAmbienceRef.current, snowSoundRef.current, windSoundRef.current].forEach(audio => {
      if (audio) {
        audio.muted = false;
        audio.play().catch(e => console.warn('Audio play error:', e));
      }
    });
  };

  // Handle sound mute/unmute when sound toggle changes
  const toggleSoundMute = async () => {
    // Mark that user has interacted
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    try {
      if (isSoundMuted) {
        // Unmute sounds
        setIsSoundMuted(false);
        if (isSeasonalActive) {
          await playAllSounds();
        }
      } else {
        // Mute sounds
        setIsSoundMuted(true);
        muteAllSounds();
      }
    } catch (err) {
      console.warn('Sound toggle error:', err);
      // If autoplay is blocked, show a toast
      if (err.name === 'NotAllowedError') {
        toast.info('Click the sound button again to enable winter sounds');
      }
    }
  };

  // Add click handler to the entire page to detect user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
        // If sound is not muted and winter theme is active, try to play
        if (isSeasonalActive && !isSoundMuted) {
          unmuteAndPlayAllSounds();
        }
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [hasUserInteracted, isSeasonalActive, isSoundMuted]);

  useEffect(() => {
    if (isSeasonalEnabled && activeTheme !== 'active') {
      setTheme(seasonalThemeConfig.activeTheme || 'active');
    }
  }, []);

  // Create animated snowflakes with random starting positions
  useEffect(() => {
    if (isSeasonalActive) {
      const flakes = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 8 + 4,
        duration: Math.random() * 10 + 8,
        delay: -(Math.random() * 10),
        opacity: Math.random() * 0.6 + 0.4,
        drift: Math.random() * 40 - 20,
        fallDistance: 120,
      }));
      
      setSnowflakes(flakes);

      const floatingFlakes = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 6 + 3,
        duration: Math.random() * 20 + 20,
        delay: Math.random() * 15,
      }));
      setFloatingSnowflakes(floatingFlakes);
    }
  }, [isSeasonalActive]);

  useEffect(() => {
    setAnimateCard(true);
    const t = setTimeout(() => setAnimateImage(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (res.data?.accessToken) {
        storeAccessToken(res.data.accessToken);
        setAuth(res.data.accessToken);
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Login failed');
      }
    } catch {
      setAuth(null);
      toast.error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWinterTheme = () => {
    if (isSeasonalActive) {
      setTheme('default');
      pauseAllSounds();
    } else {
      setTheme(seasonalThemeConfig.activeTheme || 'active');
      if (!isSoundMuted && hasUserInteracted) {
        playAllSounds();
      }
    }
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${isSeasonalActive ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50' : 'bg-white'}`}>

      {/* NON-WINTER FULL SCREEN BACKGROUND IMAGE */}
      {!isSeasonalActive && (
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${loginBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {isSeasonalActive && (
        <>
          <div
            className="fixed inset-0 z-0"
            style={{
              backgroundImage:
                "url('https://cdn.pixabay.com/photo/2022/12/10/11/08/trees-7646958_1280.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          <div className="fixed inset-0 z-1 bg-gradient-to-b from-blue-50/10 via-transparent to-blue-100/10" />
        </>
      )}

      {/* Winter Theme Toggle Button */}
      {isSeasonalEnabled && (
        <button
          onClick={handleToggleWinterTheme}
          className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group ${
            isSeasonalActive 
              ? 'bg-white/90 hover:bg-white' 
              : 'bg-blue-600/90 hover:bg-blue-700'
          }`}
          title={isSeasonalActive ? "Remove winter theme" : "Apply winter theme"}
        >
          <MdModeNight className={`w-6 h-6 transition-colors ${
            isSeasonalActive 
              ? 'text-blue-600 group-hover:text-blue-800' 
              : 'text-white group-hover:text-blue-100'
          }`} />
        </button>
      )}

      {/* Sound Controls - Only show when winter theme is active */}
      {isSeasonalActive && (
        <div className="fixed top-20 right-4 z-50 flex flex-col items-center gap-2">
          <button
            onClick={toggleSoundMute}
            className={`p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${
              isSoundMuted 
                ? 'bg-white/90 hover:bg-white' 
                : 'bg-blue-100/90 hover:bg-blue-100'
            }`}
            title={isSoundMuted ? "Unmute winter sounds" : "Mute winter sounds"}
          >
            {isSoundMuted ? (
              <VolumeX className="w-5 h-5 text-gray-600" />
            ) : (
              <Volume2 className="w-5 h-5 text-blue-600" />
            )}
          </button>
    
        </div>
      )}

      {/* Winter Theme Background - Full Screen Background Image */}
      {isSeasonalActive && (
        <>
          {/* Animated Snowfall - Full Screen */}
          <div className="fixed inset-0 z-2 pointer-events-none overflow-hidden">
            {snowflakes.map(flake => (
              <div
                key={flake.id}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${flake.left}%`,
                  top: `-${flake.fallDistance}px`,
                  width: `${flake.size}px`,
                  height: `${flake.size}px`,
                  opacity: flake.opacity,
                  animation: `snowfall ${flake.duration}s linear ${flake.delay}s infinite`,
                  '--drift': `${flake.drift}px`,
                  '--start-top': `-${flake.fallDistance}px`,
                  '--end-top': `110vh`,
                }}
              />
            ))}
          </div>

          {/* Floating Snowflakes - Full Screen */}
          <div className="fixed inset-0 z-3 pointer-events-none">
            {floatingSnowflakes.map(flake => (
              <div
                key={flake.id}
                className="absolute"
                style={{
                  top: `${flake.top}%`,
                  left: `${flake.left}%`,
                  width: `${flake.size}px`,
                  height: `${flake.size}px`,
                  animation: `float ${flake.duration}s ease-in-out ${flake.delay}s infinite`,
                }}
              >
                <Snowflake className="w-full h-full text-blue-100" />
              </div>
            ))}
          </div>

          {/* Animated Sparkles Effect - Full Screen */}
          <div className="fixed inset-0 z-4 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `sparkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
                }}
              >
                <Sparkles className="w-4 h-4 text-blue-200 opacity-70" />
              </div>
            ))}
          </div>
        </>
      )}
      

      <div className="relative flex min-h-screen">
        {/* Left Illustration - Only show when NOT in winter theme */}
        {!isSeasonalActive && (
          <div className="hidden lg:flex w-1/2 items-center justify-center p-10">
            <img
              src="https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/login.PNG"
              alt="Login illustration"
              className={`max-w-[420px] w-[80%] h-auto object-contain transition-all duration-700 ease-out will-change-transform 
                ${animateImage ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
              loading="eager"
            />
          </div>
        )}

        {/* Winter Theme Left Side - Only show when winter theme is active */}
        {isSeasonalActive && (
          <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-10 relative">
            {/* Glass Border Container */}
            <div
              className="
                relative z-10
                max-w-2xl w-full
                text-center space-y-10
                rounded-3xl
                border border-cyan-300/20
                bg-white/[0.015]
                backdrop-blur-sm
                shadow-[0_0_30px_rgba(59,130,246,0.12)]
                p-12
              "
            >
              {/* Welcome Text */}
              <div className="space-y-6">
                <h1
                  className="
                    font-black
                    text-blue-700
                    text-6xl sm:text-5xl lg:text-6xl xl:text-8xl
                    tracking-tight leading-none
                    drop-shadow-[0_6px_20px_rgba(59,130,246,0.6)]
                  "
                >
                  WELCOME
                </h1>

                {/* Animated underline */}
                <div className="relative w-64 h-1.5 mx-auto overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-700 to-transparent animate-shimmer" />
                </div>

                {/* Subtitle */}
                <div className="space-y-4 pt-6">
                  <p className="text-cyan-100 font-semibold text-xl sm:text-2xl lg:text-3xl tracking-wide drop-shadow">
                    to the Winter Experience
                  </p>

                  <p className="text-blue-100/90 font-medium text-base sm:text-lg lg:text-xl max-w-md mx-auto px-4 leading-relaxed drop-shadow">
                    Enter your credentials to access your secure dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side - Always visible */}
        <div className={`flex-1 relative flex items-center justify-center p-0 ${isSeasonalActive ? 'lg:w-full' : ''} `}>
          {/* Login Card */}
          <div className="w-full max-w-md relative z-10 p-6">
            {/* Winter Theme Decorative Elements */}
            {isSeasonalActive && (
              <>
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-100/20 rounded-full blur-md animate-subtle-glow z-1" />
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-200/20 rounded-full blur-md animate-subtle-glow z-1" />
              </>
            )}

            <Card
              className={`transition-all duration-700 relative overflow-hidden z-20 ${
                animateCard
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-10 opacity-0'
              } ${isSeasonalActive ? 'bg-white/[0.015] backdrop-blur-sm' : ''}`}
            >
              {/* Frost Effect Border for Winter Theme */}
              {isSeasonalActive && (
                <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-blue-100/20 via-transparent to-blue-100/20 rounded-lg pointer-events-none z-1" />
              )}

              <CardHeader className="text-center relative z-10">
                {!showSignUp && (
                  <>
                    <CardTitle
                      className={`text-2xl font-bold ${
                        isSeasonalActive
                          ? 'bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent'
                          : ''
                      }`}
                    >
                      {isSeasonalActive ? 'Welcome Back' : 'Welcome To Athena LMS'}
                    </CardTitle>

                    <CardDescription
                      className={isSeasonalActive ? 'text-blue-600/80 mt-2' : ''}
                    >
                      {isSeasonalActive
                        ? 'Sign in to your winter wonderland account'
                        : 'Enter your credentials to access your account'}
                    </CardDescription>
                  </>
                )}
              </CardHeader>

              <CardContent className="relative z-10">
                {showSignUp ? (
                  <SignUp onBack={() => setShowSignUp(false)} />
                ) : showForgotPassword ? (
                  <ForgotPassword
                    onBack={() => setShowForgotPassword(false)}
                    email={email}
                    onEmailChange={setEmail}
                  />
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label className={`font-medium ${isSeasonalActive ? "text-blue-700 flex items-center gap-2" : ""}`}>
                        {isSeasonalActive && <Snowflake className="h-4 w-4" />}
                        Email Address
                      </Label>
                      <Input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={isSeasonalActive ? 
                          "border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-blue-50/50" : 
                          ""
                        }
                        placeholder={isSeasonalActive ? "your.email@example.com" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={`font-medium ${isSeasonalActive ? "text-blue-700 flex items-center gap-2" : ""}`}>
                        {isSeasonalActive && <CloudSnow className="h-4 w-4" />}
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className={isSeasonalActive ? 
                            "border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-blue-50/50 pr-10" : 
                            "pr-10"
                          }
                          placeholder={isSeasonalActive ? "••••••••" : ""}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <span className={isSeasonalActive ? "text-blue-500" : ""}>Hide</span>
                          ) : (
                            <span className={isSeasonalActive ? "text-blue-500" : ""}>Show</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <Button 
                      className={`w-full font-medium text-base py-6 ${isSeasonalActive ? 
                        'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-200' : 
                        ''}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          {isSeasonalActive && <Snowflake className="h-5 w-5 animate-spin" />}
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {isSeasonalActive && <Snowflake className="h-5 w-5" />}
                          Sign In
                        </span>
                      )}
                    </Button>

                    {/* Additional Options */}
                    <div className="flex flex-col gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className={`text-sm hover:underline text-center ${isSeasonalActive ? 'text-blue-600 hover:text-blue-800' : 'text-gray-600'}`}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>

            </Card>
          </div>
        </div>

        
      </div>
    </div>
  );
}

export default Login;
