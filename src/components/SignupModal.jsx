import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, User, Mail, Phone, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

const SignupModal = ({ isOpen, onClose, onSignupSuccess, onLoginSuccess }) => {
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
      
      // For now, just simulate success and pass user data to payment modal
      const userData = {
        id: `user_${Date.now()}`, // Generate dummy user ID
        ...signupData
      };
      
      // Close signup modal and open payment modal
      onClose();
      onSignupSuccess(userData);
      
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
      
      // For now, just simulate success and pass user data to payment modal
      const userData = {
        id: `existing_user_${Date.now()}`, // Generate dummy user ID
        email: loginData.email,
        first_name: 'Existing',
        last_name: 'User'
      };
      
      // Close signup modal and open payment modal
      onClose();
      onSignupSuccess(userData);
      
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-[40rem] p-0 bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-8 pb-6">
          <DialogTitle className="flex items-center justify-between text-2xl font-semibold text-gray-900">
            <span>Join Creditors Academy</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0">
              <X size={20} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {/* Tab Navigation */}
        <div className="px-8 pb-6">
          <div className="flex space-x-2 bg-gray-100 p-2 rounded-xl">
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 flex items-center justify-center space-x-3 py-3 px-6 rounded-lg text-base font-medium transition-all duration-200 ${
                activeTab === 'signup'
                  ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <UserPlus size={20} />
              <span>Sign Up</span>
            </button>
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 flex items-center justify-center space-x-3 py-3 px-6 rounded-lg text-base font-medium transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </button>
          </div>
        </div>
        
        {/* Signup Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="px-8 pb-8 space-y-6">
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="first_name" className="text-base font-medium text-gray-700 mb-2 block">
                  First Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={signupData.first_name}
                    onChange={(e) => handleInputChange(e, 'signup')}
                    className={`pl-12 h-12 text-base ${errors.first_name ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="First Name"
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-2 text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="last_name" className="text-base font-medium text-gray-700 mb-2 block">
                  Last Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={signupData.last_name}
                    onChange={(e) => handleInputChange(e, 'signup')}
                    className={`pl-12 h-12 text-base ${errors.last_name ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Last Name"
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-2 text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="signup_email" className="text-base font-medium text-gray-700 mb-2 block">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="signup_email"
                  name="email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => handleInputChange(e, 'signup')}
                  className={`pl-12 h-12 text-base ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone" className="text-base font-medium text-gray-700 mb-2 block">
                Phone Number *
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => handleInputChange(e, 'signup')}
                  className={`pl-12 h-12 text-base ${errors.phone ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="(555) 123-4567"
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="signup_password" className="text-base font-medium text-gray-700 mb-2 block">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="signup_password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={signupData.password}
                    onChange={(e) => handleInputChange(e, 'signup')}
                    className={`pl-12 pr-12 h-12 text-base ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Create a password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="text-base font-medium text-gray-700 mb-2 block">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupData.confirmPassword}
                    onChange={(e) => handleInputChange(e, 'signup')}
                    className={`pl-12 pr-12 h-12 text-base ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg h-14"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <p className="text-sm text-gray-500 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        )}
        
        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="px-8 pb-8 space-y-6">
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="login_email" className="text-base font-medium text-gray-700 mb-2 block">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="login_email"
                  name="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => handleInputChange(e, 'login')}
                  className={`pl-12 h-12 text-base ${errors.loginEmail ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.loginEmail && (
                <p className="mt-2 text-sm text-red-600">{errors.loginEmail}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="login_password" className="text-base font-medium text-gray-700 mb-2 block">
                Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="login_password"
                  name="password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => handleInputChange(e, 'login')}
                  className={`pl-12 pr-12 h-12 text-base ${errors.loginPassword ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              {errors.loginPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.loginPassword}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors text-lg h-14"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <p className="text-sm text-gray-500 text-center">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up here
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;
