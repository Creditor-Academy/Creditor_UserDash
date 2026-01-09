import {
  LayoutDashboard,
  Users,
  Building2,
  Headset,
  CreditCard,
  Database,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Sidebar() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [activePage, setActivePage] = useState('dashboard');
  const location = useLocation();

  useEffect(() => {
    // Sync the active button with the current route
    const segments = location.pathname.split('/').filter(Boolean);
    const page = segments[1] || 'dashboard'; // e.g., /superadmin/users -> users
    setActivePage(page);
  }, [location.pathname]);

  const navItems = [
    {
      icon: <LayoutDashboard size={22} />,
      label: 'Dashboard',
      path: 'dashboard',
    },
    {
      icon: <Building2 size={22} />,
      label: 'Organizations',
      path: 'organizations',
    },
    { icon: <Users size={22} />, label: 'Users', path: 'users' },
    {
      icon: <Headset size={22} />,
      label: 'Support Ticket',
      path: 'supportticket',
    },
    { icon: <CreditCard size={22} />, label: 'Billing', path: 'billing' },
    {
      icon: <Database size={22} />,
      label: 'Tokens & Space',
      path: 'tokens-space',
    },
  ];

  const handleNavClick = path => {
    setActivePage(path);
    window.dispatchEvent(
      new CustomEvent('navigatePage', { detail: { page: path } })
    );
  };

  return (
    <aside
      className="w-20 h-screen fixed left-0 top-0 flex flex-col items-center py-4 gap-6 transition-colors duration-300 overflow-visible"
      style={{ backgroundColor: colors.bg.secondary, zIndex: 1000 }}
    >
      <div className="mb-4">
        <img
          src="/logoathena.webp"
          alt="Athena Logo"
          className="w-[3.75rem] h-[3.75rem] object-contain drop-shadow-lg"
          style={{
            filter: 'drop-shadow(0 4px 6px rgba(197, 21, 21, 0.15))',
          }}
        />
      </div>

      {navItems.map((item, index) => (
        <div key={index} className="relative group" style={{ zIndex: 50 }}>
          <button
            onClick={() => handleNavClick(item.path)}
            className={`w-14 h-14 flex items-center justify-center transition-all duration-300 ${
              activePage === item.path ? 'rounded-[24px]' : 'rounded-xl'
            }`}
            style={
              activePage === item.path
                ? {
                    background: 'linear-gradient(135deg, #FF7A3D, #A065F4)',
                    boxShadow:
                      '0 0 30px rgba(255,122,61,0.25), 0 8px 20px rgba(0,0,0,0.4)',
                    color: '#FFFFFF',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: colors.text.muted,
                  }
            }
            onMouseEnter={e => {
              if (activePage !== item.path) {
                e.currentTarget.style.backgroundColor = colors.bg.hover;
              }
            }}
            onMouseLeave={e => {
              if (activePage !== item.path) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item.icon}
          </button>

          {/* Tooltip */}
          <div
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 whitespace-nowrap"
            style={{
              backgroundColor: colors.bg.secondary,
              color: colors.text.primary,
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              border: `1px solid ${colors.border || 'rgba(255,255,255,0.1)'}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              zIndex: 999999,
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </aside>
  );
}
