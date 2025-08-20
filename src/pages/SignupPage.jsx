import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('signup'); // 'signup' or 'login'
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'signup') {
      setSignupData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setLoginData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInputFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleInputBlur = () => {
    setFocusedField('');
  };

  const validateSignupForm = () => {
    const newErrors = {};

    if (!signupData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!signupData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!signupData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!signupData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLoginForm = () => {
    const newErrors = {};

    if (!loginData.email.trim()) {
      newErrors.loginEmail = 'Email is required';
    }

    if (!loginData.password) {
      newErrors.loginPassword = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just simulate success and pass user data to payment page
      const userData = {
        id: `user_${Date.now()}`, // Generate dummy user ID
        ...signupData
      };
      
      // Navigate to payment page with user data
      navigate('/payment', { state: { userData } });
      
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just simulate success and pass user data to payment page
      const userData = {
        id: `existing_user_${Date.now()}`, // Generate dummy user ID
        email: loginData.email,
        first_name: 'Existing',
        last_name: 'User'
      };
      
      // Navigate to payment page with user data
      navigate('/payment', { state: { userData } });
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
    if (tab === 'signup') {
      setSignupData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setLoginData({
        email: '',
        password: ''
      });
    }
  };

  const getInputIcon = (fieldName) => {
    const icons = {
      first_name: <User className="h-3 w-3 text-gray-400" />,
      last_name: <User className="h-3 w-3 text-gray-400" />,
      email: <Mail className="h-3 w-3 text-gray-400" />,
      phone: <Phone className="h-3 w-3 text-gray-400" />,
      password: <Lock className="h-3 w-3 text-gray-400" />,
      confirmPassword: <Lock className="h-3 w-3 text-gray-400" />
    };
    return icons[fieldName] || icons.email;
  };

  const handleBackNavigation = () => {
    // Check if we came from payment page to avoid navigation loop
    if (location.state?.fromPayment) {
      // If we came from payment, go to home page instead
      navigate('/');
    } else if (location.state?.fromHome) {
      // If we came from home page, go back to home
      navigate('/');
    } else {
      // Otherwise, use normal back navigation
      navigate(-1);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackNavigation}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-gray-50 hover:scale-105"
              >
                <ArrowLeft size={14} />
                <span className="text-xs">
                  {location.state?.fromPayment ? 'Back to Home' : 
                   location.state?.fromHome ? 'Back to Home' : 'Back'}
                </span>
              </button>
              <div className="h-4 w-px bg-gray-300"></div>
              <h1 className="text-base font-semibold text-gray-900">Creditors Academy</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Ultra Compact */}
      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl transform transition-all duration-300 hover:shadow-xl">
          {/* Page Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Join Creditors Academy
            </h1>
            <p className="text-sm text-gray-600">
              Create your account or sign in to access the Master Class
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-sm mx-auto">
              <button
                onClick={() => switchTab('signup')}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-4 rounded-md text-xs font-medium transition-all duration-300 ${
                  activeTab === 'signup'
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-102'
                }`}
              >
                <UserPlus size={14} />
                <span>Sign Up</span>
              </button>
              <button
                onClick={() => switchTab('login')}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-4 rounded-md text-xs font-medium transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-102'
                }`}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            </div>
          </div>
          
          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                  <p className="text-xs text-red-600 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    {errors.general}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="first_name" className="text-xs font-medium text-gray-700 mb-1 block">
                    First Name *
                  </Label>
                  <div className="relative group">
                    <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'first_name' ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {getInputIcon('first_name')}
                    </div>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={signupData.first_name}
                      onChange={(e) => handleInputChange(e, 'signup')}
                      onFocus={() => handleInputFocus('first_name')}
                      onBlur={handleInputBlur}
                      className={`pl-7 h-8 text-xs transition-all duration-200 ${
                        errors.first_name 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      } ${focusedField === 'first_name' ? 'ring-2 ring-blue-200' : ''}`}
                      placeholder="First Name"
                    />
                  </div>
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.first_name}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="last_name" className="text-xs font-medium text-gray-700 mb-1 block">
                    Last Name *
                  </Label>
                  <div className="relative group">
                    <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'last_name' ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {getInputIcon('last_name')}
                    </div>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={signupData.last_name}
                      onChange={(e) => handleInputChange(e, 'signup')}
                      onFocus={() => handleInputFocus('last_name')}
                      onBlur={handleInputBlur}
                      className={`pl-7 h-8 text-xs transition-all duration-200 ${
                        errors.last_name 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      } ${focusedField === 'last_name' ? 'ring-2 ring-blue-200' : ''}`}
                      placeholder="Last Name"
                    />
                  </div>
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="signup_email" className="text-xs font-medium text-gray-700 mb-1 block">
                  Email Address *
                </Label>
                <div className="relative group">
                  <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {getInputIcon('email')}
                  </div>
                  <Input
                    id="signup_email"
                    name="email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => handleInputChange(e, 'signup')}
                    onFocus={() => handleInputFocus('email')}
                    onBlur={handleInputBlur}
                    className={`pl-7 h-8 text-xs transition-all duration-200 ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } ${focusedField === 'email' ? 'ring-2 ring-blue-200' : ''}`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-xs font-medium text-gray-700 mb-1 block">
                  Phone Number *
                </Label>
                <div className="relative group">
                  <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === 'phone' ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {getInputIcon('phone')}
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={signupData.phone}
                    onChange={(e) => handleInputChange(e, 'signup')}
                    onFocus={() => handleInputFocus('phone')}
                    onBlur={handleInputBlur}
                    className={`pl-7 h-8 text-xs transition-all duration-200 ${
                      errors.phone 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } ${focusedField === 'phone' ? 'ring-2 ring-blue-200' : ''}`}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.phone}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="signup_password" className="text-xs font-medium text-gray-700 mb-1 block">
                    Password *
                  </Label>
                  <div className="relative group">
                    <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {getInputIcon('password')}
                    </div>
                    <Input
                      id="signup_password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={signupData.password}
                      onChange={(e) => handleInputChange(e, 'signup')}
                      onFocus={() => handleInputFocus('password')}
                      onBlur={handleInputBlur}
                      className={`pl-7 pr-7 h-8 text-xs transition-all duration-200 ${
                        errors.password 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      } ${focusedField === 'password' ? 'ring-2 ring-blue-200' : ''}`}
                      placeholder="Create a password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full px-2 hover:bg-transparent transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.password}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-700 mb-1 block">
                    Confirm Password *
                  </Label>
                  <div className="relative group">
                    <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'confirmPassword' ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {getInputIcon('confirmPassword')}
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupData.confirmPassword}
                      onChange={(e) => handleInputChange(e, 'signup')}
                      onFocus={() => handleInputFocus('confirmPassword')}
                      onBlur={handleInputBlur}
                      className={`pl-7 pr-7 h-8 text-xs transition-all duration-200 ${
                        errors.confirmPassword 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      } ${focusedField === 'confirmPassword' ? 'ring-2 ring-blue-200' : ''}`}
                      placeholder="Confirm your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-0 h-full px-2 hover:bg-transparent transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm h-8 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          )}
          
          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                  <p className="text-xs text-red-600 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    {errors.general}
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="login_email" className="text-xs font-medium text-gray-700 mb-1 block">
                  Email Address *
                </Label>
                <div className="relative group">
                  <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === 'login_email' ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {getInputIcon('email')}
                  </div>
                  <Input
                    id="login_email"
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => handleInputChange(e, 'login')}
                    onFocus={() => handleInputFocus('login_email')}
                    onBlur={handleInputBlur}
                    className={`pl-7 h-8 text-xs transition-all duration-200 ${
                      errors.loginEmail 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } ${focusedField === 'login_email' ? 'ring-2 ring-blue-200' : ''}`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.loginEmail && (
                  <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.loginEmail}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="login_password" className="text-xs font-medium text-gray-700 mb-1 block">
                  Password *
                </Label>
                <div className="relative group">
                  <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === 'login_password' ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {getInputIcon('password')}
                  </div>
                  <Input
                    id="login_password"
                    name="password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => handleInputChange(e, 'login')}
                    onFocus={() => handleInputFocus('login_password')}
                    onBlur={handleInputBlur}
                    className={`pl-7 pr-7 h-8 text-xs transition-all duration-200 ${
                      errors.loginPassword 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } ${focusedField === 'login_password' ? 'ring-2 ring-blue-200' : ''}`}
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent transition-colors duration-200"
                  >
                    {showLoginPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  </Button>
                </div>
                {errors.loginPassword && (
                  <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.loginPassword}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm h-8 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
                >
                  Sign up here
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
