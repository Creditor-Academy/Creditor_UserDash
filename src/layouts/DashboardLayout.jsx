import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BackButton from '@/components/navigation/BackButton';
import CreditPurchaseModal from '@/components/credits/CreditPurchaseModal';
import { SeasonalThemeContext } from '@/contexts/SeasonalThemeContext';

// Create a context for the sidebar state
export const SidebarContext = React.createContext({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
});

export function DashboardLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [isChristmasMode, setIsChristmasMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('dashboardChristmasMode') === 'true';
    } catch {
      return false;
    }
  });

  // Only show back button on specific pages where navigation back makes sense
  const pathsWithBackButton = [
    '/profile',
    '/faqs',
    '/support',
    '/guides',
    '/support/ticket',
    '/privacy',
    '/avatar-picker',
  ];

  const showBackButton = pathsWithBackButton.some(path =>
    location.pathname.startsWith(path)
  );

  // Sidebar width values
  const expandedWidth = '17rem';
  const collapsedWidth = '4.5rem';

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
    // Auto-collapse sidebar for immersive pages like ScenarioTakePage and LessonBuilder
    const immersive =
      location.pathname.startsWith('/dashboard/scenario/take/') ||
      (location.pathname.includes('/lesson/') &&
        location.pathname.includes('/builder'));
    setSidebarCollapsed(immersive);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    document.body.classList.toggle('christmas-theme', isChristmasMode);
    return () => {
      document.body.classList.remove('christmas-theme');
    };
  }, [isChristmasMode]);

  const toggleChristmasMode = () => {
    setIsChristmasMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('dashboardChristmasMode', String(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  // Generate snowflakes for animation - covers entire layout including sidebar
  const snowflakes = useMemo(() => {
    if (!isChristmasMode) return [];

    // Create 100 snowflakes with varied properties
    return Array.from({ length: 100 }, (_, i) => {
      const size = 3 + Math.random() * 6; // Size between 3-9px
      const left = Math.random() * 100; // Random horizontal position
      const delay = Math.random() * 2; // Start delay 0-2s for staggered effect
      const duration = 8 + Math.random() * 7; // Fall duration 8-15s (varied speeds)
      const drift = (Math.random() - 0.5) * 60; // Horizontal drift -30px to +30px
      const opacity = 0.5 + Math.random() * 0.5; // Opacity 0.5-1.0

      return {
        id: i,
        left: `${left}%`,
        size: `${size}px`,
        delay: `${delay}s`,
        duration: `${duration}s`,
        drift: `${drift}px`,
        opacity,
      };
    });
  }, [isChristmasMode]);

  return (
    <SeasonalThemeContext.Provider
      value={{ isChristmasMode, toggleChristmasMode }}
    >
      <SidebarContext.Provider
        value={{ sidebarCollapsed, setSidebarCollapsed }}
      >
        <div
          className={`dashboard-shell flex min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-gray-50 to-white ${
            isChristmasMode ? 'christmas-theme' : ''
          }`}
        >
          {/* Snowflake Animation - covers entire layout including sidebar */}
          {isChristmasMode && (
            <div
              className="snowflakes-container pointer-events-none"
              aria-hidden="true"
            >
              {snowflakes.map(flake => (
                <div
                  key={flake.id}
                  className="snowflake"
                  style={{
                    left: flake.left,
                    width: flake.size,
                    height: flake.size,
                    animationDelay: flake.delay,
                    animationDuration: flake.duration,
                    opacity: flake.opacity,
                    '--snowflake-drift': flake.drift,
                  }}
                />
              ))}
            </div>
          )}
          {/* Sidebar - mobile drawer and desktop fixed */}
          <div
            className={
              `fixed top-0 left-0 h-screen z-30 transform transition-transform duration-300 ` +
              `${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ` +
              `lg:translate-x-0`
            }
          >
            <Sidebar
              collapsed={sidebarCollapsed}
              setCollapsed={setSidebarCollapsed}
              onCreditorCardClick={() => setCreditModalOpen(true)}
            />
          </div>

          {/* Mobile overlay */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Main content area */}
          <div
            className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-[17rem]'}`}
          >
            {/* Header - fixed at the top */}
            <header
              className={`fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-14 sm:h-16 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-[17rem]'}`}
            >
              <DashboardHeader
                sidebarCollapsed={sidebarCollapsed}
                onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
              />
            </header>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain pt-14 sm:pt-16">
              <div className="max-w-7xl mx-auto w-full min-w-0">
                {showBackButton && (
                  <div className="px-6 pt-6">
                    <BackButton />
                  </div>
                )}
                <motion.main
                  className="p-4 sm:p-5 lg:p-6 pt-3 sm:pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Outlet />
                </motion.main>
              </div>
            </div>
          </div>
        </div>
        {/* Credit Purchase Modal */}
        <CreditPurchaseModal
          open={creditModalOpen}
          onClose={() => setCreditModalOpen(false)}
        />
      </SidebarContext.Provider>
    </SeasonalThemeContext.Provider>
  );
}

export default DashboardLayout;
