import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  MessageSquare,
  User,
  Calendar,
  Ticket,
  TrendingUp,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  organization: string;
  assignedTo?: string;
  resolution?: string;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    open: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-400',
      label: 'Open',
    },
    'in-progress': {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-400',
      label: 'In Progress',
    },
    resolved: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      label: 'Resolved',
    },
    closed: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-300',
      label: 'Closed',
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

// Priority Badge Component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityConfig = {
    low: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      label: 'Low',
    },
    medium: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-400',
      label: 'Medium',
    },
    high: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-800 dark:text-orange-400',
      label: 'High',
    },
    critical: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-400',
      label: 'Critical',
    },
  }[priority] || { bg: 'bg-gray-100', text: 'text-gray-800', label: priority };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.text}`}
    >
      {priorityConfig.label}
    </span>
  );
};

// Ticket Detail Modal Component
const TicketDetailModal = ({
  ticket,
  isOpen,
  onClose,
  onResolve,
}: {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (ticketId: string, resolution: string) => void;
}) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [resolution, setResolution] = useState('');

  if (!isOpen || !ticket) return null;

  const handleResolve = () => {
    if (resolution.trim()) {
      onResolve(ticket.id, resolution);
      setResolution('');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.bg.secondary }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: colors.border || 'rgba(255,255,255,0.1)' }}
        >
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: colors.text.primary }}
            >
              {ticket.title}
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: colors.text.secondary }}
            >
              Ticket ID: {ticket.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-opacity-10 rounded-lg transition-colors"
            style={{ color: colors.text.primary }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Status
              </label>
              <StatusBadge status={ticket.status} />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Priority
              </label>
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Description
            </label>
            <p
              style={{ color: colors.text.secondary }}
              className="text-sm leading-relaxed"
            >
              {ticket.description}
            </p>
          </div>

          {/* Ticket Details */}
          <div
            className="grid grid-cols-2 gap-4 p-4 rounded-lg"
            style={{ backgroundColor: colors.bg.primary }}
          >
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Created By
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {ticket.createdBy}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Organization
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {ticket.organization}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Created Date
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Last Updated
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {new Date(ticket.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Resolution Section */}
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Resolve Ticket
              </label>
              <textarea
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                placeholder="Enter resolution details..."
                className="w-full px-4 py-2 rounded-lg border transition-colors min-h-[120px]"
                style={{
                  backgroundColor: colors.bg.primary,
                  borderColor: colors.border || 'rgba(255,255,255,0.1)',
                  color: colors.text.primary,
                }}
              />
            </div>
          )}

          {ticket.resolution && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Resolution
              </label>
              <p
                className="text-sm leading-relaxed p-4 rounded-lg"
                style={{
                  color: colors.text.secondary,
                  backgroundColor: colors.bg.primary,
                }}
              >
                {ticket.resolution}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 p-6 border-t"
          style={{ borderColor: colors.border || 'rgba(255,255,255,0.1)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: colors.bg.primary,
              color: colors.text.primary,
              border: `1px solid ${colors.border || 'rgba(255,255,255,0.1)'}`,
            }}
          >
            Close
          </button>
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <button
              onClick={handleResolve}
              disabled={!resolution.trim()}
              className="px-6 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
              }}
            >
              <CheckCircle className="inline mr-2" size={16} />
              Resolve Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SupportTicket() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock data
  useEffect(() => {
    const mockTickets: SupportTicket[] = [
      {
        id: 'TKT-001',
        title: 'Login issues on mobile app',
        description:
          'Users are unable to login to the mobile application. They receive an "Authentication failed" error message.',
        status: 'open',
        priority: 'high',
        createdBy: 'Alex Johnson',
        createdAt: '2023-06-15T10:30:00',
        updatedAt: '2023-06-15T10:30:00',
        organization: 'Acme Corp',
      },
      {
        id: 'TKT-002',
        title: 'Dashboard loading slowly',
        description:
          'The main dashboard takes more than 10 seconds to load. This is affecting user experience.',
        status: 'in-progress',
        priority: 'medium',
        createdBy: 'Sarah Williams',
        createdAt: '2023-06-14T14:20:00',
        updatedAt: '2023-06-15T09:00:00',
        organization: 'Globex',
        assignedTo: 'Tech Team',
      },
      {
        id: 'TKT-003',
        title: 'Payment gateway integration error',
        description:
          'Payment processing is failing intermittently. Error code: 500 Internal Server Error.',
        status: 'open',
        priority: 'critical',
        createdBy: 'Michael Chen',
        createdAt: '2023-06-13T16:45:00',
        updatedAt: '2023-06-13T16:45:00',
        organization: 'Soylent Corp',
      },
      {
        id: 'TKT-004',
        title: 'Feature request: Dark mode',
        description:
          'Users are requesting a dark mode option for the application.',
        status: 'resolved',
        priority: 'low',
        createdBy: 'Emily Davis',
        createdAt: '2023-06-10T11:15:00',
        updatedAt: '2023-06-12T15:30:00',
        organization: 'Initech',
        resolution:
          'Dark mode feature has been implemented and deployed in version 2.1.0',
      },
      {
        id: 'TKT-005',
        title: 'Database connection timeout',
        description:
          'Experiencing intermittent database connection timeouts during peak hours.',
        status: 'in-progress',
        priority: 'high',
        createdBy: 'Robert Wilson',
        createdAt: '2023-06-12T08:00:00',
        updatedAt: '2023-06-15T10:00:00',
        organization: 'Umbrella Corp',
        assignedTo: 'Database Team',
      },
    ];

    setTimeout(() => {
      setTickets(mockTickets);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.organization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
  const currentTickets = filteredTickets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle resolve ticket
  const handleResolveTicket = (ticketId: string, resolution: string) => {
    setTickets(
      tickets.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'resolved',
              resolution,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    setIsDetailModalOpen(false);
    setSelectedTicket(null);
  };

  // Ticket statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <main
      className="ml-20 pt-24 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto"
      style={{ backgroundColor: colors.bg.primary }}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-8">
        {/* Header */}
        <div style={{ color: colors.text.primary }} className="mt-6">
          <h1 className="text-4xl font-bold mb-2">Support Tickets</h1>
          <p className="text-lg" style={{ color: colors.text.secondary }}>
            Manage and track support tickets from all organizations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Tickets */}
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
                  Total Tickets
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              >
                <Ticket className="h-6 w-6" style={{ color: '#3B82F6' }} />
              </div>
            </div>
          </div>

          {/* Open Tickets */}
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
                  Open Tickets
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.open}</h3>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              >
                <AlertCircle className="h-6 w-6" style={{ color: '#3B82F6' }} />
              </div>
            </div>
          </div>

          {/* In Progress */}
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
                  In Progress
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.inProgress}</h3>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
              >
                <Clock className="h-6 w-6" style={{ color: '#F59E0B' }} />
              </div>
            </div>
          </div>

          {/* Resolved */}
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
                  Resolved
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.resolved}</h3>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              >
                <CheckCircle className="h-6 w-6" style={{ color: '#10B981' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
          style={{ borderColor: colors.border, borderWidth: '1px' }}
        >
          {/* Table Header with Filters */}
          <div
            className="p-4 border-b flex items-center justify-between flex-wrap gap-4"
            style={{ borderColor: colors.border }}
          >
            <h3 className="text-lg font-semibold">All Support Tickets</h3>
            <div className="flex items-center space-x-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
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

              {/* Status Filter */}
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
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: colors.text.secondary }}
                />
              </div>

              {/* Priority Filter */}
              <div className="relative">
                <select
                  className="appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    borderColor: colors.border,
                    color: colors.text.primary,
                  }}
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: colors.text.secondary }}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Ticket ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Title
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
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Priority
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
                {currentTickets.length > 0 ? (
                  currentTickets.map(ticket => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm font-medium"
                          style={{ color: colors.text.primary }}
                        >
                          {ticket.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm font-medium"
                          style={{ color: colors.text.primary }}
                        >
                          {ticket.title}
                        </div>
                        <div
                          className="text-xs mt-1"
                          style={{ color: colors.text.secondary }}
                        >
                          {ticket.description.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {ticket.organization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="View Details"
                        >
                          <Eye
                            className="h-4 w-4"
                            style={{ color: colors.text.secondary }}
                          />
                        </button>
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
                          No tickets found
                        </h3>
                        <p
                          className="text-sm max-w-md"
                          style={{ color: colors.text.secondary }}
                        >
                          {searchTerm ||
                          statusFilter !== 'all' ||
                          priorityFilter !== 'all'
                            ? 'No tickets match your search criteria. Try adjusting your filters.'
                            : 'No support tickets available.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTickets.length > 0 && (
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
                  {Math.min(currentPage * rowsPerPage, filteredTickets.length)}
                </span>{' '}
                of <span className="font-medium">{filteredTickets.length}</span>{' '}
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
                    {Math.ceil(filteredTickets.length / rowsPerPage)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(p =>
                        Math.min(
                          Math.ceil(filteredTickets.length / rowsPerPage),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentPage >=
                      Math.ceil(filteredTickets.length / rowsPerPage)
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

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        onResolve={handleResolveTicket}
      />
    </main>
  );
}
