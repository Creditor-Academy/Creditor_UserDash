import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, MonitorPlay, Target, GraduationCap } from 'lucide-react';

const DashboardServices = ({
  balance,
  showServiceHistory,
  setShowServiceHistory,
}) => {
  return (
    <div className="mb-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Creditor Academy Services
              </h2>
              <p className="text-sm text-gray-600 max-w-2xl mt-1">
                At Creditor Academy, we offer a comprehensive suite of professional
                services designed to empower businesses and individuals with tailored
                solutions. Explore our key offerings below and schedule a consultation
                to get started.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border px-3 py-1 text-sm text-gray-700 bg-gray-50">
              {balance} credits
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowServiceHistory(!showServiceHistory)}
            >
              History
            </Button>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Website Services */}
          <div className="rounded-2xl border bg-blue-50 p-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-4">
              <MonitorPlay size={18} />
            </div>

            <h3 className="text-base font-semibold mb-2">
              Website Services
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Elevate your online presence with our expert website design,
              development, and maintenance solutions. Whether you're launching
              a new site or optimizing an existing one, we deliver user-friendly,
              responsive, and high-performing websites that drive results.
            </p>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() =>
                window.open(
                  'https://scheduler.zoom.us/prerna-mishra/website-requirement-meeting',
                  '_blank',
                  'noopener,noreferrer'
                )
              }
            >
              Schedule Now
            </Button>
          </div>

          {/* Digital Marketing */}
          <div className="rounded-2xl border bg-purple-50 p-6">
            <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-4">
              <Target size={18} />
            </div>

            <h3 className="text-base font-semibold mb-2">
              Digital Marketing and SEO Services
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Boost your visibility and growth with our strategic digital marketing
              and SEO expertise. From targeted campaigns and content creation to
              advanced search engine optimization, we help you attract, engage,
              and convert your audience effectively.
            </p>

            <Button className="w-full" disabled>
              Coming Soon…
            </Button>
          </div>

          {/* Recruitment */}
          <div className="rounded-2xl border bg-orange-50 p-6">
            <div className="w-10 h-10 rounded-lg bg-orange-600 text-white flex items-center justify-center mb-4">
              <GraduationCap size={18} />
            </div>

            <h3 className="text-base font-semibold mb-2">
              Recruitment and Staffing Services (Including Payroll)
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Streamline your talent acquisition with our end-to-end recruitment,
              staffing, and payroll management services. We connect you with top-tier
              professionals while handling compliance, onboarding, and seamless
              payroll processing for hassle-free operations.
            </p>

            <Button className="w-full" disabled>
              Coming Soon…
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardServices;
