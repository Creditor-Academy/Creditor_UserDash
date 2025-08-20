import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, CreditCard, Shield, CheckCircle, ArrowRight } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, userData, onPaymentSuccess }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'processing', 'success'

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Secure credit card processing',
      icon: '💳',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      selectedColor: 'bg-blue-100 border-blue-400'
    },
    {
      id: 'westcoast',
      name: 'Westcoast',
      description: 'Alternative payment processor',
      icon: '🏦',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      selectedColor: 'bg-green-100 border-green-400'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with PayPal account',
      icon: '🔵',
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      selectedColor: 'bg-indigo-100 border-indigo-400'
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
      
      // Wait a bit then close modal and redirect
      setTimeout(() => {
        onClose();
        onPaymentSuccess && onPaymentSuccess(userData, selectedPaymentMethod);
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      setPaymentStep('select');
    }
  };

  const renderPaymentSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-3">
          Choose Your Payment Method
        </h3>
        <p className="text-base text-gray-600">
          Select how you'd like to pay for your $69/month Master Class membership
        </p>
      </div>

      {/* User Info Display */}
      {userData && (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-base font-medium text-blue-700">
                {userData.first_name?.[0]}{userData.last_name?.[0]}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {userData.first_name} {userData.last_name}
              </p>
              <p className="text-base text-gray-600">{userData.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => handlePaymentMethodSelect(method.id)}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedPaymentMethod === method.id
                ? method.selectedColor
                : method.color
            } ${selectedPaymentMethod === method.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{method.icon}</div>
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">{method.name}</h4>
                <p className="text-base text-gray-600">{method.description}</p>
              </div>
              {selectedPaymentMethod === method.id && (
                <CheckCircle className="h-6 w-6 text-blue-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex items-center justify-between text-base mb-3">
          <span className="text-gray-600">Monthly Subscription:</span>
          <span className="font-medium text-gray-900">$69.00</span>
        </div>
        <div className="flex items-center justify-between text-base mb-3">
          <span className="text-gray-600">Billing Cycle:</span>
          <span className="font-medium text-gray-900">Monthly</span>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-900">Total:</span>
            <span className="text-2xl font-bold text-blue-600">$69.00</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleProceedToPayment}
        disabled={!selectedPaymentMethod}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg h-14"
      >
        Proceed to Payment
        <ArrowRight className="ml-3 h-5 w-5" />
      </Button>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-8 py-12">
      <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600 mx-auto"></div>
      <div>
        <h3 className="text-xl font-medium text-gray-900 mb-3">
          Processing Your Payment
        </h3>
        <p className="text-base text-gray-600">
          Please wait while we process your payment with {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}...
        </p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-8 py-12">
      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <div>
        <h3 className="text-xl font-medium text-gray-900 mb-3">
          Payment Successful!
        </h3>
        <p className="text-base text-gray-600">
          Welcome to the Creditors Academy Master Class! You'll receive a confirmation email shortly.
        </p>
      </div>
      <div className="bg-green-50 p-6 rounded-xl">
        <p className="text-base text-green-800">
          Redirecting you to your dashboard...
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-[48rem] p-0 bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-8 pb-6">
          <DialogTitle className="flex items-center justify-between text-2xl font-semibold text-gray-900">
            <span>Complete Your Purchase</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0">
              <X size={20} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-8 pb-8">
          {paymentStep === 'select' && renderPaymentSelection()}
          {paymentStep === 'processing' && renderProcessing()}
          {paymentStep === 'success' && renderSuccess()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
