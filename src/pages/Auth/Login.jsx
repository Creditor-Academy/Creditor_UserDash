import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Gavel,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  BookOpen,
  Users,
  Award,
  ArrowLeft,
  CheckCircle,
  UserPlus,
  Phone,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import axios from 'axios';
import {
  fetchUserProfile,
  setUserRole,
  setUserRoles,
} from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { SignUp } from '@/pages/Auth/SignUp';
import { storeAccessToken } from '@/services/tokenService';
import { SeasonalThemeContext } from '@/contexts/SeasonalThemeContext';
import christmasImage from '@/assets/Chri.png';
import christmasMusic from '@/assets/christmas-music.mp3';

// ForgotPassword Component
function ForgotPassword({ onBack, email, onEmailChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await axios.post(
        `${API_BASE}/api/auth/forgot-password`,
        { email: normalizedEmail }
      );
      setIsEmailSent(true);
      toast.success(
        response.data?.message || 'Password reset email sent successfully!'
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to send reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Check Your Email
          </h3>
          <p className="text-slate-600">
            We've sent a password reset link to{' '}
            <span className="font-medium text-slate-800">{email}</span>
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Button
            onClick={() => setIsEmailSent(false)}
            variant="outline"
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Forgot Password?
        </h3>
        <p className="text-slate-600">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="forgot-email"
            className="text-sm font-medium text-slate-700"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="forgot-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => onEmailChange(e.target.value)}
              disabled={isLoading}
              required
              className="h-11 pl-10 pr-4 border-slate-200 focus:border-blue-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </div>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Button>
      </div>
    </div>
  );
}

export function Login() {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);
  const [animateImage, setAnimateImage] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isChristmasMode, setIsChristmasMode] = useState(true);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const audioRef = useRef(null); // Ref for Christmas music audio element

  useEffect(() => {
    // Check for Christmas mode from localStorage, default to true
    const checkChristmasMode = () => {
      try {
        const saved = localStorage.getItem('dashboardChristmasMode');
        // Default to true if not set
        setIsChristmasMode(saved === null ? true : saved === 'true');
      } catch {
        setIsChristmasMode(true);
      }
    };
    checkChristmasMode();
    // Listen for changes
    const handleStorageChange = () => checkChristmasMode();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Trigger card animation on mount
    setAnimateCard(true);
    // Staggered image entrance
    const t = setTimeout(() => setAnimateImage(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Christmas music effect - plays only on login page
  useEffect(() => {
    if (!isChristmasMode) {
      // Stop music if Christmas mode is disabled
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    // Create and configure audio element
    const audio = new Audio(christmasMusic);
    audio.loop = true; // Loop the music
    audio.volume = 0.3; // Set volume to 30% (adjust as needed)

    // Handle first user interaction for autoplay-restricted browsers
    const handleFirstInteraction = () => {
      if (audio && audio.paused) {
        audio.play().catch(err => console.log('Could not play music:', err));
      }
      // Remove listeners after first play
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    // Try to play the music
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('🎵 Christmas music started playing');
        })
        .catch(error => {
          // Auto-play was prevented - browser requires user interaction
          console.log(
            'Music autoplay prevented. Will start on user interaction:',
            error
          );

          // Add listeners for first user interaction
          document.addEventListener('click', handleFirstInteraction);
          document.addEventListener('keydown', handleFirstInteraction);
          document.addEventListener('touchstart', handleFirstInteraction);
        });
    }

    audioRef.current = audio;

    // Cleanup: Stop and remove audio when component unmounts or Christmas mode changes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      // Cleanup interaction listeners
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isChristmasMode]);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    // Stop Christmas music before login
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('🎵 Christmas music stopped (user logging in)');
    }

    try {
      const trimmedEmail = email.trim();
      const normalizedEmail = trimmedEmail.toLowerCase();
      const normalizedPassword = password.trim();

      const loginWithEmail = async emailToUse => {
        return axios.post(
          `${API_BASE}/api/auth/login`,
          {
            email: emailToUse,
            password: normalizedPassword,
          },
          {
            withCredentials: true,
          }
        );
      };

      let response;
      try {
        response = await loginWithEmail(trimmedEmail);
      } catch (primaryError) {
        const shouldRetryWithNormalizedEmail =
          trimmedEmail !== normalizedEmail &&
          primaryError.response?.status === 401;

        if (shouldRetryWithNormalizedEmail) {
          response = await loginWithEmail(normalizedEmail);
        } else {
          throw primaryError;
        }
      }
      if (response.data.success && response.data.accessToken) {
        // Store tokens using tokenService for consistent token storage
        storeAccessToken(response.data.accessToken);
        console.log('[Auth] Login success. Token stored.');

        // Set authentication state
        setAuth(response.data.accessToken);

        // Don't set default role - let UserContext fetch profile and set correct role
        // Dispatch userLoggedIn event to trigger UserContext profile fetch
        window.dispatchEvent(new CustomEvent('userLoggedIn'));

        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Clear any partial auth state on error
      setAuth(null);

      if (err.response) {
        const errorMessage = err.response.data?.message || 'Login failed';
        toast.error(errorMessage);
      } else if (err.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/'); // Navigate directly to homepage
  };

  // Generate snowflakes for animation - same as Dashboard
  const snowflakes = useMemo(() => {
    if (!isChristmasMode) return [];

    // Create 100 snowflakes with varied properties
    return Array.from({ length: 100 }, (_, i) => {
      const size = 3 + Math.random() * 6; // Size between 3-9px
      const left = Math.random() * 100; // Random horizontal position
      const delay = Math.random() * 2; // Start delay 0-2s for staggered effect
      const duration = 8 + Math.random() * 7; // Fall duration 8-15s (varied speeds)
      const drift = (Math.random() - 0.5) * 60; // Horizontal drift -30px to +30px
      const opacity = 0.5 + Math.random() * 0.5; // Opacity 0.5-1.0

      return {
        id: i,
        left: `${left}%`,
        size: `${size}px`,
        delay: `${delay}s`,
        duration: `${duration}s`,
        drift: `${drift}px`,
        opacity,
      };
    });
  }, [isChristmasMode]);

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        isChristmasMode ? 'login-christmas-theme' : 'bg-white'
      }`}
    >
      {isChristmasMode && (
        <>
          <div className="login-snowfall-layer" aria-hidden="true" />
          {/* Snowflake Animation - same as Dashboard */}
          <div
            className="snowflakes-container pointer-events-none"
            aria-hidden="true"
          >
            {snowflakes.map(flake => (
              <div
                key={flake.id}
                className="snowflake"
                style={{
                  left: flake.left,
                  width: flake.size,
                  height: flake.size,
                  animationDelay: flake.delay,
                  animationDuration: flake.duration,
                  opacity: flake.opacity,
                  '--snowflake-drift': flake.drift,
                }}
              />
            ))}
          </div>
        </>
      )}
      <div className="relative flex min-h-screen">
        {/* Left Illustration */}
        <div className="hidden lg:flex w-1/2 items-center justify-center p-10 relative">
          <img
            src={christmasImage}
            alt="Christmas login illustration"
            className={`max-w-[420px] w-[80%] h-auto object-contain transition-all duration-700 ease-out will-change-transform 
              ${animateImage ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
            loading="eager"
          />
        </div>

        {/* Right Wave + Card */}
        <div className="flex-1 relative flex items-center justify-center p-0">
          {/* Blue wave background */}
          <div
            className={`absolute inset-y-0 right-0 w-screen -z-0 pointer-events-none ${
              isChristmasMode ? 'text-red-500' : 'text-blue-500'
            }`}
          >
            <svg
              viewBox="0 0 800 800"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              {/* Soft back layer */}
              <path
                d="M800,0 C620,80 540,160 480,240 C420,320 380,420 220,520 C140,570 70,610 0,640 L0,800 L800,800 Z"
                fill="currentColor"
                opacity="0.18"
              />
              {/* Mid layer */}
              <path
                d="M800,0 C640,90 560,170 510,250 C450,345 400,430 260,530 C160,600 80,650 0,690 L0,800 L800,800 Z"
                fill="currentColor"
                opacity="0.28"
              />
              {/* Foreground diagonal sweep from top-right to bottom-left */}
              <path
                d="M800,0 C660,100 590,190 540,280 C470,400 390,470 300,540 C200,615 110,665 0,710 L0,800 L800,800 Z"
                fill="currentColor"
                opacity="0.92"
              />
            </svg>
          </div>

          {/* Card */}
          <div className="w-full max-w-md relative z-10 p-6">
            <Card
              className={`${
                isChristmasMode
                  ? 'login-christmas-card border-red-200 shadow-2xl'
                  : 'border-slate-200 shadow-xl'
              } transition-all duration-700 ${animateCard ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              <CardHeader className="space-y-1 pb-4">
                <div className="flex justify-center mb-2 relative">
                  {isChristmasMode && (
                    <span
                      className="absolute -top-2 -right-2 text-2xl animate-bounce"
                      aria-hidden="true"
                    >
                      🎄
                    </span>
                  )}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isChristmasMode ? 'bg-red-100' : 'bg-blue-100'
                    }`}
                  >
                    <Shield
                      className={`h-6 w-6 ${
                        isChristmasMode ? 'text-red-600' : 'text-blue-600'
                      }`}
                    />
                  </div>
                </div>
                <CardTitle
                  className={`text-xl font-medium text-center ${
                    isChristmasMode ? 'text-red-700' : 'text-slate-800'
                  }`}
                >
                  {isChristmasMode ? '🎅 Welcome back!' : 'Welcome back'}
                </CardTitle>
                <CardDescription
                  className={`text-center ${
                    isChristmasMode ? 'text-red-600' : 'text-slate-500'
                  }`}
                >
                  {isChristmasMode
                    ? 'Enter your credentials to access your festive account ❄️'
                    : 'Enter your credentials to access your account'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {showSignUp ? (
                  <SignUp onBack={() => setShowSignUp(false)} />
                ) : showForgotPassword ? (
                  <ForgotPassword
                    onBack={() => setShowForgotPassword(false)}
                    email={email}
                    onEmailChange={setEmail}
                  />
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700">
                        User ID
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pl-10 h-11 border-slate-200 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-slate-700">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          disabled={isLoading}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pl-10 pr-10 h-11 border-slate-200 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                          tabIndex={-1}
                          onClick={() => setShowPassword(v => !v)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className={`w-full h-11 text-white font-medium ${
                        isChristmasMode
                          ? 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Signing in...
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {isChristmasMode && <span>🎄</span>}
                          Sign In
                          {isChristmasMode && <span>❄️</span>}
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>

              {/* {!showSignUp && !showForgotPassword && (
                <CardFooter className="flex flex-col space-y-4 pt-2">
                  <div className="text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setShowSignUp(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      disabled={isLoading}
                    >
                      Sign up
                    </button>
                  </div>
                </CardFooter>
              )} */}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
