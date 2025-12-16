import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SponsorRequestForm from '@/components/sponsorCenter/SponsorRequestForm';
import SponsorAdCard from '@/components/sponsorCenter/SponsorAdCard';
import { useUser } from '@/contexts/UserContext';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2 } from 'lucide-react';

const initialForm = {
  sponsorName: '',
  companyName: '',
  contactEmail: '',
  contactPhone: '',
  adTitle: '',
  description: '',
  mediaUrl: '',
  mediaFile: null,
  placement: 'dashboard_banner',
  budget: '0',
  startDate: '',
  endDate: '',
  website: '',
  notes: '',
  adType: 'Image',
};

const SponsorRequestPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const [formState, setFormState] = useState(initialForm);
  const [mediaPreview, setMediaPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

  // Pre-fill user email if available
  useEffect(() => {
    if (userProfile?.email && !formState.contactEmail) {
      setFormState(prev => ({ ...prev, contactEmail: userProfile.email }));
    }
  }, [userProfile]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handlePlacementChange = value => {
    setFormState(prev => ({ ...prev, placement: value }));
  };

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clean up previous preview URL to prevent memory leaks
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }

    const preview = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    const adType = isVideo ? 'Video' : 'Image';

    setMediaPreview(preview);
    setFormState(prev => ({
      ...prev,
      mediaFile: file,
      mediaUrl: preview,
      adType: adType,
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formState.sponsorName.trim())
      nextErrors.sponsorName = 'Sponsor name is required';
    if (!formState.companyName.trim())
      nextErrors.companyName = 'Company name is required';
    if (!formState.contactEmail.trim())
      nextErrors.contactEmail = 'Contact email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.contactEmail))
      nextErrors.contactEmail = 'Please enter a valid email address';
    if (!formState.contactPhone.trim())
      nextErrors.contactPhone = 'Contact phone is required';
    if (!formState.adTitle.trim()) nextErrors.adTitle = 'Ad title is required';
    if (!formState.description.trim())
      nextErrors.description = 'Description is required';
    if (!formState.website.trim())
      nextErrors.website = 'Website URL is required';
    else {
      try {
        new URL(formState.website);
      } catch {
        nextErrors.website = 'Please enter a valid URL';
      }
    }
    if (!formState.startDate) nextErrors.startDate = 'Start date is required';
    if (!formState.endDate) nextErrors.endDate = 'End date is required';
    if (
      formState.startDate &&
      formState.endDate &&
      formState.startDate > formState.endDate
    ) {
      nextErrors.dateRange = 'End date should be after start date';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    // Navigate to step 2 (description page) with step 1 data
    const step1Data = {
      title: formState.adTitle,
      description: formState.description,
      sponsor_name: formState.sponsorName,
      company_name: formState.companyName,
      contact_email: formState.contactEmail,
      contact_phone: formState.contactPhone,
      mediaFile: formState.mediaFile,
      mediaUrl: mediaPreview || formState.mediaUrl,
      placement: formState.placement,
      preferred_start_date: formState.startDate,
      preferred_end_date: formState.endDate,
      budget: formState.budget || '0',
      additional_notes: formState.notes,
      website: formState.website,
      adType: formState.adType,
    };

    // Navigate to description page
    navigate('/dashboard/sponsor-center/submit/description', {
      state: { step1Data },
    });
  };

  const previewData = useMemo(() => {
    // Determine mediaType based on adType (lowercase for mediaType)
    const mediaType = formState.adType === 'Video' ? 'video' : 'image';

    return {
      sponsorName: formState.sponsorName || 'Sponsor name',
      adTitle: formState.adTitle || 'Ad title',
      description: formState.description || 'Preview copy will appear here.',
      mediaUrl: mediaPreview || formState.mediaUrl,
      mediaType: mediaType,
      placement: formState.placement,
      type: formState.adType || 'Image',
      status: 'Preview',
      startDate: formState.startDate,
      endDate: formState.endDate,
      budget: formState.budget,
    };
  }, [formState, mediaPreview]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[...Array(2)].map((_, idx) => (
          <Skeleton key={idx} className="w-full h-96 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
          1
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Step 1: Ad Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Provide basic information about your ad
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] gap-4 sm:gap-6">
        <div className="space-y-4 sm:space-y-5">
          <SponsorRequestForm
            formState={formState}
            errors={errors}
            onInputChange={handleInputChange}
            onPlacementChange={handlePlacementChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
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

export default SponsorRequestPage;
