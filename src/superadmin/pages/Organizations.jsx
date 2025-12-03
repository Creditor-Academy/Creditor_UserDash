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
      PENDING: 'pending',
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
      pending: {
        text: 'Pending',
        icon: <Clock className="w-3 h-3 mr-1" />,
        bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      },
      PENDING: {
        text: 'Pending',
        icon: <Clock className="w-3 h-3 mr-1" />,
        bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      },
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

  return (
    <main
      className="ml-20 pt-24 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto"
      style={{ backgroundColor: colors.bg.primary }}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
          <div style={{ color: colors.text.primary }}>
            <h1 className="text-3xl font-bold">Organizations</h1>
            <p
              className="text-sm mt-1"
              style={{ color: colors.text.secondary }}
            >
              Manage all organizations and their details
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search organizations..."
                className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                style={{
                  backgroundColor: colors.bg.primary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="appearance-none block pl-3 pr-10 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                style={{
                  backgroundColor: colors.bg.primary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                }}
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
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
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p
                  className="mt-2 text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  Loading organizations...
                </p>
              </div>
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
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      S.No.
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Organization Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Admin Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Total Users
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
                      Created
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
                  {currentOrgs.map((org, index) => (
                    <tr
                      key={org.id}
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2 justify-end">
                          <button
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                            title="View"
                          >
                            <Eye
                              className="h-4 w-4"
                              style={{ color: colors.text.secondary }}
                            />
                          </button>
                          <button
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                            title="Edit"
                          >
                            <Edit
                              className="h-4 w-4"
                              style={{ color: colors.text.secondary }}
                            />
                          </button>
                          <button
                            onClick={e => handleDeleteClick(org, e)}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500"
                            title="Delete"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
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
    </main>
  );
}
