import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  LogOut,
  Settings,
  User,
  Check,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

// Helper function to get initials from name
const getInitials = name => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

export default function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'loading...',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'System Update Available',
      message:
        'A new system update has been released. Please review the changelog.',
      time: '2 hours ago',
      read: false,
      type: 'system',
    },
    {
      id: 2,
      title: 'New User Registration',
      message:
        'User John Doe has successfully registered and completed verification.',
      time: '4 hours ago',
      read: false,
      type: 'user',
    },
    {
      id: 3,
      title: 'Course Completion Report',
      message: 'Monthly course completion report is ready for your review.',
      time: '1 day ago',
      read: false,
      type: 'report',
    },
    {
      id: 4,
      title: 'Security Alert',
      message:
        'Unusual login activity detected. Please verify recent access logs.',
      time: '2 days ago',
      read: false,
      type: 'security',
    },
    {
      id: 5,
      title: 'Welcome to SuperAdmin Dashboard',
      message:
        'Welcome! Your superadmin account has been successfully activated.',
      time: '1 week ago',
      read: true,
      type: 'welcome',
    },
  ]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token =
          localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/user/getUserProfile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data && response.data.data) {
          const user = response.data.data;
          setUserData({
            name:
              user.full_name ||
              `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
              'User',
            email: user.email || 'No email',
            firstName: user.first_name || '',
            lastName: user.last_name || '',
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile data');
        // Fallback to local storage if available
        const storedUser = localStorage.getItem('superadminData');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setUserData({
              name: user.name || 'User',
              email: user.email || 'No email',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
            });
          } catch (e) {
            console.error('Error parsing stored user data:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('superadminData');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const handleClearAllNotifications = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav
      className="fixed top-0 left-20 right-0 h-20 flex items-center justify-between px-8 z-40 transition-colors duration-300"
      style={{
        backgroundColor:
          theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${colors.border}`,
        boxShadow:
          theme === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center gap-3 flex-1">
        <span
          className="text-xl md:text-2xl font-bold whitespace-nowrap -ml-1"
          style={{ color: theme === 'dark' ? '#ffffff' : 'rgb(81, 55, 82)' }}
        >
          Athena LMS
        </span>
        <div className="flex-1 max-w-2xl">
          <div
            className="relative flex items-center rounded-2xl px-5 py-3 transition-colors duration-300"
            style={{
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.05)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <Search size={20} style={{ color: colors.text.tertiary }} />
            <input
              type="text"
              placeholder="Search analytics, reports, users..."
              className="flex-1 bg-transparent border-none outline-none ml-3 text-sm transition-colors duration-300"
              style={{ color: colors.text.primary }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-8">
        {/* Notification */}
        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 relative"
          style={{
            backgroundColor:
              theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.backgroundColor = colors.bg.hover)
          }
          onMouseLeave={e =>
            (e.currentTarget.style.backgroundColor =
              theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')
          }
          title="Notifications"
        >
          <Bell size={20} style={{ color: colors.text.muted }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: colors.accent.red }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Theme Switch */}
        <button
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor:
              theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.backgroundColor = colors.bg.hover)
          }
          onMouseLeave={e =>
            (e.currentTarget.style.backgroundColor =
              theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')
          }
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun size={20} style={{ color: colors.text.muted }} />
          ) : (
            <Moon size={20} style={{ color: colors.text.muted }} />
          )}
        </button>

        {/* Notification Dropdown */}
        {isNotificationOpen && (
          <div
            className="absolute right-4 top-16 w-96 max-h-96 rounded-xl shadow-2xl overflow-hidden z-50"
            style={{
              backgroundColor: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderColor: colors.border }}
            >
              <h3
                className="text-sm font-semibold"
                style={{ color: colors.text.primary }}
              >
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleClearAllNotifications}
                  className="text-xs px-2 py-1 rounded-md transition-colors"
                  style={{
                    color: colors.accent.blue,
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'rgba(59, 130, 246, 0.05)',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor = colors.bg.hover)
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor =
                      theme === 'dark'
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'rgba(59, 130, 246, 0.05)')
                  }
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div
                  className="divide-y"
                  style={{ borderColor: colors.border }}
                >
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:opacity-80 transition-opacity cursor-pointer"
                      style={{
                        backgroundColor: !notification.read
                          ? theme === 'dark'
                            ? 'rgba(59, 130, 246, 0.05)'
                            : 'rgba(59, 130, 246, 0.03)'
                          : 'transparent',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Notification Icon */}
                        <div
                          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{
                            backgroundColor: notification.read
                              ? colors.text.tertiary
                              : colors.accent.blue,
                          }}
                        />
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: colors.text.primary }}
                          >
                            {notification.title}
                          </p>
                          <p
                            className="text-xs mt-1 line-clamp-2"
                            style={{ color: colors.text.secondary }}
                          >
                            {notification.message}
                          </p>
                          <p
                            className="text-xs mt-2"
                            style={{ color: colors.text.tertiary }}
                          >
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Menu */}
        <div className="relative ml-2">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-11 h-11 rounded-xl overflow-hidden transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #FF7A3D, #A065F4)',
              boxShadow: '0 0 20px rgba(255,122,61,0.3)',
            }}
            title="Profile Menu"
          >
            <div className="w-full h-full flex items-center justify-center text-white font-semibold">
              {isLoading ? '...' : getInitials(userData.name)}
            </div>
          </button>

          {/* Dropdown */}
          {isProfileMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50"
              style={{
                backgroundColor: colors.bg.secondary,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: colors.border }}
              >
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: colors.text.primary }}
                  title={userData.name}
                >
                  {isLoading ? 'Loading...' : userData.name}
                </p>
                <p
                  className="text-xs mt-1 truncate"
                  style={{ color: colors.text.secondary }}
                  title={userData.email}
                >
                  {isLoading ? 'loading...' : userData.email}
                </p>
              </div>

              <div className="py-2">
                <button
                  onClick={() => {
                    navigate('/superadmin/profile');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-3"
                  style={{ color: colors.text.primary }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor = colors.bg.hover)
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <User size={16} />
                  <span className="text-sm">Profile</span>
                </button>

                {/* <button
                  className="w-full px-4 py-2 flex items-center gap-3"
                  style={{ color: colors.text.primary }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor = colors.bg.hover)
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <Settings size={16} />
                  <span className="text-sm">Settings</span>
                </button> */}

                <div
                  className="my-1"
                  style={{ borderTop: `1px solid ${colors.border}` }}
                ></div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 flex items-center gap-3"
                  style={{ color: '#EF4444' }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor =
                      'rgba(239, 68, 68, 0.1)')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}

          {isProfileMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsProfileMenuOpen(false)}
            />
          )}
        </div>

        {/* Notification Dropdown Overlay */}
        {isNotificationOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsNotificationOpen(false)}
          />
        )}
      </div>
    </nav>
  );
}
