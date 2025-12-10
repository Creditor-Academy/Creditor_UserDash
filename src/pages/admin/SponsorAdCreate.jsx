import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useSponsorAds } from '@/contexts/SponsorAdsContext';
import SponsorAdPreview from '@/components/sponsorAds/SponsorAdPreview';
import { createSponsorAd } from '@/services/sponsorAdsService';

const adTypeToMediaType = {
  Image: 'image',
  Video: 'video',
};

const placementOptions = [
  {
    value: 'dashboard_banner',
    label: 'Dashboard Banner',
    backendValue: 'DASHBOARD',
  },
  {
    value: 'dashboard_sidebar',
    label: 'Dashboard Sidebar',
    backendValue: 'SIDEBAR',
  },
  {
    value: 'course_player_sidebar',
    label: 'Course Player Right Sidebar',
    backendValue: 'COURSE_PLAYER',
  },
  {
    value: 'course_listing_tile',
    label: 'Course Listing Page Ad Tile',
    backendValue: 'COURSE_LISTING',
  },
  { value: 'popup', label: 'Popup Ad (optional)', backendValue: 'POPUP' },
];

// Map frontend placement value to backend position
const mapPlacementToPosition = placement => {
  const option = placementOptions.find(opt => opt.value === placement);
  return option?.backendValue || 'DASHBOARD';
};

const tierOptions = ['Gold', 'Silver', 'Bronze'];

const initialForm = {
  sponsorName: '',
  title: '',
  description: '',
  mediaUrl: '',
  adType: 'Image',
  placement: 'dashboard_banner',
  ctaText: '',
  ctaUrl: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0],
  tier: 'Gold',
};

export const SponsorAdCreate = () => {
  const { addAd, refreshAds } = useSponsorAds();
  const [formState, setFormState] = useState(initialForm);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const isValidUrl = url => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleMediaUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store the file object for API upload
    setMediaFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);

    const fileType = file.type.startsWith('video') ? 'video' : 'image';
    setFormState(prev => ({
      ...prev,
      adType: fileType === 'video' ? 'Video' : 'Image',
    }));
  };

  const previewAd = useMemo(
    () => ({
      ...formState,
      mediaUrl: mediaPreview || formState.mediaUrl,
      mediaType: adTypeToMediaType[formState.adType] || 'image',
    }),
    [formState, mediaPreview]
  );

  const handleSubmit = async e => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) {
      console.warn(
        'Form submission already in progress, ignoring duplicate submit'
      );
      return;
    }

    const nextErrors = {};
    if (!formState.sponsorName.trim())
      nextErrors.sponsorName = 'Sponsor name is required';
    if (!formState.title.trim()) nextErrors.title = 'Title is required';
    if (!isValidUrl(formState.ctaUrl))
      nextErrors.ctaUrl = 'Enter a valid HTTPS URL';

    if (new Date(formState.startDate) > new Date(formState.endDate)) {
      nextErrors.dateRange = 'Start date must be before end date';
    }

    // Validate media (image or video) is provided
    if (!mediaFile && !formState.mediaUrl) {
      nextErrors.mediaUrl = 'Please upload an image or video';
    } else if (formState.mediaUrl && !isValidUrl(formState.mediaUrl)) {
      nextErrors.mediaUrl = 'Please provide a valid media URL';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);

    try {
      // Prepare data for backend API
      const apiData = {
        title: formState.title,
        description: formState.description,
        mediaFile: mediaFile || formState.mediaUrl, // File object or URL string
        linkUrl: formState.ctaUrl,
        sponsorName: formState.sponsorName,
        startDate: formState.startDate,
        endDate: formState.endDate,
        position: mapPlacementToPosition(formState.placement),
        organizationId: null,
      };

      // Call backend API
      const result = await createSponsorAd(apiData);

      // Also add to local context for immediate UI update (optional)
      if (result.data) {
        addAd({
          ...formState,
          mediaUrl:
            result.data.video_url ||
            result.data.image_url ||
            mediaPreview ||
            formState.mediaUrl,
          mediaType: adTypeToMediaType[formState.adType] || 'image',
        });
      }

      toast.success('Sponsor ad created successfully!');
      refreshAds?.().catch(() => {});
      setFormState(initialForm);
      setMediaPreview('');
      setMediaFile(null);

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Failed to create sponsor ad:', error);
      toast.error(
        error.message || 'Failed to create sponsor ad. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationDays = Math.max(
    0,
    Math.round(
      (new Date(formState.endDate).getTime() -
        new Date(formState.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
        <div className="space-y-5">
          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Brand & Messaging</CardTitle>
              <CardDescription className="text-sm">
                Enter sponsor details and ad content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sponsorName" className="text-sm font-medium">
                    Sponsor Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sponsorName"
                    name="sponsorName"
                    placeholder="e.g. Nova FinServe"
                    value={formState.sponsorName}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                  {errors.sponsorName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.sponsorName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="tier" className="text-sm font-medium">
                    Sponsor Tier
                  </Label>
                  <Select
                    value={formState.tier}
                    onValueChange={value => handleSelectChange('tier', value)}
                  >
                    <SelectTrigger id="tier" className="mt-1.5">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tierOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Ad Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Upgrade your learning"
                  value={formState.title}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Write a compelling description..."
                  value={formState.description}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Placement & Schedule</CardTitle>
              <CardDescription className="text-sm">
                Choose where the ad appears and when it runs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Placement</Label>
                <Select
                  value={formState.placement}
                  onValueChange={value =>
                    handleSelectChange('placement', value)
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {placementOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formState.startDate}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    End Date
                  </Label>
                  <Input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formState.endDate}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                  {errors.dateRange && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.dateRange}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                <p className="text-xs text-gray-600 mb-1">Campaign Duration</p>
                <p className="text-lg font-semibold text-gray-900">
                  {durationDays} days
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Media & CTA</CardTitle>
              <CardDescription className="text-sm">
                Upload ad media and set the call-to-action
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Upload Media <span className="text-red-500">*</span>
                </Label>
                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-4">
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supports JPG, PNG, WEBP, MP4 (max 10MB)
                  </p>
                </div>
                {errors.mediaUrl && (
                  <p className="text-xs text-red-500 mt-1">{errors.mediaUrl}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ctaUrl" className="text-sm font-medium">
                  CTA URL
                </Label>
                <Input
                  id="ctaUrl"
                  name="ctaUrl"
                  placeholder="https://example.com"
                  value={formState.ctaUrl}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
                {errors.ctaUrl && (
                  <p className="text-xs text-red-500 mt-1">{errors.ctaUrl}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <SponsorAdPreview ad={previewAd} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          className="bg-blue-600 text-white hover:bg-blue-700 px-6 rounded-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Ad'}
        </Button>
      </div>
    </form>
  );
};

export default SponsorAdCreate;
