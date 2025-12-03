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
  const [orgData, setOrgData] = useState(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [activeUsersData, setActiveUsersData] = useState(null);
  const [activeUsersLoading, setActiveUsersLoading] = useState(true);

  useEffect(() => {
    const handleNavigation = event => {
      const customEvent = event;
      setCurrentPage(customEvent.detail.page);
    };

    window.addEventListener('navigatePage', handleNavigation);
    return () => window.removeEventListener('navigatePage', handleNavigation);
  }, []);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        setOrgLoading(true);
        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
        const url = `${apiBaseUrl}/api/org/countOrg`;
        const accessToken = localStorage.getItem('authToken');

        console.log('Fetching organization data from:', url);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const result = await response.json();
        console.log('Organization data response:', result);
        if (result.success && result.data) {
          setOrgData({
            totalOrganizations: result.data.totalOrganizations,
            percentAdded: result.data.percentAdded,
          });
        } else {
          console.warn('Unexpected response format:', result);
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
      } finally {
        setOrgLoading(false);
      }
    };

    fetchOrgData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserLoading(true);
        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
        const url = `${apiBaseUrl}/api/org/countUsers`;
        const accessToken = localStorage.getItem('authToken');

        console.log('Fetching user data from:', url);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const result = await response.json();
        console.log('User data response:', result);

        if (result.success && result.data) {
          setUserData({
            totalUsers: result.data.totalUsers,
            percentAdded: result.data.percentAdded,
          });
        } else {
          console.warn('Unexpected response format:', result);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchActiveUsersData = async () => {
      try {
        setActiveUsersLoading(true);
        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
        const url = `${apiBaseUrl}/api/org/activeUsers`;
        const accessToken = localStorage.getItem('authToken');

        console.log('Fetching active users data from:', url);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const result = await response.json();
        console.log('Active users data response:', result);

        if (result.success && result.data) {
          setActiveUsersData({
            activeUsers: result.data.activeUsers,
            growthRate: result.data.growthRate,
          });
        } else {
          console.warn('Unexpected response format:', result);
        }
      } catch (error) {
        console.error('Error fetching active users data:', error);
      } finally {
        setActiveUsersLoading(false);
      }
    };

    fetchActiveUsersData();
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
                  value={
                    userLoading
                      ? 'Loading...'
                      : String(userData?.totalUsers || 0)
                  }
                  color={colors.accent.blue}
                  subtitle={userData?.percentAdded}
                />
                <MetricCard
                  icon={MousePointer}
                  label="Total Organizations"
                  value={
                    orgLoading
                      ? 'Loading...'
                      : String(orgData?.totalOrganizations || 0)
                  }
                  color={colors.accent.pink}
                  subtitle={orgData?.percentAdded}
                />
                <MetricCard
                  icon={ShoppingBag}
                  label="Active Users"
                  value={
                    activeUsersLoading
                      ? 'Loading...'
                      : String(activeUsersData?.activeUsers || 0)
                  }
                  color={colors.accent.orange}
                  subtitle={activeUsersData?.growthRate}
                />
                <MetricCard
                  icon={Package}
                  label="Total Storage used"
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
