import React from 'react';

const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4.5 10.5l3 3L15.5 5.5"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrossIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M5 5l10 10M15 5L5 15"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DEFAULT_FEATURES = [
  {
    key: 'pages',
    label: 'Number of Pages',
    starter: '2-3 pages',
    cadillac: '5-7+ custom pages',
  },
  {
    key: 'logo',
    label: 'Custom Logo',
    starter: 'Basic text/logo',
    cadillac: 'Premium design with revisions',
  },
  {
    key: 'policy',
    label: 'Policy Pages',
    starter: 'Basic templates',
    cadillac: 'Custom-written & formatted',
  },
  {
    key: 'contact',
    label: 'Contact Form',
    starter: 'Basic with auto-email',
    cadillac: 'Advanced with CRM sync',
  },
  {
    key: 'uiux',
    label: 'UI/UX Design',
    starter: 'Clean layout',
    cadillac: 'Brand-aligned premium design',
  },
  {
    key: 'security',
    label: 'Security (SSL)',
    starter: 'HTTPS',
    cadillac: 'HTTPS + Extra layers',
  },
  { key: 'mobile', label: 'Mobile Responsive', starter: true, cadillac: true },
  {
    key: 'member',
    label: 'Member Login / Portal',
    starter: true,
    cadillac: true,
  },
  {
    key: 'underwriter',
    label: 'Payment Automation & Merchant Account Approved',
    starter: true,
    cadillac: true,
  },
  {
    key: 'hosting',
    label: 'Hosting & Maintenance',
    starter: 'Monthly',
    cadillac: 'Monthly',
  },
  {
    key: 'dashboard',
    label: 'Detail User Dashboard',
    starter: false,
    cadillac: true,
  },
  {
    key: 'backend',
    label: 'Backend Integration',
    starter: false,
    cadillac: true,
  },
  {
    key: 'blog',
    label: 'Blog / Resource Section',
    starter: false,
    cadillac: true,
  },
  {
    key: 'chatbot',
    label: 'Chatbot / Live Chat',
    starter: false,
    cadillac: true,
  },
  {
    key: 'booking',
    label: 'Appointment Booking',
    starter: false,
    cadillac: true,
  },
  { key: 'seo', label: 'SEO Optimization', starter: false, cadillac: true },
  {
    key: 'training',
    label: 'Client Training / Walkthrough',
    starter: false,
    cadillac: true,
  },
];

export default function ComparisonTable({
  starterPrototypeLink = 'https://digi-market-simple.vercel.app/',
  cadillacPrototypeLink = 'https://rhythmic-vibe.vercel.app/',
  starterPaymentLink,
  cadillacPaymentLink,
  className = '',
  featuresData,
}) {
  const features = featuresData ?? DEFAULT_FEATURES;

  const renderCell = (value, highlight = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-green-600">
          <CheckIcon className="w-5 h-5" />
          <span>Included</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-red-500">
          <CrossIcon className="w-5 h-5" />
          <span>Not included</span>
        </div>
      );
    }

    if (!value)
      return <span className="text-sm sm:text-base text-gray-500">—</span>;

    if (/https?/i.test(value) || /monthly/i.test(value)) {
      return (
        <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-green-600">
          <CheckIcon className="w-5 h-5" />
          <span>{value}</span>
        </div>
      );
    }

    return (
      <span
        className={`text-sm sm:text-base ${
          highlight ? 'font-semibold text-indigo-700' : 'text-gray-700'
        }`}
      >
        {value}
      </span>
    );
  };

  return (
    <section
      className={`w-full py-20 px-4 relative overflow-hidden ${className}`}
      aria-label="Plan comparison table"
      style={{
        background:
          'linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)',
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-normal py-6 sm:py-20 text-gray-900 mb-4 leading-tight"
            style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
          >
            Starter vs Cadillac — at a glance
            <p
              className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto font-normal"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              Clear, responsive comparison so you can decide fast.
            </p>
          </h2>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <span className="text-sm sm:text-lg px-2 py-1 rounded bg-green-50 text-green-700 border border-green-100">
              Included
            </span>
            <span className="text-sm sm:text-lg px-2 py-1 rounded bg-red-50 text-red-700 border border-red-100">
              Not included
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="w-full rounded-xl shadow-lg ring-1 ring-black/5 bg-gradient-to-b from-white to-indigo-50">
            {/* Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch p-4">
              {/* Features Col */}
              <div className="flex items-center">
                <div className="text-base sm:text-lg font-medium text-gray-600">
                  Features
                </div>
              </div>

              {/* Starter Card */}
              <div className="rounded-lg bg-white p-4 flex flex-col justify-between border hover:shadow-lg transition">
                <div>
                  <div className="text-sm sm:text-lg uppercase tracking-wide font-medium text-indigo-600">
                    Starter
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      $99
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      Starter Plan
                    </span>
                  </div>
                  {/* Maintenance Charge */}
                  <p className="text-sm sm:text-base font-bold text-black mt-1">
                    + $49/month Maintenance + Hosting
                  </p>
                  <p className="mt-3 text-sm sm:text-base text-gray-600">
                    Fast & lean website — ideal for smaller projects and quick
                    launches.
                  </p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <a
                    href={
                      starterPaymentLink ??
                      'https://quickclick.com/r/mq0rtcnac7tng6qnl2wk009ddrgrly'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center px-4 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-0"
                  >
                    Pay Now
                  </a>
                </div>
              </div>

              {/* Cadillac Card */}
              <div className="rounded-lg bg-gradient-to-b from-white to-indigo-100 p-4 flex flex-col justify-between border border-indigo-100 hover:shadow-xl transition">
                <div>
                  <div className="text-sm sm:text-lg uppercase tracking-wide font-medium text-indigo-800">
                    Cadillac
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      $998
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      Cadillac Plan
                    </span>
                  </div>
                  {/* Maintenance Charge */}
                  <p className="text-sm sm:text-base font-bold text-black mt-1">
                    + $49/month Maintenance + Hosting
                  </p>
                  <p className="mt-3 text-sm sm:text-base text-gray-700">
                    Full custom solution — premium design, integrations and
                    enterprise-ready structure.
                  </p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <a
                    href={
                      cadillacPaymentLink ??
                      'https://quickclick.com/r/ktwk1pon618kihkfhnfioqm9n1caap'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center px-4 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-0"
                  >
                    Pay Now
                  </a>
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100 bg-white rounded-b-lg">
              {features.map((f, idx) => {
                const starterVal = f.starter;
                const cadillacVal = f.cadillac;
                const cadillacBetter =
                  starterVal === false && cadillacVal === true;

                return (
                  <div
                    key={f.key}
                    className={`grid grid-cols-1 sm:grid-cols-3 gap-4 items-center px-4 py-4 sm:px-6 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div>
                      <div
                        className="text-base sm:text-lg font-medium text-gray-900"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        {f.label}
                      </div>
                      {f.note ? (
                        <div
                          className="text-sm sm:text-base text-gray-600 mt-1"
                          style={{ fontFamily: 'Arial, sans-serif' }}
                        >
                          {f.note}
                        </div>
                      ) : null}
                    </div>

                    <div>{renderCell(starterVal)}</div>

                    <div
                      className={`${cadillacBetter ? 'bg-indigo-50 rounded py-2 px-3' : ''}`}
                    >
                      {renderCell(cadillacVal, cadillacBetter)}
                    </div>
                  </div>
                );
              })}

              {/* Footer CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center px-4 py-6 sm:px-6">
                <div />
                <a
                  href={starterPrototypeLink ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-center px-4 py-2 rounded-md text-sm font-semibold ${
                    starterPrototypeLink
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white text-gray-500 border border-gray-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  {starterPrototypeLink
                    ? 'Open Starter Prototype'
                    : 'Attach Starter Link'}
                </a>

                <a
                  href={cadillacPrototypeLink ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-center px-4 py-2 rounded-md text-sm font-semibold ${
                    cadillacPrototypeLink
                      ? 'bg-indigo-700 text-white hover:bg-indigo-800'
                      : 'bg-white text-gray-500 border border-gray-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  {cadillacPrototypeLink
                    ? 'Open Cadillac Prototype'
                    : 'Attach Cadillac Link'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
