import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import HeroAnalytics from './HeroAnalytics';
import AnalyticsChart from './AnalyticsChart';
import RevenueInsights from './RevenueInsights';
import ActivityFeed from './ActivityFeed';
import DashboardContent from './sections/DashboardContent';
import OrganizationsContent from './sections/OrganizationsContent';
import UsersContent from './sections/UsersContent';
import BillingContent from './sections/BillingContent';
import SupportContent from './sections/SupportContent';

export default function SuperAdminDashboard() {
  const { logout, userRoles } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    console.log('[SuperAdminDashboard] Mounted with roles:', userRoles);
  }, [userRoles]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'organizations':
        return <OrganizationsContent />;
      case 'users':
        return <UsersContent />;
      case 'billing':
        return <BillingContent />;
      case 'support':
        return <DashboardContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E1015] via-[#141820] to-[#1A1D28] text-white overflow-x-hidden">
      <div className="flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div
          className={`flex-1 transition-all duration-500 ease-out ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}
        >
          <TopNav />

          <main className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
