import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const MEMBERSHIP_URL =
  'https://quickclick.com/r/ylju71tqiulsto3pqq6w9mq9tbrnmn';

const plans = [
  {
    id: 'monthly',
    title: 'Monthly Membership',
    price: '$69',
    cadence: '/month',
    description: [
      'Masterclass Membership for 1 month',
      'LMS Login ID included',
    ],
    highlight: false,
    badge: null,
  },
  {
    id: 'annual',
    title: 'Annual Membership',
    price: '$828',
    cadence: '/year',
    description: [
      'Masterclass Membership for 1 year',
      'LMS Login ID included',
      '2000 FREE credits to unlock premium courses on LMS',
    ],
    highlight: true,
    badge: 'Until Nov 30th',
  },
];

export default function MembershipEnrollment() {
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [agreed, setAgreed] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleEnroll = () => {
    setFeedback('');
    if (!agreed) {
      setFeedback('Please agree to the Membership Terms & Conditions.');
      return;
    }

    if (selectedPlan !== 'annual') {
      setFeedback('Select the Annual Membership to continue to checkout.');
      return;
    }

    window.open(MEMBERSHIP_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Membership
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            Membership Terms & Conditions
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            By joining our Private Association, you acknowledge and agree to the
            following terms.
          </p>
        </div>

        <div className="bg-white/90 border border-slate-100 shadow-xl rounded-3xl p-8 space-y-8">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Choose Your Membership Plan
          </div>

          <div className="space-y-6">
            {plans.map(plan => (
              <label key={plan.id} className="block cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={selectedPlan === plan.id}
                  onChange={e => setSelectedPlan(e.target.value)}
                  className="hidden"
                />
                <div
                  className={`relative rounded-3xl border p-6 lg:p-7 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-600 shadow-lg shadow-blue-100 bg-blue-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPlan === plan.id
                              ? 'border-blue-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {selectedPlan === plan.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="text-xl font-semibold text-slate-900">
                          {plan.title}
                        </p>
                        {plan.badge && (
                          <span className="text-xs uppercase tracking-wider bg-orange-500 text-white px-3 py-1 rounded-full">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <ul className="space-y-1 text-slate-600">
                        {plan.description.map(item => (
                          <li key={item} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-right">
                      <p className="text-4xl font-bold text-slate-900">
                        {plan.price}
                        <span className="text-lg font-medium text-slate-500">
                          {plan.cadence}
                        </span>
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {plan.id === 'monthly'
                          ? 'Billed every month'
                          : 'Billed annually'}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <p className="text-center text-base font-medium text-slate-600">
            Annual access + 2000 credit points to unlock premium courses on LMS
          </p>

          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <input
              id="agree"
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="agree" className="text-sm text-slate-600">
              I have read and agree to the{' '}
              <Link
                to="/MembershipTnC"
                target="_blank"
                className="text-blue-600 font-semibold underline-offset-2 hover:underline"
              >
                Membership Terms & Conditions
              </Link>
              .
            </label>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleEnroll}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white py-4 text-lg font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-60 disabled:hover:scale-100"
            >
              Enroll Now @{' '}
              {selectedPlan === 'annual' ? '$828/year' : '$69/month'}
              <Star className="h-5 w-5" />
            </button>
            {feedback && (
              <p className="text-center text-sm text-red-600 font-medium">
                {feedback}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
