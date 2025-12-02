import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ExternalLink, Sparkles } from 'lucide-react';
import {
  fetchDashboardSponsorAds,
  trackSponsorAdClick,
} from '@/services/sponsorAdsService';

const placementCopy = {
  DASHBOARD: 'Dashboard Banner',
  SIDEBAR: 'Sidebar',
  COURSE_PLAYER: 'Course Player',
  COURSE_LISTING: 'Course Listing',
  POPUP: 'Popup',
};

const resolveLink = url => {
  if (!url) return '#';
  if (url.startsWith('http')) return url;
  return `https://${url}`;
};

const SponsorDashboardAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clickingId, setClickingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadAds = async () => {
      try {
        const data = await fetchDashboardSponsorAds();
        if (mounted) {
          setAds(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard sponsor ads:', err);
        if (mounted) {
          setError(err.message || 'Unable to load sponsor ads');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadAds();
    return () => {
      mounted = false;
    };
  }, []);

  const hasAds = useMemo(() => ads && ads.length > 0, [ads]);

  const handleAdClick = async ad => {
    if (!ad?.link_url) return;
    try {
      setClickingId(ad.id);
      await trackSponsorAdClick(ad.id);
    } catch (err) {
      console.warn('Failed to track sponsor ad click:', err);
    } finally {
      setClickingId(null);
      window.open(resolveLink(ad.link_url), '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <Card className="rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Sponsored Spotlight
          </CardTitle>
          <CardDescription>
            Discover curated offers tailored for your learning journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[0, 1].map(index => (
            <div
              key={index}
              className="space-y-3 rounded-2xl border border-gray-100 p-4"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-9 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-3xl border border-rose-100 bg-rose-50/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-rose-700">
            Unable to load sponsor ads
          </CardTitle>
          <CardDescription className="text-rose-600">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!hasAds) {
    return (
      <Card className="rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Sponsored Spotlight
          </CardTitle>
          <CardDescription>
            Fresh partner offers will appear here soon.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border border-gray-100 shadow-sm">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Sponsored Spotlight
          </CardTitle>
          <CardDescription>
            Relevant offers from trusted partners. Click to learn more—your view
            is already tracked.
          </CardDescription>
        </div>
        <Badge className="rounded-full bg-blue-50 text-blue-700 border-blue-100">
          Curated for you
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {ads.map(ad => (
          <div
            key={ad.id}
            className="flex flex-col rounded-2xl border border-gray-100 bg-white/70 p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">
                {ad.sponsor_name || 'Sponsor'}
              </p>
              <Badge
                variant="outline"
                className="rounded-full border-blue-100 text-blue-700"
              >
                {placementCopy[ad.position] || 'Dashboard'}
              </Badge>
            </div>
            <h4 className="mt-2 text-lg font-semibold text-gray-900">
              {ad.title}
            </h4>
            <p className="mt-1 text-sm text-gray-600 line-clamp-3">
              {ad.description || 'Click to explore this sponsor offer.'}
            </p>
            {ad.start_date && ad.end_date && (
              <p className="mt-3 text-xs text-gray-500">
                {new Date(ad.start_date).toLocaleDateString()} –{' '}
                {new Date(ad.end_date).toLocaleDateString()}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>
                Views: <strong>{ad.view_count ?? 0}</strong>
              </span>
              <span>
                Clicks: <strong>{ad.click_count ?? 0}</strong>
              </span>
            </div>
            <Button
              variant="secondary"
              className="mt-4 w-full rounded-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => handleAdClick(ad)}
              disabled={clickingId === ad.id}
            >
              {clickingId === ad.id ? 'Opening...' : 'View Offer'}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SponsorDashboardAds;
