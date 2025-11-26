import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  Clock,
  CreditCard,
  PlayCircle,
  FileText,
} from 'lucide-react';

const AdRequestStatusGuide = () => {
  const steps = [
    {
      icon: FileText,
      title: 'Submit Request',
      description: 'Fill out ad details and select your preferred plan',
      status: 'pending',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Clock,
      title: 'Admin Review',
      description: 'Your request is reviewed by admin (24-48 hours)',
      status: 'review',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: CheckCircle,
      title: 'Approval',
      description: 'Admin approves your ad request',
      status: 'approved',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: CreditCard,
      title: 'Payment',
      description: 'Complete payment for your selected plan',
      status: 'payment',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: PlayCircle,
      title: 'Go Live',
      description: 'Your ad campaign goes live and starts reaching users',
      status: 'active',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Ad Request Process</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.status} className="flex items-start gap-3">
                <div
                  className={`${step.bgColor} ${step.color} p-2 rounded-lg flex-shrink-0`}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">
                      STEP {index + 1}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500">
            💡 <strong>Tip:</strong> Ensure all details are accurate before
            submission. You can edit your request while it's pending review.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdRequestStatusGuide;
