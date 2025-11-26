import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import sponsorService from '@/services/sponsorService';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Loader2,
  CreditCard,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SponsorPayment = () => {
  const navigate = useNavigate();
  const { submissionId } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { userProfile } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [submission, setSubmission] = useState(null);

  const tier = searchParams.get('tier') || 'Bronze';
  const amount = searchParams.get('amount') || '99';

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    setLoading(true);
    try {
      const data = await sponsorService.getSubmissionById(submissionId);
      setSubmission(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load submission details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCardNumber = value => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = value => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate payment data
    if (
      !paymentData.cardNumber ||
      !paymentData.cardName ||
      !paymentData.expiryDate ||
      !paymentData.cvv
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required payment fields.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify payment
      await sponsorService.verifyPayment(submissionId, 'mock_payment_id');

      toast({
        title: 'Payment Successful!',
        description: 'Your ad has been submitted for review.',
      });

      navigate('/dashboard/sponsor');
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description:
          'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/sponsor')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
        <p className="text-gray-600 mt-2">
          Secure payment for your ad campaign
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={20} />
                Payment Information
              </CardTitle>
              <CardDescription>
                All transactions are secure and encrypted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">
                    Card Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={e =>
                      handleInputChange(
                        'cardNumber',
                        formatCardNumber(e.target.value)
                      )
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>

                {/* Cardholder Name */}
                <div className="space-y-2">
                  <Label htmlFor="cardName">
                    Cardholder Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cardName"
                    value={paymentData.cardName}
                    onChange={e =>
                      handleInputChange('cardName', e.target.value)
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">
                      Expiry Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={e =>
                        handleInputChange(
                          'expiryDate',
                          formatExpiryDate(e.target.value)
                        )
                      }
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">
                      CVV <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cvv"
                      type="password"
                      value={paymentData.cvv}
                      onChange={e =>
                        handleInputChange(
                          'cvv',
                          e.target.value.replace(/\D/g, '').slice(0, 4)
                        )
                      }
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Input
                    id="billingAddress"
                    value={paymentData.billingAddress}
                    onChange={e =>
                      handleInputChange('billingAddress', e.target.value)
                    }
                    placeholder="123 Main Street"
                  />
                </div>

                {/* City, Zip, Country */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={paymentData.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={paymentData.zipCode}
                      onChange={e =>
                        handleInputChange('zipCode', e.target.value)
                      }
                      placeholder="10001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={paymentData.country}
                      onChange={e =>
                        handleInputChange('country', e.target.value)
                      }
                      placeholder="USA"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2" size={20} />
                        Pay ${amount}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/sponsor')}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg">
                  <Lock size={16} className="text-gray-600 mt-0.5" />
                  <p className="text-xs text-gray-600">
                    Your payment information is encrypted and secure. We never
                    store your full card details.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {submission.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {submission.description}
                    </p>
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tier</span>
                      <span className="font-medium">{tier}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">30 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Placement</span>
                      <span className="font-medium capitalize">
                        {submission.placement?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-2xl text-blue-600">
                    ${amount}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    Money-back guarantee if your ad is not approved
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-xs text-gray-700">24/7 customer support</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    Real-time analytics dashboard
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SponsorPayment;
