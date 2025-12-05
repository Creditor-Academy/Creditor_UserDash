import {
  Users,
  MousePointer,
  ShoppingBag,
  Package,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import HeroPanel from '../components/HeroPanel';
import MetricCard from '../components/MetricCard';
import ActiveUsersChart from '../components/ActiveUsersChart';
import AddOrganizationModal from '../components/AddOrganizationModal';
import { darkTheme, lightTheme } from '../theme/colors';
import { useState, useEffect } from 'react';
import Organizations from './Organizations';
import UsersPage from './Users';
import SupportTicket from './SupportTicket';
import Billing from './Billing';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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
          <main className="ml-20 pt-24 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto mt-10">
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
                <div
                  className="rounded-2xl p-6 transition-colors duration-300"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border || 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.text.primary }}
                  >
                    Pending Bills
                  </h3>
                  <div className="space-y-3">
                    <div
                      className="flex justify-between items-center pb-3 border-b border-opacity-10"
                      style={{
                        borderColor: colors.border || 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <span style={{ color: colors.text.muted }}>Org A</span>
                      <span style={{ color: colors.accent.red }}>$2,450</span>
                    </div>
                    <div
                      className="flex justify-between items-center pb-3 border-b border-opacity-10"
                      style={{
                        borderColor: colors.border || 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <span style={{ color: colors.text.muted }}>Org B</span>
                      <span style={{ color: colors.accent.red }}>$1,200</span>
                    </div>
                    <div
                      className="flex justify-between items-center pb-3 border-b border-opacity-10"
                      style={{
                        borderColor: colors.border || 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <span style={{ color: colors.text.muted }}>Org C</span>
                      <span style={{ color: colors.accent.red }}>$890</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span
                        style={{ color: colors.text.primary }}
                        className="font-semibold"
                      >
                        Total
                      </span>
                      <span
                        style={{ color: colors.accent.orange }}
                        className="font-semibold"
                      >
                        $4,540
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div
                  className="rounded-2xl p-6 transition-colors duration-300"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border || 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.text.primary }}
                  >
                    Organization Growth
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span style={{ color: colors.text.muted }}>
                          Active Orgs
                        </span>
                        <span style={{ color: colors.accent.blue }}>85%</span>
                      </div>
                      <div
                        className="w-full h-2 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: '85%',
                            background:
                              'linear-gradient(90deg, #3B82F6, #1D4ED8)',
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span style={{ color: colors.text.muted }}>
                          Pending Approval
                        </span>
                        <span style={{ color: colors.accent.orange }}>12%</span>
                      </div>
                      <div
                        className="w-full h-2 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: '12%',
                            background:
                              'linear-gradient(90deg, #FF7A3D, #FF5C1A)',
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span style={{ color: colors.text.muted }}>
                          Inactive
                        </span>
                        <span style={{ color: colors.accent.red }}>3%</span>
                      </div>
                      <div
                        className="w-full h-2 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: '3%',
                            background:
                              'linear-gradient(90deg, #EF4444, #DC2626)',
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-6 transition-colors duration-300"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border || 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-6"
                    style={{ color: colors.text.primary }}
                  >
                    Storage Used
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <p
                            style={{ color: colors.text.muted }}
                            className="text-sm mb-1"
                          >
                            Total Storage
                          </p>
                          <p
                            style={{ color: colors.accent.blue }}
                            className="text-3xl font-bold"
                          >
                            1,845 GB
                          </p>
                        </div>
                        <p
                          style={{ color: colors.text.muted }}
                          className="text-sm"
                        >
                          of 2,000 GB
                        </p>
                      </div>
                      <div
                        className="w-full h-3 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: '92%',
                            background:
                              'linear-gradient(90deg, #3B82F6, #1D4ED8)',
                          }}
                        ></div>
                      </div>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-xs mt-2"
                      >
                        92% used
                      </p>
                    </div>
                    <div
                      className="grid grid-cols-2 gap-4 pt-4 border-t border-opacity-10"
                      style={{
                        borderColor: colors.border || 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <div>
                        <p
                          style={{ color: colors.text.muted }}
                          className="text-xs mb-1"
                        >
                          Available
                        </p>
                        <p
                          style={{ color: colors.accent.green }}
                          className="text-lg font-semibold"
                        >
                          155 GB
                        </p>
                      </div>
                      <div>
                        <p
                          style={{ color: colors.text.muted }}
                          className="text-xs mb-1"
                        >
                          Used
                        </p>
                        <p
                          style={{ color: colors.accent.orange }}
                          className="text-lg font-semibold"
                        >
                          1,845 GB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
                <div
                  className="rounded-2xl p-6 transition-colors duration-300"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border || 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-6"
                    style={{ color: colors.text.primary }}
                  >
                    Users Growth Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        { month: 'Jan', users: 12, activeUsers: 5 },
                        { month: 'Feb', users: 15, activeUsers: 7 },
                        { month: 'Mar', users: 18, activeUsers: 9 },
                        { month: 'Apr', users: 22, activeUsers: 11 },
                        { month: 'May', users: 25, activeUsers: 13 },
                      ]}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={colors.border || 'rgba(255,255,255,0.1)'}
                      />
                      <XAxis stroke={colors.text.muted} />
                      <YAxis stroke={colors.text.muted} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: colors.bg.primary,
                          border: `1px solid ${colors.border}`,
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="activeUsers"
                        stroke="#FF7A3D"
                        strokeWidth={2}
                        dot={{ fill: '#FF7A3D' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div
                  className="rounded-2xl p-6 transition-colors duration-300"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border || 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-6"
                    style={{ color: colors.text.primary }}
                  >
                    Organizations Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: 6 },
                          { name: 'Pending', value: 1 },
                          { name: 'Inactive', value: 1 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#3B82F6" />
                        <Cell fill="#FF7A3D" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div
                  className="rounded-2xl p-6 transition-colors duration-300"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border || 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-6"
                    style={{ color: colors.text.primary }}
                  >
                    Billing Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-sm mb-2"
                      >
                        Total Revenue
                      </p>
                      <p
                        style={{ color: colors.accent.blue }}
                        className="text-2xl font-bold"
                      >
                        $7,500
                      </p>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-xs mt-1"
                      >
                        2 paid invoices
                      </p>
                    </div>
                    <div>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-sm mb-2"
                      >
                        Pending Amount
                      </p>
                      <p
                        style={{ color: colors.accent.orange }}
                        className="text-2xl font-bold"
                      >
                        $8,300
                      </p>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-xs mt-1"
                      >
                        2 pending invoices
                      </p>
                    </div>
                    <div>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-sm mb-2"
                      >
                        Overdue Amount
                      </p>
                      <p
                        style={{ color: colors.accent.red }}
                        className="text-2xl font-bold"
                      >
                        $7,200
                      </p>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-xs mt-1"
                      >
                        1 overdue invoice
                      </p>
                    </div>
                    <div>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-sm mb-2"
                      >
                        Total Invoices
                      </p>
                      <p
                        style={{ color: colors.accent.pink }}
                        className="text-2xl font-bold"
                      >
                        6
                      </p>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-xs mt-1"
                      >
                        All time invoices
                      </p>
                    </div>
                  </div>
                  <div
                    className="pt-4 border-t border-opacity-10"
                    style={{
                      borderColor: colors.border || 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <p
                      style={{ color: colors.text.primary }}
                      className="font-medium mb-3"
                    >
                      Revenue Trend
                    </p>
                    <div className="flex items-end gap-2 h-20">
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full rounded-t"
                          style={{
                            height: '40%',
                            backgroundColor: 'rgba(59, 130, 246, 0.3)',
                          }}
                        ></div>
                        <p
                          style={{ color: colors.text.muted }}
                          className="text-xs mt-2"
                        >
                          Jan
                        </p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full rounded-t"
                          style={{
                            height: '60%',
                            backgroundColor: 'rgba(59, 130, 246, 0.5)',
                          }}
                        ></div>
                        <p
                          style={{ color: colors.text.muted }}
                          className="text-xs mt-2"
                        >
                          Feb
                        </p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full rounded-t"
                          style={{
                            height: '80%',
                            backgroundColor: 'rgba(59, 130, 246, 0.7)',
                          }}
                        ></div>
                        <p
                          style={{ color: colors.text.muted }}
                          className="text-xs mt-2"
                        >
                          Mar
                        </p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full rounded-t"
                          style={{
                            height: '100%',
                            backgroundColor: 'rgba(59, 130, 246, 1)',
                          }}
                        ></div>
                        <p
                          style={{ color: colors.text.muted }}
                          className="text-xs mt-2"
                        >
                          Apr
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-6 transition-colors duration-300"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border || 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-6"
                    style={{ color: colors.text.primary }}
                  >
                    Support Tickets
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-sm mb-2"
                      >
                        Total Tickets
                      </p>
                      <p
                        style={{ color: colors.accent.blue }}
                        className="text-2xl font-bold"
                      >
                        5
                      </p>
                    </div>
                    <div>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-sm mb-2"
                      >
                        Open Tickets
                      </p>
                      <p
                        style={{ color: colors.accent.orange }}
                        className="text-2xl font-bold"
                      >
                        2
                      </p>
                    </div>
                    <div>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-sm mb-2"
                      >
                        In Progress
                      </p>
                      <p
                        style={{ color: colors.accent.yellow }}
                        className="text-2xl font-bold"
                      >
                        2
                      </p>
                    </div>
                    <div>
                      <p
                        style={{ color: colors.text.muted }}
                        className="text-sm mb-2"
                      >
                        Resolved
                      </p>
                      <p
                        style={{ color: colors.accent.green }}
                        className="text-2xl font-bold"
                      >
                        1
                      </p>
                    </div>
                  </div>
                  <div
                    className="pt-4 border-t border-opacity-10"
                    style={{
                      borderColor: colors.border || 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <p
                      style={{ color: colors.text.primary }}
                      className="font-medium mb-3"
                    >
                      Recent Tickets
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-2">
                        <div>
                          <p
                            style={{ color: colors.text.primary }}
                            className="text-sm font-medium"
                          >
                            Login issues on mobile app
                          </p>
                          <p
                            style={{ color: colors.text.muted }}
                            className="text-xs"
                          >
                            Acme Corp
                          </p>
                        </div>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: colors.accent.red,
                          }}
                        >
                          High
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2">
                        <div>
                          <p
                            style={{ color: colors.text.primary }}
                            className="text-sm font-medium"
                          >
                            Dashboard loading slowly
                          </p>
                          <p
                            style={{ color: colors.text.muted }}
                            className="text-xs"
                          >
                            Globex
                          </p>
                        </div>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            color: colors.accent.orange,
                          }}
                        >
                          Medium
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            style={{ color: colors.text.primary }}
                            className="text-sm font-medium"
                          >
                            Payment gateway error
                          </p>
                          <p
                            style={{ color: colors.text.muted }}
                            className="text-xs"
                          >
                            Soylent Corp
                          </p>
                        </div>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: colors.accent.red,
                          }}
                        >
                          Critical
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
