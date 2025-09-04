import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, ArrowRight, ArrowLeft, UserPlus, Phone, Lock } from "lucide-react";

function SignUp({ onBack }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTnC, setAcceptTnC] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // OTP inputs helpers
  const OTP_LENGTH = 6;
  const otpRefs = useRef([]);

  const focusInput = (index) => {
    const el = otpRefs.current[index];
    if (el) el.focus();
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    if (digit === "" && otp[index] === undefined) return;
    const chars = Array.from(otp.padEnd(OTP_LENGTH, " "));
    chars[index] = digit || "";
    const nextOtp = chars.join("").replace(/\s/g, "");
    setOtp(nextOtp);
    if (digit && index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const chars = Array.from(otp);
        chars[index] = "";
        setOtp(chars.join(""));
      } else if (index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    setOtp(text);
    const lastIndex = Math.min(text.length, OTP_LENGTH) - 1;
    focusInput(Math.max(lastIndex, 0));
  };

  useEffect(() => {
    if (!otpOpen || resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [otpOpen, resendIn]);

  const requestOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/registerUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, phone })
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Gracefully handle backends that respond 4xx with an "already sent" message
        if (data?.message && /already sent/i.test(data.message)) {
          setOtpOpen(true);
          setResendIn(20);
          toast.success(`OTP sent to ${email}`);
          return;
        }
        throw new Error(data?.message || "Failed to send OTP");
      }
      toast.success(`OTP sent to ${email}`);
      setOtpOpen(true);
      setResendIn(20);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!acceptTnC) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }
    await requestOtp();
  };

  const proceedToDetails = () => {
    if (!otp.trim() || otp.length !== 6) {
      toast.error("Enter the 6-digit OTP sent to your email");
      return;
    }
    // Close OTP modal and open details modal
    setOtpOpen(false);
    setDetailsOpen(true);
  };

  const handleCompleteRegistration = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!gender) {
      toast.error("Please select your gender");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          gender,
          otp,
          password,
          auth_provider: "local",
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message || "Registration failed";
        // If OTP is invalid/expired, send user back to OTP modal
        if (/otp/i.test(msg) && (/invalid/i.test(msg) || /expired/i.test(msg))) {
          toast.error(msg);
          setDetailsOpen(false);
          setOtp("");
          setOtpOpen(true);
          return;
        }
        throw new Error(msg);
      }
      toast.success(data?.message || "Registered successfully");
      setDetailsOpen(false);
      onBack?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, subject: "OTP Verification" })
      });
      const data = await res.json();
      if (!res.ok) {
        // Treat "already sent" as success for a smoother UX
        if (data?.message && /already sent/i.test(data.message)) {
          toast.success("OTP resent");
          setResendIn(20);
          return;
        }
        throw new Error(data?.message || "Failed to resend OTP");
      }
      // Ensure OTP modal is visible after resend
      setOtpOpen(true);
      toast.success("OTP resent");
      setResendIn(20);
    } catch (e) {
      toast.error(e.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Create your account</h3>
        <p className="text-slate-600">Join Creditor Academy in a minute</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div className="space-y-2">
          <Label htmlFor="su-email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            Email Address
          </Label>
          <Input id="su-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} required className="h-11 px-4 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-phone" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-500" />
            Phone
          </Label>
          <Input id="su-phone" type="tel" placeholder="+1 555 000 1111" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} required className="h-11 px-4 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300" />
        </div>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={acceptTnC} onChange={(e) => setAcceptTnC(e.target.checked)} disabled={isLoading} />
          <span>
            I agree to the <span className="font-medium text-slate-800">Terms & Conditions</span> and
            <span className="font-medium text-slate-800"> Privacy Policy</span>.
          </span>
        </label>

        <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending OTP...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button onClick={onBack} variant="ghost" className="text-slate-600 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Button>
      </div>

      {/* OTP Modal */}
      <Dialog open={otpOpen} onOpenChange={(open) => {
        setOtpOpen(open);
        if (!open) {
          // Reset OTP state when modal is closed
          setOtp("");
          setResendIn(0);
        }
      }}>
        <DialogContent
          className="sm:max-w-[480px] rounded-xl"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Email Verification</DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to
              <span className="ml-1 font-medium text-slate-800">{email}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label className="text-sm font-medium text-slate-700">One-Time Password</Label>
              <div
                className="mt-2 grid grid-cols-6 gap-2"
                onPaste={handleOtpPaste}
              >
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    autoComplete="one-time-code"
                    value={otp[i] || ""}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="h-12 rounded-md border-2 border-slate-200 text-center text-lg font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">OTP expires in 5 minutes.</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendIn > 0 || isResending}
                className={`font-medium underline-offset-2 ${(resendIn > 0 || isResending) ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700 underline'}`}
              >
                {isResending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                    Resending...
                  </span>
                ) : resendIn > 0 ? (
                  `Resend in ${resendIn}s`
                ) : (
                  'Resend OTP'
                )}
              </button>
              <span className="text-slate-500">Didn’t get it? Check spam folder.</span>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => {
              setOtpOpen(false);
              setOtp("");
              setResendIn(0);
            }} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={proceedToDetails} disabled={isLoading || otp.length !== 6} className="w-full sm:w-auto">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={(open) => {
        setDetailsOpen(open);
        if (!open) {
          // optional: clear sensitive fields
          setPassword("");
        }
      }}>
        <DialogContent className="sm:max-w-[520px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Complete Your Profile</DialogTitle>
            <DialogDescription>
              Enter your details to finish creating your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dt-fn" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-500" />
                  First Name
                </Label>
                <Input id="dt-fn" type="text" autoComplete="given-name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isLoading} required className="h-11 px-4 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dt-ln" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-500" />
                  Last Name
                </Label>
                <Input id="dt-ln" type="text" autoComplete="family-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isLoading} required className="h-11 px-4 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dt-gender" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  Gender
                </Label>
                <select id="dt-gender" autoComplete="off" value={gender} onChange={(e) => setGender(e.target.value)} disabled={isLoading} required className="h-11 px-4 w-full rounded-md border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white">
                  <option value="" disabled>Choose...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dt-pw" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-500" />
                  Password
                </Label>
                <Input id="dt-pw" type="password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} required className="h-11 px-4 border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setDetailsOpen(false)} className="w-full sm:w-auto">Back</Button>
            <Button onClick={handleCompleteRegistration} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Submitting...' : 'Finish Registration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { SignUp };


