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
          replies: ticket.replies || [],
          category: ticket.category || 'General'
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

  // Map backend status to frontend display format
  const mapToFrontendStatus = (backendStatus) => {
    if (!backendStatus) return 'pending';
    
    const status = backendStatus.toLowerCase();
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'in_progress':
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (ticket.message && ticket.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         ticket.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Get the normalized status for comparison
    const ticketStatus = mapToFrontendStatus(ticket.status);
    const matchesStatus = statusFilter === 'all' || ticketStatus === statusFilter;
    
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

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 p-0 mx-[-1rem] md:mx-[-1.5rem]">
      <Card className="w-full h-full flex flex-col border shadow-sm rounded-none">
        <CardHeader className="pb-4 border-b bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Mail className="h-5 w-5 text-blue-600" />
                Support Tickets
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    className="pl-10 w-full h-9 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-40">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <Filter className="h-4 w-4 mr-2 text-gray-500" />
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
            </div>
            {filteredTickets.length > 0 && (
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{endIndex} of {filteredTickets.length} tickets
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <h3 className="text-base font-medium text-gray-700">No tickets found</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No tickets match your search criteria. Try adjusting your filters.' 
                  : 'No support tickets have been created yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {paginatedTickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  className={`bg-white rounded-lg border transition-all duration-200 overflow-hidden ${expandedTicket === ticket.id ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'}`}
                >
                  <div 
                    className={`p-4 cursor-pointer ${expandedTicket === ticket.id ? 'border-b border-gray-100' : ''}`}
                    onClick={() => toggleTicketExpansion(ticket.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                              {ticket.userName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {ticket.userName} • {ticket.userEmail}
                              </h3>
                              {getStatusBadge(ticket.status)}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {ticket.subject} • {formatDate(ticket.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.priority}
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          {expandedTicket === ticket.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedTicket === ticket.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <div className="mb-4">
                        <h3 className="text-base font-medium text-gray-900">{ticket.userName}'s Ticket</h3>
                        <p className="text-sm text-gray-500">{ticket.subject}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Message</h4>
                            <div className="bg-white p-3 rounded border text-sm text-gray-700 whitespace-pre-line">
                              {ticket.message}
                            </div>
                          </div>
                          
                          {ticket.replies && ticket.replies.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Replies ({ticket.replies.length})
                              </h4>
                              <div className="space-y-3">
                                {ticket.replies.map((reply, index) => (
                                  <div key={index} className="bg-white p-3 rounded border">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                                          {reply.sender?.name?.charAt(0) || 'A'}
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">
                                          {reply.sender?.name || 'Admin'}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-400">
                                        {formatDate(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 ml-8">
                                      {reply.message}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Details</h4>
                            <div className="bg-white p-3 rounded border space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Category:</span>
                                <span className="font-medium">{ticket.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Created:</span>
                                <span>{formatDate(ticket.createdAt)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Last Updated:</span>
                                <span>{formatDate(ticket.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Actions</h4>
                            <div className="space-y-2">
                              <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={() => openReplyDialog(ticket.id)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Reply
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={() => openStatusDialog(ticket.id, ticket.status)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Update Status
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        
        {/* Pagination */}
        {filteredTickets.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {endIndex} of {filteredTickets.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1">Previous</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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