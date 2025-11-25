import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Play, Pause, Filter } from 'lucide-react';
import { sponsorAdsService } from '@/data/mockSponsorAds';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ManageAdsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    setLoading(true);
    try {
      const data = await sponsorAdsService.getAllAds();
      setAds(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load ads.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async id => {
    try {
      await sponsorAdsService.toggleAdStatus(id);
      await loadAds();
      toast({
        title: 'Success',
        description: 'Ad status updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update ad status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!adToDelete) return;
    try {
      await sponsorAdsService.deleteAd(adToDelete);
      await loadAds();
      toast({
        title: 'Success',
        description: 'Ad deleted successfully.',
      });
      setDeleteDialogOpen(false);
      setAdToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete ad.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status, startDate, endDate) => {
    const today = new Date().toISOString().split('T')[0];
    if (status === 'paused') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Paused
        </span>
      );
    }
    if (status === 'active') {
      if (endDate < today) {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Expired
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  };

  const getTierBadge = tier => {
    const colors = {
      Gold: 'bg-yellow-100 text-yellow-800',
      Silver: 'bg-gray-100 text-gray-800',
      Bronze: 'bg-orange-100 text-orange-800',
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[tier] || colors.Bronze}`}
      >
        {tier}
      </span>
    );
  };

  const formatPlacement = placement => {
    return placement
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch =
      !searchTerm ||
      ad.sponsorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlacement =
      placementFilter === 'all' || ad.placement === placementFilter;
    return matchesSearch && matchesPlacement;
  });

  const sortedAds = [...filteredAds].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Sponsor Ads
          </h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage sponsor advertisements.
          </p>
        </div>
        <Button
          onClick={() => navigate('/instructor/sponsor-ads/create')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Ad
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by sponsor name or title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select
                value={placementFilter}
                onValueChange={setPlacementFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Placements</SelectItem>
                  <SelectItem value="dashboard_banner">
                    Dashboard Banner
                  </SelectItem>
                  <SelectItem value="dashboard_sidebar">
                    Dashboard Sidebar
                  </SelectItem>
                  <SelectItem value="course_player_sidebar">
                    Course Player Sidebar
                  </SelectItem>
                  <SelectItem value="course_listing">Course Listing</SelectItem>
                  <SelectItem value="popup">Popup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Ads ({sortedAds.length})</CardTitle>
          <CardDescription>
            Manage your sponsor advertisements and their settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading ads...</p>
            </div>
          ) : sortedAds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No ads found.</p>
              <Button
                onClick={() => navigate('/instructor/sponsor-ads/create')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Ad
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sponsor</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAds.map(ad => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ad.mediaUrl && ad.mediaType === 'image' && (
                            <img
                              src={ad.mediaUrl}
                              alt={ad.sponsorName}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <span className="font-medium">{ad.sponsorName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={ad.title}>
                          {ad.title}
                        </div>
                      </TableCell>
                      <TableCell>{formatPlacement(ad.placement)}</TableCell>
                      <TableCell className="capitalize">
                        {ad.mediaType}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {new Date(ad.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">to</div>
                          <div>{new Date(ad.endDate).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ad.status, ad.startDate, ad.endDate)}
                      </TableCell>
                      <TableCell>{getTierBadge(ad.tier)}</TableCell>
                      <TableCell>{ad.impressions || 0}</TableCell>
                      <TableCell>{ad.clicks || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/instructor/sponsor-ads/edit/${ad.id}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(ad.id)}
                          >
                            {ad.status === 'active' ? (
                              <Pause className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <Play className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAdToDelete(ad.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              sponsor ad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
