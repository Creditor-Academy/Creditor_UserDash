import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Headphones,
  Settings,
  ChevronLeft,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({
  collapsed,
  onToggle,
  activeSection,
  onSectionChange,
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Building2, label: 'Organizations', id: 'organizations' },
    { icon: Users, label: 'Users', id: 'users' },
    { icon: CreditCard, label: 'Billing', id: 'billing' },
    { icon: Headphones, label: 'Support', id: 'support' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-white/[0.12] via-white/[0.06] to-white/[0.02] backdrop-blur-3xl border-r border-white/[0.12] transition-all duration-500 ease-out z-50 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
      style={{
        boxShadow:
          'inset -1px 0 0 rgba(255, 255, 255, 0.15), 8px 0 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="flex flex-col h-full p-4 md:p-6 relative">
        {/* Animated Background Orbs */}
        <div className="absolute top-20 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/12 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/12 to-transparent rounded-full blur-3xl"></div>

        {/* Logo */}
        <div className="flex items-center justify-between mb-8 md:mb-12 relative z-10">
          {!collapsed && (
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-500/70 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-2xl"></div>
                <Zap className="w-6 h-6 text-white relative z-10" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Athena
              </span>
            </div>
          )}
          <button
            onClick={onToggle}
            className={`w-8 h-8 rounded-xl bg-gradient-to-br from-white/[0.12] to-white/[0.06] hover:from-white/[0.16] hover:to-white/[0.08] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 border border-white/[0.15] backdrop-blur-xl relative overflow-hidden group ${
              collapsed ? 'mx-auto' : ''
            }`}
            style={{
              boxShadow:
                '0 0 16px rgba(34, 211, 238, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-500 ease-out relative z-10 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 relative z-10">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={index}
                onClick={() => onSectionChange(item.id)}
                className={`flex items-center transition-all duration-300 group relative overflow-hidden rounded-2xl ${
                  collapsed
                    ? 'w-12 h-12 justify-center px-0'
                    : 'w-full gap-3 px-4 py-3'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30'
                    : 'hover:bg-white/[0.12]'
                }`}
                style={
                  isActive
                    ? {
                        boxShadow:
                          '0 0 32px rgba(34, 211, 238, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset -1px -1px 0 rgba(0, 0, 0, 0.2)',
                        border: '1.5px solid rgba(34, 211, 238, 0.35)',
                      }
                    : { border: '1px solid rgba(255, 255, 255, 0.1)' }
                }
                title={collapsed ? item.label : ''}
              >
                {/* Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent rounded-2xl pointer-events-none"></div>

                {/* Glow Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl rounded-2xl"></div>
                )}

                {/* Icon Container */}
                <div
                  className={`rounded-xl flex items-center justify-center transition-all relative overflow-hidden flex-shrink-0 ${
                    collapsed ? 'w-10 h-10' : 'w-11 h-11'
                  } ${
                    isActive
                      ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 shadow-lg shadow-cyan-500/70'
                      : 'bg-white/[0.12] group-hover:bg-white/[0.18] group-hover:shadow-lg group-hover:shadow-cyan-400/40'
                  }`}
                >
                  {/* Icon Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-xl"></div>
                  <Icon className="w-5 h-5 relative z-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Label */}
                {!collapsed && (
                  <span
                    className={`font-semibold transition-colors text-sm whitespace-nowrap ${
                      isActive
                        ? 'text-cyan-100'
                        : 'text-gray-300 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && !collapsed && (
                  <div className="absolute right-4 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-lg shadow-cyan-400/80 animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
