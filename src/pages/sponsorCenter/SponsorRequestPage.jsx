import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import SponsorRequestForm from '@/components/sponsorCenter/SponsorRequestForm';
import SponsorAdCard from '@/components/sponsorCenter/SponsorAdCard';
import SponsorRequestSuccessBanner from '@/components/sponsorCenter/SponsorRequestSuccessBanner';
import { useUserSponsor } from '@/contexts/UserSponsorContext';
import { useUser } from '@/contexts/UserContext';
import { Skeleton } from '@/components/ui/skeleton';
import { submitSponsorAdRequest } from '@/services/sponsorAdsService';

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
  const { addRequest, refreshApplications } = useUserSponsor();
  const { userProfile } = useUser();
  const [formState, setFormState] = useState(initialForm);
  const [mediaPreview, setMediaPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

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
    const preview = URL.createObjectURL(file);
    setMediaPreview(preview);
    setFormState(prev => ({ ...prev, mediaFile: file, mediaUrl: preview }));
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
    setIsSubmitting(true);

    try {
      // Prepare request data
      const requestData = {
        title: formState.adTitle,
        description: formState.description,
        sponsor_name: formState.sponsorName,
        company_name: formState.companyName,
        contact_email: formState.contactEmail,
        contact_phone: formState.contactPhone,
        mediaFile: formState.mediaFile || formState.mediaUrl,
        link_url: formState.website,
        placement: formState.placement,
        preferred_start_date: formState.startDate,
        preferred_end_date: formState.endDate,
        budget: formState.budget || '0',
        additional_notes: formState.notes,
      };

      // Submit to backend
      const result = await submitSponsorAdRequest(requestData);

      // Refresh applications list
      if (refreshApplications) {
        await refreshApplications();
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      toast.success(
        result.message ||
          'Ad application submitted successfully. Admin will review your request.'
      );
      setFormState(initialForm);
      setMediaPreview('');
      setFormState(prev => ({
        ...prev,
        contactEmail: userProfile?.email || '',
      }));
    } catch (error) {
      console.error('Failed to submit sponsor ad request:', error);
      setIsSubmitting(false);
      toast.error(
        error.message || 'Failed to submit ad request. Please try again.'
      );
    }
  };

  const previewData = useMemo(
    () => ({
      sponsorName: formState.sponsorName || 'Sponsor name',
      adTitle: formState.adTitle || 'Ad title',
      description: formState.description || 'Preview copy will appear here.',
      mediaUrl: mediaPreview || formState.mediaUrl,
      placement: formState.placement,
      type: formState.adType || 'Image',
      status: 'Preview',
      startDate: formState.startDate,
      endDate: formState.endDate,
      budget: formState.budget,
    }),
    [formState, mediaPreview]
  );

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
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] gap-6">
      <div className="space-y-5">
        {showSuccess && <SponsorRequestSuccessBanner />}
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
      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          Live Preview
        </p>
        <SponsorAdCard ad={previewData} isPreview hideActions />
      </div>
    </div>
  );
};

export default SponsorRequestPage;
