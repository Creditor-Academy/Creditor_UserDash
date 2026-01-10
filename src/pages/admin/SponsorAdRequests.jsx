import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  AlertCircle,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllAdApplications,
  updateApplicationStatus,
} from "@/services/sponsorAdsService";
import { Skeleton } from "@/components/ui/skeleton";

// Add this import for auth context/hook (adjust based on your auth setup)
// import { useAuth } from '@/contexts/AuthContext';

// Map backend position to frontend placement
const POSITION_TO_PLACEMENT = {
  DASHBOARD: "dashboard_banner",
  SIDEBAR: "dashboard_sidebar",
  COURSE_PLAYER: "course_player_sidebar",
  COURSE_LISTING: "course_listing_tile",
  POPUP: "popup",
};

// Normalize backend application to frontend format
const normalizeApplication = (app) => {
  const mediaUrl = app.video_url || app.image_url || "";
  const mediaType = app.video_url ? "video" : "image";

  // Extract requester name from email or use company name
  const getRequesterName = () => {
    if (app.contact_email) {
      const emailName = app.contact_email.split("@")[0];
      // Capitalize first letter and replace dots/underscores with spaces
      return emailName
        .replace(/[._]/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    if (app.company_name) {
      return app.company_name;
    }
    return "Unknown User";
  };

  return {
    id: app.id,
    requesterName: getRequesterName(),
    requesterEmail: app.contact_email || "",
    organizationName: app.company_name || "",
    sponsorName: app.sponsor_name || "",
    adTitle: app.title || "",
    description: app.description || "",
    detailedDescription:
      app.offer_details ||
      app.detailed_description ||
      app.detailedDescription ||
      "",
    websiteDescription: app.website_description || app.websiteDescription || "",
    websiteOverview: app.website_overview || app.websiteOverview || "",
    websiteFeatures:
      app.website_features_highlights ||
      app.website_features ||
      app.websiteFeatures ||
      "",
    placement:
      POSITION_TO_PLACEMENT[app.preferred_position] || "dashboard_banner",
    tier: "Gold", // Not in backend response, defaulting
    budget: app.budget ? `$${Number(app.budget).toLocaleString()}` : "$0",
    startDate: app.preferred_start_date || app.start_date || "",
    endDate: app.preferred_end_date || app.end_date || "",
    mediaUrl: mediaUrl,
    mediaType: mediaType,
    ctaUrl: app.link_url || "",
    ctaText: app.cta_text || app.ctaText || (app.link_url ? "Learn More" : ""),
    status: app.status?.toLowerCase() || "pending",
    submittedAt: app.created_at || "",
    reviewedAt: app.reviewed_at || null,
    reviewedBy: app.reviewed_by || null,
    notes: app.additional_notes || "",
    rejectionReason: app.admin_notes || null,
    contactEmail: app.contact_email || "",
    contactPhone: app.contact_phone || "",
    companyName: app.company_name || "",
    websiteMedia: app.website_media || [],
  };
};

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const placementLabels = {
  dashboard_banner: "Dashboard Banner",
  dashboard_sidebar: "Dashboard Sidebar",
  course_player_sidebar: "Course Player",
  course_listing_tile: "Course Listing",
  popup: "Popup Ad",
};

export const SponsorAdRequests = () => {
  // Add this line to get user info (adjust based on your auth setup)
  // const { user, isAdmin } = useAuth();

  // For demonstration, I'll create a mock isAdmin state
  // You should replace this with your actual auth logic
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingRequest, setViewingRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [viewImageError, setViewImageError] = useState(false);
  const [viewVideoError, setViewVideoError] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Simulate checking if user is admin
  // Replace this with your actual auth check
  useEffect(() => {
    // Example: Check user role from localStorage or context
    const checkAdminStatus = () => {
      // This is a mock - replace with your actual auth logic
      const userRole = localStorage.getItem("userRole") || "user";
      setIsAdmin(userRole === "admin");
    };

    checkAdminStatus();
  }, []);

  // Helper function to check if URL is a placeholder/invalid
  const isPlaceholderUrl = (url) => {
    if (!url || url === "") return true;
    return (
      url.includes("example.com") ||
      url.includes("placeholder") ||
      url === null ||
      url === undefined
    );
  };

  // Reset errors when viewing a different request
  useEffect(() => {
    if (viewingRequest) {
      setViewImageError(false);
      setViewVideoError(false);
    }
  }, [viewingRequest]);

  // Fetch all ad applications from backend - only if user is admin
  const fetchApplications = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const applications = await getAllAdApplications();
      const normalizedRequests = applications.map(normalizeApplication);
      setRequests(normalizedRequests);
    } catch (err) {
      console.error("[SponsorAdRequests] Failed to fetch applications:", err);
      setError(err.message);
      setRequests([]);
      toast.error("Failed to load ad applications");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.sponsorName.toLowerCase().includes(search.toLowerCase()) ||
        req.adTitle.toLowerCase().includes(search.toLowerCase()) ||
        req.requesterName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    };
  }, [requests]);

  const handleReview = (request, action) => {
    if (!isAdmin) {
      toast.error("You do not have permission to review requests");
      return;
    }
    setViewingRequest(request);
    setReviewAction(action);
    setReviewNotes("");
  };

  const submitReview = async () => {
    if (!viewingRequest || !isAdmin) return;

    // For rejection, require admin notes
    if (reviewAction === "reject" && !reviewNotes.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsSubmittingReview(true);

    try {
      // Map frontend action to backend status
      const status = reviewAction === "approve" ? "APPROVED" : "REJECTED";
      const adminNotes =
        reviewAction === "reject"
          ? reviewNotes.trim()
          : reviewAction === "approve"
            ? reviewNotes.trim() ||
              "Application approved. Ad will be live soon."
            : "";

      // Call API to update status
      await updateApplicationStatus(viewingRequest.id, status, adminNotes);

      // Show success message
      if (reviewAction === "approve") {
        toast.success("Ad request approved successfully!");
      } else {
        toast.success("Ad request rejected");
      }

      // Close dialog and reset state
      setViewingRequest(null);
      setReviewAction(null);
      setReviewNotes("");

      // Refresh applications to get updated data
      await fetchApplications();
    } catch (error) {
      console.error(
        "[SponsorAdRequests] Failed to update application status:",
        error,
      );
      toast.error(
        error.message ||
          "Failed to update application status. Please try again.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Non-admin access restriction view
  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-3 bg-red-100 rounded-full">
                <Shield className="w-12 h-12 text-red-600" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-red-900">
                  Access Restricted
                </p>
                <p className="text-sm text-red-700 max-w-md">
                  You do not have administrator privileges to view or manage
                  sponsor ad requests. Please contact your system administrator
                  if you believe this is an error.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, idx) => (
            <Skeleton key={idx} className="h-20 rounded-xl" />
          ))}
        </div>
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <AlertCircle className="w-12 h-12 text-red-600" />
              <p className="text-lg font-semibold text-red-900">
                Failed to load ad applications
              </p>
              <p className="text-sm text-red-700">{error}</p>
              {/* Only show retry button for admin */}
              <Button
                onClick={fetchApplications}
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-lg border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-amber-200 bg-amber-50/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-700">Pending</p>
                <p className="text-lg font-bold text-amber-900">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-700">Approved</p>
                <p className="text-lg font-bold text-emerald-900">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-rose-200 bg-rose-50/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-700">Rejected</p>
                <p className="text-lg font-bold text-rose-900">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-lg border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Ad Requests</CardTitle>
              <CardDescription className="text-xs">
                Review and manage user submissions
              </CardDescription>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {filteredRequests.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg h-9 text-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-lg h-9 text-sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="rounded-lg border-gray-200 shadow-sm overflow-hidden">
        <div className="max-h-[calc(100vh-420px)] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="py-2 text-xs">Requester</TableHead>
                <TableHead className="py-2 text-xs">Ad Details</TableHead>
                <TableHead className="py-2 text-xs">Placement</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <AlertCircle className="w-8 h-8" />
                      <p className="text-sm font-semibold">No requests found</p>
                      <p className="text-xs">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => {
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
                            {new Date(request.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs text-gray-600">
                          {placementLabels[request.placement]}
                        </span>
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
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleReview(request, "approve")}
                                className="rounded-lg h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReview(request, "reject")}
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
      </Card>

      {/* View/Review Dialog */}
      <Dialog
        open={Boolean(viewingRequest)}
        onOpenChange={(open) => {
          if (!open) {
            setViewingRequest(null);
            setReviewAction(null);
            setReviewNotes("");
            setViewImageError(false);
            setViewVideoError(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {reviewAction ? "Review Request" : "Request Details"}
            </DialogTitle>
            <DialogDescription>
              {viewingRequest?.sponsorName} - {viewingRequest?.adTitle}
            </DialogDescription>
          </DialogHeader>

          {viewingRequest && (
            <div className="space-y-6">
              {/* Preview */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                {viewingRequest.mediaUrl &&
                !isPlaceholderUrl(viewingRequest.mediaUrl) &&
                !viewImageError &&
                !viewVideoError ? (
                  viewingRequest.mediaType === "video" ? (
                    <video
                      src={viewingRequest.mediaUrl}
                      className="w-full h-64 object-cover"
                      controls
                      muted
                      onError={() => setViewVideoError(true)}
                    />
                  ) : (
                    <img
                      src={viewingRequest.mediaUrl}
                      alt={viewingRequest.adTitle}
                      className="w-full h-64 object-cover"
                      onError={() => setViewImageError(true)}
                    />
                  )
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No media available
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                      {viewingRequest.sponsorName}
                    </Badge>
                    <Badge
                      className={
                        viewingRequest.tier === "Gold"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : viewingRequest.tier === "Silver"
                            ? "bg-slate-50 text-slate-700 border-slate-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }
                    >
                      {viewingRequest.tier} Tier
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {viewingRequest.adTitle}
                  </h3>
                  <p className="text-gray-600">{viewingRequest.description}</p>

                  {/* Detailed Description */}
                  {viewingRequest.detailedDescription && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Detailed Description
                      </h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {viewingRequest.detailedDescription}
                      </p>
                    </div>
                  )}

                  {/* Website Description */}
                  {viewingRequest.websiteDescription && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        About the Website
                      </h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {viewingRequest.websiteDescription}
                      </p>
                    </div>
                  )}

                  {viewingRequest.ctaText && viewingRequest.ctaUrl && (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
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
                  <Label className="text-xs text-gray-500">CTA Text</Label>
                  <p className="font-semibold">
                    {viewingRequest.ctaText || "Not specified"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">
                    Campaign Period
                  </Label>
                  <p className="font-semibold">
                    {new Date(viewingRequest.startDate).toLocaleDateString()} -{" "}
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

              {/* Offer Details */}
              {viewingRequest.detailedDescription && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-semibold">
                    Offer Details
                  </Label>
                  <p className="text-sm p-3 bg-gray-50 rounded-xl border border-gray-200 whitespace-pre-line">
                    {viewingRequest.detailedDescription}
                  </p>
                </div>
              )}

              {/* Website Overview */}
              {viewingRequest.websiteOverview && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-semibold">
                    Website Overview
                  </Label>
                  <p className="text-sm p-3 bg-indigo-50 rounded-xl border border-indigo-200 whitespace-pre-line">
                    {viewingRequest.websiteOverview}
                  </p>
                </div>
              )}

              {/* Website Description */}
              {viewingRequest.websiteDescription && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-semibold">
                    Website Description
                  </Label>
                  <p className="text-sm p-3 bg-blue-50 rounded-xl border border-blue-200 whitespace-pre-line">
                    {viewingRequest.websiteDescription}
                  </p>
                </div>
              )}

              {/* Website Features */}
              {viewingRequest.websiteFeatures && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 font-semibold">
                    Website Features & Highlights
                  </Label>
                  <p className="text-sm p-3 bg-green-50 rounded-xl border border-green-200 whitespace-pre-line">
                    {viewingRequest.websiteFeatures}
                  </p>
                </div>
              )}

              {/* Website Media */}
              {viewingRequest.websiteMedia &&
                Array.isArray(viewingRequest.websiteMedia) &&
                viewingRequest.websiteMedia.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500 font-semibold">
                      Website Media
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {viewingRequest.websiteMedia.map((media, index) => (
                        <div
                          key={index}
                          className="relative rounded-lg overflow-hidden border border-gray-200"
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.url}
                              alt={
                                media.caption || `Website image ${index + 1}`
                              }
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/400x300?text=Image+Not+Available";
                              }}
                            />
                          ) : (
                            <video
                              src={media.url}
                              className="w-full h-32 object-cover"
                              controls
                            />
                          )}
                          {media.caption && (
                            <p className="text-xs text-gray-600 p-2 bg-white/80 absolute bottom-0 left-0 right-0 truncate">
                              {media.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {viewingRequest.notes && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">
                    Additional Notes
                  </Label>
                  <p className="text-sm p-3 bg-gray-50 rounded-xl border border-gray-200 whitespace-pre-line">
                    {viewingRequest.notes}
                  </p>
                </div>
              )}

              {viewingRequest.status === "rejected" &&
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

              {reviewAction === "reject" && (
                <div className="space-y-2">
                  <Label htmlFor="review-notes">
                    Rejection Reason <span className="text-rose-600">*</span>
                  </Label>
                  <Textarea
                    id="review-notes"
                    placeholder="Explain why this request is being rejected..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="rounded-xl"
                  />
                </div>
              )}

              {reviewAction === "approve" && (
                <>
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
                  <div className="space-y-2">
                    <Label htmlFor="approval-notes">
                      Approval Notes (Optional)
                    </Label>
                    <Textarea
                      id="approval-notes"
                      placeholder="Add any notes about this approval..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setViewingRequest(null);
                setReviewAction(null);
                setReviewNotes("");
                setViewImageError(false);
                setViewVideoError(false);
              }}
              className="rounded-xl"
              disabled={isSubmittingReview}
            >
              {reviewAction ? "Cancel" : "Close"}
            </Button>
            {reviewAction && (
              <Button
                onClick={submitReview}
                disabled={isSubmittingReview}
                className={
                  reviewAction === "approve"
                    ? "rounded-xl bg-emerald-600 hover:bg-emerald-700"
                    : "rounded-xl bg-rose-600 hover:bg-rose-700"
                }
              >
                {isSubmittingReview ? (
                  <>
                    <span className="mr-2">Processing...</span>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </>
                ) : reviewAction === "approve" ? (
                  "Confirm Approval"
                ) : (
                  "Confirm Rejection"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SponsorAdRequests;
