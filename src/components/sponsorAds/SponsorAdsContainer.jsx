import React from 'react';
import useSponsorAds from '@/hooks/useSponsorAds';
import SponsorBanner from './SponsorBanner';
import SponsorSidebarAd from './SponsorSidebarAd';
import SponsorCoursePlayerAd from './SponsorCoursePlayerAd';
import SponsorAdCard from './SponsorAdCard';

export function SponsorAdsContainer({ placement, className = '' }) {
  const { selectedAd, loading, trackImpression, trackClick } =
    useSponsorAds(placement);

  if (loading || !selectedAd) {
    return null;
  }

  switch (placement) {
    case 'dashboard_banner':
      return (
        <div className={className}>
          <SponsorBanner
            ad={selectedAd}
            onImpression={trackImpression}
            onClick={trackClick}
          />
        </div>
      );
    case 'dashboard_sidebar':
      return (
        <div className={className}>
          <SponsorSidebarAd
            ad={selectedAd}
            onImpression={trackImpression}
            onClick={trackClick}
          />
        </div>
      );
    case 'course_player_sidebar':
      return (
        <div className={className}>
          <SponsorCoursePlayerAd
            ad={selectedAd}
            onImpression={trackImpression}
            onClick={trackClick}
          />
        </div>
      );
    case 'course_listing':
      return (
        <div className={className}>
          <SponsorAdCard
            ad={selectedAd}
            onImpression={trackImpression}
            onClick={trackClick}
          />
        </div>
      );
    default:
      return null;
  }
}

export default SponsorAdsContainer;
