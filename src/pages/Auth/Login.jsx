import React, { useState, useEffect } from 'react';
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
import snowImage from '@/assets/snow.png';
import decorImage from '@/assets/decor.png';
import loImage from '@/assets/lo.png';

// Countdown Component with Premium Animations
function NewYearCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [prevTimeLeft, setPrevTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [phase, setPhase] = useState('countdown'); // 'countdown' or 'welcome'

  useEffect(() => {
    // Set target date to January 1, 2026 at 00:00:00
    const targetDate = new Date('2026-01-01T00:00:00').getTime();
    // Phase 2 ends on January 3, 2026 at 23:59:59
    const phase2EndDate = new Date('2026-01-03T23:59:59').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();

      // Check if we're in Phase 2 (Jan 1-3)
      if (now >= targetDate && now <= phase2EndDate) {
        setPhase(prev => (prev !== 'welcome' ? 'welcome' : prev));
        return;
      }

      // Check if countdown has ended but we're past Phase 2
      if (now > phase2EndDate) {
        setPhase(prev => (prev !== 'welcome' ? 'welcome' : prev));
        return;
      }

      const difference = targetDate - now;

      if (difference <= 0) {
        setPhase(prev => (prev !== 'welcome' ? 'welcome' : prev));
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(prev => {
        setPrevTimeLeft(prev);
        return { days, hours, minutes, seconds };
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []); // Empty deps - only run once on mount

  const formatNumber = num => String(num).padStart(2, '0');

  // Phase 2: Welcome Message (morphs from countdown)
  if (phase === 'welcome') {
    return (
      <div className="countdown-message">
        <h2 className="countdown-welcome-title">Welcome to the New Year</h2>
        <p className="countdown-welcome-subtitle">
          Fresh goals. Focused learning.
        </p>
      </div>
    );
  }

  // Phase 1: Countdown with Premium Animations - Flip Clock Style
  const renderFlipCard = (value, label, prevValue, shouldAnimate) => {
    const digits = formatNumber(value).split('');
    const prevDigits = formatNumber(prevValue).split('');

    return (
      <div className="countdown-flip-group">
        <div className="countdown-flip-cards">
          {digits.map((digit, index) => (
            <div
              key={`${label}-${index}-${digit}`}
              className={`countdown-flip-card ${shouldAnimate && prevDigits[index] !== digit ? 'flip-animate' : ''}`}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <span className="flip-digit">{digit}</span>
                </div>
                <div className="flip-card-back">
                  <span className="flip-digit">{prevDigits[index] || '0'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <span className="countdown-label">{label}</span>
      </div>
    );
  };

  return (
    <div className="countdown-container">
      <div className="countdown-display">
        {renderFlipCard(
          timeLeft.days,
          'DAYS',
          prevTimeLeft.days,
          prevTimeLeft.days !== timeLeft.days
        )}
        <span className="countdown-separator">:</span>
        {renderFlipCard(
          timeLeft.hours,
          'HOURS',
          prevTimeLeft.hours,
          prevTimeLeft.hours !== timeLeft.hours
        )}
        <span className="countdown-separator">:</span>
        {renderFlipCard(
          timeLeft.minutes,
          'MINUTES',
          prevTimeLeft.minutes,
          prevTimeLeft.minutes !== timeLeft.minutes
        )}
        <span className="countdown-separator">:</span>
        {renderFlipCard(
          timeLeft.seconds,
          'SECONDS',
          prevTimeLeft.seconds,
          true
        )}
      </div>
    </div>
  );
}

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
          <h3 className="text-xl font-semibold text-white mb-2">
            Check Your Email
          </h3>
          <p className="text-white/80">
            We've sent a password reset link to{' '}
            <span className="font-medium text-white">{email}</span>
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-white/70">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Button
            onClick={() => setIsEmailSent(false)}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
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
        <h3 className="text-xl font-semibold text-white mb-2">
          Forgot Password?
        </h3>
        <p className="text-white/80">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="forgot-email"
            className="text-sm font-medium text-white/90"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              id="forgot-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => onEmailChange(e.target.value)}
              disabled={isLoading}
              required
              className="h-11 pl-10 pr-4 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 login-newyear-button font-medium"
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
          className="text-white/80 hover:text-white hover:bg-white/10"
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

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

  const currentYear = 2026;

  return (
    <div
      className="min-h-screen relative overflow-hidden login-newyear-bg"
      style={{
        '--snow-image': `url(${snowImage})`,
      }}
    >
      {/* Subtle Sparkles Background */}
      <div className="login-sparkles-container" aria-hidden="true"></div>

      <div className="relative flex min-h-screen z-10">
        {/* Left Side - Message Card */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-8 lg:p-12">
          {/* Decor Image - Top Left Corner */}
          <img
            src={decorImage}
            alt="Decorative ornament"
            className="login-decor-image"
          />
          {/* Main Image on Left Side */}
          <img
            src={loImage}
            alt="Learning professionals"
            className="login-left-image"
          />
          <div className="login-message-card">
            <div className="countdown-wrapper">
              <NewYearCountdown />
            </div>
          </div>
        </div>

        {/* Mobile Message - Shown only on small screens */}
        <div className="lg:hidden absolute top-8 left-0 right-0 px-6 z-10 text-center">
          <h1 className="login-message-headline-mobile">
            <span className="headline-small">New year.</span>
            <span className="headline-script-mobile">
              same commitment to learning.
            </span>
          </h1>
        </div>

        {/* Login Card - Right Side */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Card */}
          <div className="w-full max-w-md relative z-10">
            <Card className="login-newyear-card">
              <CardHeader className="space-y-3 pb-6 pt-8 relative z-10 login-newyear-card-header-accent">
                <div className="flex justify-center mb-2 relative">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg border border-white/20">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center text-white">
                  Welcome to a New Year of Learning
                </CardTitle>
                <CardDescription className="text-center text-white/80 text-base leading-relaxed">
                  Start fresh. Set goals. Build skills that matter.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 relative z-10">
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
                      <Label htmlFor="email" className="text-white/90">
                        User ID
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pl-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-white/90">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs font-medium transition-colors text-blue-300 hover:text-blue-200"
                          disabled={isLoading}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pl-10 pr-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 focus:outline-none transition-colors"
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
                      className="w-full h-12 text-white font-semibold login-newyear-button transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Starting your journey...
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span>Start My Learning Journey</span>
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Support Statement */}
            {!showSignUp && !showForgotPassword && (
              <div className="mt-4 text-center">
                <div className="text-sm text-white font-medium space-y-2">
                  <p className="text-white font-semibold">
                    For Login related issues email us at:{' '}
                    <a
                      href="mailto:support@creditoracademy.com"
                      className="text-yellow-300 hover:text-yellow-200 transition-colors underline font-bold"
                    >
                      support@creditoracademy.com
                    </a>
                  </p>
                  <p className="text-white font-semibold">
                    Or You can schedule a meeting with us at this link:{' '}
                    <a
                      href="https://calendly.com/creditor-academy/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-300 hover:text-yellow-200 transition-colors underline font-bold"
                    >
                      Click Here
                    </a>
                  </p>
                </div>
              </div>
            )}

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
