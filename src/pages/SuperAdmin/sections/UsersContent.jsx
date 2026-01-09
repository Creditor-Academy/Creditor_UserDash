import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  Search,
  ChevronDown,
  MoreVertical,
  Shield,
  Lock,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export default function UsersContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganization, setSelectedOrganization] =
    useState('All Organizations');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openRoleSubmenuId, setOpenRoleSubmenuId] = useState(null);
  const menuRefs = useRef({});

  const users = [
    {
      id: 1,
      name: 'Admin User 1',
      email: 'user1@creditoracademy.com',
      role: 'Admin',
      status: 'Active',
      organization: 'Creditor Academy',
      joinDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'Prof. User 2',
      email: 'user2@creditoracademy.com',
      role: 'Instructor',
      status: 'Active',
      organization: 'Creditor Academy',
      joinDate: '2024-02-20',
    },
    {
      id: 3,
      name: 'Prof. User 3',
      email: 'user3@creditoracademy.com',
      role: 'Instructor',
      status: 'Active',
      organization: 'Creditor Academy',
      joinDate: '2024-03-10',
    },
    {
      id: 4,
      name: 'Prof. User 4',
      email: 'user4@creditoracademy.com',
      role: 'Instructor',
      status: 'Inactive',
      organization: 'Creditor Academy',
      joinDate: '2024-01-05',
    },
    {
      id: 5,
      name: 'Super Admin User',
      email: 'superadmin@creditoracademy.com',
      role: 'Super Admin',
      status: 'Active',
      organization: 'Creditor Academy',
      joinDate: '2024-04-01',
    },
    {
      id: 6,
      name: 'Regular User 1',
      email: 'regularuser@creditoracademy.com',
      role: 'User',
      status: 'Active',
      organization: 'Creditor Academy',
      joinDate: '2024-01-20',
    },
  ];

  const organizations = [
    'All Organizations',
    'Creditor Academy',
    'Tech Institute',
    'Business School',
  ];
  const roles = ['All Roles', 'Admin', 'Instructor', 'Super Admin', 'User'];

  // Filter users based on search, organization, and role
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesOrg =
        selectedOrganization === 'All Organizations' ||
        user.organization === selectedOrganization;
      const matchesRole =
        selectedRole === 'All Roles' || user.role === selectedRole;

      return matchesSearch && matchesOrg && matchesRole;
    });
  }, [searchTerm, selectedOrganization, selectedRole]);

  const getRoleColor = role => {
    switch (role) {
      case 'Admin':
        return 'from-red-500 to-red-600';
      case 'Instructor':
        return 'from-blue-500 to-blue-600';
      case 'Super Admin':
        return 'from-purple-500 to-purple-600';
      case 'User':
        return 'from-cyan-500 to-cyan-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      let isClickInside = false;
      Object.values(menuRefs.current).forEach(ref => {
        if (ref && ref.contains(event.target)) {
          isClickInside = true;
        }
      });
      if (!isClickInside) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative">
        <div
          className="rounded-2xl p-6 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.01] backdrop-blur-3xl border border-white/[0.1] overflow-hidden"
          style={{
            boxShadow:
              '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent rounded-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/40 relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-xl"></div>
                <Users className="w-5 h-5 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Global User Management
                </h1>
                <p className="text-gray-400 text-xs mt-0.5">
                  Search and manage all users across all organizations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div
        className="rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.01] backdrop-blur-3xl border border-white/[0.1] p-4 overflow-hidden"
        style={{
          boxShadow:
            '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent rounded-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Organization Filter */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <div className="relative group">
              <select
                value={selectedOrganization}
                onChange={e => setSelectedOrganization(e.target.value)}
                className="appearance-none w-full px-3 py-2 rounded-lg bg-white text-gray-900 border border-gray-200 hover:border-gray-300 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 outline-none transition-all text-sm font-medium cursor-pointer pr-8 shadow-sm"
              >
                {organizations.map(org => (
                  <option
                    key={org}
                    value={org}
                    className="bg-white text-gray-900"
                  >
                    {org}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none group-hover:text-gray-700" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 min-w-0">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-gray-400 group-focus-within:text-gray-400 transition-colors" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-gradient-to-br from-white/[0.12] via-white/[0.08] to-white/[0.06] backdrop-blur-xl border border-white/[0.2] hover:border-white/[0.3] focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 outline-none transition-all text-sm text-white"
                style={{
                  colorScheme: 'dark',
                }}
              />
              <style>{`
                input::placeholder {
                  color: rgba(107, 114, 128, 0.8) !important;
                }
                input:focus::placeholder {
                  color: rgba(107, 114, 128, 0.6) !important;
                }
              `}</style>
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <div className="relative group">
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="appearance-none w-full px-3 py-2 rounded-lg bg-white text-gray-900 border border-gray-200 hover:border-gray-300 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 outline-none transition-all text-sm font-medium cursor-pointer pr-8 shadow-sm"
              >
                {roles.map(role => (
                  <option
                    key={role}
                    value={role}
                    className="bg-white text-gray-900"
                  >
                    {role}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none group-hover:text-gray-700" />
            </div>
          </div>

          {/* User Count */}
          <div className="flex-shrink-0 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-300 font-medium text-center sm:text-left shadow-sm">
            {filteredUsers.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div
        className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.01] backdrop-blur-3xl border border-white/[0.1]"
        style={{
          boxShadow:
            '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent rounded-2xl pointer-events-none"></div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.1] bg-white/[0.02]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className="border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div>
                        <div className="text-sm text-white font-medium">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <div
                        className={`inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r ${getRoleColor(user.role)} bg-opacity-20 text-white text-xs font-semibold`}
                      >
                        {user.role}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-300">
                      {user.organization}
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <div
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-red-500/10 text-red-300 border-red-500/30'}`}
                      >
                        {user.status}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-right relative">
                      <div ref={el => (menuRefs.current[user.id] = el)}>
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === user.id ? null : user.id
                            )
                          }
                          className="p-1.5 hover:bg-white/[0.08] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === user.id && (
                          <div
                            className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50"
                            style={{
                              boxShadow:
                                '0 20px 25px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                            }}
                          >
                            {/* Change Role */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenRoleSubmenuId(
                                    openRoleSubmenuId === user.id
                                      ? null
                                      : user.id
                                  )
                                }
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors border-b border-gray-700 text-left group"
                              >
                                <Shield className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-emerald-400 group-hover:text-emerald-300">
                                    Change Role
                                  </div>
                                </div>
                                <ChevronDown
                                  className={`w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-transform ${openRoleSubmenuId === user.id ? 'rotate-180' : 'rotate-90'}`}
                                />
                              </button>

                              {/* Role Submenu */}
                              {openRoleSubmenuId === user.id && (
                                <div
                                  className="absolute left-full top-0 ml-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50"
                                  style={{
                                    boxShadow:
                                      '0 20px 25px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                  }}
                                >
                                  {/* Admin Role */}
                                  <button className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-700 transition-colors border-b border-gray-700 text-left group">
                                    <Shield className="w-3.5 h-3.5 text-red-400 group-hover:text-red-300" />
                                    <div className="text-sm font-medium text-gray-300 group-hover:text-white">
                                      Admin
                                    </div>
                                  </button>

                                  {/* Instructor Role */}
                                  <button className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-700 transition-colors border-b border-gray-700 text-left group">
                                    <Shield className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                                    <div className="text-sm font-medium text-gray-300 group-hover:text-white">
                                      Instructor
                                    </div>
                                  </button>

                                  {/* User Role */}
                                  <button className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-700 transition-colors text-left group">
                                    <Shield className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
                                    <div className="text-sm font-medium text-gray-300 group-hover:text-white">
                                      User
                                    </div>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Suspend User */}
                            <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors border-b border-gray-700 text-left group">
                              <AlertCircle className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                              <div className="text-sm font-semibold text-red-400 group-hover:text-red-300">
                                Suspend User
                              </div>
                            </button>

                            {/* Reset Password */}
                            <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors border-b border-gray-700 text-left group">
                              <Lock className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                              <div className="text-sm font-semibold text-gray-300 group-hover:text-white">
                                Reset Password
                              </div>
                            </button>

                            {/* Delete User */}
                            <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors text-left group">
                              <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-400" />
                              <div className="text-sm font-semibold text-red-500 group-hover:text-red-400">
                                Delete User
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center">
                    <div className="text-gray-500 text-sm">
                      No users found matching your filters
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
