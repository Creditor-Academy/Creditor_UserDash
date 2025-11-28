import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopNav() {
  const [profileOpen, setProfileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileOpen]);
  return (
    <nav
      className="sticky top-0 z-40 bg-gradient-to-b from-white/[0.09] to-white/[0.03] backdrop-blur-3xl border-b border-white/[0.12]"
      style={{
        boxShadow:
          'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 8px 32px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-4 md:py-5 gap-4 relative max-w-full">
        {/* Animated Background */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs md:max-w-xl relative z-10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-500 group-hover:text-cyan-400 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder="Search organizations, users..."
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3.5 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] backdrop-blur-2xl border border-white/[0.12] hover:border-white/[0.18] focus:border-cyan-400/50 focus:bg-gradient-to-br focus:from-white/[0.1] focus:to-white/[0.04] outline-none transition-all text-sm md:text-base text-gray-100 group-hover:bg-gradient-to-br group-hover:from-white/[0.1] group-hover:to-white/[0.03]"
              style={{
                boxShadow:
                  '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset -1px -1px 0 rgba(0, 0, 0, 0.15)',
              }}
            />
            <style>{`
              input::placeholder {
                color: rgba(100, 116, 139, 0.7) !important;
              }
              input:focus::placeholder {
                color: rgba(100, 116, 139, 0.5) !important;
              }
              input {
                color-scheme: dark;
              }
            `}</style>
            {/* Reflection overlay - subtle glass effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent rounded-2xl pointer-events-none"></div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 md:space-x-3 ml-2 md:ml-8 relative z-10">
          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="hidden sm:flex items-center space-x-2 md:space-x-3 pl-2 pr-3 md:pr-4 py-2 rounded-2xl bg-white/[0.08] backdrop-blur-xl hover:bg-white/[0.12] transition-all hover:scale-105 border border-white/[0.1] hover:border-white/[0.15] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-8 md:w-10 h-8 md:h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl"></div>
                  <span className="relative z-10">SA</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 md:w-4 h-3 md:h-4 bg-emerald-400 rounded-full border-2 border-white/20 shadow-lg shadow-emerald-500/50"></div>
              </div>
              <div className="text-left hidden md:block relative z-10">
                <div className="text-sm font-semibold text-white">
                  Sarah Chen
                </div>
                <div className="text-xs text-gray-400">Super Admin</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 group-hover:text-cyan-300 transition-all relative z-10 duration-300 ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-gradient-to-br from-white/[0.15] via-white/[0.08] to-white/[0.02] backdrop-blur-3xl border border-white/[0.18] shadow-2xl overflow-hidden z-50"
                style={{
                  boxShadow:
                    '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/[0.1] transition-all text-sm font-medium group"
                >
                  <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
