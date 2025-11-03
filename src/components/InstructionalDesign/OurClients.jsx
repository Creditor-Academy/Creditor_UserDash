import React from 'react';

const OurClients = () => {
  // Array of companies with their brand fonts and colors
  const companies = [
    {
      name: 'Google',
      fontFamily: "'Product Sans', sans-serif",
      color: '#4285F4',
      fontWeight: '500',
    },
    {
      name: 'Microsoft',
      fontFamily: "'Segoe UI', sans-serif",
      color: '#00A4EF',
      fontWeight: '600',
    },
    {
      name: 'Amazon',
      fontFamily: "'Amazon Ember', Arial, sans-serif",
      color: '#FF9900',
      fontWeight: '700',
    },
    {
      name: 'Meta',
      fontFamily: "'Optimistic Display', sans-serif",
      color: '#0081FB',
      fontWeight: '700',
    },
    {
      name: 'Apple',
      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
      color: '#000000',
      fontWeight: '600',
    },
    {
      name: 'Netflix',
      fontFamily: "'Netflix Sans', 'Bebas Neue', sans-serif",
      color: '#E50914',
      fontWeight: '700',
    },
    {
      name: 'IBM',
      fontFamily: "'IBM Plex Sans', sans-serif",
      color: '#0F62FE',
      fontWeight: '600',
    },
    {
      name: 'Salesforce',
      fontFamily: "'Salesforce Sans', sans-serif",
      color: '#00A1E0',
      fontWeight: '700',
    },
    {
      name: 'Adobe',
      fontFamily: "'Adobe Clean', sans-serif",
      color: '#FF0000',
      fontWeight: '700',
    },
    {
      name: 'Intel',
      fontFamily: "'Intel Clear', 'Arial Narrow', sans-serif",
      color: '#0071C5',
      fontWeight: '700',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-normal text-gray-900 mb-4"
            style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
          >
            Trusted by Industry Leaders
          </h2>
          <p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            We've partnered with top organizations to create transformative
            learning experiences
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Gradient Overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>

          {/* Marquee Wrapper */}
          <div className="marquee-container">
            <div className="marquee-content">
              {/* First set of logos */}
              {companies.map((company, index) => (
                <div key={`first-${index}`} className="marquee-item">
                  <span
                    className="company-name"
                    style={{
                      fontFamily: company.fontFamily,
                      color: company.color,
                      fontWeight: company.fontWeight,
                    }}
                  >
                    {company.name}
                  </span>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {companies.map((company, index) => (
                <div key={`second-${index}`} className="marquee-item">
                  <span
                    className="company-name"
                    style={{
                      fontFamily: company.fontFamily,
                      color: company.color,
                      fontWeight: company.fontWeight,
                    }}
                  >
                    {company.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p
            className="text-sm text-gray-500"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            Join hundreds of organizations transforming their learning programs
          </p>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@600&family=Bebas+Neue&display=swap');

        .marquee-container {
          overflow: hidden;
          position: relative;
          width: 100%;
        }

        .marquee-content {
          display: flex;
          gap: 4rem;
          animation: marquee 45s linear infinite;
          width: fit-content;
        }

        .marquee-content:hover {
          animation-play-state: paused;
        }

        .marquee-item {
          flex-shrink: 0;
          min-width: 120px;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 1rem;
        }

        .company-name {
          font-size: 1.75rem;
          white-space: nowrap;
          transition: all 0.3s ease;
          opacity: 0.85;
          letter-spacing: -0.02em;
        }

        .company-name:hover {
          opacity: 1;
          transform: scale(1.05);
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 768px) {
          .marquee-content {
            gap: 2.5rem;
          }

          .marquee-item {
            min-width: 100px;
            height: 2.5rem;
            padding: 0 0.75rem;
          }

          .company-name {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </section>
  );
};

export default OurClients;
