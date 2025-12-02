import { Users, MousePointer, ShoppingBag, Package, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import HeroPanel from '../components/HeroPanel';
import MetricCard from '../components/MetricCard';
import ActiveUsersChart from '../components/ActiveUsersChart';
import SalesCard from '../components/SalesCard';
import VideoTable from '../components/VideoTable';
import AddOrganizationModal from '../components/AddOrganizationModal';
import { darkTheme, lightTheme } from '../theme/colors';
import { useState, useEffect } from 'react';
import Organizations from './Organizations';
import UsersPage from './Users';
import SupportTicket from './SupportTicket';
import Billing from './Billing';

function SuperAdminDashboardContent() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);

  useEffect(() => {
    const handleNavigation = (event: Event) => {
      const customEvent = event as CustomEvent;
      setCurrentPage(customEvent.detail.page);
    };

    window.addEventListener('navigatePage', handleNavigation);
    return () => window.removeEventListener('navigatePage', handleNavigation);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'organizations':
        return <Organizations />;
      case 'users':
        return <UsersPage />;
      case 'supportticket':
        return <SupportTicket />;
      case 'billing':
        return <Billing />;
      case 'dashboard':
      default:
        return (
          <main className="ml-20 pt-24 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-8">
              <div className="w-full">
                <HeroPanel
                  onAddOrganization={() => setIsAddOrgModalOpen(true)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <MetricCard
                  icon={Users}
                  label="Total Users"
                  value="8,462"
                  color={colors.accent.blue}
                />
                <MetricCard
                  icon={MousePointer}
                  label="Total Clicks"
                  value="124.5K"
                  color={colors.accent.pink}
                />
                <MetricCard
                  icon={ShoppingBag}
                  label="Total Sales"
                  value="$54,230"
                  color={colors.accent.orange}
                />
                <MetricCard
                  icon={Package}
                  label="Total Items"
                  value="1,845"
                  color={colors.accent.red}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2">
                  <ActiveUsersChart />
                </div>
                <div>
                  <SalesCard />
                </div>
              </div>

              <VideoTable />
            </div>
          </main>
        );
    }
  };

  return (
    <div
      className="h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: colors.bg.primary }}
    >
      <Sidebar />
      <TopNav />
      {renderPage()}
      <AddOrganizationModal
        isOpen={isAddOrgModalOpen}
        onClose={() => setIsAddOrgModalOpen(false)}
      />
    </div>
  );
}

export default function SuperAdminDashboard() {
  return <SuperAdminDashboardContent />;
}
