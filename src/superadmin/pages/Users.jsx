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
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('alphabetical-asc');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
        const url = `${apiBaseUrl}/api/org/get-all-users`;
        const accessToken = localStorage.getItem('authToken');

        console.log('Fetching users from:', url);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Users API response:', result);
        console.log('Result data type:', typeof result.data);
        console.log('Is array?', Array.isArray(result.data));
        console.log('Result data:', result.data);

        if (result.success) {
          // Handle different response structures
          let usersArray = [];

          if (Array.isArray(result.data)) {
            usersArray = result.data;
          } else if (result.data && typeof result.data === 'object') {
            // If data is an object, try to extract array from it
            if (result.data.users && Array.isArray(result.data.users)) {
              usersArray = result.data.users;
            } else if (result.data.data && Array.isArray(result.data.data)) {
              usersArray = result.data.data;
            } else {
              // Try to convert object to array
              usersArray = Object.values(result.data).filter(
                item => typeof item === 'object'
              );
            }
          }

          console.log('Processed users array:', usersArray);
          console.log('Users count:', usersArray.length);

          // Map API response to component format
          const mappedUsers = usersArray.map(user => ({
            id: user.id || user._id || user.user_id || 'N/A',
            name:
              `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() ||
              user.name ||
              user.full_name ||
              'N/A',
            email: user.email || 'N/A',
            phone: user.phone || user.phone_number || '',
            role:
              user.roles && Array.isArray(user.roles) && user.roles.length > 0
                ? user.roles[0]
                : user.role || user.user_role || 'user',
            status: user.status || (user.is_active ? 'active' : 'inactive'),
            lastLogin: user.last_login || user.lastLogin || null,
            joinDate:
              user.created_at || user.joinDate || new Date().toISOString(),
            organization:
              user.organizations?.name ||
              user.organization ||
              user.org_name ||
              'N/A',
          }));

          console.log('Mapped users:', mappedUsers);
          setUsers(mappedUsers);
        } else {
          console.warn('Unexpected response format:', result);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Get unique organizations for filter dropdown
  const uniqueOrganizations = [
    ...new Set(users.map(user => user.organization)),
  ].filter(org => org !== 'N/A');

  // Filter organizations based on search
  const filteredOrganizations = uniqueOrganizations.filter(org =>
    org.toLowerCase().includes(organizationSearch.toLowerCase())
  );

  // Filter users based on search and filters
  let filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesOrganization =
      organizationFilter === 'all' || user.organization === organizationFilter;

    return matchesSearch && matchesRole && matchesOrganization;
  });

  // Apply sorting
  filteredUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical-asc':
        return a.name.localeCompare(b.name);
      case 'alphabetical-desc':
        return b.name.localeCompare(a.name);
      case 'never-visited':
        return (
          (a.lastLogin === null ? -1 : 1) - (b.lastLogin === null ? -1 : 1)
        );
      case 'just-visited':
        if (a.lastLogin === null) return 1;
        if (b.lastLogin === null) return -1;
        return new Date(b.lastLogin) - new Date(a.lastLogin);
      default:
        return 0;
    }
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
      <div className="mb-8 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: colors.text.primary }}
            >
              Users
            </h1>
            <p
              className="text-sm mt-2"
              style={{ color: colors.text.secondary }}
            >
              Manage your team members and their account permissions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}

      {/* User Table */}
      <div
        className="rounded-2xl shadow-lg overflow-hidden mt-8"
        style={{
          borderColor: colors.border,
          borderWidth: '1px',
          backgroundColor: colors.bg.secondary,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: colors.text.primary }}
            >
              All Users
            </h2>
            <span
              className="text-sm px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3B82F6',
              }}
            >
              {filteredUsers.length} users
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-xs">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or organization..."
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                  borderWidth: '1px',
                }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 w-full text-left transition-all duration-200"
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                  borderWidth: '1px',
                }}
              >
                {organizationFilter === 'all'
                  ? 'All Organizations'
                  : organizationFilter}
              </button>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: colors.text.secondary }}
              />

              {isOrgDropdownOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-xl z-50 overflow-hidden"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    borderColor: colors.border,
                    borderWidth: '1px',
                  }}
                >
                  <div
                    className="p-3 border-b"
                    style={{ borderColor: colors.border }}
                  >
                    <input
                      type="text"
                      placeholder="Search organizations..."
                      className="w-full px-3 py-2.5 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                      style={{
                        backgroundColor: colors.bg.primary,
                        borderColor: colors.border,
                        color: colors.text.primary,
                        borderWidth: '1px',
                      }}
                      value={organizationSearch}
                      onChange={e => setOrganizationSearch(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto">
                    <button
                      onClick={() => {
                        setOrganizationFilter('all');
                        setIsOrgDropdownOpen(false);
                        setOrganizationSearch('');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-150"
                      style={{
                        color: colors.text.primary,
                        backgroundColor:
                          organizationFilter === 'all'
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'transparent',
                      }}
                      onMouseEnter={e => {
                        if (organizationFilter !== 'all') {
                          e.currentTarget.style.backgroundColor =
                            colors.bg.hover;
                        }
                      }}
                      onMouseLeave={e => {
                        if (organizationFilter !== 'all') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      All Organizations
                    </button>

                    {filteredOrganizations.map(org => (
                      <button
                        key={org}
                        onClick={() => {
                          setOrganizationFilter(org);
                          setIsOrgDropdownOpen(false);
                          setOrganizationSearch('');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-150"
                        style={{
                          color: colors.text.primary,
                          backgroundColor:
                            organizationFilter === org
                              ? 'rgba(59, 130, 246, 0.1)'
                              : 'transparent',
                        }}
                        onMouseEnter={e => {
                          if (organizationFilter !== org) {
                            e.currentTarget.style.backgroundColor =
                              colors.bg.hover;
                          }
                        }}
                        onMouseLeave={e => {
                          if (organizationFilter !== org) {
                            e.currentTarget.style.backgroundColor =
                              'transparent';
                          }
                        }}
                      >
                        {org}
                      </button>
                    ))}

                    {filteredOrganizations.length === 0 &&
                      organizationSearch && (
                        <div
                          className="px-4 py-3 text-sm text-center"
                          style={{ color: colors.text.secondary }}
                        >
                          No organizations found
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                  borderWidth: '1px',
                }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="alphabetical-asc">Alphabetical (A → Z)</option>
                <option value="alphabetical-desc">Alphabetical (Z → A)</option>
                <option value="never-visited">Never Visited (Top)</option>
                <option value="just-visited">Just Visited (Newest)</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: colors.text.secondary }}
              />
            </div>
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                  borderWidth: '1px',
                }}
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="user">User</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none"
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
              <thead style={{ backgroundColor: colors.bg.hover }}>
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
                    Last Login
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-gray-200"
                style={{ backgroundColor: colors.bg.secondary }}
              >
                {isLoading ? (
                  <>
                    {[...Array(5)].map((_, index) => (
                      <tr
                        key={`skeleton-${index}`}
                        style={{ backgroundColor: colors.bg.secondary }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="flex-shrink-0 h-10 w-10 rounded-full animate-pulse"
                              style={{
                                backgroundColor: 'rgba(200, 200, 200, 0.3)',
                              }}
                            ></div>
                            <div className="ml-4 space-y-2 flex-1">
                              <div
                                className="h-4 w-24 rounded animate-pulse"
                                style={{
                                  backgroundColor: 'rgba(200, 200, 200, 0.3)',
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div
                              className="h-4 w-32 rounded animate-pulse"
                              style={{
                                backgroundColor: 'rgba(200, 200, 200, 0.3)',
                              }}
                            ></div>
                            <div
                              className="h-3 w-24 rounded animate-pulse"
                              style={{
                                backgroundColor: 'rgba(200, 200, 200, 0.2)',
                              }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="h-4 w-20 rounded animate-pulse"
                            style={{
                              backgroundColor: 'rgba(200, 200, 200, 0.3)',
                            }}
                          ></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="h-6 w-16 rounded-full animate-pulse"
                            style={{
                              backgroundColor: 'rgba(200, 200, 200, 0.3)',
                            }}
                          ></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="h-4 w-20 rounded animate-pulse"
                            style={{
                              backgroundColor: 'rgba(200, 200, 200, 0.3)',
                            }}
                          ></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center items-center space-x-2">
                            <div
                              className="h-8 w-8 rounded-lg animate-pulse"
                              style={{
                                backgroundColor: 'rgba(200, 200, 200, 0.3)',
                              }}
                            ></div>
                            <div
                              className="h-8 w-8 rounded-lg animate-pulse"
                              style={{
                                backgroundColor: 'rgba(200, 200, 200, 0.3)',
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : currentUsers.length > 0 ? (
                  currentUsers.map(user => (
                    <tr
                      key={user.id}
                      style={{ backgroundColor: colors.bg.secondary }}
                      className="transition-colors duration-150 border-b"
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = colors.bg.hover;
                        e.currentTarget.style.boxShadow =
                          '0 2px 8px rgba(0, 0, 0, 0.05)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor =
                          colors.bg.secondary;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
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
                          {user.phone || 'N/A'}
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
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                            title="View"
                          >
                            <Eye
                              className="h-5 w-5"
                              style={{ color: colors.text.secondary }}
                            />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-150"
                            title="Delete"
                          >
                            <Trash2
                              className="h-5 w-5"
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
                          organizationFilter !== 'all'
                            ? 'No users match your search criteria. Try adjusting your filters.'
                            : 'No users available.'}
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
