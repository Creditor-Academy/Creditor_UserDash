import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BackButton from "@/components/navigation/BackButton";
import CreditPurchaseModal from "@/components/credits/CreditPurchaseModal";

// Create a context for the sidebar state
export const SidebarContext = React.createContext({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {}
});

export function DashboardLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  // Only show back button on specific pages where navigation back makes sense
  const pathsWithBackButton = [
    "/profile",
    "/faqs",
    "/support",
    "/guides",
    "/support/ticket", 
    "/privacy",
    "/avatar-picker"
  ];
  
  const showBackButton = pathsWithBackButton.some(path => location.pathname.startsWith(path));

  // Sidebar width values
  const expandedWidth = '17rem';
  const collapsedWidth = '4.5rem';

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
    // Auto-collapse sidebar for immersive pages like ScenarioTakePage
    const immersive = location.pathname.startsWith('/dashboard/scenario/take/');
    setSidebarCollapsed(immersive);
  }, [location.pathname]);

  return (
    <SidebarContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
      <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-gray-50 to-white">
        {/* Sidebar - mobile drawer and desktop fixed */}
        <div
          className={
            `fixed top-0 left-0 h-screen z-30 transform transition-transform duration-300 ` +
            `${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} ` +
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
          <header className={`fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-14 sm:h-16 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-[17rem]'}`}>
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
  );
}

export default DashboardLayout;