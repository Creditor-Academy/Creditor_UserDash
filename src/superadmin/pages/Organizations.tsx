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
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

interface Organization {
  id: string;
  name: string;
  industry: string;
  email: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  users: number;
}

export default function Organizations() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in a real app, this would be fetched from an API
  useEffect(() => {
    const mockOrganizations: Organization[] = [
      {
        id: '1',
        name: 'Acme Corp',
        industry: 'Technology',
        email: 'contact@acmecorp.com',
        status: 'active',
        createdAt: '2023-01-15',
        users: 42,
      },
      {
        id: '2',
        name: 'Globex',
        industry: 'Finance',
        email: 'info@globex.com',
        status: 'pending',
        createdAt: '2023-03-22',
        users: 18,
      },
      {
        id: '3',
        name: 'Initech',
        industry: 'Software',
        email: 'support@initech.com',
        status: 'suspended',
        createdAt: '2022-11-05',
        users: 76,
      },
      {
        id: '4',
        name: 'Soylent',
        industry: 'Food & Beverage',
        email: 'hello@soylent.com',
        status: 'active',
        createdAt: '2023-02-14',
        users: 31,
      },
      {
        id: '5',
        name: 'Umbrella Corp',
        industry: 'Pharmaceuticals',
        email: 'contact@umbrella.com',
        status: 'active',
        createdAt: '2023-04-01',
        users: 127,
      },
    ];

    setTimeout(() => {
      setOrganizations(mockOrganizations);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.industry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === 'all' || org.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Suspended
          </span>
        );
      default:
        return null;
    }
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
          className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
          style={{ borderColor: colors.border, borderWidth: '1px' }}
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
                <p className="text-gray-500 dark:text-gray-400">
                  No organizations found matching your criteria.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
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
                      Industry
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Users
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
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrganizations.map(org => (
                    <tr
                      key={org.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {org.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div
                              className="text-sm font-medium"
                              style={{ color: colors.text.primary }}
                            >
                              {org.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: colors.text.secondary }}
                            >
                              ID: {org.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {org.industry}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {org.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {org.users} users
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(org.status)}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {new Date(org.createdAt).toLocaleDateString()}
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
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500"
                            title="Delete"
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
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">
                    {filteredOrganizations.length}
                  </span>{' '}
                  of <span className="font-medium">{organizations.length}</span>{' '}
                  organizations
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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
    </main>
  );
}
