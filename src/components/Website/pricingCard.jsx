import { useEffect, useState } from 'react';
import cover1 from '../../assets/cadillac.jpg';
import cover2 from '../../assets/Cover-2.webp';

function PricingCard() {
  const [pricingData, setPricingData] = useState(null);

  useEffect(() => {
    // Website services pricing data
    const data = {
      data: [
        {
          tag: 'BASIC',
          planName: 'Starter Plan',
          planPrice: '$99',
          cancelPrice: '$500',
          coverImage: cover1,
          planIncludes: [
            'Competitive research & insights',
            'Wireframing and prototyping',
            'Basic tracking setup (Google Analytics, etc.)',
            'Standard contact form integration',
          ],
          payLink: '#',
        },
        {
          tag: 'ADVANCE',
          planName: 'Cadillac Plan',
          planPrice: '$998',
          cancelPrice: '$2,199',
          coverImage: cover2,
          planIncludes: [
            'Everything in the Launch Plan',
            'Custom design for up to 10 pages',
            'Seamless social media integration',
            'SEO enhancements for key pages',
          ],
          payLink: '#',
        },
      ],
    };
    setPricingData(data);
  }, []);

  const defaultCoverImages = [cover1, cover2, cover2];

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Animated decorative background (behind everything) */}
      <div className="absolute inset-0 -z-20 pointer-events-none">
        {/* Subtle base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-100" />

        {/* Blurred color blobs (static) */}
        <div
          aria-hidden="true"
          className="absolute -left-20 -top-20 w-[36rem] h-[36rem] rounded-full mix-blend-multiply filter blur-3xl opacity-60"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.55), rgba(139,92,246,0.25) 35%, transparent 60%)',
          }}
        />

        <div
          aria-hidden="true"
          className="absolute right-[-4rem] top-10 w-[28rem] h-[28rem] rounded-full mix-blend-multiply filter blur-2xl opacity-50"
          style={{
            background:
              'radial-gradient(circle at 60% 40%, rgba(6,182,212,0.45), rgba(59,130,246,0.22) 40%, transparent 65%)',
          }}
        />

        <div
          aria-hidden="true"
          className="absolute left-10 bottom-[-6rem] w-[30rem] h-[30rem] rounded-full mix-blend-multiply filter blur-3xl opacity-45"
          style={{
            background:
              'radial-gradient(circle at 20% 70%, rgba(250,204,21,0.40), rgba(250,113,113,0.18) 35%, transparent 70%)',
          }}
        />

        {/* Very subtle noise/texture overlay for depth */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <filter id="grain">
            <feTurbulence
              baseFrequency="0.8"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend mode="overlay" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* Content container (above background blobs) */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col gap-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-normal mb-4 leading-tight"
            style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
          >
            <span className="text-gray-900">Affordable Plan for Everyone</span>
          </h2>
          <p
            className="text-lg text-gray-600 max-w-3xl mx-auto font-normal"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            Explore our creative solutions, optimized workflows, and
            transformative digital experiences that empower your business.
          </p>
        </div>

        {/* Aligned Grid */}
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-2">
          {pricingData?.data?.map((value, index) => {
            const coverImage =
              value.coverImage ||
              defaultCoverImages[index] ||
              defaultCoverImages[0];

            return (
              <div
                key={index}
                className="rounded-3xl overflow-hidden cursor-pointer group flex flex-col h-full shadow-2xl"
              >
                {/* Card shell uses glass style so it reads well over animated background */}
                <div className="flex flex-col h-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl overflow-hidden">
                  {/* Cover Image */}
                  <div className="relative h-72 w-full overflow-hidden rounded-t-3xl flex-shrink-0">
                    <img
                      src={coverImage}
                      alt={`${value.planName} cover`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Dark overlay for better text contrast */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent p-4 flex flex-col gap-2">
                      <span
                        className="text-white text-sm uppercase font-medium"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        {value?.tag || 'Plan'}
                      </span>
                      <h3
                        className="text-white text-2xl font-bold"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        {value?.planName}
                      </h3>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 text-white">
                      <div className="flex items-center gap-2">
                        {value.cancelPrice && (
                          <del className="text-white/70">
                            {value.cancelPrice}
                          </del>
                        )}
                        <span
                          className="text-2xl font-bold"
                          style={{ fontFamily: 'Arial, sans-serif' }}
                        >
                          {value.planPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-8 xl:p-10 flex flex-col gap-6 flex-1 justify-between">
                    <div>
                      <p
                        className="text-lg font-medium text-gray-800"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        What's Included:
                      </p>
                      <ul className="flex flex-col gap-3 mt-3">
                        {value?.planIncludes?.map((item, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <div className="bg-blue-600 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                            <span
                              className="text-gray-700"
                              style={{ fontFamily: 'Arial, sans-serif' }}
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Subscribe Button */}
                    <div className="mt-4">
                      <a
                        href={value?.payLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex justify-center items-center w-full text-black font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 hover:-translate-y-0.5"
                        style={{
                          background:
                            'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          fontFamily: "'Arial', sans-serif",
                          fontSize: '1rem',
                          boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow =
                            '0 6px 20px rgba(251, 191, 36, 0.4)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow =
                            '0 4px 15px rgba(251, 191, 36, 0.3)';
                        }}
                      >
                        Opt Service Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Static bottom wave for extra polish */}
      <div
        className="absolute bottom-0 left-0 w-full -z-10 pointer-events-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 120"
          width="100%"
          height="120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="g1" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(99,102,241,0.12)" />
              <stop offset="50%" stopColor="rgba(6,182,212,0.08)" />
              <stop offset="100%" stopColor="rgba(250,204,21,0.06)" />
            </linearGradient>
          </defs>
          <path
            d="M0 60 C 240 10 480 110 720 60 C 960 10 1200 110 1440 60 L1440 120 L0 120 Z"
            fill="url(#g1)"
          />
        </svg>
      </div>
    </section>
  );
}

export default PricingCard;
