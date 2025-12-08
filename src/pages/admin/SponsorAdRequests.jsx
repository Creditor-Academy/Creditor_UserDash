import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

// Dummy data for ad requests
const DUMMY_REQUESTS = [
  {
    id: 'req_1',
    requesterName: 'Sarah Johnson',
    requesterEmail: 'sarah.j@techcorp.com',
    organizationName: 'TechCorp Solutions',
    sponsorName: 'TechCorp',
    adTitle: 'Cloud Computing Masterclass',
    description:
      'Join our comprehensive cloud computing course. Learn AWS, Azure, and Google Cloud from industry experts.',
    placement: 'dashboard_banner',
    tier: 'Gold',
    budget: '$5,000/month',
    startDate: '2025-01-15',
    endDate: '2025-03-15',
    mediaUrl:
      'https://via.placeholder.com/600x300/3b82f6/ffffff?text=Cloud+Course',
    ctaUrl: 'https://techcorp.com/cloud-course',
    ctaText: 'Enroll Now',
    status: 'pending',
    submittedAt: '2025-01-05T10:30:00Z',
    notes: 'Looking to target computer science students specifically.',
  },
  {
    id: 'req_2',
    requesterName: 'Michael Chen',
    requesterEmail: 'mchen@financeplus.com',
    organizationName: 'FinancePlus Academy',
    sponsorName: 'FinancePlus',
    adTitle: 'Financial Literacy Bootcamp',
    description:
      'Master personal finance, investing, and wealth management in 8 weeks.',
    placement: 'dashboard_sidebar',
    tier: 'Silver',
    budget: '$3,000/month',
    startDate: '2025-01-20',
    endDate: '2025-04-20',
    mediaUrl:
      'https://via.placeholder.com/600x300/10b981/ffffff?text=Finance+Bootcamp',
    ctaUrl: 'https://financeplus.com/bootcamp',
    ctaText: 'Learn More',
    status: 'pending',
    submittedAt: '2025-01-06T14:15:00Z',
    notes: '',
  },
  {
    id: 'req_3',
    requesterName: 'Emma Rodriguez',
    requesterEmail: 'emma@designhub.io',
    organizationName: 'DesignHub Studio',
    sponsorName: 'DesignHub',
    adTitle: 'UX/UI Design Intensive',
    description:
      'Transform your design skills with our intensive UX/UI program.',
    placement: 'course_player_sidebar',
    tier: 'Gold',
    budget: '$4,500/month',
    startDate: '2025-02-01',
    endDate: '2025-04-30',
    mediaUrl:
      'https://via.placeholder.com/600x300/8b5cf6/ffffff?text=UX+Design',
    ctaUrl: 'https://designhub.io/ux-intensive',
    ctaText: 'Apply Now',
    status: 'approved',
    submittedAt: '2025-01-02T09:00:00Z',
    reviewedAt: '2025-01-03T11:30:00Z',
    reviewedBy: 'Admin User',
    notes: 'Approved for design and tech categories.',
  },
  {
    id: 'req_4',
    requesterName: 'David Park',
    requesterEmail: 'david@codecamp.dev',
    organizationName: 'CodeCamp Pro',
    sponsorName: 'CodeCamp',
    adTitle: 'Full Stack Developer Program',
    description:
      'Become a full stack developer in 12 weeks. MERN stack specialization.',
    placement: 'course_listing_tile',
    tier: 'Bronze',
    budget: '$2,000/month',
    startDate: '2025-01-25',
    endDate: '2025-04-25',
    mediaUrl:
      'https://via.placeholder.com/600x300/f59e0b/ffffff?text=Full+Stack',
    ctaUrl: 'https://codecamp.dev/fullstack',
    ctaText: 'Join Program',
    status: 'rejected',
    submittedAt: '2024-12-28T16:45:00Z',
    reviewedAt: '2025-01-04T10:00:00Z',
    reviewedBy: 'Admin User',
    rejectionReason: 'Budget allocation full for this quarter.',
    notes: '',
  },
  {
    id: 'req_5',
    requesterName: 'Lisa Wang',
    requesterEmail: 'lwang@aiinstitute.org',
    organizationName: 'AI Research Institute',
    sponsorName: 'AI Institute',
    adTitle: 'Machine Learning Specialization',
    description:
      'Deep dive into ML algorithms, neural networks, and AI applications.',
    placement: 'popup',
    tier: 'Gold',
    budget: '$6,000/month',
    startDate: '2025-02-10',
    endDate: '2025-05-10',
    mediaUrl:
      'https://via.placeholder.com/600x300/ec4899/ffffff?text=ML+Course',
    ctaUrl: 'https://aiinstitute.org/ml-spec',
    ctaText: 'Start Learning',
    status: 'pending',
    submittedAt: '2025-01-07T08:20:00Z',
    notes: 'Interested in targeting advanced students only.',
  },
];

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const placementLabels = {
  dashboard_banner: 'Dashboard Banner',
  dashboard_sidebar: 'Dashboard Sidebar',
  course_player_sidebar: 'Course Player',
  course_listing_tile: 'Course Listing',
  popup: 'Popup Ad',
};

export const SponsorAdRequests = () => {
  const [requests, setRequests] = useState(DUMMY_REQUESTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingRequest, setViewingRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch =
        req.sponsorName.toLowerCase().includes(search.toLowerCase()) ||
        req.adTitle.toLowerCase().includes(search.toLowerCase()) ||
        req.requesterName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  }, [requests]);

  const handleReview = (request, action) => {
    setViewingRequest(request);
    setReviewAction(action);
    setReviewNotes('');
  };

  const submitReview = () => {
    if (reviewAction === 'approve') {
      setRequests(prev =>
        prev.map(req =>
          req.id === viewingRequest.id
            ? {
                ...req,
                status: 'approved',
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'Admin User',
              }
            : req
        )
      );
      toast.success('Ad request approved successfully!');
    } else if (reviewAction === 'reject') {
      if (!reviewNotes.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }
      setRequests(prev =>
        prev.map(req =>
          req.id === viewingRequest.id
            ? {
                ...req,
                status: 'rejected',
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'Admin User',
                rejectionReason: reviewNotes,
              }
            : req
        )
      );
      toast.success('Ad request rejected');
    }
    setViewingRequest(null);
    setReviewAction(null);
    setReviewNotes('');
  };

  return (
    <div className="space-y-3">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="rounded-xl border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Requests</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-amber-200 bg-amber-50/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-700">Pending</p>
                <p className="text-xl font-bold text-amber-900">
                  {stats.pending}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-700">Approved</p>
                <p className="text-xl font-bold text-emerald-900">
                  {stats.approved}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-rose-200 bg-rose-50/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-700">Rejected</p>
                <p className="text-xl font-bold text-rose-900">
                  {stats.rejected}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Sponsor Ad Requests</CardTitle>
              <CardDescription className="text-xs">
                Review and manage user-submitted sponsorship requests
              </CardDescription>
            </div>
            <Badge className="w-fit bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {filteredRequests.length} Requests
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              placeholder="Search by sponsor, title, or requester..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded-xl h-9 text-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-xl h-9 text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests Table */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="max-h-[calc(100vh-420px)] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="py-2 text-xs">Requester</TableHead>
                    <TableHead className="py-2 text-xs">Ad Details</TableHead>
                    <TableHead className="py-2 text-xs">Placement</TableHead>
                    <TableHead className="py-2 text-xs">Tier</TableHead>
                    <TableHead className="py-2 text-xs">Budget</TableHead>
                    <TableHead className="py-2 text-xs">Status</TableHead>
                    <TableHead className="py-2 text-xs text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <AlertCircle className="w-8 h-8" />
                          <p className="text-sm font-semibold">
                            No requests found
                          </p>
                          <p className="text-xs">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map(request => {
                      const StatusIcon = statusConfig[request.status].icon;
                      return (
                        <TableRow key={request.id} className="hover:bg-gray-50">
                          <TableCell className="py-2">
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-gray-900">
                                {request.requesterName}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {request.organizationName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-gray-900">
                                {request.sponsorName}
                              </p>
                              <p className="text-[11px] text-gray-600">
                                {request.adTitle}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {new Date(
                                  request.submittedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {placementLabels[request.placement]}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${
                                request.tier === 'Gold'
                                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  : request.tier === 'Silver'
                                    ? 'bg-slate-50 text-slate-700 border-slate-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {request.tier}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <p className="text-xs font-semibold text-gray-900">
                              {request.budget}
                            </p>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge
                              className={`flex items-center gap-1 w-fit text-[10px] px-1.5 py-0 ${statusConfig[request.status].color}`}
                            >
                              <StatusIcon className="w-2.5 h-2.5" />
                              {statusConfig[request.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingRequest(request)}
                                className="rounded-lg h-7 px-2 text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              {request.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleReview(request, 'approve')
                                    }
                                    className="rounded-lg h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleReview(request, 'reject')
                                    }
                                    className="rounded-lg h-7 px-2 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View/Review Dialog */}
      <Dialog
        open={Boolean(viewingRequest)}
        onOpenChange={open => !open && setViewingRequest(null)}
      >
        <DialogContent className="max-w-3xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {reviewAction ? 'Review Request' : 'Request Details'}
            </DialogTitle>
            <DialogDescription>
              {viewingRequest?.sponsorName} - {viewingRequest?.adTitle}
            </DialogDescription>
          </DialogHeader>

          {viewingRequest && (
            <div className="space-y-6">
              {/* Preview */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                {viewingRequest.mediaUrl && (
                  <img
                    src={viewingRequest.mediaUrl}
                    alt={viewingRequest.adTitle}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                      {viewingRequest.sponsorName}
                    </Badge>
                    <Badge
                      className={
                        viewingRequest.tier === 'Gold'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : viewingRequest.tier === 'Silver'
                            ? 'bg-slate-50 text-slate-700 border-slate-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }
                    >
                      {viewingRequest.tier} Tier
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {viewingRequest.adTitle}
                  </h3>
                  <p className="text-gray-600">{viewingRequest.description}</p>
                  {viewingRequest.ctaText && viewingRequest.ctaUrl && (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      {viewingRequest.ctaText}
                    </Button>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Requester</Label>
                  <p className="font-semibold">
                    {viewingRequest.requesterName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {viewingRequest.requesterEmail}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Organization</Label>
                  <p className="font-semibold">
                    {viewingRequest.organizationName}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Placement</Label>
                  <p className="font-semibold">
                    {placementLabels[viewingRequest.placement]}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Budget</Label>
                  <p className="font-semibold">{viewingRequest.budget}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">
                    Campaign Period
                  </Label>
                  <p className="font-semibold">
                    {new Date(viewingRequest.startDate).toLocaleDateString()} -{' '}
                    {new Date(viewingRequest.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Submitted</Label>
                  <p className="font-semibold">
                    {new Date(viewingRequest.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {viewingRequest.notes && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">
                    Requester Notes
                  </Label>
                  <p className="text-sm p-3 bg-gray-50 rounded-xl border border-gray-200">
                    {viewingRequest.notes}
                  </p>
                </div>
              )}

              {viewingRequest.status === 'rejected' &&
                viewingRequest.rejectionReason && (
                  <div className="space-y-2">
                    <Label className="text-xs text-rose-600">
                      Rejection Reason
                    </Label>
                    <p className="text-sm p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900">
                      {viewingRequest.rejectionReason}
                    </p>
                  </div>
                )}

              {reviewAction === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="review-notes">
                    Rejection Reason <span className="text-rose-600">*</span>
                  </Label>
                  <Textarea
                    id="review-notes"
                    placeholder="Explain why this request is being rejected..."
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    rows={4}
                    className="rounded-xl"
                  />
                </div>
              )}

              {reviewAction === 'approve' && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-900">
                        Approve this request?
                      </p>
                      <p className="text-sm text-emerald-700 mt-1">
                        This will create a new sponsor ad and notify the
                        requester.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setViewingRequest(null);
                setReviewAction(null);
                setReviewNotes('');
              }}
              className="rounded-xl"
            >
              {reviewAction ? 'Cancel' : 'Close'}
            </Button>
            {reviewAction && (
              <Button
                onClick={submitReview}
                className={
                  reviewAction === 'approve'
                    ? 'rounded-xl bg-emerald-600 hover:bg-emerald-700'
                    : 'rounded-xl bg-rose-600 hover:bg-rose-700'
                }
              >
                {reviewAction === 'approve'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SponsorAdRequests;
