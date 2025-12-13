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
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-white/[0.15] via-white/[0.08] to-white/[0.03] backdrop-blur-3xl border-r border-white/[0.15] transition-all duration-500 ease-out z-50 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
      style={{
        boxShadow:
          'inset -1px 0 0 rgba(255, 255, 255, 0.18), 8px 0 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="flex flex-col h-full p-4 md:p-5 relative">
        {/* Animated Background Orbs */}
        <div className="absolute top-20 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/15 to-transparent rounded-full blur-3xl"></div>

        {/* Logo */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-xl"></div>
                <Zap className="w-5 h-5 text-white relative z-10" />
              </div>
              <div>
                <span className="text-lg font-bold text-cyan-300 block">
                  Athena LMS
                </span>
                <span className="text-sm text-gray-500">Super Admin</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/40 relative overflow-hidden mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-xl"></div>
              <Zap className="w-5 h-5 text-white relative z-10" />
            </div>
          )}
          <button
            onClick={onToggle}
            className={`w-7 h-7 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] flex items-center justify-center transition-all border border-white/[0.12] ${
              collapsed ? 'mx-auto' : ''
            }`}
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 text-gray-400 ${collapsed ? 'rotate-180' : ''}`}
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
                className={`flex items-center transition-all duration-200 group relative overflow-hidden rounded-lg ${
                  collapsed
                    ? 'w-10 h-10 justify-center px-0'
                    : 'w-full gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-cyan-500/20 border border-cyan-500/30'
                    : 'hover:bg-white/[0.08] border border-transparent'
                }`}
                title={collapsed ? item.label : ''}
              >
                {/* Icon Container */}
                <div
                  className={`rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                    collapsed ? 'w-9 h-9' : 'w-9 h-9'
                  } ${isActive ? 'bg-cyan-500/30' : 'bg-white/[0.08]'}`}
                >
                  <Icon
                    className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-cyan-300' : 'text-gray-400'}`}
                  />
                </div>

                {/* Label */}
                {!collapsed && (
                  <span
                    className={`font-medium transition-colors text-sm whitespace-nowrap ${
                      isActive ? 'text-cyan-200' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
