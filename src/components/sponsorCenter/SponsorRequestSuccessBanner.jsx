import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const SponsorRequestSuccessBanner = () => {
  return (
    <Card className="border border-emerald-100 bg-emerald-50/70 rounded-3xl shadow-sm">
      <CardContent className="flex items-center gap-3 py-4">
        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-800">
            Your sponsorship request has been received.
          </p>
          <p className="text-sm text-emerald-700">
            Our partnerships team will review it soon and follow up via email.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SponsorRequestSuccessBanner;
