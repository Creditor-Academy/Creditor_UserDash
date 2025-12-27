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
          Forgot Pasword?
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
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // Trigger card animation on mount
    setAnimateCard(true);
    // Staggered image entrance
    const t = setTimeout(() => setAnimateImage(true), 50);
    return () => clearTimeout(t);
  }, []);

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

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen relative overflow-hidden login-newyear-bg">
      {/* Subtle Sparkles Background */}
      <div className="login-sparkles-container" aria-hidden="true"></div>

      {/* Year Watermark */}
      <div className="login-year-watermark" aria-hidden="true">
        {currentYear}
      </div>

      <div className="relative flex min-h-screen">
        {/* Left Side - Motivational Visual */}
        <div className="hidden lg:flex w-1/2 items-center justify-center p-10 relative">
          <div className="max-w-[420px] w-[80%] h-auto flex flex-col items-center justify-center gap-6">
            <div className="text-7xl opacity-30 animate-pulse-subtle">🎯</div>
            <div className="text-center space-y-2">
              <p className="text-white/80 text-lg font-medium">New Year</p>
              <p className="text-white/60 text-sm">New Opportunities</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Card */}
          <div className="w-full max-w-md relative z-10">
            <Card
              className={`login-newyear-card transition-all duration-700 ${animateCard ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              {/* New Year Badge */}
              <div className="absolute -top-3 right-6 z-20">
                <div className="login-newyear-badge">
                  <span className="text-xs">🎆</span>
                  <span className="text-xs font-semibold ml-1">
                    New Year Edition
                  </span>
                </div>
              </div>

              <CardHeader className="space-y-3 pb-6 pt-8">
                <div className="flex justify-center mb-2 relative">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Welcome to a New Year of Learning
                </CardTitle>
                <CardDescription className="text-center text-gray-600 text-base leading-relaxed">
                  Start fresh. Set goals. Build skills that matter.
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
                          className="text-xs font-medium transition-colors text-blue-600 hover:text-blue-700"
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
