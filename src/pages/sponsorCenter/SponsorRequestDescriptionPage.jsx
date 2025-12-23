import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  CheckCircle2,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import SponsorAdCard from '@/components/sponsorCenter/SponsorAdCard';

const SponsorRequestDescriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const step1Data = location.state?.step1Data || {};
  const [formState, setFormState] = useState({
    offerDetails: '', // This is the detailed description/offer details
    websiteDescription: '',
    websiteOverview: '',
    websiteFeaturesHighlights: '',
    callToAction: 'Learn More',
    websiteUrl: '',
    websiteImages: [],
    websiteVideos: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  // Initialize websiteUrl from step1Data or location state
  useEffect(() => {
    if (!formState.websiteUrl) {
      const url =
        location.state?.website ||
        step1Data?.website ||
        step1Data?.link_url ||
        '';
      if (url) {
        setFormState(prev => ({ ...prev, websiteUrl: url }));
      }
    }
  }, [location.state, step1Data, formState.websiteUrl]);

  useEffect(() => {
    // If no step 1 data, redirect back
    if (!step1Data || Object.keys(step1Data).length === 0) {
      toast.error('Please complete step 1 first');
      navigate('/dashboard/sponsor-center/submit');
    }
  }, [step1Data, navigate]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      videoPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews, videoPreviews]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = e => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      toast.error('Please select only image files');
      return;
    }

    if (formState.websiteImages.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = [...formState.websiteImages, ...imageFiles];
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));

    setFormState(prev => ({ ...prev, websiteImages: newImages }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleVideoUpload = e => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    if (videoFiles.length !== files.length) {
      toast.error('Please select only video files');
      return;
    }

    if (formState.websiteVideos.length + videoFiles.length > 3) {
      toast.error('Maximum 3 videos allowed');
      return;
    }

    const newVideos = [...formState.websiteVideos, ...videoFiles];
    const newPreviews = videoFiles.map(file => URL.createObjectURL(file));

    setFormState(prev => ({ ...prev, websiteVideos: newVideos }));
    setVideoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = index => {
    const newImages = formState.websiteImages.filter((_, i) => i !== index);
    const previewToRemove = imagePreviews[index];
    URL.revokeObjectURL(previewToRemove);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setFormState(prev => ({ ...prev, websiteImages: newImages }));
    setImagePreviews(newPreviews);
  };

  const removeVideo = index => {
    const newVideos = formState.websiteVideos.filter((_, i) => i !== index);
    const previewToRemove = videoPreviews[index];
    URL.revokeObjectURL(previewToRemove);
    const newPreviews = videoPreviews.filter((_, i) => i !== index);

    setFormState(prev => ({ ...prev, websiteVideos: newVideos }));
    setVideoPreviews(newPreviews);
  };

  const validate = () => {
    const nextErrors = {};
    if (!formState.offerDetails.trim()) {
      nextErrors.offerDetails = 'Offer details are required';
    } else if (formState.offerDetails.trim().length < 50) {
      nextErrors.offerDetails = 'Offer details must be at least 50 characters';
    }
    if (!formState.websiteDescription.trim()) {
      nextErrors.websiteDescription = 'Website description is required';
    } else if (formState.websiteDescription.trim().length < 30) {
      nextErrors.websiteDescription =
        'Website description must be at least 30 characters';
    }
    if (!formState.websiteOverview.trim()) {
      nextErrors.websiteOverview = 'Website overview is required';
    } else if (formState.websiteOverview.trim().length < 50) {
      nextErrors.websiteOverview =
        'Website overview must be at least 50 characters';
    }
    if (!formState.websiteFeaturesHighlights.trim()) {
      nextErrors.websiteFeaturesHighlights = 'Website features are required';
    } else if (formState.websiteFeaturesHighlights.trim().length < 30) {
      nextErrors.websiteFeaturesHighlights =
        'Website features must be at least 30 characters';
    }
    if (!formState.websiteUrl.trim()) {
      nextErrors.websiteUrl = 'Website URL is required';
    } else {
      try {
        new URL(formState.websiteUrl);
      } catch {
        nextErrors.websiteUrl = 'Please enter a valid URL';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine step 1 and step 2 data
      const requestData = {
        ...step1Data,
        link_url:
          formState.websiteUrl || step1Data.website || step1Data.link_url || '',
        website_overview: formState.websiteOverview,
        offer_details: formState.offerDetails,
        website_features_highlights: formState.websiteFeaturesHighlights,
        websiteImages: formState.websiteImages,
        websiteVideos: formState.websiteVideos,
      };

      // Import and call the API
      const { submitSponsorAdRequest } = await import(
        '@/services/sponsorAdsService'
      );
      const result = await submitSponsorAdRequest(requestData);

      toast.success(result.message || 'Ad request submitted successfully!');
      navigate('/dashboard/sponsor-center/my-ads');
    } catch (error) {
      console.error('Failed to submit sponsor ad request:', error);
      toast.error(
        error.message || 'Failed to submit ad request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewData = {
    ...step1Data,
    description:
      formState.offerDetails ||
      step1Data.description ||
      'Preview will show your offer details here.',
    website: formState.websiteUrl,
    websiteOverview: formState.websiteOverview,
    websiteFeatures: formState.websiteFeaturesHighlights,
    websiteImages: imagePreviews,
    websiteVideos: videoPreviews,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() =>
            navigate('/dashboard/sponsor-center/submit', { state: step1Data })
          }
          className="flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Step 1: Completed
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Step 2: Provide Detailed Information
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Add detailed descriptions about your ad and website
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] gap-4 sm:gap-6">
        {/* Form */}
        <div className="space-y-4 sm:space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Card className="rounded-xl shadow-sm border-gray-100">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg">
                  Offer Details
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Provide detailed information about your offer and what users
                  will get
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                <div>
                  <Label htmlFor="offerDetails" className="text-sm font-medium">
                    Offer Details <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="offerDetails"
                    name="offerDetails"
                    placeholder="Describe your offer in detail. What discounts, promotions, or special deals are you offering? Include promo codes, validity dates, and any terms and conditions. (Minimum 50 characters)"
                    value={formState.offerDetails}
                    onChange={handleInputChange}
                    className="mt-1.5 min-h-[120px]"
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formState.offerDetails.length} characters (minimum 50)
                  </p>
                  {errors.offerDetails && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.offerDetails}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-gray-100">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg">
                  Website Information
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Tell us about your website and where users will be directed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                <div>
                  <Label htmlFor="websiteUrl" className="text-sm font-medium">
                    Website URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    placeholder="https://example.com"
                    value={formState.websiteUrl}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                  {errors.websiteUrl && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.websiteUrl}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="websiteDescription"
                    className="text-sm font-medium"
                  >
                    Website Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="websiteDescription"
                    name="websiteDescription"
                    placeholder="Brief description of your website (Minimum 30 characters)"
                    value={formState.websiteDescription}
                    onChange={handleInputChange}
                    className="mt-1.5 min-h-[80px]"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formState.websiteDescription.length} characters (minimum
                    30)
                  </p>
                  {errors.websiteDescription && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.websiteDescription}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="websiteOverview"
                    className="text-sm font-medium"
                  >
                    Complete Website Overview{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="websiteOverview"
                    name="websiteOverview"
                    placeholder="Provide a comprehensive overview of your website. What is it about? What is the main purpose? What makes it unique? (Minimum 50 characters)"
                    value={formState.websiteOverview}
                    onChange={handleInputChange}
                    className="mt-1.5 min-h-[120px]"
                    rows={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formState.websiteOverview.length} characters (minimum 50)
                  </p>
                  {errors.websiteOverview && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.websiteOverview}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="websiteFeaturesHighlights"
                    className="text-sm font-medium"
                  >
                    Website Features & Highlights{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="websiteFeaturesHighlights"
                    name="websiteFeaturesHighlights"
                    placeholder="List the key features, services, or highlights of your website. Use bullet points or checkmarks (✓) to format. Example: ✓ Free shipping\n✓ 24/7 support\n✓ Money-back guarantee (Minimum 30 characters)"
                    value={formState.websiteFeaturesHighlights}
                    onChange={handleInputChange}
                    className="mt-1.5 min-h-[100px]"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formState.websiteFeaturesHighlights.length} characters
                    (minimum 30)
                  </p>
                  {errors.websiteFeaturesHighlights && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.websiteFeaturesHighlights}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="callToAction" className="text-sm font-medium">
                    Call to Action Text
                  </Label>
                  <Input
                    id="callToAction"
                    name="callToAction"
                    placeholder="Learn More, Watch Now, Get Started, etc."
                    value={formState.callToAction}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Text displayed on the button (default: "Learn More")
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Media Upload Section */}
            <Card className="rounded-xl shadow-sm border-gray-100">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-base sm:text-lg">
                  Website Media
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Upload images and videos showcasing your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Image Upload */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Website Images{' '}
                    <span className="text-gray-500 text-xs">
                      (Max 5 images)
                    </span>
                  </Label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label
                        htmlFor="image-upload"
                        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Upload Images
                        </span>
                        <Upload className="w-4 h-4 text-gray-500" />
                      </Label>
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Upload */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Website Videos{' '}
                    <span className="text-gray-500 text-xs">
                      (Max 3 videos)
                    </span>
                  </Label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <Label
                        htmlFor="video-upload"
                        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <Video className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Upload Videos
                        </span>
                        <Upload className="w-4 h-4 text-gray-500" />
                      </Label>
                    </div>
                    {videoPreviews.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {videoPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <video
                              src={preview}
                              className="w-full h-40 object-cover rounded-lg border border-gray-200"
                              controls
                            />
                            <button
                              type="button"
                              onClick={() => removeVideo(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate('/dashboard/sponsor-center/submit', {
                    state: step1Data,
                  })
                }
                className="flex-1 sm:flex-initial"
              >
                Previous Step
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-initial min-w-[140px]"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="space-y-2 sm:space-y-3 order-first xl:order-last">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Live Preview
          </p>
          <SponsorAdCard ad={previewData} isPreview hideActions />
        </div>
      </div>
    </div>
  );
};

export default SponsorRequestDescriptionPage;
