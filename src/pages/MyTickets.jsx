import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Filter,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Tag,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getUserTickets } from "@/services/ticketService";
import { useAuth } from "@/contexts/AuthContext";



const statusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "OPEN":
      return "default";
    case "CLOSED":
      return "secondary";
    case "PENDING":
      return "outline";
    case "RESOLVED":
      return "success"; // green
    case "IN_PROGRESS":
    case "IN-PROGRESS":
    case "IN PROGRESS":
      return "warning"; // yellow
    default:
      return "outline";
  }
};

const priorityColor = (priority) => {
  switch (priority?.toUpperCase()) {
    case "HIGH": return "destructive";
    case "MEDIUM": return "default";
    case "LOW": return "secondary";
    default: return "outline";
  }
};

export default function MyTickets() {
  const { isInstructorOrAdmin, hasRole } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);

  // Check if user is admin (admins should not access this page)
  const isAdmin = hasRole('admin');

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
        const normalized = incoming.map((t) => ({
          ...t,
          createdAt:
            t.createdAt ||
            t.created_at ||
            t.created_on ||
            t.createdDate ||
            t.created ||
            t.created_time ||
            t.createdTime || null,
          updatedAt:
            t.updatedAt ||
            t.updated_at ||
            t.updated_on ||
            t.updatedDate ||
            t.updated ||
            t.updated_time ||
            t.updatedTime || null,
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
        data: err.response?.data
      });
      setError(err.response?.data?.message || err.message || 'Failed to load tickets');
      
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

  const filteredTickets = sortedTickets.filter((ticket) => {
    const matchesSearch = 
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id?.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === "All" || ticket.status?.toUpperCase() === statusFilter.toUpperCase();
    const matchesPriority = priorityFilter === "All" || ticket.priority?.toUpperCase() === priorityFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDialog(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (isAdmin) {
    return (
      <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-xl">
          <div className="text-blue-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Admins cannot access this page. Please use the Support Tickets admin view.</p>
          <Button asChild>
            <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 max-w-6xl">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading your tickets...</p>
          </div>
        </div>
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
              onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Tickets Table */}
      <Card className="p-6">
        {filteredTickets.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {searchQuery || statusFilter !== "All" || priorityFilter !== "All" ? (
              <div>
                <p className="mb-2">No tickets found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All");
                    setPriorityFilter("All");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : tickets.length === 0 ? (
              <div>
                <p className="mb-4">You have not submitted any support tickets yet.</p>
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
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">#{ticket.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.subject}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {ticket.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor(ticket.status)}>{ticket.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(ticket.createdAt)}</div>
                      <div className="text-muted-foreground">Updated {formatDate(ticket.updatedAt)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket #{selectedTicket?.id}</DialogTitle>
            <DialogDescription>
              {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline">{selectedTicket.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created by:</span>
                  <span>{selectedTicket.student?.first_name} {selectedTicket.student?.last_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created:</span>
                  <span>{formatDateTime(selectedTicket.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Updated:</span>
                  <span>{formatDateTime(selectedTicket.updatedAt)}</span>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="flex gap-4">
                <div>
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={statusColor(selectedTicket.status)} className="ml-2">
                    {selectedTicket.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Priority:</span>
                  <Badge variant={priorityColor(selectedTicket.priority)} className="ml-2">
                    {selectedTicket.priority}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium mb-3">Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Attachments</h4>
                  <div className="space-y-2">
                    {JSON.parse(selectedTicket.attachments).map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600">📎</span>
                        <span>{attachment.split('/').pop()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages/Replies */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Conversation
                </h4>
                <div className="space-y-4">
                  {/* Original ticket message */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">You</span>
                      <span className="text-sm text-muted-foreground">{formatDateTime(selectedTicket.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                  </div>
                  
                  {/* Replies */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                    selectedTicket.replies.map((reply) => (
                      <div key={reply.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">
                            {reply.sender?.first_name} {reply.sender?.last_name} (Support)
                          </span>
                          <span className="text-sm text-muted-foreground">{formatDateTime(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{reply.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      <p className="text-sm">No replies yet. Support team will respond soon.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowTicketDialog(false)}>
                  Close
                </Button>
                {selectedTicket.status?.toUpperCase() === "OPEN" && (
                  <Button>
                    Reply to Ticket
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 