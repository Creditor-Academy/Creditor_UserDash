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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSponsorAds } from '@/contexts/SponsorAdsContext';
import SponsorAdCard from '@/components/sponsorAds/SponsorAdCard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { TrendingUp, PauseCircle, Shield, Filter } from 'lucide-react';

const placementFilterOptions = [
  { value: 'all', label: 'All placements' },
  { value: 'dashboard_banner', label: 'Dashboard Banner' },
  { value: 'dashboard_sidebar', label: 'Dashboard Sidebar' },
  { value: 'course_player_sidebar', label: 'Course Player Sidebar' },
  { value: 'course_listing_tile', label: 'Course Listing Tile' },
  { value: 'popup', label: 'Popup Ad' },
];

const sortOptions = [
  { value: 'start-desc', label: 'Start date (newest)' },
  { value: 'start-asc', label: 'Start date (oldest)' },
  { value: 'tier', label: 'Tier priority' },
];

const placementLabels = {
  dashboard_banner: 'Dashboard Banner',
  dashboard_sidebar: 'Dashboard Sidebar',
  course_player_sidebar: 'Course Player Sidebar',
  course_listing_tile: 'Course Listing Tile',
  popup: 'Popup Ad',
};

export const SponsorAdManage = () => {
  const {
    ads,
    deleteAd,
    toggleAdStatus,
    updateAd,
    getRuntimeStatus,
    analytics,
  } = useSponsorAds();
  const [search, setSearch] = useState('');
  const [placement, setPlacement] = useState('all');
  const [sortBy, setSortBy] = useState('start-desc');
  const [editingAd, setEditingAd] = useState(null);
  const [editState, setEditState] = useState({
    title: '',
    description: '',
    ctaText: '',
    ctaUrl: '',
  });
  const [deletingId, setDeletingId] = useState(null);

  const filteredAds = useMemo(() => {
    let list = ads;
    if (search.trim()) {
      list = list.filter(ad =>
        ad.sponsorName.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (placement !== 'all') {
      list = list.filter(ad => ad.placement === placement);
    }
    switch (sortBy) {
      case 'start-asc':
        list = [...list].sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );
        break;
      case 'start-desc':
        list = [...list].sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        );
        break;
      case 'tier':
        list = [...list].sort((a, b) => {
          const priority = { Gold: 3, Silver: 2, Bronze: 1 };
          return (priority[b.tier] || 0) - (priority[a.tier] || 0);
        });
        break;
      default:
        break;
    }
    return list;
  }, [ads, search, placement, sortBy]);

  const openEditDialog = ad => {
    setEditingAd(ad);
    setEditState({
      title: ad.title || '',
      description: ad.description || '',
      ctaText: ad.ctaText || '',
      ctaUrl: ad.ctaUrl || '',
    });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditState(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (editingAd) {
      updateAd(editingAd.id, editState);
      setEditingAd(null);
    }
  };

  const handleDelete = async id => {
    try {
      setDeletingId(id);
      await deleteAd(id);
    } catch (error) {
      console.error('Failed to delete ad', error);
    } finally {
      setDeletingId(null);
    }
  };

  const statusBreakdown = useMemo(() => {
    const active = ads.filter(ad => getRuntimeStatus(ad) === 'Active').length;
    const paused = ads.filter(ad => getRuntimeStatus(ad) === 'Paused').length;
    const expired = ads.filter(ad => getRuntimeStatus(ad) === 'Expired').length;
    return [
      {
        label: 'Live placements',
        value: active,
        helper: 'Running right now',
        icon: TrendingUp,
        color: 'text-emerald-600',
      },
      {
        label: 'Paused / scheduled',
        value: paused,
        helper: 'Ready to resume',
        icon: PauseCircle,
        color: 'text-amber-600',
      },
      {
        label: 'Expired',
        value: expired,
        helper: 'Need new runway',
        icon: Shield,
        color: 'text-gray-600',
      },
    ];
  }, [ads, getRuntimeStatus]);

  const emptyState = filteredAds.length === 0;

  return (
    <div className="space-y-8">
      <Card className="rounded-3xl shadow-sm border-gray-200">
        <CardHeader className="space-y-1">
          <CardTitle>Campaign health</CardTitle>
          <CardDescription>
            Monitor what is live, paused, or ready for a refresh.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusBreakdown.map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 p-4 bg-gray-50/60"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                {stat.label}
              </div>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.helper}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm border-gray-100">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div>
              <CardTitle>Filters & sorting</CardTitle>
              <CardDescription>
                Slice by placement, tier or start dates effortlessly.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 lg:ml-auto">
              <Filter className="w-4 h-4" /> Quick refine
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by sponsor name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-2xl"
          />
          <Select value={placement} onValueChange={setPlacement}>
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Filter by placement" />
            </SelectTrigger>
            <SelectContent>
              {placementFilterOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm bg-white">
        {emptyState ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <p className="text-lg font-semibold text-gray-900">
              No campaigns match the filters
            </p>
            <p className="text-sm text-gray-500 max-w-md">
              Try resetting your filters or create a new sponsor placement to
              fill the table.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setPlacement('all');
                setSortBy('start-desc');
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60">
                <TableHead>Sponsor</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAds.map(ad => (
                <TableRow key={ad.id} className="align-top">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {ad.logo && (
                        <img
                          src={ad.logo}
                          alt={ad.sponsorName}
                          className="w-12 h-12 rounded-2xl object-cover"
                          loading="lazy"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {ad.sponsorName}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {ad.title}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[11px] mt-2 border-blue-100 bg-blue-50 text-blue-700"
                        >
                          {ad.tier} Tier
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{placementLabels[ad.placement]}</TableCell>
                  <TableCell className="capitalize">{ad.adType}</TableCell>
                  <TableCell>{ad.startDate}</TableCell>
                  <TableCell className="text-gray-500">{ad.endDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          getRuntimeStatus(ad) === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : getRuntimeStatus(ad) === 'Paused'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                        }
                      >
                        {getRuntimeStatus(ad)}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Switch
                          checked={ad.status !== 'Paused'}
                          onCheckedChange={() => toggleAdStatus(ad.id)}
                          disabled={getRuntimeStatus(ad) === 'Expired'}
                        />
                        <span>
                          {ad.status === 'Paused' ? 'Paused' : 'Running'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col gap-2 items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(ad)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(ad.id)}
                        disabled={deletingId === ad.id}
                      >
                        {deletingId === ad.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Card className="rounded-3xl shadow-sm border-gray-100">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle>Grid preview</CardTitle>
          <CardDescription>
            How the top placements look across the LMS surfaces.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAds.slice(0, 3).map(ad => (
              <SponsorAdCard key={`card-${ad.id}`} ad={ad} hideActions />
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(editingAd)}
        onOpenChange={open => !open && setEditingAd(null)}
      >
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>Edit sponsor ad</DialogTitle>
            <CardDescription>
              Make lightweight tweaks without recreating the campaign.
            </CardDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={editState.title}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                rows={3}
                value={editState.description}
                onChange={handleEditChange}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-ctaText">CTA Text</Label>
                <Input
                  id="edit-ctaText"
                  name="ctaText"
                  value={editState.ctaText}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <Label htmlFor="edit-ctaUrl">CTA URL</Label>
                <Input
                  id="edit-ctaUrl"
                  name="ctaUrl"
                  value={editState.ctaUrl}
                  onChange={handleEditChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAd(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SponsorAdManage;
