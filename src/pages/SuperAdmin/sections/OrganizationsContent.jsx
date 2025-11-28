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
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div
          className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.01] backdrop-blur-3xl border border-white/[0.12] overflow-hidden"
          style={{
            boxShadow:
              '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-lg"></div>
                <Building2 className="w-5 h-5 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Organizations
                </h1>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  Manage and monitor all registered organizations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {organizations.map(org => (
          <div
            key={org.id}
            className="group rounded-xl bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.01] backdrop-blur-3xl border border-white/[0.12] hover:border-white/[0.18] transition-all duration-200 hover:scale-102 relative overflow-hidden cursor-pointer"
            style={{
              boxShadow:
                '0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Top border glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none"></div>

            <div className="relative z-10 p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {org.name}
                  </h3>
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/25">
                    {org.status}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md relative overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-lg"></div>
                  <Building2 className="w-5 h-5 text-white relative z-10" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg bg-white/[0.08] p-3 border border-white/[0.1]">
                  <div className="text-xs text-gray-500 mb-1 font-medium">
                    Users
                  </div>
                  <div className="text-xl font-bold text-cyan-300">
                    {org.users}
                  </div>
                </div>
                <div className="rounded-lg bg-white/[0.08] p-3 border border-white/[0.1]">
                  <div className="text-xs text-gray-500 mb-1 font-medium">
                    Courses
                  </div>
                  <div className="text-xl font-bold text-blue-300">
                    {org.courses}
                  </div>
                </div>
                <div className="rounded-lg bg-white/[0.08] p-3 border border-white/[0.1]">
                  <div className="text-xs text-gray-500 mb-1 font-medium">
                    Revenue
                  </div>
                  <div className="text-xl font-bold text-emerald-300">
                    {org.revenue}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{org.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>{org.phone}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
