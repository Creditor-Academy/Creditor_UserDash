import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUserSponsor } from '@/contexts/UserSponsorContext';
import SponsorAdCard from '@/components/sponsorCenter/SponsorAdCard';
import SponsorStatusBadge from '@/components/sponsorCenter/SponsorStatusBadge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const placements = [
  { value: 'all', label: 'All placements' },
  { value: 'dashboard_banner', label: 'Dashboard Banner' },
  { value: 'dashboard_sidebar', label: 'Dashboard Sidebar' },
  { value: 'course_player_sidebar', label: 'Course Player Sidebar' },
  { value: 'course_listing_tile', label: 'Course Listing Tile' },
  { value: 'popup', label: 'Popup' },
];

const statusFilters = [
  { value: 'all', label: 'All statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

const MySponsorAdsPage = () => {
  const {
    ads,
    updateAd,
    deleteAd,
    toggleAdStatus,
    resubmitAd,
    loading,
    error,
  } = useUserSponsor();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [editingAd, setEditingAd] = useState(null);
  const [editState, setEditState] = useState({
    adTitle: '',
    description: '',
    website: '',
  });
  const [viewingAd, setViewingAd] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const filteredAds = useMemo(() => {
    const query = search.toLowerCase();
    return ads
      .filter(ad => {
        const sponsor = ad.sponsorName?.toLowerCase() || '';
        const title = ad.adTitle?.toLowerCase() || '';
        return sponsor.includes(query) || title.includes(query);
      })
      .filter(ad =>
        statusFilter === 'all' ? true : ad.status === statusFilter
      )
      .filter(ad =>
        placementFilter === 'all' ? true : ad.placement === placementFilter
      );
  }, [ads, search, statusFilter, placementFilter]);

  const openEditDialog = ad => {
    setEditingAd(ad);
    setEditState({
      adTitle: ad.adTitle,
      description: ad.description,
      website: ad.website || '',
    });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditState(prev => ({ ...prev, [name]: value }));
  };

  const saveEdits = () => {
    if (editingAd) {
      updateAd(editingAd.id, editState);
      toast.success('Ad updated');
      setEditingAd(null);
    }
  };

  const handleDelete = async ad => {
    try {
      setDeletingId(ad.id);
      await deleteAd(ad.id);
      toast.success('Ad removed');
    } catch (error) {
      console.error('Failed to delete ad', error);
      toast.error('Failed to delete ad');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = ad => {
    toggleAdStatus(ad.id);
    toast.info(ad.status === 'Approved' ? 'Ad paused' : 'Ad resumed');
  };

  const handleResubmit = ad => {
    resubmitAd(ad.id);
    toast.success('Ad resubmitted');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(3)].map((_, idx) => (
          <Skeleton key={idx} className="h-72 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center space-y-2">
        <p className="text-lg font-semibold text-red-900">Error loading ads</p>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search sponsor or title"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-2xl"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={placementFilter} onValueChange={setPlacementFilter}>
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder="Filter by placement" />
          </SelectTrigger>
          <SelectContent>
            {placements.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAds.map(ad => (
          <SponsorAdCard
            key={ad.id}
            ad={ad}
            onView={setViewingAd}
            onEdit={openEditDialog}
            onToggleStatus={handleToggle}
            onDelete={handleDelete}
            onResubmit={handleResubmit}
          />
        ))}
      </div>

      {!filteredAds.length && (
        <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center space-y-2">
          <p className="text-lg font-semibold text-gray-900">
            No sponsor ads yet
          </p>
          <p className="text-sm text-gray-500">
            Submit a request to see it listed here.
          </p>
          <Button className="rounded-full bg-blue-600 text-white px-6" asChild>
            <Link to="/dashboard/sponsor-center/submit">
              Submit sponsorship request
            </Link>
          </Button>
        </div>
      )}

      <Dialog
        open={Boolean(editingAd)}
        onOpenChange={open => !open && setEditingAd(null)}
      >
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Edit sponsor ad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adTitle">Ad Title</Label>
              <Input
                id="adTitle"
                name="adTitle"
                value={editState.adTitle}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                value={editState.description}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <Label htmlFor="website">URL</Label>
              <Input
                id="website"
                name="website"
                value={editState.website}
                onChange={handleEditChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAd(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdits}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewingAd)}
        onOpenChange={open => !open && setViewingAd(null)}
      >
        <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewingAd && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingAd.adTitle}</DialogTitle>
                <div className="text-sm text-gray-500">
                  {viewingAd.sponsorName}
                  {viewingAd.companyName && ` • ${viewingAd.companyName}`}
                </div>
              </DialogHeader>
              <div className="space-y-4">
                {viewingAd.mediaUrl &&
                  (viewingAd.mediaType === 'video' ? (
                    <video
                      src={viewingAd.mediaUrl}
                      className="w-full h-64 rounded-2xl object-cover"
                      controls
                      muted
                    />
                  ) : (
                    <img
                      src={viewingAd.mediaUrl}
                      alt={viewingAd.adTitle}
                      className="w-full h-64 rounded-2xl object-cover"
                    />
                  ))}
                <p className="text-sm text-gray-600">{viewingAd.description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  <SponsorStatusBadge status={viewingAd.status} />
                  <span className="rounded-full bg-gray-100 px-3 py-1 capitalize">
                    {viewingAd.placement.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-semibold">${viewingAd.budget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Campaign Period</p>
                    <p className="font-semibold">
                      {viewingAd.startDate &&
                        new Date(viewingAd.startDate).toLocaleDateString()}{' '}
                      -{' '}
                      {viewingAd.endDate &&
                        new Date(viewingAd.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {viewingAd.contactEmail && (
                    <div>
                      <p className="text-xs text-gray-500">Contact Email</p>
                      <p className="font-semibold">{viewingAd.contactEmail}</p>
                    </div>
                  )}
                  {viewingAd.contactPhone && (
                    <div>
                      <p className="text-xs text-gray-500">Contact Phone</p>
                      <p className="font-semibold">{viewingAd.contactPhone}</p>
                    </div>
                  )}
                </div>
                {viewingAd.additionalNotes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Additional Notes
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {viewingAd.additionalNotes}
                    </p>
                  </div>
                )}
                {viewingAd.adminNotes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Admin Notes</p>
                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {viewingAd.adminNotes}
                    </p>
                  </div>
                )}
                {viewingAd.reviewedBy && (
                  <div className="text-xs text-gray-500">
                    Reviewed by {viewingAd.reviewedBy} on{' '}
                    {viewingAd.reviewedAt &&
                      new Date(viewingAd.reviewedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingAd(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MySponsorAdsPage;
