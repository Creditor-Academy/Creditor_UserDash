import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Ticket,
} from 'lucide-react';

const hexToRgba = (hex, alpha = 0.12) => {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Status Badge Component
const StatusBadge = ({ status, colors }) => {
  const statusConfig = {
    open: {
      color: colors.accent.blue,
      bg: hexToRgba(colors.accent.blue),
      label: 'Open',
    },
    'in-progress': {
      color: colors.accent.yellow,
      bg: hexToRgba(colors.accent.yellow),
      label: 'In Progress',
    },
    resolved: {
      color: colors.accent.green,
      bg: hexToRgba(colors.accent.green),
      label: 'Resolved',
    },
    closed: {
      color: colors.text.secondary,
      bg: hexToRgba(colors.text.secondary, 0.18),
      label: 'Closed',
    },
  }[status] || {
    color: colors.text.secondary,
    bg: hexToRgba(colors.text.secondary, 0.14),
    label: status,
  };

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: statusConfig.bg,
        color: statusConfig.color,
        border: `1px solid ${hexToRgba(statusConfig.color, 0.25)}`,
      }}
    >
      {statusConfig.label}
    </span>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority, colors }) => {
  const priorityConfig = {
    low: {
      color: colors.accent.green,
      bg: hexToRgba(colors.accent.green),
      label: 'Low',
    },
    medium: {
      color: colors.accent.yellow,
      bg: hexToRgba(colors.accent.yellow),
      label: 'Medium',
    },
    high: {
      color: colors.accent.orange,
      bg: hexToRgba(colors.accent.orange),
      label: 'High',
    },
    critical: {
      color: colors.accent.red,
      bg: hexToRgba(colors.accent.red),
      label: 'Critical',
    },
  }[priority] || {
    color: colors.text.secondary,
    bg: hexToRgba(colors.text.secondary, 0.14),
    label: priority,
  };

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: priorityConfig.bg,
        color: priorityConfig.color,
        border: `1px solid ${hexToRgba(priorityConfig.color, 0.25)}`,
      }}
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
  onUpdateStatus,
  statusLoading,
  resolveLoading,
}) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [resolution, setResolution] = useState('');
  const [statusUpdate, setStatusUpdate] = useState(ticket?.status || 'open');

  useEffect(() => {
    setStatusUpdate(ticket?.status || 'open');
    setResolution('');
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const handleResolve = () => {
    if (resolution.trim()) {
      onResolve(ticket.id, resolution);
      setResolution('');
    }
  };

  const handleStatusUpdate = () => {
    if (statusUpdate && statusUpdate !== ticket.status) {
      onUpdateStatus(ticket.id, statusUpdate);
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
              {ticket.subject || ticket.title}
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: colors.text.secondary }}
            >
              Submitted by: {ticket.submittedBy || ticket.createdBy}
            </p>
            <p
              className="text-xs mt-1"
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
              <StatusBadge status={ticket.status} colors={colors} />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Priority
              </label>
              <PriorityBadge priority={ticket.priority} colors={colors} />
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
            className="grid md:grid-cols-2 gap-4 p-4 rounded-lg"
            style={{ backgroundColor: colors.bg.primary }}
          >
            <div className="space-y-1">
              <p
                className="text-xs font-medium"
                style={{ color: colors.text.secondary }}
              >
                Subject
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-base font-semibold"
              >
                {ticket.subject || ticket.title}
              </p>
            </div>

            <div className="space-y-1">
              <p
                className="text-xs font-medium"
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

            <div className="space-y-1">
              <p
                className="text-xs font-medium"
                style={{ color: colors.text.secondary }}
              >
                Category
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium uppercase tracking-wide"
              >
                {ticket.category || 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <p
                className="text-xs font-medium"
                style={{ color: colors.text.secondary }}
              >
                Ticket ID
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium break-all"
              >
                {ticket.id}
              </p>
            </div>

            <div className="space-y-1">
              <p
                className="text-xs font-medium"
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

            <div className="space-y-1">
              <p
                className="text-xs font-medium"
                style={{ color: colors.text.secondary }}
              >
                Student Email
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium break-all"
              >
                {ticket.student?.email || 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <p
                className="text-xs font-medium"
                style={{ color: colors.text.secondary }}
              >
                Student ID
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium break-all"
              >
                {ticket.student?.id || 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <p
                className="text-xs font-medium"
                style={{ color: colors.text.secondary }}
              >
                Student Phone
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium break-all"
              >
                {ticket.student?.phone || 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <p
                className="text-xs font-medium"
                style={{ color: colors.text.secondary }}
              >
                Created Date
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {ticket.createdAt
                  ? new Date(ticket.createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <p
                className="text-xs font-medium"
                style={{ color: colors.text.secondary }}
              >
                Last Updated
              </p>
              <p
                style={{ color: colors.text.primary }}
                className="text-sm font-medium"
              >
                {ticket.updatedAt
                  ? new Date(ticket.updatedAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Status Update */}
          <div
            className="p-4 rounded-lg border flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.bg.primary,
            }}
          >
            <div className="flex flex-col gap-1">
              <span
                className="text-sm font-semibold"
                style={{ color: colors.text.primary }}
              >
                Update Status
              </span>
              <span
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                Choose a new status for this ticket.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                }}
                value={statusUpdate}
                onChange={e => setStatusUpdate(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  opacity:
                    statusUpdate === ticket.status || statusLoading ? 0.6 : 1,
                  cursor:
                    statusUpdate === ticket.status || statusLoading
                      ? 'not-allowed'
                      : 'pointer',
                }}
                disabled={statusUpdate === ticket.status || statusLoading}
              >
                {statusLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Replies */}
          {ticket.replies && ticket.replies.length > 0 && (
            <div className="space-y-3">
              <h4
                className="text-sm font-semibold"
                style={{ color: colors.text.primary }}
              >
                Conversation
              </h4>
              <div className="space-y-3">
                {ticket.replies.map(reply => {
                  const senderName =
                    `${reply.sender?.first_name || ''} ${reply.sender?.last_name || ''}`.trim() ||
                    reply.sender?.email ||
                    'Unknown';
                  return (
                    <div
                      key={reply.id}
                      className="p-3 rounded-lg border"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.bg.primary,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: colors.text.primary }}
                        >
                          {senderName}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: colors.text.secondary }}
                        >
                          {reply.created_at
                            ? new Date(reply.created_at).toLocaleString()
                            : ''}
                        </span>
                      </div>
                      <p
                        className="text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {reply.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resolution Section */}
          {ticket.status !== 'closed' && (
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
              disabled={!resolution.trim() || resolveLoading}
              className="px-6 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
              }}
            >
              <CheckCircle className="inline mr-2" size={16} />
              {resolveLoading ? 'Submitting...' : 'Resolve Ticket'}
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
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
  const toApiStatus = status => {
    const normalized = (status || '')
      .toLowerCase()
      .trim()
      .replace(/[_\s]+/g, '-');
    const map = {
      open: 'PENDING',
      'in-progress': 'IN_PROGRESS',
      resolved: 'RESOLVED',
      closed: 'CLOSED',
    };
    return map[normalized] || 'PENDING';
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const normalizeStatus = status => {
      const upper = (status || '').toUpperCase();
      switch (upper) {
        case 'OPEN':
        case 'PENDING':
          return 'open';
        case 'IN_PROGRESS':
        case 'IN-PROGRESS':
          return 'in-progress';
        case 'RESOLVED':
          return 'resolved';
        case 'CLOSED':
          return 'closed';
        default:
          return upper.toLowerCase() || 'open';
      }
    };

    const normalizePriority = priority =>
      priority ? priority.toLowerCase() : 'low';

    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        setError('');
        const token =
          localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          setError('Access token missing. Please log in again.');
          setTickets([]);
          return;
        }

        const res = await fetch(`${API_BASE}/api/org/Allticket`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const failBody = await res.json().catch(() => ({}));
          const message =
            failBody?.message ||
            failBody?.error ||
            `Request failed with status ${res.status}`;
          setError(message);
          setTickets([]);
          return;
        }

        const json = await res.json();
        const incoming = Array.isArray(json?.data) ? json.data : [];
        const normalized = incoming.map(item => {
          const subject = item.subject || item.category || 'Support Ticket';
          const studentName = item.student
            ? `${item.student.first_name || ''} ${item.student.last_name || ''}`.trim() ||
              item.student.email ||
              'Unknown'
            : 'Unknown';

          const organizationName =
            item.organization_name ||
            item.organizations?.name ||
            item.organization?.name ||
            'N/A';

          return {
            id: item.id,
            title: subject,
            subject,
            description: item.description || 'No description provided.',
            status: normalizeStatus(item.status),
            priority: normalizePriority(item.priority),
            createdBy: studentName,
            submittedBy: studentName,
            createdAt:
              item.created_at ||
              item.createdAt ||
              item.created_on ||
              item.createdOn,
            updatedAt:
              item.updated_at ||
              item.updatedAt ||
              item.updated_on ||
              item.updatedOn,
            organization: organizationName,
            category: item.category,
            student: item.student,
            replies: item.replies || [],
            raw: item,
          };
        });
        setTickets(normalized);
      } catch (err) {
        console.error('Failed to fetch tickets', err);
        setError('Failed to load tickets. Please try again.');
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.submittedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.organization?.toLowerCase().includes(searchTerm.toLowerCase());

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
  const handleResolveTicket = async (ticketId, resolution) => {
    const token =
      localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      setError('Access token missing. Please log in again.');
      return;
    }

    try {
      setIsResolving(true);
      const res = await fetch(
        `${API_BASE}/api/support-tickets/admin/reply/${ticketId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: resolution,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.message || body?.error || 'Failed to resolve ticket'
        );
      }

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
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to resolve ticket.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    const token =
      localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      setError('Access token missing. Please log in again.');
      return;
    }

    try {
      setIsStatusUpdating(true);
      const res = await fetch(
        `${API_BASE}/api/support-tickets/status/${ticketId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: toApiStatus(status) }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.message || body?.error || 'Failed to update status'
        );
      }

      setTickets(
        tickets.map(t =>
          t.id === ticketId
            ? {
                ...t,
                status,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev =>
          prev ? { ...prev, status, updatedAt: new Date().toISOString() } : prev
        );
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update status.');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // Ticket statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  const cardShadow =
    theme === 'dark'
      ? '0 18px 45px rgba(0,0,0,0.38)'
      : '0 16px 40px rgba(0,0,0,0.08)';

  const panelStyle = {
    backgroundColor: colors.bg.secondary,
    border: `1px solid ${colors.border}`,
    boxShadow: cardShadow,
  };

  return (
    <main
      className="ml-20 pt-24 p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto"
      style={{ backgroundColor: colors.bg.primary, color: colors.text.primary }}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-8">
        {/* Header */}
        <div style={{ color: colors.text.primary }} className="mt-16">
          <h1 className="text-4xl font-bold mb-2">Support Tickets</h1>
          <p className="text-lg" style={{ color: colors.text.secondary }}>
            Manage and track support tickets from all organizations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Tickets */}
          <div className="p-5 rounded-2xl" style={panelStyle}>
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
                style={{ backgroundColor: hexToRgba(colors.accent.blue) }}
              >
                <Ticket
                  className="h-6 w-6"
                  style={{ color: colors.accent.blue }}
                />
              </div>
            </div>
          </div>

          {/* Open Tickets */}
          <div className="p-5 rounded-2xl" style={panelStyle}>
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
                style={{ backgroundColor: hexToRgba(colors.accent.blue) }}
              >
                <AlertCircle
                  className="h-6 w-6"
                  style={{ color: colors.accent.blue }}
                />
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="p-5 rounded-2xl" style={panelStyle}>
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
                style={{ backgroundColor: hexToRgba(colors.accent.yellow) }}
              >
                <Clock
                  className="h-6 w-6"
                  style={{ color: colors.accent.yellow }}
                />
              </div>
            </div>
          </div>

          {/* Resolved */}
          <div className="p-5 rounded-2xl" style={panelStyle}>
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
                style={{ backgroundColor: hexToRgba(colors.accent.green) }}
              >
                <CheckCircle
                  className="h-6 w-6"
                  style={{ color: colors.accent.green }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="rounded-2xl overflow-hidden" style={panelStyle}>
          {/* Table Header with Filters */}
          <div
            className="p-4 border-b flex items-center justify-between flex-wrap gap-4"
            style={{ borderColor: colors.border }}
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: colors.text.primary }}
            >
              All Support Tickets
            </h3>
            <div className="flex items-center space-x-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: colors.text.secondary, opacity: 0.75 }}
                />
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
            <table
              className="min-w-full"
              style={{ borderColor: colors.border, color: colors.text.primary }}
            >
              <thead
                style={{
                  backgroundColor: colors.bg.primary,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: colors.text.secondary }}
                  >
                    Submitted By
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: colors.text.secondary }}
                  >
                    Subject
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: colors.text.secondary }}
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: colors.text.secondary }}
                  >
                    Organization
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: colors.text.secondary }}
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: colors.text.secondary }}
                  >
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: colors.text.secondary }}
                  >
                    Created
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderColor: colors.border,
                }}
              >
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div
                        className="flex items-center justify-center gap-3 text-sm font-medium"
                        style={{ color: colors.text.secondary }}
                      >
                        <Clock
                          className="h-5 w-5 animate-spin"
                          style={{ color: colors.accent.blue }}
                        />
                        Loading tickets...
                      </div>
                    </td>
                  </tr>
                ) : currentTickets.length > 0 ? (
                  currentTickets.map(ticket => (
                    <tr
                      key={ticket.id}
                      style={{
                        backgroundColor: colors.bg.secondary,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
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
                          className="text-sm font-medium"
                          style={{ color: colors.text.primary }}
                        >
                          {ticket.submittedBy || ticket.createdBy}
                        </div>
                        <div
                          className="text-xs mt-1"
                          style={{ color: colors.text.secondary }}
                        >
                          {ticket.student?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm font-medium"
                          style={{ color: colors.text.primary }}
                        >
                          {ticket.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: colors.bg.primary,
                            color: colors.text.primary,
                            border: `1px solid ${colors.border}`,
                            letterSpacing: 0.2,
                          }}
                        >
                          {ticket.category || 'N/A'}
                        </span>
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
                        <StatusBadge status={ticket.status} colors={colors} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge
                          priority={ticket.priority}
                          colors={colors}
                        />
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-md transition-colors"
                          title="View Details"
                          style={{ color: colors.text.secondary }}
                          onMouseEnter={e =>
                            (e.currentTarget.style.backgroundColor =
                              colors.bg.hover)
                          }
                          onMouseLeave={e =>
                            (e.currentTarget.style.backgroundColor =
                              'transparent')
                          }
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
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        {error ? (
                          <>
                            <AlertCircle
                              className="h-12 w-12 mb-4"
                              style={{ color: colors.accent.red, opacity: 0.8 }}
                            />
                            <h3
                              className="text-lg font-medium mb-1"
                              style={{ color: colors.text.primary }}
                            >
                              Unable to load tickets
                            </h3>
                            <p
                              className="text-sm max-w-md"
                              style={{ color: colors.text.secondary }}
                            >
                              {error}
                            </p>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
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
              <div className="text-sm" style={{ color: colors.text.secondary }}>
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
                <span
                  className="text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  Rows per page: {rowsPerPage}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md transition-colors disabled:opacity-50"
                    style={{ color: colors.text.primary }}
                    onMouseEnter={e => {
                      if (e.currentTarget.disabled) return;
                      e.currentTarget.style.backgroundColor = colors.bg.hover;
                    }}
                    onMouseLeave={e =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
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
                    className="p-1.5 rounded-md transition-colors disabled:opacity-50"
                    style={{ color: colors.text.primary }}
                    onMouseEnter={e => {
                      if (e.currentTarget.disabled) return;
                      e.currentTarget.style.backgroundColor = colors.bg.hover;
                    }}
                    onMouseLeave={e =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
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
        onUpdateStatus={handleUpdateStatus}
        statusLoading={isStatusUpdating}
        resolveLoading={isResolving}
      />
    </main>
  );
}
