import React, { useMemo, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useSponsorAds } from "@/contexts/SponsorAdsContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp, PauseCircle, Shield, RefreshCw } from "lucide-react";

const placementFilterOptions = [
  { value: "all", label: "All placements" },
  { value: "dashboard_banner", label: "Dashboard Banner" },
  { value: "dashboard_sidebar", label: "Dashboard Sidebar" },
  { value: "course_player_sidebar", label: "Course Player Sidebar" },
  { value: "course_listing_tile", label: "Course Listing Tile" },
  { value: "popup", label: "Popup Ad" },
];

const sortOptions = [
  { value: "start-desc", label: "Start date (newest)" },
  { value: "start-asc", label: "Start date (oldest)" },
  { value: "tier", label: "Tier priority" },
];

const placementLabels = {
  dashboard_banner: "Dashboard Banner",
  dashboard_sidebar: "Dashboard Sidebar",
  course_player_sidebar: "Course Player Sidebar",
  course_listing_tile: "Course Listing Tile",
  popup: "Popup Ad",
};

export const SponsorAdManage = () => {
  const {
    ads,
    deleteAd,
    toggleAdStatus,
    updateAd,
    getRuntimeStatus,
    analytics,
    refreshAds,
    isSyncing,
  } = useSponsorAds();
  const [search, setSearch] = useState("");
  const [placement, setPlacement] = useState("all");
  const [sortBy, setSortBy] = useState("start-desc");
  const [editingAd, setEditingAd] = useState(null);
  const [editState, setEditState] = useState({
    title: "",
    description: "",
    ctaUrl: "",
  });
  const [deletingId, setDeletingId] = useState(null);

  const filteredAds = useMemo(() => {
    let list = ads;
    if (search.trim()) {
      list = list.filter((ad) =>
        ad.sponsorName.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (placement !== "all") {
      list = list.filter((ad) => ad.placement === placement);
    }
    switch (sortBy) {
      case "start-asc":
        list = [...list].sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate),
        );
        break;
      case "start-desc":
        list = [...list].sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate),
        );
        break;
      case "tier":
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

  const openEditDialog = (ad) => {
    setEditingAd(ad);
    setEditState({
      title: ad.title || "",
      description: ad.description || "",
      ctaUrl: ad.ctaUrl || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (editingAd) {
      updateAd(editingAd.id, editState);
      setEditingAd(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteAd(id);
    } catch (error) {
      console.error("Failed to delete ad", error);
    } finally {
      setDeletingId(null);
    }
  };

  const statusBreakdown = useMemo(() => {
    const active = ads.filter((ad) => getRuntimeStatus(ad) === "Active").length;
    const paused = ads.filter((ad) => getRuntimeStatus(ad) === "Paused").length;
    const expired = ads.filter(
      (ad) => getRuntimeStatus(ad) === "Expired",
    ).length;
    return [
      {
        label: "Live placements",
        value: active,
        helper: "Running right now",
        icon: TrendingUp,
        color: "text-emerald-600",
      },
      {
        label: "Paused / scheduled",
        value: paused,
        helper: "Ready to resume",
        icon: PauseCircle,
        color: "text-amber-600",
      },
      {
        label: "Expired",
        value: expired,
        helper: "Need new runway",
        icon: Shield,
        color: "text-gray-600",
      },
    ];
  }, [ads, getRuntimeStatus]);

  const emptyState = filteredAds.length === 0;

  // Auto-refresh every 30 seconds to update click counts
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAds().catch(() => {
        // Silently fail, already logged in refreshAds
      });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshAds]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusBreakdown.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-xl border-gray-100 shadow-sm"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                {stat.label}
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stat.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshAds()}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Search by sponsor name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg"
          />
          <Select value={placement} onValueChange={setPlacement}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="All placements" />
            </SelectTrigger>
            <SelectContent>
              {placementFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
        {emptyState ? (
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-base font-semibold text-gray-900 mb-2">
              No ads found
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your filters or create a new ad
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setPlacement("all");
                setSortBy("start-desc");
              }}
            >
              Reset filters
            </Button>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs">Sponsor</TableHead>
                  <TableHead className="text-xs">Placement</TableHead>
                  <TableHead className="text-xs">Start Date</TableHead>
                  <TableHead className="text-xs">End Date</TableHead>
                  <TableHead className="text-xs">Impressions</TableHead>
                  <TableHead className="text-xs">Clicks</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad) => (
                  <TableRow key={ad.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {ad.sponsorName}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {ad.title}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] mt-1 border-blue-100 bg-blue-50 text-blue-700"
                        >
                          {ad.tier}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {placementLabels[ad.placement]}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(ad.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(ad.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {ad.impressions?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {ad.clicks?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            getRuntimeStatus(ad) === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 text-xs"
                              : getRuntimeStatus(ad) === "Paused"
                                ? "bg-amber-50 text-amber-700 border-amber-100 text-xs"
                                : "bg-gray-100 text-gray-600 border-gray-200 text-xs"
                          }
                        >
                          {getRuntimeStatus(ad)}
                        </Badge>
                        <Switch
                          checked={ad.status !== "Paused"}
                          onCheckedChange={() => toggleAdStatus(ad.id)}
                          disabled={getRuntimeStatus(ad) === "Expired"}
                          className="scale-75"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => openEditDialog(ad)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(ad.id)}
                          disabled={deletingId === ad.id}
                        >
                          {deletingId === ad.id ? "..." : "Delete"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog
        open={Boolean(editingAd)}
        onOpenChange={(open) => !open && setEditingAd(null)}
      >
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Ad</DialogTitle>
            <CardDescription className="text-sm">
              Update ad details
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
