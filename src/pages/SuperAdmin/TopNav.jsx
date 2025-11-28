import React from 'react';
import { Search, Bell, Settings, ChevronDown } from 'lucide-react';

export default function TopNav() {
  return (
    <nav
      className="sticky top-0 z-40 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-3xl border-b border-white/[0.1]"
      style={{
        boxShadow:
          'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-4 md:py-5 gap-4 relative">
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
          {/* Notifications */}
          <button className="w-12 h-12 rounded-2xl bg-white/[0.08] backdrop-blur-xl hover:bg-white/[0.12] flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 border border-white/[0.1] hover:border-white/[0.15] relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Bell className="w-5 h-5 text-white relative z-10" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full text-xs font-bold flex items-center justify-center shadow-lg shadow-cyan-500/50 text-white animate-pulse">
              5
            </span>
          </button>

          {/* Settings */}
          <button className="w-12 h-12 rounded-2xl bg-white/[0.08] backdrop-blur-xl hover:bg-white/[0.12] flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 border border-white/[0.1] hover:border-white/[0.15] group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Settings className="w-5 h-5 text-white relative z-10 group-hover:rotate-90 transition-transform duration-500" />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gradient-to-b from-white/[0.1] via-white/[0.05] to-transparent mx-1 md:mx-2 hidden sm:block"></div>

          {/* Profile */}
          <button className="hidden sm:flex items-center space-x-2 md:space-x-3 pl-2 pr-3 md:pr-4 py-2 rounded-2xl bg-white/[0.08] backdrop-blur-xl hover:bg-white/[0.12] transition-all hover:scale-105 border border-white/[0.1] hover:border-white/[0.15] group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-8 md:w-10 h-8 md:h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl"></div>
                <span className="relative z-10">SA</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 md:w-4 h-3 md:h-4 bg-emerald-400 rounded-full border-2 border-white/20 shadow-lg shadow-emerald-500/50"></div>
            </div>
            <div className="text-left hidden md:block relative z-10">
              <div className="text-sm font-semibold text-white">Sarah Chen</div>
              <div className="text-xs text-gray-400">Super Admin</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-cyan-300 transition-colors relative z-10 group-hover:rotate-180 duration-300" />
          </button>
        </div>
      </div>
    </nav>
  );
}
