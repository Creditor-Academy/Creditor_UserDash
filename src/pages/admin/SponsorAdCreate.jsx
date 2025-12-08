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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSponsorAds } from '@/contexts/SponsorAdsContext';
import SponsorAdPreview from '@/components/sponsorAds/SponsorAdPreview';
import { createSponsorAd } from '@/services/sponsorAdsService';

const roleOptions = ['student', 'teacher', 'admin'];
const categoryOptions = ['business', 'finance', 'technology', 'legal'];
const batchOptions = ['2024', '2025', '2026'];

const adTypeToMediaType = {
  Image: 'image',
  Video: 'video',
  Carousel: 'image',
  'Text+CTA': 'card',
  'Sponsor Card': 'card',
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

const frequencyOptions = [
  { value: 'always', label: 'Always show' },
  { value: 'once_per_session', label: 'Once per session' },
  { value: 'low', label: 'Low frequency' },
];

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
  frequency: 'always',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0],
  targetRoles: [],
  targetCategories: [],
  targetBatches: [],
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

  const toggleMultiValue = (key, value) => {
    setFormState(prev => {
      const list = prev[key];
      return list.includes(value)
        ? { ...prev, [key]: list.filter(item => item !== value) }
        : { ...prev, [key]: [...list, value] };
    });
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

  const applyPreset = preset => {
    setFormState(prev => ({
      ...prev,
      ...preset,
    }));
    setMediaPreview(preset.mediaUrl || '');
    toast.info('Preset applied. You can fine tune further.');
  };

  const presets = [
    {
      label: 'Product Drop',
      payload: {
        sponsorName: 'Nova FinServe',
        title: 'Premium Scholar Card',
        description: 'Unlock 5% cashback on every course upgrade this season.',
        ctaText: 'Apply today',
        ctaUrl: 'https://example.com/cards',
        tier: 'Gold',
        adType: 'Image',
        placement: 'dashboard_banner',
      },
    },
    {
      label: 'Events & Webinars',
      payload: {
        sponsorName: 'FocusLabs',
        title: 'Live Productivity Sprint',
        description: 'Join our 45 min cohort to reclaim 6 study hours a week.',
        ctaText: 'Save my seat',
        ctaUrl: 'https://example.com/webinar',
        tier: 'Silver',
        adType: 'Text+CTA',
        placement: 'course_player_sidebar',
      },
    },
  ];

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <Card className="border border-blue-100/60 bg-blue-50/50 rounded-3xl shadow-sm">
        <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-blue-500">
              Studio
            </p>
            <CardTitle className="text-2xl text-gray-900">
              Craft a sponsor placement
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-1">
              Keep the branding clean, define runway, and preview placements
              without leaving the LMS.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3 ml-auto">
            {presets.map(preset => (
              <Button
                key={preset.label}
                type="button"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-white/80 rounded-2xl"
                onClick={() => applyPreset(preset.payload)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8">
        <div className="space-y-6">
          <Card className="rounded-3xl shadow-sm border-gray-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Brand & messaging</CardTitle>
                  <CardDescription>
                    Keep titles concise (max 40 chars) for perfect truncation.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-600 border-blue-100"
                >
                  Required
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sponsorName">Sponsor Name</Label>
                  <Input
                    id="sponsorName"
                    name="sponsorName"
                    placeholder="e.g. Nova FinServe"
                    value={formState.sponsorName}
                    onChange={handleInputChange}
                  />
                  {errors.sponsorName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.sponsorName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="tier">Sponsor Tier</Label>
                  <Select
                    value={formState.tier}
                    onValueChange={value => handleSelectChange('tier', value)}
                  >
                    <SelectTrigger id="tier">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Ad Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Upgrade your learning"
                    value={formState.title}
                    onChange={handleInputChange}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="adType">Ad Type</Label>
                  <Select
                    value={formState.adType}
                    onValueChange={value => handleSelectChange('adType', value)}
                  >
                    <SelectTrigger id="adType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(adTypeToMediaType).map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Write a compelling one-liner for learners..."
                  value={formState.description}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Placement, schedule & pacing</CardTitle>
              <CardDescription>
                Choose where the ad renders and how often learners see it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Placement</Label>
                  <Select
                    value={formState.placement}
                    onValueChange={value =>
                      handleSelectChange('placement', value)
                    }
                  >
                    <SelectTrigger>
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
                <div>
                  <Label>Frequency Control</Label>
                  <Select
                    value={formState.frequency}
                    onValueChange={value =>
                      handleSelectChange('frequency', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Display Start</Label>
                  <Input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formState.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Display End</Label>
                  <Input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formState.endDate}
                    onChange={handleInputChange}
                  />
                  {errors.dateRange && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.dateRange}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-4 flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    Projected run
                  </p>
                  <p className="text-2xl font-semibold text-blue-900">
                    {durationDays} days
                  </p>
                </div>
                <Separator
                  orientation="vertical"
                  className="hidden sm:block h-12 bg-blue-200"
                />
                <div className="flex flex-col text-sm text-blue-900/70">
                  <span>Start: {formState.startDate || '—'}</span>
                  <span>End: {formState.endDate || '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Creative & CTA</CardTitle>
              <CardDescription>
                Upload media and define how learners engage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctaText">CTA Button Text</Label>
                  <Input
                    id="ctaText"
                    name="ctaText"
                    placeholder="Learn more"
                    value={formState.ctaText}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="ctaUrl">CTA Redirect URL</Label>
                  <Input
                    id="ctaUrl"
                    name="ctaUrl"
                    placeholder="https://example.com"
                    value={formState.ctaUrl}
                    onChange={handleInputChange}
                  />
                  {errors.ctaUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.ctaUrl}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Ad Media</Label>
                <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-4">
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                  />
                  <p className="text-xs text-gray-500">
                    JPG, PNG, WEBP, MP4 under 10MB. Files stay local and power
                    the live preview.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Audience targeting</CardTitle>
              <CardDescription>
                Use lightweight targeting to keep the experience relevant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>User Roles</Label>
                <div className="flex flex-wrap gap-3 mt-3">
                  {roleOptions.map(role => (
                    <label
                      key={role}
                      className="flex items-center gap-2 text-sm rounded-full bg-gray-50 px-3 py-1.5 border border-gray-200"
                    >
                      <Checkbox
                        checked={formState.targetRoles.includes(role)}
                        onCheckedChange={() =>
                          toggleMultiValue('targetRoles', role)
                        }
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Course Categories</Label>
                <div className="flex flex-wrap gap-3 mt-3">
                  {categoryOptions.map(category => (
                    <label
                      key={category}
                      className="flex items-center gap-2 text-sm rounded-full bg-gray-50 px-3 py-1.5 border border-gray-200"
                    >
                      <Checkbox
                        checked={formState.targetCategories.includes(category)}
                        onCheckedChange={() =>
                          toggleMultiValue('targetCategories', category)
                        }
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Batch / Department</Label>
                <div className="flex flex-wrap gap-3 mt-3">
                  {batchOptions.map(batch => (
                    <label
                      key={batch}
                      className="flex items-center gap-2 text-sm rounded-full bg-gray-50 px-3 py-1.5 border border-gray-200"
                    >
                      <Checkbox
                        checked={formState.targetBatches.includes(batch)}
                        onCheckedChange={() =>
                          toggleMultiValue('targetBatches', batch)
                        }
                      />
                      {batch}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <SponsorAdPreview ad={previewAd} />
          <Card className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/70">
            <CardHeader>
              <CardTitle className="text-base">Mock data reminder</CardTitle>
              <CardDescription>
                Saving an ad updates the Sponsor Ads mock JSON stored in
                localStorage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <p>
                This keeps the LMS frontend responsive without calling backend
                APIs. You can refresh to persist and share the state with
                day-to-day stakeholders.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Instantly available in Manage + Analytics.</li>
                <li>No risk to live learners—sandboxed to your browser.</li>
                <li>Perfect for stakeholder reviews or sales demos.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="text-sm text-gray-500">
          Changes autosave locally. Click publish when you are ready to surface
          this placement.
        </div>
        <Button
          type="submit"
          className="bg-blue-600 text-white hover:bg-blue-700 px-8 rounded-2xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Ad...' : 'Save Sponsor Ad'}
        </Button>
      </div>
    </form>
  );
};

export default SponsorAdCreate;
