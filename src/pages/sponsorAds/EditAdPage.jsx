import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import { sponsorAdsService } from '@/data/mockSponsorAds';
import SponsorAdPreview from '@/components/sponsorAds/SponsorAdPreview';
import { useToast } from '@/hooks/use-toast';

export default function EditAdPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    sponsorName: '',
    title: '',
    description: '',
    ctaText: '',
    ctaUrl: '',
    mediaType: 'image',
    mediaUrl: '',
    placement: 'dashboard_banner',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    frequency: 'always',
    targetRoles: [],
    targetCategories: [],
    targetBatches: [],
    tier: 'Bronze',
  });

  useEffect(() => {
    loadAd();
  }, [id]);

  const loadAd = async () => {
    setLoading(true);
    try {
      const ad = await sponsorAdsService.getAdById(id);
      if (ad) {
        setFormData({
          sponsorName: ad.sponsorName || '',
          title: ad.title || '',
          description: ad.description || '',
          ctaText: ad.ctaText || '',
          ctaUrl: ad.ctaUrl || '',
          mediaType: ad.mediaType || 'image',
          mediaUrl: ad.mediaUrl || '',
          placement: ad.placement || 'dashboard_banner',
          startDate: ad.startDate || new Date().toISOString().split('T')[0],
          endDate:
            ad.endDate ||
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          frequency: ad.frequency || 'always',
          targetRoles: ad.targetRoles || [],
          targetCategories: ad.targetCategories || [],
          targetBatches: ad.targetBatches || [],
          tier: ad.tier || 'Bronze',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Ad not found.',
          variant: 'destructive',
        });
        navigate('/instructor/sponsor-ads/manage');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load ad.',
        variant: 'destructive',
      });
      navigate('/instructor/sponsor-ads/manage');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field, value, checked) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (checked) {
        return { ...prev, [field]: [...current, value] };
      } else {
        return { ...prev, [field]: current.filter(v => v !== value) };
      }
    });
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, mediaUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateUrl = url => {
    if (!url) return true; // URL is optional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.sponsorName || !formData.title) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.ctaUrl && !validateUrl(formData.ctaUrl)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL for the CTA redirect.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await sponsorAdsService.updateAd(id, formData);
      toast({
        title: 'Success',
        description: 'Ad updated successfully!',
      });
      navigate('/instructor/sponsor-ads/manage');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update ad.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ad...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/instructor/sponsor-ads/manage')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Manage Ads
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Sponsor Ad</h1>
        <p className="text-gray-600 mt-2">
          Update the information for your sponsor ad.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ad Details</CardTitle>
              <CardDescription>
                Update the information for your sponsor ad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sponsor Name */}
                <div>
                  <Label htmlFor="sponsorName">
                    Sponsor Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sponsorName"
                    value={formData.sponsorName}
                    onChange={e => handleChange('sponsorName', e.target.value)}
                    placeholder="ABC Corp"
                    required
                  />
                </div>

                {/* Ad Title */}
                <div>
                  <Label htmlFor="title">
                    Ad Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => handleChange('title', e.target.value)}
                    placeholder="Upgrade Your Learning"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Special offer for LMS users..."
                    rows={3}
                  />
                </div>

                {/* Media Upload */}
                <div>
                  <Label>Upload Ad Media</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="mediaUpload"
                    />
                    <Label
                      htmlFor="mediaUpload"
                      className="cursor-pointer flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Click to upload image or video</span>
                    </Label>
                    {formData.mediaUrl && (
                      <div className="mt-2">
                        {formData.mediaType === 'image' ? (
                          <img
                            src={formData.mediaUrl}
                            alt="Preview"
                            className="max-h-48 rounded-lg"
                          />
                        ) : (
                          <video
                            src={formData.mediaUrl}
                            controls
                            className="max-h-48 rounded-lg"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Media URL (alternative) */}
                <div>
                  <Label htmlFor="mediaUrl">Or Enter Media URL</Label>
                  <Input
                    id="mediaUrl"
                    value={formData.mediaUrl}
                    onChange={e => handleChange('mediaUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Ad Type */}
                <div>
                  <Label htmlFor="mediaType">Ad Type</Label>
                  <Select
                    value={formData.mediaType}
                    onValueChange={value => handleChange('mediaType', value)}
                  >
                    <SelectTrigger id="mediaType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                      <SelectItem value="text">Text+CTA</SelectItem>
                      <SelectItem value="card">Sponsor Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Placement */}
                <div>
                  <Label htmlFor="placement">Placement</Label>
                  <Select
                    value={formData.placement}
                    onValueChange={value => handleChange('placement', value)}
                  >
                    <SelectTrigger id="placement">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard_banner">
                        Dashboard Banner
                      </SelectItem>
                      <SelectItem value="dashboard_sidebar">
                        Dashboard Sidebar
                      </SelectItem>
                      <SelectItem value="course_player_sidebar">
                        Course Player Right Sidebar
                      </SelectItem>
                      <SelectItem value="course_listing">
                        Course Listing Page Ad Tile
                      </SelectItem>
                      <SelectItem value="popup">Popup Ad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* CTA Button Text */}
                <div>
                  <Label htmlFor="ctaText">CTA Button Text</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={e => handleChange('ctaText', e.target.value)}
                    placeholder="Learn More"
                  />
                </div>

                {/* CTA URL */}
                <div>
                  <Label htmlFor="ctaUrl">CTA Redirect URL</Label>
                  <Input
                    id="ctaUrl"
                    type="url"
                    value={formData.ctaUrl}
                    onChange={e => handleChange('ctaUrl', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={e => handleChange('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={e => handleChange('endDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <Label htmlFor="frequency">Frequency Control</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={value => handleChange('frequency', value)}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always show</SelectItem>
                      <SelectItem value="once_per_session">
                        Once per session
                      </SelectItem>
                      <SelectItem value="low_frequency">
                        Low frequency
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* User Targeting - Roles */}
                <div>
                  <Label>User Role Targeting (Optional)</Label>
                  <div className="mt-2 space-y-2">
                    {['Student', 'Teacher', 'Admin'].map(role => (
                      <label key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.targetRoles.includes(
                            role.toLowerCase()
                          )}
                          onChange={e =>
                            handleMultiSelect(
                              'targetRoles',
                              role.toLowerCase(),
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300"
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sponsor Tier */}
                <div>
                  <Label htmlFor="tier">Sponsor Tier</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={value => handleChange('tier', value)}
                  >
                    <SelectTrigger id="tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Update Ad'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/instructor/sponsor-ads/manage')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your ad will appear to users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SponsorAdPreview ad={formData} placement={formData.placement} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
