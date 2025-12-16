import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import apiConfig from '../../config/apiConfig';
import AddOrganizationModal from '../components/AddOrganizationModal';

export default function Organizations() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isLoadingOrgDetails, setIsLoadingOrgDetails] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);

  // Fetch organizations from API
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const baseURL = apiConfig.backend.baseURL;
        const response = await fetch(`${baseURL}/api/org/allOrg`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setOrganizations(data.data || []);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations. Please try again later.');
        setOrganizations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter(org => {
    if (!org) return false;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      org.name?.toLowerCase().includes(searchLower) ||
      (org.admin?.email?.toLowerCase() || '').includes(searchLower) ||
      (org.admin?.name?.toLowerCase() || '').includes(searchLower) ||
      org.description?.toLowerCase().includes(searchLower);

    const statusMap = {
      ACTIVE: 'active',
      // PENDING: 'pending',
      SUSPENDED: 'suspended',
    };

    const orgStatus = statusMap[org.status] || (org.status || '').toLowerCase();
    const matchesFilter = filter === 'all' || orgStatus === filter;

    return matchesSearch && matchesFilter;
  });

  // Get current organizations
  const indexOfLastOrg = currentPage * itemsPerPage;
  const indexOfFirstOrg = indexOfLastOrg - itemsPerPage;
  const currentOrgs = filteredOrganizations.slice(
    indexOfFirstOrg,
    indexOfLastOrg
  );
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);

  // View organization details
  const handleViewClick = async (org, e) => {
    if (e) e.stopPropagation();
    setViewModalOpen(true);
    setIsLoadingOrgDetails(true);
    try {
      const baseURL = apiConfig.backend.baseURL;
      const response = await fetch(`${baseURL}/api/org/org/${org.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSelectedOrg(data.data);
    } catch (err) {
      console.error('Error fetching organization details:', err);
      setSelectedOrg(org);
    } finally {
      setIsLoadingOrgDetails(false);
    }
  };

  // Edit organization
  const handleEditClick = async (org, e) => {
    if (e) e.stopPropagation();
    try {
      const baseURL = apiConfig.backend.baseURL;
      const response = await fetch(`${baseURL}/api/org/org/${org.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEditingOrg(data.data);
    } catch (err) {
      console.error('Error fetching organization details:', err);
      setEditingOrg(org);
    }
    setAddModalOpen(true);
  };

  // Delete organization
  const handleDeleteClick = (org, e) => {
    if (e) e.stopPropagation();
    setOrgToDelete(org);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orgToDelete) return;

    setIsDeleting(true);
    try {
      const baseURL = apiConfig.backend.baseURL;
      const response = await fetch(
        `${baseURL}/api/org/delete/${orgToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setOrganizations(orgs => orgs.filter(org => org.id !== orgToDelete.id));
      setDeleteConfirmOpen(false);
      setOrgToDelete(null);
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('Failed to delete organization. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);

  // Handle next/previous page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusBadge = status => {
    const statusMap = {
      active: {
        text: 'Active',
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      },
      ACTIVE: {
        text: 'Active',
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      },
      // pending: {
      //   text: 'Pending',
      //   icon: <Clock className="w-3 h-3 mr-1" />,
      //   bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      // },
      // PENDING: {
      //   text: 'Pending',
      //   icon: <Clock className="w-3 h-3 mr-1" />,
      //   bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      // },
      suspended: {
        text: 'Suspended',
        icon: <XCircle className="w-3 h-3 mr-1" />,
        bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      },
      SUSPENDED: {
        text: 'Suspended',
        icon: <XCircle className="w-3 h-3 mr-1" />,
        bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      },
      default: {
        text: status || 'Unknown',
        icon: <AlertCircle className="w-3 h-3 mr-1" />,
        bg: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      },
    };

    const statusConfig = statusMap[status] || statusMap['default'];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg}`}
      >
        {statusConfig.icon}
        {statusConfig.text}
      </span>
    );
  };

  // Convert byte values to a readable unit using decimal (1000-based) conversion
  // This matches common usage where 1 MB = 1,000,000 bytes
  const formatBytes = value => {
    if (value === null || value === undefined) return 'N/A';
    let bytes = Number(value);
    if (Number.isNaN(bytes) || bytes < 0) return 'N/A';

    // Handle case where backend might store value with extra zero (10x error)
    // Example: 170000000 bytes should be 17 MB, not 170 MB
    // Check if bytes is divisible by 10,000,000 (10^7) and result is reasonable
    if (bytes >= 10000000 && bytes % 10000000 === 0) {
      const mbValue = bytes / 10000000;
      // If it's a whole number between 1-1000, likely a 10x storage error
      if (Number.isInteger(mbValue) && mbValue >= 1 && mbValue <= 1000) {
        bytes = bytes / 10; // Correct by dividing by 10
      }
    }

    if (bytes < 1000) return `${bytes} B`;

    // Use decimal (1000-based) conversion
    const kb = bytes / 1000;
    if (kb < 1000) return `${kb.toFixed(2)} KB`;

    const mb = kb / 1000;
    if (mb < 1000) return `${mb.toFixed(2)} MB`;

    const gb = mb / 1000;
    return `${gb.toFixed(2)} GB`;
  };

  // Format storage used - handles both GB values (small numbers) and byte values (large numbers)
  const formatStorage = value => {
    if (value === null || value === undefined) return 'N/A';
    const numValue = Number(value);
    if (Number.isNaN(numValue) || numValue < 0) return 'N/A';

    // If value is small (< 10000), assume it's already in GB
    // This handles cases where API returns "0.09" meaning 0.09 GB
    if (numValue < 10000) {
      // Show with 2 decimal places for consistency
      return `${numValue.toFixed(2)} GB`;
    }

    // If value is large, treat it as bytes and convert
    return formatBytes(numValue);
  };

  // Format storage limit - handles both GB values (small numbers) and byte values (large numbers)
  const formatStorageLimit = value => {
    if (value === null || value === undefined) return 'N/A';
    const numValue = Number(value);
    if (Number.isNaN(numValue) || numValue < 0) return 'N/A';

    // If value is small (< 10000), assume it's already in GB
    // This handles cases where API returns "10" meaning 10 GB
    if (numValue < 10000) {
      // If it's a whole number, display without decimals
      if (Number.isInteger(numValue)) {
        return `${numValue} GB`;
      }
      // Otherwise show with 2 decimal places
      return `${numValue.toFixed(2)} GB`;
    }

    // If value is large, treat it as bytes and convert
    return formatBytes(numValue);
  };

  return (
    <main
      className="ml-20 pt-24 p-6 flex-1 overflow-y-auto"
      style={{ backgroundColor: colors.bg.primary }}
    >
      <div className="max-w-[1600px] mx-auto pb-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: colors.text.primary }}
              >
                Organizations
              </h1>
              <p
                className="text-sm mt-2"
                style={{ color: colors.text.secondary }}
              >
                Manage all organizations and their details
              </p>
            </div>
            <button
              onClick={() => {
                setEditingOrg(null);
                setAddModalOpen(true);
              }}
              className="px-6 py-2.5 rounded-lg text-white font-semibold transition-all hover:shadow-lg uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.transform = 'translateY(-2px)')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.transform = 'translateY(0)')
              }
            >
              + Add Organization
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div
          className="rounded-2xl shadow-lg overflow-hidden"
          style={{
            borderColor: colors.border,
            borderWidth: '1px',
            backgroundColor: colors.bg.secondary,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Filters Section */}
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-semibold"
                style={{ color: colors.text.primary }}
              >
                All Organizations
              </h2>
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#3B82F6',
                }}
              >
                {filteredOrganizations.length} organizations
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-xs">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, admin, or email..."
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
                <select
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    borderColor: colors.border,
                    color: colors.text.primary,
                    borderWidth: '1px',
                  }}
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  {/* <option value="pending">Pending</option> */}
                  <option value="suspended">Suspended</option>
                </select>
                <Filter
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: colors.text.secondary }}
                />
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ backgroundColor: colors.bg.hover }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      S.No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Organization Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Admin Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-gray-200"
                  style={{ backgroundColor: colors.bg.secondary }}
                >
                  {[...Array(5)].map((_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      style={{ backgroundColor: colors.bg.secondary }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="h-4 w-8 rounded animate-pulse"
                          style={{
                            backgroundColor: 'rgba(200, 200, 200, 0.3)',
                          }}
                        ></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="h-10 w-10 rounded-full animate-pulse"
                            style={{
                              backgroundColor: 'rgba(200, 200, 200, 0.3)',
                            }}
                          ></div>
                          <div className="ml-4 flex-1">
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
                            className="h-4 w-20 rounded animate-pulse"
                            style={{
                              backgroundColor: 'rgba(200, 200, 200, 0.3)',
                            }}
                          ></div>
                          <div
                            className="h-3 w-28 rounded animate-pulse"
                            style={{
                              backgroundColor: 'rgba(200, 200, 200, 0.2)',
                            }}
                          ></div>
                        </div>
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
                          className="h-6 w-20 rounded-full animate-pulse"
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
                </tbody>
              </table>
            ) : filteredOrganizations.length === 0 ? (
              <div className="p-8 text-center">
                {error ? (
                  <div className="flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                    <p className="text-red-500 dark:text-red-400">{error}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? 'No organizations found matching your search.'
                      : 'No organizations available.'}
                  </p>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ backgroundColor: colors.bg.hover }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      S.No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Organization Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Admin Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-gray-200"
                  style={{ backgroundColor: colors.bg.secondary }}
                >
                  {currentOrgs.map((org, index) => (
                    <tr
                      key={org.id}
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
                        <div
                          className="text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {indexOfFirstOrg + index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {org.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="ml-4">
                            <div
                              className="text-sm font-medium"
                              style={{ color: colors.text.primary }}
                            >
                              {org.name || 'Unnamed Organization'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {org.admin?.name || 'No Admin'}
                          {org.admin?.email && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {org.admin.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {org.total_users || 0} users
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(org.status)}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {org.created_at
                          ? new Date(org.created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={e => handleViewClick(org, e)}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                            title="View"
                          >
                            <Eye
                              className="h-5 w-5"
                              style={{ color: colors.text.secondary }}
                            />
                          </button>
                          <button
                            onClick={e => handleEditClick(org, e)}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                            title="Edit"
                          >
                            <Edit
                              className="h-5 w-5"
                              style={{ color: colors.text.secondary }}
                            />
                          </button>
                          <button
                            onClick={e => handleDeleteClick(org, e)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-150"
                            title="Delete"
                            disabled={isDeleting}
                          >
                            <Trash2
                              className="h-5 w-5"
                              style={{ color: '#EF4444' }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination */}
          <div
            className="px-6 py-4 flex items-center justify-between border-t"
            style={{ borderColor: colors.border }}
          >
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  Showing{' '}
                  <span className="font-medium">{indexOfFirstOrg + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastOrg, filteredOrganizations.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">
                    {filteredOrganizations.length}
                  </span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    )
                  )}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Organization Modal */}
      {viewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: colors.bg.secondary }}
          >
            {isLoadingOrgDetails ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p style={{ color: colors.text.secondary }}>
                  Loading organization details...
                </p>
              </div>
            ) : selectedOrg ? (
              <>
                {/* Header with Background */}
                <div
                  className="px-8 pt-8 pb-6 border-b"
                  style={{
                    borderColor: colors.border,
                    background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {selectedOrg.logo_url ? (
                        <img
                          src={selectedOrg.logo_url}
                          alt={selectedOrg.name}
                          className="h-20 w-20 rounded-xl object-cover shadow-md flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="h-20 w-20 rounded-xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-md"
                          style={{ backgroundColor: '#3B82F6' }}
                        >
                          {selectedOrg.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h2
                          className="text-3xl font-bold"
                          style={{ color: colors.text.primary }}
                        >
                          {selectedOrg.name}
                        </h2>
                        <p
                          style={{ color: colors.text.secondary }}
                          className="text-sm mt-2 leading-relaxed"
                        >
                          {selectedOrg.description ||
                            'No description available'}
                        </p>
                        <div className="mt-3">
                          {getStatusBadge(selectedOrg.status)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 text-3xl leading-none flex-shrink-0 ml-4"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Details Content */}
                <div className="p-8">
                  {/* Key Metrics Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Users */}
                    <div
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                      }}
                    >
                      <p
                        className="text-xs font-semibold uppercase"
                        style={{ color: colors.text.secondary }}
                      >
                        User Limit
                      </p>
                      <p
                        className="text-2xl font-bold mt-2"
                        style={{ color: '#3B82F6' }}
                      >
                        {selectedOrg.user_limit || 'N/A'}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: colors.text.secondary }}
                      >
                        users
                      </p>
                    </div>

                    {/* Storage */}
                    <div
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        borderColor: 'rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <p
                        className="text-xs font-semibold uppercase"
                        style={{ color: colors.text.secondary }}
                      >
                        Storage Used / Limit
                      </p>
                      <p
                        className="text-2xl font-bold mt-2"
                        style={{ color: '#10B981' }}
                      >
                        {formatStorage(selectedOrg.storage)} /{' '}
                        {formatStorageLimit(selectedOrg.storage_limit)}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: colors.text.secondary }}
                      >
                        used / limit
                      </p>
                    </div>

                    {/* Credits */}
                    <div
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                        borderColor: 'rgba(245, 158, 11, 0.2)',
                      }}
                    >
                      <p
                        className="text-xs font-semibold uppercase"
                        style={{ color: colors.text.secondary }}
                      >
                        Available Credits
                      </p>
                      <p
                        className="text-2xl font-bold mt-2"
                        style={{ color: '#F59E0B' }}
                      >
                        {selectedOrg.credit || 0}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: colors.text.secondary }}
                      >
                        credits
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="border-t mb-8"
                    style={{ borderColor: colors.border }}
                  ></div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Organization ID */}
                      <div>
                        <label
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: colors.text.secondary }}
                        >
                          Organization ID
                        </label>
                        <p
                          className="text-sm font-medium mt-2"
                          style={{ color: colors.text.primary }}
                        >
                          {selectedOrg.id}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <label
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: colors.text.secondary }}
                        >
                          Status
                        </label>
                        <p
                          className="text-sm font-medium mt-2"
                          style={{ color: colors.text.primary }}
                        >
                          {selectedOrg.status}
                        </p>
                      </div>

                      {/* Plan */}
                      <div>
                        <label
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: colors.text.secondary }}
                        >
                          Plan
                        </label>
                        <p
                          className="text-sm font-medium mt-2"
                          style={{ color: colors.text.primary }}
                        >
                          {selectedOrg.plan || 'N/A'}
                        </p>
                      </div>

                      {/* Created At */}
                      <div>
                        <label
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: colors.text.secondary }}
                        >
                          Created At
                        </label>
                        <p
                          className="text-sm font-medium mt-2"
                          style={{ color: colors.text.primary }}
                        >
                          {selectedOrg.created_at
                            ? new Date(
                                selectedOrg.created_at
                              ).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Updated At */}
                      <div>
                        <label
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: colors.text.secondary }}
                        >
                          Last Updated
                        </label>
                        <p
                          className="text-sm font-medium mt-2"
                          style={{ color: colors.text.primary }}
                        >
                          {selectedOrg.updated_at
                            ? new Date(
                                selectedOrg.updated_at
                              ).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </p>
                      </div>

                      {/* Placeholder for balance */}
                      <div>
                        <label
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: colors.text.secondary }}
                        >
                          Account Status
                        </label>
                        <p
                          className="text-sm font-medium mt-2"
                          style={{ color: colors.text.primary }}
                        >
                          {selectedOrg.status === 'ACTIVE'
                            ? 'Active & Verified'
                            : selectedOrg.status}
                        </p>
                      </div>

                      {/* Placeholder */}
                      <div></div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="px-8 py-6 border-t flex justify-end gap-3"
                  style={{ borderColor: colors.border }}
                >
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="px-8 py-2.5 rounded-lg font-medium transition-all duration-200"
                    style={{
                      backgroundColor: '#3B82F6',
                      color: 'white',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#2563EB';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#3B82F6';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p style={{ color: colors.text.secondary }}>
                  Failed to load organization details
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog - Always Light Mode */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Organization
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete{' '}
              <strong className="text-gray-900">{orgToDelete?.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setOrgToDelete(null);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Organization Modal */}
      <AddOrganizationModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingOrg(null);
        }}
        onSuccess={() => {
          // Refresh organizations list
          setCurrentPage(1);
          const fetchOrganizations = async () => {
            try {
              const baseURL = apiConfig.backend.baseURL;
              const response = await fetch(`${baseURL}/api/org/allOrg`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              setOrganizations(Array.isArray(data.data) ? data.data : []);
            } catch (err) {
              console.error('Error fetching organizations:', err);
            }
          };
          fetchOrganizations();
        }}
        editingOrg={editingOrg}
      />
    </main>
  );
}
