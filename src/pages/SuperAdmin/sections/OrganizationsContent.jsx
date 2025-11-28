import React from 'react';
import { Building2, Users, TrendingUp, Mail, Phone } from 'lucide-react';

export default function OrganizationsContent() {
  const organizations = [
    {
      id: 1,
      name: 'Tech Academy',
      users: 1250,
      courses: 45,
      revenue: '$12,500',
      status: 'Active',
      email: 'admin@techacademy.com',
      phone: '+1 (555) 123-4567',
    },
    {
      id: 2,
      name: 'Global Learning Hub',
      users: 3420,
      courses: 89,
      revenue: '$34,200',
      status: 'Active',
      email: 'contact@globallearning.com',
      phone: '+1 (555) 234-5678',
    },
    {
      id: 3,
      name: 'Professional Development',
      users: 892,
      courses: 28,
      revenue: '$8,920',
      status: 'Active',
      email: 'info@profdev.com',
      phone: '+1 (555) 345-6789',
    },
    {
      id: 4,
      name: 'Creative Institute',
      users: 2150,
      courses: 67,
      revenue: '$21,500',
      status: 'Active',
      email: 'hello@creativeinst.com',
      phone: '+1 (555) 456-7890',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div
          className="rounded-3xl md:rounded-[40px] p-8 md:p-12 lg:p-16 bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-white/[0.02] backdrop-blur-3xl border border-white/[0.15] overflow-hidden"
          style={{
            boxShadow:
              '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset -1px -1px 0 rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.1] via-white/[0.03] to-transparent rounded-3xl md:rounded-[40px] pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.2] to-transparent rounded-3xl pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 rounded-3xl md:rounded-[40px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-5 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/60 relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent rounded-2xl"></div>
                <Building2 className="w-8 h-8 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                  Organizations
                </h1>
                <p className="text-gray-400 text-base md:text-lg mt-3">
                  Manage and monitor all registered organizations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {organizations.map(org => (
          <div
            key={org.id}
            className="group rounded-3xl bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.02] backdrop-blur-3xl border border-white/[0.12] hover:border-white/[0.2] transition-all duration-300 hover:scale-105 relative overflow-hidden cursor-pointer"
            style={{
              boxShadow:
                '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset -1px -1px 0 rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent rounded-3xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent rounded-3xl pointer-events-none"></div>

            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-transparent group-hover:from-cyan-500/15 transition-all duration-500 rounded-3xl pointer-events-none"></div>

            <div className="relative z-10 p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {org.name}
                  </h3>
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                    {org.status}
                  </div>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/60 relative overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent rounded-xl"></div>
                  <Building2 className="w-7 h-7 text-white relative z-10" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-5 mb-8">
                <div className="rounded-2xl bg-gradient-to-br from-white/[0.1] via-white/[0.04] to-white/[0.01] p-5 border border-white/[0.12] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent rounded-2xl pointer-events-none"></div>
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent rounded-2xl pointer-events-none"></div>
                  <div className="text-xs text-gray-500 mb-3 relative z-10 font-medium">
                    Users
                  </div>
                  <div className="text-3xl font-bold text-cyan-300 relative z-10">
                    {org.users}
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-white/[0.1] via-white/[0.04] to-white/[0.01] p-5 border border-white/[0.12] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent rounded-2xl pointer-events-none"></div>
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent rounded-2xl pointer-events-none"></div>
                  <div className="text-xs text-gray-500 mb-3 relative z-10 font-medium">
                    Courses
                  </div>
                  <div className="text-3xl font-bold text-blue-300 relative z-10">
                    {org.courses}
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-white/[0.1] via-white/[0.04] to-white/[0.01] p-5 border border-white/[0.12] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent rounded-2xl pointer-events-none"></div>
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent rounded-2xl pointer-events-none"></div>
                  <div className="text-xs text-gray-500 mb-3 relative z-10 font-medium">
                    Revenue
                  </div>
                  <div className="text-3xl font-bold text-emerald-300 relative z-10">
                    {org.revenue}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 pt-8 border-t border-white/[0.1]">
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate font-medium">{org.email}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="font-medium">{org.phone}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
