import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import SponsorRequestForm from '@/components/sponsorCenter/SponsorRequestForm';
import SponsorAdCard from '@/components/sponsorCenter/SponsorAdCard';
import SponsorRequestSuccessBanner from '@/components/sponsorCenter/SponsorRequestSuccessBanner';
import { useUserSponsor } from '@/contexts/UserSponsorContext';
import { Skeleton } from '@/components/ui/skeleton';

const initialForm = {
  sponsorName: '',
  adTitle: '',
  description: '',
  mediaUrl: '',
  placement: 'dashboard_banner',
  budget: '',
  startDate: '',
  endDate: '',
  website: '',
  notes: '',
  adType: 'Image',
};

const SponsorRequestPage = () => {
  const { addRequest } = useUserSponsor();
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
    setFormState(prev => ({ ...prev, mediaUrl: preview }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formState.sponsorName.trim())
      nextErrors.sponsorName = 'Sponsor name is required';
    if (!formState.adTitle.trim()) nextErrors.adTitle = 'Ad title is required';
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

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      addRequest(formState);
      setIsSubmitting(false);
      setShowSuccess(true);
      toast.success('Sponsorship request submitted');
      setFormState(initialForm);
      setMediaPreview('');
    }, 600);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, idx) => (
          <Skeleton key={idx} className="w-full h-96 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] gap-8">
      <div className="space-y-6">
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
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-wide text-gray-500">
          Live preview
        </p>
        <SponsorAdCard ad={previewData} isPreview hideActions />
      </div>
    </div>
  );
};

export default SponsorRequestPage;
