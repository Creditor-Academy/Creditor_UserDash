import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';

const SolutionsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
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
    <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="solutions-button flex items-center gap-1 text-white font-semibold text-lg transition-all duration-200 relative"
        style={{
          color: "#fff",
          fontWeight: "600",
          fontSize: "1.1rem",
          textDecoration: "none",
          transition: "all 0.2s ease",
          padding: "6px 0",
          position: "relative",
        }}
      >
        Solutions
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="fixed top-[64px] left-0 w-screen bg-white shadow-2xl border border-gray-200 overflow-hidden z-50 solutions-dropdown">
          <div className="flex flex-col lg:flex-row">
            {/* Left Column - "LMS Athena for" */}
            <div className="flex-1 p-6 lg:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">LMS Athena for</h3>
              <div className="flex flex-col gap-6">
                <a href="/academic_athena" className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Academies</h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Scale your professional training programs</p>
                </a>
                <a href="/company_athena" className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Companies</h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Surpass revenue targets and reduce churn</p>
                </a>
                <a href="/expert_athena" className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Experts</h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Turn your knowledge into new revenue streams</p>
                </a>
              </div>
            </div>

            {/* Right Column - "Solutions for" */}
            <div className="flex-1 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Solutions for</h3>
              <div className="flex flex-col gap-6">
                <a href="/revenue_generation" className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Revenue generation</h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Sell more with profitable learning experiences</p>
                </a>
                <a href="/customer_training" className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Customer training</h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Maximize customer success — and revenue</p>
                </a>
                <a href="/lead_generation" className="block group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-blue-50">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Lead generation</h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Fill your sales funnel with learning content</p>
                </a>
              </div>
            </div>

            {/* Athena Instructional Design Section */}
            <div className="w-full lg:w-80 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200">
              <div className="mb-6">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop&crop=faces"
                  alt="Instructional Design"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-gray-900">ATHENA</span>
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                    Instructional Design
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Create engaging and effective learning experiences with our instructional design expertise
                </p>
                <button
                  onClick={() => window.location.href = '/instructionaldesign'}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explore Design Solutions
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionsDropdown;

// Add custom styles for the dropdown
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .solutions-dropdown {
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
    
    /* Solutions button hover animation to match other nav links */
    .solutions-button:hover {
      color: #e0f0ff !important;
    }
    
    .solutions-button::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: #e0f0ff;
      transition: width 0.3s ease;
    }
    
    .solutions-button:hover::after {
      width: 100%;
    }
    
    /* Ensure no movement on hover */
    .solutions-dropdown a {
      transform: translateZ(0);
      will-change: background-color;
      text-decoration: none;
    }
    
    .solutions-dropdown a:hover {
      transform: translateZ(0);
      text-decoration: none;
    }
    
    /* Underline only for headings, matching text width */
    .solutions-dropdown a h4 {
      position: relative;
      display: inline-block;
    }
    
    .solutions-dropdown a h4::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -2px;
      left: 0;
      background-color: #2563eb;
      transition: width 0.3s ease;
    }
    
    .solutions-dropdown a:hover h4::after {
      width: 100%;
    }
    
    .solutions-dropdown {
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
      .solutions-dropdown {
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
      }
    }
    
    @media (max-width: 768px) {
      .solutions-dropdown {
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
      }
    }
  `;
  document.head.appendChild(style);
}
