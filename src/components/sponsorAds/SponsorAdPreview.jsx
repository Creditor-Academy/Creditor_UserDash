import React from 'react';
import SponsorBanner from './SponsorBanner';
import SponsorSidebarAd from './SponsorSidebarAd';
import SponsorCoursePlayerAd from './SponsorCoursePlayerAd';
import SponsorAdCard from './SponsorAdCard';

export function SponsorAdPreview({ ad, placement }) {
  if (!ad) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        Preview will appear here
      </div>
    );
  }

  const previewAd = {
    ...ad,
    id: 'preview',
  };

  switch (placement) {
    case 'dashboard_banner':
      return (
        <div className="w-full">
          <SponsorBanner ad={previewAd} />
        </div>
      );
    case 'dashboard_sidebar':
      return (
        <div className="w-full max-w-xs">
          <SponsorSidebarAd ad={previewAd} />
        </div>
      );
    case 'course_player_sidebar':
      return (
        <div className="w-full max-w-xs">
          <SponsorCoursePlayerAd ad={previewAd} />
        </div>
      );
    case 'course_listing':
      return (
        <div className="w-full max-w-sm">
          <SponsorAdCard ad={previewAd} />
        </div>
      );
    default:
      return (
        <div className="w-full">
          <SponsorAdCard ad={previewAd} />
        </div>
      );
  }
}

export default SponsorAdPreview;
