import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BackButton from "@/components/navigation/BackButton";

// Create a context for the sidebar state
export const SidebarContext = React.createContext({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {}
});

export function DashboardLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
  }, [location.pathname]);

  return (
    <SidebarContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-white">
        {/* Sidebar - fixed on the left */}
        <div className="fixed top-0 left-0 h-screen z-30">
          <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        </div>
        {/* Main content area */}
        <div
          className="flex-1 flex flex-col min-h-screen transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? collapsedWidth : expandedWidth }}
        >
          {/* Header - fixed at the top */}
          <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-16 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? collapsedWidth : expandedWidth }}>
            <DashboardHeader sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
          </header>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto pt-16">
            <div className="max-w-7xl mx-auto w-full">
              {showBackButton && (
                <div className="px-6 pt-6">
                  <BackButton />
                </div>
              )}
              <motion.main 
                className="p-6 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Outlet context={{ sidebarCollapsed, setSidebarCollapsed }} />
              </motion.main>
            </div>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

export default DashboardLayout;