import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';

const PlatformDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative"
      ref={dropdownRef}
      style={{ position: 'relative' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="platform-button flex items-center gap-1 text-white font-semibold text-lg transition-all duration-200 relative"
        style={{
          color: '#fff',
          fontWeight: '600',
          fontSize: '1.1rem',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          padding: '6px 0',
          position: 'relative',
        }}
      >
        Platform
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="fixed top-[64px] left-0 w-screen bg-white shadow-2xl border border-gray-200 overflow-hidden z-50 platform-dropdown">
          <div className="flex flex-col lg:flex-row">
            {/* Left Column - "Athena LMS for" */}
            <div className="flex-1 p-6 lg:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Athena LMS for
              </h3>
              <div className="flex flex-col gap-6">
                <a
                  href="/platform/courses"
                  className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50"
                >
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Courses
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Easily create and sell show-stopping, profitable courses
                  </p>
                </a>
                <a
                  href="/platform/communities"
                  className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50"
                >
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Communities
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Grow your business with shared online learning spaces
                  </p>
                </a>
                <a
                  href="/platform/digital-downloads"
                  className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50"
                >
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Digital Downloads
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Generate leads and revenue with digital products
                  </p>
                </a>
                <a
                  href="/platform/memberships"
                  className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50"
                >
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Memberships
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Generate recurring revenue by offering exclusive perks
                  </p>
                </a>
                <a
                  href="/platform/coaching"
                  className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50"
                >
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Coaching and Webinars
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Build deeper connections with live learning experiences
                  </p>
                </a>
              </div>
            </div>

            {/* Middle Column - "Marketing Tools" */}
            <div className="flex-1 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Marketing Tools
              </h3>
              <div className="flex flex-col gap-6">
                <a
                  href="/website"
                  className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50"
                >
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Landing Pages
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Use AI to quickly build a high-converting landing page
                  </p>
                </a>
                <a href="/contact" className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Email Automation</h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Drive and recapture sales with automated emails</p>
                </a>
                <a href="/dashboard/progress" className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Analytics</h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Get actionable data to optimize products for profitability</p>
                </a>
                <a href="/dashboard" className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Branded Mobile</h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Get a custom, on-brand mobile app for your business</p>
                </a>
              </div>
            </div>

            {/* Right Column - "Commerce Tools" */}
            <div className="flex-1 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Commerce Tools
              </h3>
              <div className="flex flex-col gap-6">
                <a
                  href="/pricing"
                  className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50"
                >
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Take Payments
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Increase average transaction size by up to 31% with Athena
                    Payments
                  </p>
                </a>
                <a href="/merchant-processing" className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Selling Tools</h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Boost sales, conversions, and order value with advanced sales tools</p>
                </a>
                <a
                  href="/instructionaldesign"
                  className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50"
                >
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Time-Saving Tools
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Automate and streamline time-consuming admin tasks like
                    taxes
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformDropdown;

// Add custom styles for the dropdown
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .platform-dropdown {
      animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    /* Platform button hover animation to match other nav links */
    .platform-button:hover {
      color: #e0f0ff !important;
    }
    
    .platform-button::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: #e0f0ff;
      transition: width 0.3s ease;
    }
    
    .platform-button:hover::after {
      width: 100%;
    }
    
    /* Ensure no movement on hover */
    .platform-dropdown a {
      transform: translateZ(0);
      will-change: background-color;
      text-decoration: none;
    }
    
    .platform-dropdown a:hover {
      transform: translateZ(0);
      text-decoration: none;
    }
    
    /* Underline only for headings, matching text width */
    .platform-dropdown a h4 {
      position: relative;
      display: inline-block;
    }
    
    .platform-dropdown a h4::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -2px;
      left: 0;
      background-color: #2563eb;
      transition: width 0.3s ease;
    }
    
    .platform-dropdown a:hover h4::after {
      width: 100%;
    }
    
    .platform-dropdown {
      position: fixed !important;
      left: 0 !important;
      right: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
      border-radius: 0 !important;
      border-left: none !important;
      border-right: none !important;
      top: 64px !important;
    }
    
    @media (max-width: 1024px) {
      .platform-dropdown {
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
      }
    }
    
    @media (max-width: 768px) {
      .platform-dropdown {
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
      }
    }
  `;
  document.head.appendChild(style);
}
