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
  X,
  Mail,
  Building2,
  Calendar,
  LogIn,
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

// Skeleton Loader Component
const SkeletonLoader = ({ colors }) => (
  <div className="space-y-6">
    {/* Profile Skeleton */}
    <div className="flex items-center space-x-4">
      <div
        className="h-20 w-20 rounded-full animate-pulse"
        style={{ backgroundColor: 'rgba(200, 200, 200, 0.3)' }}
      ></div>
      <div className="flex-1 space-y-2">
        <div
          className="h-6 w-32 rounded animate-pulse"
          style={{ backgroundColor: 'rgba(200, 200, 200, 0.3)' }}
        ></div>
        <div
          className="h-4 w-24 rounded animate-pulse"
          style={{ backgroundColor: 'rgba(200, 200, 200, 0.2)' }}
        ></div>
      </div>
    </div>

    {/* Contact Info Skeleton */}
    <div
      className="p-4 rounded-xl space-y-3"
      style={{
        backgroundColor: colors.bg.hover,
        borderColor: colors.border,
        borderWidth: '1px',
      }}
    >
      <div
        className="h-5 w-32 rounded animate-pulse"
        style={{ backgroundColor: 'rgba(200, 200, 200, 0.3)' }}
      ></div>
      {[1, 2].map(i => (
        <div key={i} className="flex items-center space-x-3">
          <div
            className="h-5 w-5 rounded animate-pulse"
            style={{ backgroundColor: 'rgba(200, 200, 200, 0.3)' }}
          ></div>
          <div className="flex-1 space-y-1">
            <div
              className="h-3 w-12 rounded animate-pulse"
              style={{ backgroundColor: 'rgba(200, 200, 200, 0.2)' }}
            ></div>
            <div
              className="h-4 w-40 rounded animate-pulse"
              style={{ backgroundColor: 'rgba(200, 200, 200, 0.3)' }}
            ></div>
          </div>
        </div>
      ))}
    </div>

    {/* Organization Skeleton */}
    <div
      className="p-4 rounded-xl space-y-3"
      style={{
        backgroundColor: colors.bg.hover,
        borderColor: colors.border,
        borderWidth: '1px',
      }}
    >
      <div
        className="h-5 w-32 rounded animate-pulse"
        style={{ backgroundColor: 'rgba(200, 200, 200, 0.3)' }}
      ></div>
      <div className="flex items-center space-x-3">
        <div
          className="h-5 w-5 rounded animate-pulse"
          style={{ backgroundColor: 'rgba(200, 200, 200, 0.3)' }}
        ></div>
        <div className="flex-1 space-y-1">
          <div
            className="h-3 w-12 rounded animate-pulse"
            style={{ backgroundColor: 'rgba(200, 200, 200, 0.2)' }}
          ></div>
          <div
            className="h-4 w-32 rounded animate-pulse"
            style={{ backgroundColor: 'rgba(200, 200, 200, 0.3)' }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

// User Details Modal Component
const UserDetailsModal = ({ isOpen, user, onClose, colors, isLoading }) => {
  if (!isOpen) return null;

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = name => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRole = user => {
    if (!user) return 'No role assigned';
    if (
      user.user_roles &&
      Array.isArray(user.user_roles) &&
      user.user_roles.length > 0
    ) {
      return (
        user.user_roles[0].charAt(0).toUpperCase() + user.user_roles[0].slice(1)
      );
    }
    if (user.role) {
      return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
    return 'No role assigned';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: colors.bg.secondary,
          borderColor: colors.border,
          borderWidth: '1px',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between p-6 border-b"
          style={{
            backgroundColor: colors.bg.secondary,
            borderColor: colors.border,
          }}
        >
          <h2
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            User Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-6 w-6" style={{ color: colors.text.secondary }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <SkeletonLoader colors={colors} />
          ) : (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center space-x-4">
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {getInitials(user.first_name || 'User')}
                </div>
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: colors.text.primary }}
                  >
                    {user.first_name} {user.last_name}
                  </h3>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    {getUserRole(user)}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: colors.bg.hover,
                  borderColor: colors.border,
                  borderWidth: '1px',
                }}
              >
                <h4
                  className="text-lg font-semibold mb-4"
                  style={{ color: colors.text.primary }}
                >
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5" style={{ color: '#3B82F6' }} />
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        Email
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.text.primary }}
                      >
                        {user.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5" style={{ color: '#10B981' }} />
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        Phone
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.text.primary }}
                      >
                        {user.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Information */}
              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: colors.bg.hover,
                  borderColor: colors.border,
                  borderWidth: '1px',
                }}
              >
                <h4
                  className="text-lg font-semibold mb-4"
                  style={{ color: colors.text.primary }}
                >
                  Organization
                </h4>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5" style={{ color: '#F59E0B' }} />
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: colors.text.secondary }}
                    >
                      Organization Name
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.text.primary }}
                    >
                      {user.organization?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: colors.bg.hover,
                  borderColor: colors.border,
                  borderWidth: '1px',
                }}
              >
                <h4
                  className="text-lg font-semibold mb-4"
                  style={{ color: colors.text.primary }}
                >
                  Account Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar
                      className="h-5 w-5"
                      style={{ color: '#8B5CF6' }}
                    />
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        Member Since
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.text.primary }}
                      >
                        {user.created_at ? formatDate(user.created_at) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <LogIn className="h-5 w-5" style={{ color: '#EC4899' }} />
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        Last Login
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.text.primary }}
                      >
                        {user.login_activity && user.login_activity.length > 0
                          ? formatDate(user.login_activity[0].createdAt)
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login Activity */}
              {user.login_activity && user.login_activity.length > 0 && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: colors.bg.hover,
                    borderColor: colors.border,
                    borderWidth: '1px',
                  }}
                >
                  <h4
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.text.primary }}
                  >
                    Recent Login Activity (Last 5)
                  </h4>
                  <div className="space-y-2">
                    {[...user.login_activity]
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                      .slice(0, 5)
                      .map(activity => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-2 rounded-lg"
                          style={{
                            backgroundColor: colors.bg.secondary,
                            borderColor: colors.border,
                            borderWidth: '1px',
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: '#10B981' }}
                            ></div>
                            <span
                              className="text-sm"
                              style={{ color: colors.text.primary }}
                            >
                              {activity.action}
                            </span>
                          </div>
                          <span
                            className="text-xs"
                            style={{ color: colors.text.secondary }}
                          >
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Bio Section */}
              {user.bio && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: colors.bg.hover,
                    borderColor: colors.border,
                    borderWidth: '1px',
                  }}
                >
                  <h4
                    className="text-lg font-semibold mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    Bio
                  </h4>
                  <p
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    {user.bio}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex justify-end gap-3 p-6 border-t"
          style={{
            backgroundColor: colors.bg.secondary,
            borderColor: colors.border,
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: colors.bg.hover,
              color: colors.text.primary,
              border: `1px solid ${colors.border}`,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
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
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [userPendingDelete, setUserPendingDelete] = useState(null);

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

  // Fetch user details when eye button is clicked
  const handleViewUser = async userId => {
    try {
      setUserDetailsLoading(true);
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
      const url = `${apiBaseUrl}/api/org/orgprofile/${userId}`;
      const accessToken = localStorage.getItem('authToken');

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setSelectedUser(result.data);
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to load user details');
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleRequestDelete = user => setUserPendingDelete(user);
  const handleCancelDelete = () => setUserPendingDelete(null);

  // Delete user
  const handleDeleteUser = async userId => {
    try {
      setDeletingUserId(userId);
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
      const url = `${apiBaseUrl}/api/org/orgdelete/${userId}`;
      const accessToken = localStorage.getItem('authToken');

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setUserPendingDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (userPendingDelete) {
      handleDeleteUser(userPendingDelete.id);
    }
  };

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
      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserModal}
        user={selectedUser}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        colors={colors}
        isLoading={userDetailsLoading}
      />

      {/* Delete Confirmation Modal */}
      {userPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4"
            style={{
              backgroundColor: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-start space-x-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.25))',
                }}
              >
                <Trash2 className="h-5 w-5" style={{ color: '#EF4444' }} />
              </div>
              <div className="flex-1">
                <h3
                  className="text-xl font-semibold mb-1"
                  style={{ color: colors.text.primary }}
                >
                  Delete user?
                </h3>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  {`You're about to delete ${
                    userPendingDelete.name || 'this user'
                  }. This action cannot be undone.`}
                </p>
              </div>
            </div>

            <div
              className="flex items-center justify-end gap-3 pt-2"
              style={{ borderColor: colors.border }}
            >
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: colors.bg.hover,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingUserId === userPendingDelete.id}
                className="px-4 py-2 rounded-lg font-semibold transition-colors text-white disabled:opacity-70"
                style={{
                  background:
                    'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                  boxShadow: '0 10px 30px rgba(239,68,68,0.35)',
                }}
              >
                {deletingUserId === userPendingDelete.id
                  ? 'Deleting...'
                  : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                            onClick={() => handleViewUser(user.id)}
                            disabled={userDetailsLoading}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150 disabled:opacity-50"
                            title="View"
                          >
                            <Eye
                              className="h-5 w-5"
                              style={{ color: colors.text.secondary }}
                            />
                          </button>
                          <button
                            onClick={() => handleRequestDelete(user)}
                            disabled={deletingUserId === user.id}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-150 disabled:opacity-50"
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
