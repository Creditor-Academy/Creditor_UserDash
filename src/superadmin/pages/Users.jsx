import { useState, useEffect } from 'react';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Phone,
  User,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Users as UsersIcon,
  UserPlus,
  UserCheck,
  UserX,
  ArrowUpDown,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Active',
    },
    inactive: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Inactive',
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Pending',
    },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
    >
      {statusConfig.label}
    </span>
  );
};

// Role Badge Component
const RoleBadge = ({ role }) => {
  const roleConfig = {
    admin: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Admin',
    },
    manager: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      label: 'Manager',
    },
    user: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'User',
    },
  }[role] || { bg: 'bg-gray-100', text: 'text-gray-800', label: role };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleConfig.bg} ${roleConfig.text}`}
    >
      {roleConfig.label}
    </span>
  );
};

const Users = () => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Mock data - in a real app, this would be fetched from an API
  useEffect(() => {
    const mockUsers = [
      {
        id: 'USR-001',
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        role: 'admin',
        status: 'active',
        lastLogin: '2023-06-15T14:30:00',
        joinDate: '2022-01-10',
        organization: 'Acme Corp',
      },
      {
        id: 'USR-002',
        name: 'Sarah Williams',
        email: 'sarah.w@example.com',
        role: 'manager',
        status: 'active',
        lastLogin: '2023-06-14T09:15:00',
        joinDate: '2022-03-22',
        organization: 'Globex',
      },
      {
        id: 'USR-003',
        name: 'Michael Chen',
        email: 'michael.c@example.com',
        role: 'user',
        status: 'pending',
        lastLogin: '2023-06-10T16:45:00',
        joinDate: '2023-01-15',
        organization: 'Soylent Corp',
      },
      {
        id: 'USR-004',
        name: 'Emily Davis',
        email: 'emily.d@example.com',
        role: 'manager',
        status: 'inactive',
        lastLogin: '2023-05-28T11:20:00',
        joinDate: '2022-11-05',
        organization: 'Initech',
      },
      {
        id: 'USR-005',
        name: 'Robert Wilson',
        email: 'robert.w@example.com',
        role: 'manager',
        status: 'active',
        lastLogin: '2023-06-16T08:10:00',
        joinDate: '2022-07-18',
        organization: 'Umbrella Corp',
      },
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div
      className="ml-20 p-6 pt-24 min-h-screen"
      style={{
        color: colors.text.primary,
        backgroundColor: colors.bg.primary,
      }}
    >
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between mb-8 mt-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            Manage your team members and their account permissions
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg flex items-center text-sm font-medium"
          style={{
            backgroundColor: colors.accent.blue,
            color: 'white',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          <Plus size={16} className="mr-2" />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 mt-6">
        {/* Total Users Card */}
        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: colors.bg.secondary,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: colors.text.secondary }}
              >
                Total Users
              </p>
              <h3 className="text-2xl font-bold mt-1">{users.length}</h3>
              <div className="flex items-center mt-2">
                <span className="text-xs" style={{ color: '#10B981' }}>
                  +12.5% from last month
                </span>
              </div>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            >
              <UsersIcon className="h-6 w-6" style={{ color: '#10B981' }} />
            </div>
          </div>
        </div>

        {/* Active Users Card */}
        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: colors.bg.secondary,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: colors.text.secondary }}
              >
                Active Users
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {users.filter(u => u.status === 'active').length}
              </h3>
              <div className="flex items-center mt-2">
                <span className="text-xs" style={{ color: '#3B82F6' }}>
                  +8.2% from last month
                </span>
              </div>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            >
              <UserCheck className="h-6 w-6" style={{ color: '#3B82F6' }} />
            </div>
          </div>
        </div>

        {/* Pending Invites Card */}
        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: colors.bg.secondary,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: colors.text.secondary }}
              >
                Pending Invites
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {users.filter(u => u.status === 'pending').length}
              </h3>
              <div className="flex items-center mt-2">
                <span className="text-xs" style={{ color: '#F59E0B' }}>
                  +3 pending approvals
                </span>
              </div>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
            >
              <UserPlus className="h-6 w-6" style={{ color: '#F59E0B' }} />
            </div>
          </div>
        </div>

        {/* Inactive Users Card */}
        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: colors.bg.secondary,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: colors.text.secondary }}
              >
                Inactive Users
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {users.filter(u => u.status === 'inactive').length}
              </h3>
              <div className="flex items-center mt-2">
                <span className="text-xs" style={{ color: '#EF4444' }}>
                  -2 from last week
                </span>
              </div>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            >
              <UserX className="h-6 w-6" style={{ color: '#EF4444' }} />
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div
        className="rounded-2xl shadow-sm overflow-hidden mt-8"
        style={{
          borderColor: colors.border,
          borderWidth: '1px',
          backgroundColor: colors.bg.secondary,
        }}
      >
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: colors.border }}
        >
          <h3 className="text-lg font-semibold">All Users</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                }}
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: colors.text.secondary }}
              />
            </div>
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: colors.text.secondary }}
              />
            </div>
          </div>
        </div>

        <div
          className="shadow rounded-lg overflow-hidden"
          style={{
            borderColor: colors.border,
            borderWidth: '1px',
            backgroundColor: colors.bg.secondary,
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      User
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Organization
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Last Login
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-gray-200"
                style={{ backgroundColor: colors.bg.secondary }}
              >
                {currentUsers.length > 0 ? (
                  currentUsers.map(user => (
                    <tr
                      key={user.id}
                      style={{ backgroundColor: colors.bg.secondary }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.backgroundColor =
                          colors.bg.hover)
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.backgroundColor =
                          colors.bg.secondary)
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            }}
                          >
                            <User
                              className="h-5 w-5"
                              style={{ color: '#3B82F6' }}
                            />
                          </div>
                          <div className="ml-4">
                            <div
                              className="text-sm font-medium"
                              style={{ color: colors.text.primary }}
                            >
                              {user.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: colors.text.secondary }}
                            >
                              {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {user.email}
                        </div>
                        <div
                          className="text-xs flex items-center mt-1"
                          style={{ color: colors.text.secondary }}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          +1 (555) 123-4567
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {user.organization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1">
                          <button
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="View"
                          >
                            <Eye
                              className="h-4 w-4"
                              style={{ color: colors.text.secondary }}
                            />
                          </button>
                          <button
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Edit"
                          >
                            <Edit
                              className="h-4 w-4"
                              style={{ color: '#3B82F6' }}
                            />
                          </button>
                          <button
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Delete"
                          >
                            <Trash2
                              className="h-4 w-4"
                              style={{ color: '#EF4444' }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Search
                          className="h-12 w-12 mb-4 opacity-30"
                          style={{ color: colors.text.primary }}
                        />
                        <h3
                          className="text-lg font-medium mb-1"
                          style={{ color: colors.text.primary }}
                        >
                          No users found
                        </h3>
                        <p
                          className="text-sm max-w-md"
                          style={{ color: colors.text.secondary }}
                        >
                          {searchTerm ||
                          roleFilter !== 'all' ||
                          statusFilter !== 'all'
                            ? 'No users match your search criteria. Try adjusting your filters.'
                            : 'No users available. Click the "Add New User" button to get started.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div
              className="px-6 py-4 flex items-center justify-between border-t"
              style={{ borderColor: colors.border }}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing{' '}
                <span className="font-medium">
                  {(currentPage - 1) * rowsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * rowsPerPage, filteredUsers.length)}
                </span>{' '}
                of <span className="font-medium">{filteredUsers.length}</span>{' '}
                results
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Rows per page: {rowsPerPage}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    style={{ color: colors.text.primary }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span
                    className="px-2 text-sm"
                    style={{ color: colors.text.primary }}
                  >
                    {currentPage} of{' '}
                    {Math.ceil(filteredUsers.length / rowsPerPage)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(p =>
                        Math.min(
                          Math.ceil(filteredUsers.length / rowsPerPage),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentPage >=
                      Math.ceil(filteredUsers.length / rowsPerPage)
                    }
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    style={{ color: colors.text.primary }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
