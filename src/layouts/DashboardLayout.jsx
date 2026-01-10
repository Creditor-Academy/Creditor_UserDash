import React, { useEffect, useState, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BackButton from '@/components/navigation/BackButton';
import CreditPurchaseModal from '@/components/credits/CreditPurchaseModal';
import { SeasonalThemeContext } from '@/contexts/SeasonalThemeContext';
import { Snowflake, Sparkles } from 'lucide-react';

// Create a context for the sidebar state
export const SidebarContext = React.createContext({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
});

export function DashboardLayout() {
  const location = useLocation();
  const { activeTheme } = useContext(SeasonalThemeContext);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [snowflakes, setSnowflakes] = useState([]);
  const [floatingSnowflakes, setFloatingSnowflakes] = useState([]);

  const isSeasonalActive = activeTheme === 'active';

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

  // Initialize snowflakes when winter theme is active
  useEffect(() => {
    if (isSeasonalActive) {
      // Falling snowflakes
      const flakes = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 6 + 3,
        duration: Math.random() * 10 + 8,
        delay: -(Math.random() * 10),
        opacity: Math.random() * 0.5 + 0.3,
        drift: Math.random() * 40 - 20,
        fallDistance: 120,
      }));
      setSnowflakes(flakes);

      // Floating snowflakes around the content
      const floatingFlakes = Array.from({ length: 8 }, (_, i) => ({
        id: i + 100,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 5 + 3,
        duration: Math.random() * 15 + 15,
        delay: Math.random() * 10,
      }));
      setFloatingSnowflakes(floatingFlakes);
    }
  }, [isSeasonalActive]);

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

  return (
    <SidebarContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
      <div className={`dashboard-shell flex min-h-screen w-full min-w-0 overflow-x-hidden ${isSeasonalActive ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
        
        {/* Winter Theme Background Elements */}
        {isSeasonalActive && (
          <>
            {/* Full Screen Winter Background Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: "url('https://cdn.pixabay.com/photo/2022/12/10/11/08/trees-7646958_1280.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-blue-100/10 via-transparent to-blue-100/20" />
            </div>

            {/* Animated Snowfall - Full Screen */}
            <div className="fixed inset-0 z-1 pointer-events-none overflow-hidden">
              {snowflakes.map(flake => (
                <div
                  key={flake.id}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: `${flake.left}%`,
                    top: `-${flake.fallDistance}px`,
                    width: `${flake.size}px`,
                    height: `${flake.size}px`,
                    opacity: flake.opacity,
                    animation: `snowfall ${flake.duration}s linear ${flake.delay}s infinite`,
                    '--drift': `${flake.drift}px`,
                    '--start-top': `-${flake.fallDistance}px`,
                    '--end-top': `110vh`,
                    boxShadow: '0 0 4px rgba(255, 255, 255, 0.7)',
                  }}
                />
              ))}
            </div>

            {/* Floating Snowflakes around the content */}
            <div className="fixed inset-0 z-2 pointer-events-none">
              {floatingSnowflakes.map(flake => (
                <div
                  key={flake.id}
                  className="absolute"
                  style={{
                    top: `${flake.top}%`,
                    left: `${flake.left}%`,
                    width: `${flake.size}px`,
                    height: `${flake.size}px`,
                    animation: `float ${flake.duration}s ease-in-out ${flake.delay}s infinite`,
                  }}
                >
                  <Snowflake className="w-full h-full text-blue-200/70" />
                </div>
              ))}
            </div>

            {/* Sparkle Effects */}
            <div className="fixed inset-0 z-3 pointer-events-none">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `sparkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-blue-300/60" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Sidebar - mobile drawer and desktop fixed */}
        <div
          className={
            `fixed top-0 left-0 h-screen z-30 
              ${isSeasonalActive ? 'bg-gradient-to-b from-blue-800/95 to-blue-900/95 backdrop-blur-sm' : 'bg-blue-700'} 
              text-white
              transform transition-transform duration-300 ` +
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
            className={`fixed inset-0 z-20 ${isSeasonalActive ? 'bg-black/30' : 'bg-black/40'} lg:hidden`}
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content area */}
        <div
          className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 relative z-10 ${sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-[17rem]'}`}
        >
          {/* Header - fixed at the top */}
          <header
            className={`fixed top-0 left-0 right-0 z-40 ${isSeasonalActive ? 'bg-white/90 backdrop-blur-sm border-blue-200/50' : 'bg-white border-gray-200'} border-b h-14 sm:h-16 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-[17rem]'}`}
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

      {/* Winter Theme CSS Animations */}
      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(var(--start-top)) translateX(0);
          }
          100% {
            transform: translateY(var(--end-top)) translateX(var(--drift));
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(180deg);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        ${isSeasonalActive ? `
          .dashboard-shell {
            position: relative;
          }
          
          /* Optional: Add winter styling to sidebar */
          .sidebar-winter-effect {
            background: linear-gradient(135deg, rgba(30, 64, 175, 0.9), rgba(37, 99, 235, 0.9));
            backdrop-filter: blur(10px);
          }
        ` : ''}
      `}</style>
    </SidebarContext.Provider>
  );
}

export default DashboardLayout;

