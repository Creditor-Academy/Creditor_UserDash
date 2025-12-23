import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Filter,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Tag,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getUserTickets } from '@/services/ticketService';
import { useAuth } from '@/contexts/AuthContext';

const statusColor = status => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return 'default';
    case 'CLOSED':
      return 'secondary';
    case 'PENDING':
      return 'outline';
    case 'RESOLVED':
      return 'success'; // green
    case 'IN_PROGRESS':
    case 'IN-PROGRESS':
    case 'IN PROGRESS':
      return 'warning'; // yellow
    default:
      return 'outline';
  }
};

const priorityColor = priority => {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
      return 'destructive';
    case 'MEDIUM':
      return 'default';
    case 'LOW':
      return 'secondary';
    default:
      return 'outline';
  }
};

const SkeletonLine = ({ className = '' }) => (
  <div className={`bg-gray-200/80 animate-pulse rounded ${className}`} />
);

export default function MyTickets() {
  const { hasRole } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Normalize replies so created/updated timestamps exist consistently
  const normalizeReplies = (replies = []) =>
    replies.map(reply => ({
      ...reply,
      createdAt:
        reply.createdAt ||
        reply.created_at ||
        reply.created_on ||
        reply.createdDate ||
        reply.created ||
        reply.created_time ||
        reply.createdTime ||
        null,
      updatedAt:
        reply.updatedAt ||
        reply.updated_at ||
        reply.updated_on ||
        reply.updatedDate ||
        reply.updated ||
        reply.updated_time ||
        reply.updatedTime ||
        null,
      senderId:
        reply.senderId || reply.sender_id || reply.user_id || reply.author_id,
    }));

  // Fetch tickets from backend
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the ticketService function which handles authentication properly
      console.log('Fetching user tickets...');
      const response = await getUserTickets();

      console.log('API Response:', response.data);

      if (response.data && response.data.success) {
        const incoming = response.data.data || [];
        const normalized = incoming.map(t => ({
          ...t,
          createdAt:
            t.createdAt ||
            t.created_at ||
            t.created_on ||
            t.createdDate ||
            t.created ||
            t.created_time ||
            t.createdTime ||
            null,
          updatedAt:
            t.updatedAt ||
            t.updated_at ||
            t.updated_on ||
            t.updatedDate ||
            t.updated ||
            t.updated_time ||
            t.updatedTime ||
            null,
          replies: normalizeReplies(t.replies || []),
        }));
        setTickets(normalized);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
      });
      setError(
        err.response?.data?.message || err.message || 'Failed to load tickets'
      );

      // Silently handle errors on this page; no toast banners
      // Optionally, log to console or set local state if needed
      // console.warn('Ticket fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Sort tickets by creation date (newest first) before filtering
  const sortedTickets = [...tickets].sort((a, b) => {
    const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime; // Newest first
  });

  const filteredTickets = sortedTickets.filter(ticket => {
    const matchesSearch =
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id?.toString().includes(searchQuery);

    const matchesStatus =
      statusFilter === 'All' ||
      ticket.status?.toUpperCase() === statusFilter.toUpperCase();
    const matchesPriority =
      priorityFilter === 'All' ||
      ticket.priority?.toUpperCase() === priorityFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openTicketDetails = ticket => {
    setSelectedTicket(ticket);
    setShowTicketDialog(true);
  };

  useEffect(() => {
    // Reset to first page when filters or data change
    setPage(1);
  }, [searchQuery, statusFilter, priorityFilter, tickets]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTickets = filteredTickets.slice(
    startIndex,
    startIndex + pageSize
  );

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = dateString => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getReplyMeta = (reply, ticket) => {
    const studentId = ticket?.student?.id || ticket?.student_id;
    const senderId = reply.senderId || reply.sender_id || reply.sender?.id;
    const isFromSupport = senderId && studentId ? senderId !== studentId : true;

    const senderName =
      reply.sender?.first_name || reply.sender?.last_name
        ? `${reply.sender?.first_name || ''} ${reply.sender?.last_name || ''}`.trim()
        : isFromSupport
          ? 'Support Team'
          : 'You';

    return {
      isFromSupport,
      displayName: isFromSupport ? 'Support Team' : 'You',
      senderName,
    };
  };

  if (loading) {
    const skeletonRows = Array.from({ length: 5 });
    return (
      <div className="container py-8 max-w-6xl space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <SkeletonLine className="h-7 w-56" />
            <SkeletonLine className="h-4 w-64" />
          </div>
          <SkeletonLine className="h-10 w-36" />
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <SkeletonLine className="h-10 w-full md:w-80" />
            <SkeletonLine className="h-10 w-full md:w-48" />
            <SkeletonLine className="h-10 w-full md:w-48" />
          </div>
          <div className="space-y-3">
            {skeletonRows.map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-5 gap-3 items-center border rounded-lg px-4 py-3"
              >
                <div className="col-span-2 space-y-2">
                  <SkeletonLine className="h-4 w-40" />
                  <SkeletonLine className="h-3 w-28" />
                </div>
                <SkeletonLine className="h-6 w-24" />
                <SkeletonLine className="h-6 w-20" />
                <SkeletonLine className="h-4 w-28 ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Support Tickets</h1>
          <p className="text-muted-foreground">
            Track and manage your support requests
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/support/ticket">
            <Plus className="mr-2 h-4 w-4" />
            Create New Ticket
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Priority</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Pagination */}
      {filteredTickets.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 px-1">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-
            {Math.min(startIndex + pageSize, filteredTickets.length)} of{' '}
            {filteredTickets.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <Card className="p-6">
        {filteredTickets.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {searchQuery ||
            statusFilter !== 'All' ||
            priorityFilter !== 'All' ? (
              <div>
                <p className="mb-2">No tickets found matching your criteria.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setPriorityFilter('All');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : tickets.length === 0 ? (
              <div>
                <p className="mb-4">
                  You have not submitted any support tickets yet.
                </p>
                <Button asChild>
                  <Link to="/dashboard/support/ticket">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Ticket
                  </Link>
                </Button>
              </div>
            ) : (
              <div>
                <p className="mb-4">No tickets found.</p>
                <Button variant="outline" onClick={fetchTickets}>
                  Refresh
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[70px] text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold leading-tight">
                        {ticket.subject}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created {formatDate(ticket.createdAt)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {formatDate(ticket.updatedAt)}
                      </div>
                      <div className="text-muted-foreground">Updated</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openTicketDetails(ticket)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedTicket?.subject || 'Ticket details'}
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedTicket?.category && (
                  <Badge variant="outline">{selectedTicket.category}</Badge>
                )}
                {selectedTicket?.priority && (
                  <Badge variant={priorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                )}
                {selectedTicket?.status && (
                  <Badge variant={statusColor(selectedTicket.status)}>
                    {selectedTicket.status}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created {formatDateTime(selectedTicket?.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Updated {formatDateTime(selectedTicket?.updatedAt)}
                  </span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6 pt-2">
              {/* Description */}
              {selectedTicket.description && (
                <div>
                  <h4 className="font-medium mb-3">Description</h4>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {selectedTicket.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {(() => {
                try {
                  const parsed = selectedTicket.attachments
                    ? JSON.parse(selectedTicket.attachments)
                    : [];
                  return parsed.length > 0 ? (
                    <div>
                      <h4 className="font-medium mb-3">Attachments</h4>
                      <div className="space-y-2">
                        {parsed.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="text-blue-600">📎</span>
                            <span>{attachment.split('/').pop()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                } catch {
                  return null;
                }
              })()}

              {/* Messages/Replies */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Conversation
                </h4>
                <div className="space-y-3">
                  {/* Original ticket message */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-sm">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <span className="font-medium text-sm">You</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(selectedTicket.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {selectedTicket.description}
                      </p>
                    </div>
                  </div>

                  {/* Replies */}
                  {selectedTicket.replies &&
                  selectedTicket.replies.length > 0 ? (
                    selectedTicket.replies.map(reply => {
                      const { isFromSupport, displayName, senderName } =
                        getReplyMeta(reply, selectedTicket);
                      return (
                        <div
                          key={reply.id}
                          className={`flex ${isFromSupport ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg border p-3 space-y-2 shadow-sm ${
                              isFromSupport
                                ? 'bg-blue-50 border-blue-100'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="font-medium text-sm">
                                {displayName}
                                {senderName && senderName !== displayName
                                  ? ` (${senderName})`
                                  : ''}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                              {reply.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      <p className="text-sm">
                        No replies yet. Support Team will respond soon.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowTicketDialog(false)}
                >
                  Close
                </Button>
                {selectedTicket.status?.toUpperCase() === 'OPEN' && (
                  <Button>Reply to Ticket</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
