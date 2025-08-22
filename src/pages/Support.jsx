import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, Mail, AlertCircle, CheckCircle, Clock, ChevronDown, ChevronUp, Send, User, MessageSquare, Shield, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllTickets, addReplyToTicket, updateTicketStatus } from '@/services/ticketService';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const SupportTicketsPage = () => {
  const { hasRole } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const { toast } = useToast();

  // Modal state
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [statusDraft, setStatusDraft] = useState('PENDING');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Check if user has admin access
  const isAdmin = hasRole('admin');
  const isInstructor = hasRole('instructor');

  // Show access restricted modal for non-admin users
  if (!isAdmin) {
    return (
      <div className="w-full h-full flex flex-col">
        <Card className="w-full h-full flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {isInstructor 
                    ? "Instructors cannot view support tickets. Only administrators have access to support ticket management."
                    : "You don't have permission to view support tickets. Only administrators can access this feature."
                  }
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Required Role:</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-transparent">Admin</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch tickets from backend
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getAllTickets();
      
              // Transform the data to match our component's expected format
        const transformedTickets = response.data.data.map(ticket => ({
          id: ticket.id,
          userId: ticket.student_id,
          userName: ticket.student ? `${ticket.student.first_name} ${ticket.student.last_name}`.trim() : 'Unknown User',
          userEmail: ticket.student?.email || 'No email',
          subject: ticket.subject,
          message: ticket.description || ticket.message, // Use description field from backend
          status: mapToFrontendStatus(ticket.status), // Map backend status to frontend format
          priority: ticket.priority?.toLowerCase() || 'medium',
          createdAt: ticket.created_at,
          updatedAt: ticket.updated_at,
          attachments: ticket.attachments ? JSON.parse(ticket.attachments) : [],
          replies: ticket.replies || []
        }));
      
      // Sort tickets by creation date (newest first)
      const sortedTickets = transformedTickets.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTickets(sortedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch support tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [toast]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Reset to first page when filters or data change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tickets.length]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredTickets.length);
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  const toggleTicketExpansion = (ticketId) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
    setReplyingTo(null);
    setReplyText('');
  };

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingReply(true);
      await addReplyToTicket(ticketId, {
        message: replyText.trim()
      });

      // Refresh tickets to get the updated data
      const response = await getAllTickets();
      const transformedTickets = response.data.data.map(ticket => ({
        id: ticket.id,
        userId: ticket.student_id,
        userName: ticket.student ? `${ticket.student.first_name} ${ticket.student.last_name}`.trim() : 'Unknown User',
        userEmail: ticket.student?.email || 'No email',
        subject: ticket.subject,
        message: ticket.description || ticket.message,
        status: ticket.status?.toLowerCase() || 'pending',
        priority: ticket.priority?.toLowerCase() || 'medium',
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        attachments: ticket.attachments ? JSON.parse(ticket.attachments) : [],
        replies: ticket.replies || []
      }));
      
      // Sort tickets by creation date (newest first)
      const sortedTickets = transformedTickets.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTickets(sortedTickets);
      setReplyText('');
      setReplyingTo(null);
      setIsReplyDialogOpen(false);

      toast({
        title: "Success",
        description: "Reply sent successfully!",
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const openReplyDialog = (ticketId) => {
    setActiveTicketId(ticketId);
    setReplyingTo(ticketId);
    setReplyText('');
    setIsReplyDialogOpen(true);
  };

  const openStatusDialog = (ticketId, currentStatus) => {
    setActiveTicketId(ticketId);
    // Map frontend status to backend status format
    const backendStatus = mapToBackendStatus(currentStatus);
    setStatusDraft(backendStatus);
    setIsStatusDialogOpen(true);
  };

  // Update ticket status via backend API
  const applyStatusChange = async () => {
    if (!activeTicketId) return;
    
    try {
      setSubmittingReply(true);
      await updateTicketStatus(activeTicketId, statusDraft);
      
      // Refresh tickets list to get updated data from backend
      await fetchTickets();
      
      setIsStatusDialogOpen(false);
      toast({ 
        title: 'Status updated', 
        description: `Ticket status changed to ${statusDraft}.` 
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
      case 'pending':
      case 'PENDING':
        return <Badge className="bg-red-100 text-red-700 border-transparent">Open</Badge>;
      case 'in-progress':
      case 'IN_PROGRESS':
        return <Badge className="bg-amber-100 text-amber-700 border-transparent">In Progress</Badge>;
      case 'resolved':
      case 'RESOLVED':
        return <Badge className="bg-emerald-100 text-emerald-700 border-transparent">Resolved</Badge>;
      case 'closed':
      case 'CLOSED':
        return <Badge className="bg-gray-100 text-gray-700 border-transparent">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Map frontend status to backend status format
  const mapToBackendStatus = (frontendStatus) => {
    switch (frontendStatus?.toLowerCase()) {
      case 'open':
      case 'pending':
        return 'PENDING';
      case 'in-progress':
        return 'IN_PROGRESS';
      case 'resolved':
        return 'RESOLVED';
      case 'closed':
        return 'CLOSED';
      default:
        return 'PENDING';
    }
  };

  // Map backend status to frontend display format
  const mapToFrontendStatus = (backendStatus) => {
    switch (backendStatus?.toUpperCase()) {
      case 'PENDING':
        return 'open';
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'RESOLVED':
        return 'resolved';
      case 'CLOSED':
        return 'closed';
      default:
        return 'pending';
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 flex-1 flex flex-col min-h-0">
          {/* Search and Filter Section */}
          <div className="flex flex-col lg:flex-row gap-2 mb-2 flex-shrink-0">
            <div className="relative flex-1 min-w-0">
              <div className="text-xs text-gray-500 italic mb-1">
                💡 Click any row to view details
              </div>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                className="pl-10 w-full h-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full lg:w-36">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex items-center gap-2 w-full h-8">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-20 flex-1">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-4 flex-1">
              <Mail className="mx-auto h-6 w-6 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 mt-2">No tickets found</h3>
              <p className="text-xs text-gray-500 mt-1">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter' 
                  : 'No support tickets have been created yet'}
              </p>
            </div>
          ) : (
            /* Responsive Table Container */
            <div className="flex-1 overflow-auto min-h-0">
              <div className="min-w-[400px] w-full max-h-full">
                <Table>
                  <TableCaption className="text-xs">A list of recent support tickets raised by users.</TableCaption>
                  <TableHeader>
                    <TableRow className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
                      <TableHead className="w-40 text-sm font-semibold text-gray-700 py-2">User</TableHead>
                      <TableHead className="w-[28rem] text-sm font-semibold text-gray-700 py-2">Subject</TableHead>
                      <TableHead className="w-28 text-sm font-semibold text-gray-700 py-2">Priority</TableHead>
                      <TableHead className="w-28 text-sm font-semibold text-gray-700 py-2">Status</TableHead>
                      <TableHead className="w-24 text-sm font-semibold text-gray-700 py-2 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTickets.map((ticket) => (
                      <React.Fragment key={ticket.id}>
                        <TableRow 
                          className={`border-b align-top cursor-pointer transition-all duration-200 hover:shadow-sm ${expandedTicket === ticket.id ? 'bg-blue-50/70 border-l-4 border-l-blue-400' : 'hover:bg-blue-50/60 border-l-4 border-l-transparent'}`}
                          onClick={() => toggleTicketExpansion(ticket.id)}
                        >
                          <TableCell className="py-1">
                            <div className="font-medium text-xs truncate" title={ticket.userName}>
                              {ticket.userName}
                            </div>
                            <div className="text-xs text-gray-500 truncate" title={ticket.userEmail}>
                              {ticket.userEmail}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div 
                              className={`truncate max-w-[40ch] ${expandedTicket === ticket.id ? 'text-blue-700 font-semibold' : 'text-gray-800'}`}
                              title={ticket.subject}
                            >
                              {ticket.subject}
                            </div>
                          </TableCell>
                          <TableCell className="py-1">
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(ticket.priority)}
                              <span className="capitalize text-xs">{ticket.priority}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-1">{getStatusBadge(ticket.status)}</TableCell>
                          <TableCell className="py-1">
                            <div className="flex items-center justify-center">
                              {expandedTicket === ticket.id ? (
                                <ChevronUp className="h-3 w-3 text-blue-500 transition-transform duration-200" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-gray-500 transition-transform duration-200" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedTicket === ticket.id && (
                          <TableRow>
                            <TableCell colSpan={4} className="bg-blue-50/30 p-2 border-l-4 border-l-blue-200">
                              <div className="grid gap-2">
                                {/* Summary Row (compact - no duplicates) */}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">Ticket</h4>
                                    <div><span className="text-gray-500">ID:</span> <span className="font-mono">{ticket.id}</span></div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">Subject</h4>
                                    <div className="truncate">{ticket.subject}</div>
                                  </div>
                                </div>

                                {/* Body Row */}
                                <div className="grid grid-cols-3 gap-3">
                                  {/* Left: Message + Replies */}
                                  <div className="col-span-2 space-y-2">
                                    <div>
                                      <h4 className="font-medium mb-1 text-xs text-gray-600">Message</h4>
                                      <div className="bg-white p-2 rounded border text-xs">
                                        <p className="text-gray-700">{ticket.message}</p>
                                      </div>
                                    </div>
                                    {ticket.replies && ticket.replies.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-1 text-xs text-gray-600">Replies ({ticket.replies.length})</h4>
                                        <div className="space-y-1">
                                          {ticket.replies.map((reply, index) => (
                                            <div key={index} className="bg-white p-1 rounded border text-xs">
                                              <div className="flex justify-between text-gray-500 mb-1">
                                                <span>{reply.sender?.name || 'Admin'}</span>
                                                <span>{formatDate(reply.created_at)}</span>
                                              </div>
                                              <p className="text-gray-700">{reply.message}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Right: Details + Actions */}
                                  <div className="space-y-2">
                                    <div>
                                      <h4 className="font-medium mb-1 text-xs text-gray-600">Details</h4>
                                      <div className="text-xs space-y-1">
                                        <div><span className="text-gray-500">Created:</span> {formatDate(ticket.createdAt)}</div>
                                        <div><span className="text-gray-500">Updated:</span> {formatDate(ticket.updatedAt)}</div>
                                      </div>
                                    </div>
                                    <div className="mt-4">
                                      <h4 className="font-medium mb-1 text-xs text-gray-600">Actions</h4>
                                      <div className="flex flex-col gap-1">
                                        <Button size="sm" className="h-6 text-xs px-2" onClick={() => openStatusDialog(ticket.id, ticket.status)}>
                                          Change Status
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => openReplyDialog(ticket.id)}>
                                          Reply
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between py-3 px-2 border-t bg-white sticky bottom-0">
                  <div className="text-xs text-gray-600">
                    Showing <span className="font-medium">{filteredTickets.length === 0 ? 0 : startIndex + 1}</span>–<span className="font-medium">{endIndex}</span> of <span className="font-medium">{filteredTickets.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={safeCurrentPage === 1}
                      onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                      className="h-7 px-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous</span>
                    </Button>
                    <div className="text-xs text-gray-700 min-w-[90px] text-center">
                      Page <span className="font-medium">{safeCurrentPage}</span> of <span className="font-medium">{totalPages}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                      className="h-7 px-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to User</DialogTitle>
            <DialogDescription>Write your response and send it to the user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => handleReply(activeTicketId)}
              disabled={submittingReply || !replyText.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {submittingReply ? 'Sending...' : 'Send Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>Select a new status for this ticket.</DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <Select value={statusDraft} onValueChange={setStatusDraft}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
                              <SelectContent>
                  <SelectItem value="PENDING">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button 
              onClick={applyStatusChange} 
              disabled={submittingReply}
            >
              {submittingReply ? 'Updating...' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTicketsPage;