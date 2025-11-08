import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Calendar, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

export function MembershipActionModal({ isOpen, onClose, actionType }) {
  const isAnnualSwitch = actionType === 'annual';
  const isCancellation = actionType === 'cancel';
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for annual switch
  const [billingEmail, setBillingEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Form states for cancellation
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isAnnualSwitch) {
      toast.success('Successfully switched to annual membership!');
    } else {
      if (confirmText.toLowerCase() !== 'cancel') {
        toast.error("Please type 'CANCEL' to confirm");
        setIsSubmitting(false);
        return;
      }
      toast.success('Membership cancellation request submitted');
    }

    setIsSubmitting(false);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setBillingEmail('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setReason('');
    setFeedback('');
    setConfirmText('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${isCancellation ? 'sm:max-w-[600px]' : 'sm:max-w-[550px]'} ${isCancellation ? '' : 'max-h-[90vh] overflow-y-auto'}`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isAnnualSwitch ? (
              <>
                <Calendar className="h-5 w-5 text-primary" />
                Switch to Annual Membership
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                Cancel Membership
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isAnnualSwitch
              ? 'Upgrade to annual billing and save 20% on your subscription'
              : "We're sorry to see you go. Please help us improve by sharing your feedback."}
          </DialogDescription>
        </DialogHeader>

        <div className={`${isCancellation ? '' : 'space-y-6 py-4'}`}>
          {isAnnualSwitch ? (
            // Annual Switch Form
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">
                      Annual Plan Benefits
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Save 20% compared to monthly billing</li>
                      <li>• Priority customer support</li>
                      <li>• Exclusive annual member features</li>
                      <li>• No price increases for 12 months</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billing-email">Billing Email</Label>
                  <Input
                    id="billing-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={billingEmail}
                    onChange={e => setBillingEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="card-number"
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Card Number
                  </Label>
                  <Input
                    id="card-number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={e => setExpiryDate(e.target.value)}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Plan</span>
                  <span className="line-through">$29/month</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Annual Plan</span>
                  <span className="text-primary">$279/year</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll be charged $279 today. Your next billing date will be
                  one year from today.
                </p>
              </div>
            </>
          ) : (
            // Cancellation Form - WonderEngine Embedded Form
            <>
              {/* WonderEngine Form Embedded */}
              <div className="w-full -mt-4">
                <iframe
                  src="https://api.wonderengine.ai/widget/form/18fHPJOcQq2SuYq8fO2d"
                  title="Membership Cancellation Form"
                  className="w-full h-[450px] border-0 rounded-lg"
                  style={{ minHeight: '450px' }}
                />
              </div>
            </>
          )}

          {/* Only show footer buttons for annual membership, not for cancellation */}
          {isAnnualSwitch && (
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  'Upgrade to Annual'
                )}
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MembershipActionModal;
