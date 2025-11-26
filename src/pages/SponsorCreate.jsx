import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import sponsorService from '@/services/sponsorService';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Upload, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdRequestStatusGuide from '@/components/sponsorAds/AdRequestStatusGuide';

const SponsorCreate = () => {
  const navigate = useNavigate();
  const { submissionId } = useParams();
  const { isAuthenticated } = useAuth();
  const { userProfile } = useUser();
  const { toast } = useToast();

  // Get user ID from multiple sources
  const getUserId = () => {
    return (
      userProfile?.id ||
      userProfile?.user_id ||
      localStorage.getItem('userId') ||
      Cookies.get('userId') ||
      'demo-user-id'
    );
  };
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaType: 'image',
    mediaUrl: '',
    placement: 'dashboard_banner',
    ctaText: 'Learn More',
    ctaUrl: '',
    tier: 'Bronze',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    targetRoles: ['student'],
  });

  useEffect(() => {
    loadPricingTiers();
    if (submissionId) {
      loadSubmission();
    }
  }, [submissionId]);

  const loadPricingTiers = async () => {
    try {
      const tiers = await sponsorService.getPricingTiers();
      setPricingTiers(tiers);
    } catch (error) {
      console.error('Error loading pricing tiers:', error);
    }
  };

  const loadSubmission = async () => {
    setLoadingData(true);
    try {
      const submission = await sponsorService.getSubmissionById(submissionId);
      if (submission) {
        setFormData({
          title: submission.title || '',
          description: submission.description || '',
          mediaType: submission.mediaType || 'image',
          mediaUrl: submission.mediaUrl || '',
          placement: submission.placement || 'dashboard_banner',
          ctaText: submission.ctaText || 'Learn More',
          ctaUrl: submission.ctaUrl || '',
          tier: submission.tier || 'Bronze',
          startDate:
            submission.startDate || new Date().toISOString().split('T')[0],
          endDate:
            submission.endDate ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          targetRoles: submission.targetRoles || ['student'],
        });
        setPreviewUrl(submission.mediaUrl || '');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load submission data.',
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMediaUpload = e => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to S3 or cloud storage
      // For now, create a local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result;
        setPreviewUrl(url);
        handleInputChange('mediaUrl', url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (submissionId) {
        await sponsorService.updateSubmission(submissionId, formData);
        toast({
          title: 'Success',
          description: 'Ad request updated successfully.',
        });
      } else {
        await sponsorService.createSubmission(getUserId(), formData);
        toast({
          title: 'Request Submitted!',
          description:
            'Your ad request has been sent to admin for review. You will be notified once approved.',
        });
      }
      navigate('/dashboard/sponsor');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save ad submission.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTier = pricingTiers.find(t => t.name === formData.tier);

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/sponsor')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {submissionId ? 'Edit Ad Request' : 'Request New Ad Campaign'}
        </h1>
        <p className="text-gray-600 mt-2">
          Fill in your ad details and select a plan. Your request will be sent
          to admin for approval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ad Request Details</CardTitle>
              <CardDescription>
                Provide complete information about your advertisement campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Ad Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Upgrade Your Learning"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Describe your offer or message"
                    rows={4}
                    required
                  />
                </div>

                {/* Media Type */}
                <div className="space-y-2">
                  <Label htmlFor="mediaType">Media Type</Label>
                  <Select
                    value={formData.mediaType}
                    onValueChange={value =>
                      handleInputChange('mediaType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="text">Text Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Media Upload */}
                {formData.mediaType !== 'text' && (
                  <div className="space-y-2">
                    <Label htmlFor="mediaUpload">Upload Media</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        id="mediaUpload"
                        type="file"
                        accept={
                          formData.mediaType === 'video' ? 'video/*' : 'image/*'
                        }
                        onChange={handleMediaUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="mediaUpload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {formData.mediaType === 'video'
                            ? 'MP4, WebM (max 50MB)'
                            : 'PNG, JPG, GIF (max 5MB)'}
                        </span>
                      </label>
                    </div>
                    {previewUrl && formData.mediaType !== 'video' && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="mt-4 rounded-lg max-h-64 object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Placement */}
                <div className="space-y-2">
                  <Label htmlFor="placement">Ad Placement</Label>
                  <Select
                    value={formData.placement}
                    onValueChange={value =>
                      handleInputChange('placement', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard_banner">
                        Dashboard Banner (Full Width)
                      </SelectItem>
                      <SelectItem value="dashboard_sidebar">
                        Dashboard Sidebar
                      </SelectItem>
                      <SelectItem value="course_player_sidebar">
                        Course Player Sidebar
                      </SelectItem>
                      <SelectItem value="course_listing">
                        Course Listing
                      </SelectItem>
                      <SelectItem value="popup">Popup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* CTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">Button Text</Label>
                    <Input
                      id="ctaText"
                      value={formData.ctaText}
                      onChange={e =>
                        handleInputChange('ctaText', e.target.value)
                      }
                      placeholder="e.g., Learn More"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaUrl">Button URL</Label>
                    <Input
                      id="ctaUrl"
                      type="url"
                      value={formData.ctaUrl}
                      onChange={e =>
                        handleInputChange('ctaUrl', e.target.value)
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={e =>
                        handleInputChange('startDate', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={e =>
                        handleInputChange('endDate', e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 animate-spin" size={20} />
                    ) : null}
                    {submissionId
                      ? 'Update Request'
                      : 'Submit Request to Admin'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/sponsor')}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Info Message */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <div className="text-amber-600 mt-0.5">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      Payment Required After Approval
                    </p>
                    <p className="text-xs text-amber-700">
                      {submissionId
                        ? 'Your changes will be reviewed by admin. Payment will be required once approved.'
                        : 'After submitting, your ad request will be reviewed by admin. You can proceed to payment once your request is approved (typically within 24-48 hours).'}
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Pricing & Preview Section */}
        <div className="space-y-6">
          {/* Status Guide */}
          <AdRequestStatusGuide />

          {/* Pricing Tiers */}
          <Card>
            <CardHeader>
              <CardTitle>Select Plan</CardTitle>
              <CardDescription>
                Choose your advertising plan and budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.tier}
                onValueChange={value => handleInputChange('tier', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pricingTiers.map(tier => (
                    <SelectItem key={tier.name} value={tier.name}>
                      {tier.name} - ${tier.price}/{tier.duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTier && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    ${selectedTier.price}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {selectedTier.duration}
                  </div>
                  <ul className="space-y-2">
                    {selectedTier.features.map((feature, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start"
                      >
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={20} />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                {previewUrl && formData.mediaType === 'image' && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full rounded-lg mb-3"
                  />
                )}
                <h3 className="font-semibold text-lg mb-2">
                  {formData.title || 'Ad Title'}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {formData.description || 'Ad description will appear here'}
                </p>
                <Button size="sm" className="w-full">
                  {formData.ctaText || 'Learn More'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SponsorCreate;
