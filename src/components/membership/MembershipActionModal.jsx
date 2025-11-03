import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";

export function MembershipActionModal({ isOpen, onClose, actionType }) {
  const isAnnualSwitch = actionType === "annual";
  const isCancellation = actionType === "cancel";
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for annual switch
  const [billingEmail, setBillingEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Form states for cancellation
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (isAnnualSwitch) {
      toast.success("Successfully switched to annual membership!");
    } else {
      if (confirmText.toLowerCase() !== "cancel") {
        toast.error("Please type 'CANCEL' to confirm");
        setIsSubmitting(false);
        return;
      }
      toast.success("Membership cancellation request submitted");
    }

    setIsSubmitting(false);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setBillingEmail("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setReason("");
    setFeedback("");
    setConfirmText("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
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
              ? "Upgrade to annual billing and save 20% on your subscription"
              : "We're sorry to see you go. Please help us improve by sharing your feedback."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {isAnnualSwitch ? (
            // Annual Switch Form
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Annual Plan Benefits</h4>
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
                    onChange={(e) => setBillingEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-number" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card Number
                  </Label>
                  <Input
                    id="card-number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
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
                      onChange={(e) => setExpiryDate(e.target.value)}
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
                      onChange={(e) => setCvv(e.target.value)}
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
                  You'll be charged $279 today. Your next billing date will be one year from today.
                </p>
              </div>
            </>
          ) : (
            // Cancellation Form
            <>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-black dark:text-white">
                      What you'll lose
                    </h4>
                    <ul className="text-xs text-black dark:text-white space-y-1">
                      <li>• Access to all premium features</li>
                      <li>• Priority support</li>
                      <li>• Your saved preferences and settings</li>
                      <li>• Exclusive member content</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Cancellation</Label>
                  <select
                    id="reason"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  >
                    <option value="">Select a reason...</option>
                    <option value="too-expensive">Too expensive</option>
                    <option value="not-using">Not using enough</option>
                    <option value="missing-features">Missing features</option>
                    <option value="found-alternative">Found alternative</option>
                    <option value="technical-issues">Technical issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Additional Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Help us improve by sharing your thoughts..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-red-600 dark:text-red-400">
                    Type "CANCEL" to confirm
                  </Label>
                  <Input
                    id="confirm"
                    type="text"
                    placeholder="Type CANCEL"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    required
                    className="border-red-200 focus:ring-red-500"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Your membership will remain active until the end of your current billing period.
                You can reactivate anytime before then to avoid losing access.
              </p>
            </>
          )}

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
              type="submit"
              disabled={isSubmitting}
              className={
                isCancellation
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
              }
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : isAnnualSwitch ? (
                "Upgrade to Annual"
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MembershipActionModal;

