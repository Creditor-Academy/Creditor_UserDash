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
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'loading...',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="flex-1 max-w-2xl mx-auto">
        <div
          className="relative flex items-center rounded-2xl px-5 py-3 transition-colors duration-300"
          style={{
            backgroundColor:
              theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
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

      <div className="flex items-center gap-4 ml-8">
        {/* Notification */}
        <button
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
        >
          <Bell size={20} style={{ color: colors.text.muted }} />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ backgroundColor: colors.accent.red }}
          ></span>
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
      </div>
    </nav>
  );
}
