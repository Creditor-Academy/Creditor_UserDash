import React from 'react';

const ComparisonSection = () => {
  const features = [
    {
      name: 'E-Commerce Marketplace Experience',
      athena: 'Yes (Shop, bundles, flexible pricing)',
      docebo: 'No',
      absorb: 'No',
      articulate: 'Subscription only',
      talentlms: 'Basic plans',
      cornerstone: 'Enterprise licensing',
    },
    {
      name: 'Number of Integrated Tools',
      athena: '8 modular flagships',
      docebo: 'LMS + limited add-ons',
      absorb: 'LMS + basic authoring',
      articulate: 'Authoring suite only',
      talentlms: 'LMS only',
      cornerstone: 'Suite (complex)',
    },
    {
      name: 'AI-Powered Course Authoring',
      athena: 'Advanced (outlines, content, quizzes)',
      docebo: 'Limited',
      absorb: 'Some',
      articulate: 'Limited',
      talentlms: 'Basic',
      cornerstone: 'Some',
    },
    {
      name: 'Built-In Visual Design Studio',
      athena: 'Yes (Canva by Athena)',
      docebo: 'No',
      absorb: 'No',
      articulate: 'Basic templates',
      talentlms: 'No',
      cornerstone: 'No',
    },
    {
      name: 'Virtual Instructor-Led Training',
      athena: 'Full AI-enhanced VILT',
      docebo: 'Integrations',
      absorb: 'Integrations',
      articulate: 'No',
      talentlms: 'Basic',
      cornerstone: 'Yes (extra cost)',
    },
    {
      name: 'Interactive Digital Book Creator',
      athena: 'Yes (Book SMART AI)',
      docebo: 'No',
      absorb: 'No',
      articulate: 'No',
      talentlms: 'No',
      cornerstone: 'No',
    },
    {
      name: 'Lifelike AI Avatars/Agents',
      athena: 'Yes',
      docebo: 'No',
      absorb: 'No',
      articulate: 'No',
      talentlms: 'No',
      cornerstone: 'Limited',
    },
    {
      name: 'Gamified LMS/LXP',
      athena: 'Advanced AI personalization',
      docebo: 'Yes',
      absorb: 'Yes',
      articulate: 'Exports only',
      talentlms: 'Yes',
      cornerstone: 'Yes',
    },
    {
      name: 'No-Code Website/LMS Builder',
      athena: 'Yes (AI-generated)',
      docebo: 'No',
      absorb: 'No',
      articulate: 'No',
      talentlms: 'Limited',
      cornerstone: 'No',
    },
    {
      name: 'Claimed Cost/Time Savings',
      athena: 'Up to 80%',
      docebo: 'Varies',
      absorb: 'Varies',
      articulate: 'High subscription',
      talentlms: 'Affordable',
      cornerstone: 'High enterprise cost',
    },
  ];

  const platforms = [
    { name: 'Athena' },
    { name: 'Docebo' },
    { name: 'Absorb LMS' },
    { name: 'Articulate 360' },
    { name: 'TalentLMS' },
    { name: 'Cornerstone' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar { /* Chrome, Safari, Opera */
          display: none;
        }
      `}</style>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1e293b] mb-4">
            Athena vs Competitive Platforms
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A comprehensive comparison of features and capabilities
          </p>
        </div>

        {/* Comparison Features */}
        <div className="overflow-x-auto rounded-xl bg-white shadow-xl hide-scrollbar">
          <table className="w-full min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-4 px-6 text-left font-bold text-[#1e293b] border-b border-gray-200">
                  Feature
                </th>
                {platforms.map((platform, index) => (
                  <th
                    key={index}
                    className="py-4 px-4 text-center font-bold text-[#1e293b] border-b border-gray-200 min-w-[120px]"
                  >
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {platform.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className={`hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <td className="py-5 px-6 border-b border-gray-200 font-medium text-[#1e293b]">
                    {feature.name}
                  </td>
                  <td className="py-5 px-4 text-center border-b border-gray-200">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium whitespace-nowrap">
                      {feature.athena}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-center border-b border-gray-200">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium whitespace-nowrap">
                      {feature.docebo}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-center border-b border-gray-200">
                    <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium whitespace-nowrap">
                      {feature.absorb}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-center border-b border-gray-200">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium whitespace-nowrap">
                      {feature.articulate}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-center border-b border-gray-200">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium whitespace-nowrap">
                      {feature.talentlms}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-center border-b border-gray-200">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium whitespace-nowrap">
                      {feature.cornerstone}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
