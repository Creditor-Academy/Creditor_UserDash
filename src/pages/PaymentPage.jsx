import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, ArrowLeft, CreditCard, Shield, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'processing', 'success'
  const [userData, setUserData] = useState(null);
  const [hoveredMethod, setHoveredMethod] = useState(null);

  useEffect(() => {
    // Get user data from navigation state
    if (location.state?.userData) {
      setUserData(location.state.userData);
    } else {
      // If no user data, redirect back to signup
      navigate('/signup');
    }
  }, [location.state, navigate]);

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Secure credit card processing',
      icon: '💳',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      selectedColor: 'bg-blue-100 border-blue-400',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'westcoast',
      name: 'Westcoast',
      description: 'Alternative payment processor',
      icon: '🏦',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      selectedColor: 'bg-green-100 border-green-400',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with PayPal account',
      icon: '🔵',
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      selectedColor: 'bg-indigo-100 border-indigo-400',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPaymentMethod) {
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      setPaymentStep('success');
      
      // Wait a bit then redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      setPaymentStep('select');
    }
  };

  const renderPaymentSelection = () => (
    <div className="space-y-3">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Choose Your Payment Method
        </h2>
        <p className="text-sm text-gray-600">
          Select how you'd like to pay for your $69/month Master Class membership
        </p>
      </div>

      {/* User Info Display */}
      {userData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="text-xs font-medium text-white">
                {userData.first_name?.[0]}{userData.last_name?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {userData.first_name} {userData.last_name}
              </p>
              <p className="text-xs text-gray-600">{userData.email}</p>
            </div>
            <div className="ml-auto">
              <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => handlePaymentMethodSelect(method.id)}
            onMouseEnter={() => setHoveredMethod(method.id)}
            onMouseLeave={() => setHoveredMethod(null)}
            className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 transform ${
              selectedPaymentMethod === method.id
                ? method.selectedColor + ' scale-105 shadow-lg'
                : method.color + ' hover:scale-102'
            } ${selectedPaymentMethod === method.id ? 'ring-2 ring-offset-1 ring-blue-500' : ''} ${
              hoveredMethod === method.id ? 'shadow-md' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-xl transform transition-transform duration-300 hover:scale-110">
                {method.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{method.name}</h3>
                <p className="text-xs text-gray-600">{method.description}</p>
              </div>
              {selectedPaymentMethod === method.id && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 animate-bounce" />
                  <span className="text-xs text-blue-600 font-medium">Selected</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Monthly Subscription:</span>
            <span className="font-medium text-gray-900">$69.00</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Billing Cycle:</span>
            <span className="font-medium text-gray-900">Monthly</span>
          </div>
          <div className="border-t border-gray-200 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Total:</span>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                $69.00
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleProceedToPayment}
          disabled={!selectedPaymentMethod}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm h-8 min-w-[160px] transform hover:scale-105 hover:shadow-lg disabled:transform-none"
        >
          Proceed to Payment
          <ArrowRight className="ml-2 h-3 w-3 transform transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-4 py-6">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping"></div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Processing Your Payment
        </h2>
        <p className="text-sm text-gray-600">
          Please wait while we process your payment with {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}...
        </p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-4 py-6">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-lg">
        <CheckCircle className="h-6 w-6 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
          Payment Successful!
        </h2>
        <p className="text-sm text-gray-600">
          Welcome to the Creditors Academy Master Class! You'll receive a confirmation email shortly.
        </p>
      </div>
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
        <p className="text-xs text-green-800 flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Redirecting you to your dashboard...
        </p>
      </div>
    </div>
  );

  if (!userData) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping"></div>
          </div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/signup', { state: { fromPayment: true } })}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-gray-50 hover:scale-105"
              >
                <ArrowLeft size={14} />
                <span className="text-xs">Back to Signup</span>
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
          {paymentStep === 'select' && renderPaymentSelection()}
          {paymentStep === 'processing' && renderProcessing()}
          {paymentStep === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
