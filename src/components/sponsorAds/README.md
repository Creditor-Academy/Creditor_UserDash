# Sponsor Ads Module

This module provides a complete sponsor advertising system for the LMS platform.

## Features

- **Admin Management**: Create, edit, manage, and analyze sponsor ads
- **Multiple Placements**: Dashboard banner, sidebar, course player, course listing, and popup ads
- **Targeting**: Role-based, category-based, and batch-based targeting
- **Analytics**: Track impressions, clicks, and CTR
- **Tier System**: Gold, Silver, Bronze tiers with priority display
- **Frequency Control**: Always show, once per session, or low frequency

## File Structure

```
src/
├── components/sponsorAds/
│   ├── SponsorAdCard.jsx          # Card component for course listing
│   ├── SponsorBanner.jsx           # Full-width banner component
│   ├── SponsorSidebarAd.jsx        # Sidebar ad component
│   ├── SponsorCoursePlayerAd.jsx   # Course player sidebar ad
│   ├── SponsorAdPopup.jsx          # Popup ad component
│   ├── SponsorAdPreview.jsx        # Preview component for admin
│   └── SponsorAdsContainer.jsx     # Container component
├── pages/sponsorAds/
│   ├── CreateAdPage.jsx            # Create new ad
│   ├── EditAdPage.jsx              # Edit existing ad
│   ├── ManageAdsPage.jsx           # Manage all ads
│   └── AnalyticsPage.jsx           # Analytics dashboard
├── data/
│   └── mockSponsorAds.js           # Mock data service
└── hooks/
    └── useSponsorAds.js            # Hook for loading ads
```

## Usage

### In Dashboard

Add to `src/pages/Dashboard.jsx`:

```jsx
import SponsorAdsContainer from '@/components/sponsorAds/SponsorAdsContainer';

// Banner ad at top
<SponsorAdsContainer placement="dashboard_banner" className="mb-6" />

// Sidebar ad in right column
<SponsorAdsContainer placement="dashboard_sidebar" className="mb-6" />
```

### In CourseView

Add to `src/pages/CourseView.jsx`:

```jsx
import SponsorAdsContainer from '@/components/sponsorAds/SponsorAdsContainer';

// In the right sidebar area
<SponsorAdsContainer placement="course_player_sidebar" />;
```

### In Courses Listing

Add to `src/pages/Courses.jsx`:

```jsx
import SponsorAdsContainer from '@/components/sponsorAds/SponsorAdsContainer';

// In the course grid
<SponsorAdsContainer placement="course_listing" />;
```

### Popup Ads

Popup ads are handled automatically via the `useSponsorAds` hook and session storage.

## Admin Access

Access the Sponsor Ads management via:

- Instructor Portal → Sponsor Ads menu item
- Direct routes:
  - `/instructor/sponsor-ads/create` - Create new ad
  - `/instructor/sponsor-ads/manage` - Manage ads
  - `/instructor/sponsor-ads/edit/:id` - Edit ad
  - `/instructor/sponsor-ads/analytics` - View analytics

## Data Storage

Currently uses localStorage for persistence. To integrate with backend:

1. Replace `sponsorAdsService` functions in `src/data/mockSponsorAds.js`
2. Update API calls to use your backend endpoints
3. Maintain the same data structure and function signatures

## Notes

- All ads are responsive and mobile-friendly
- Images/videos are lazy-loaded for performance
- Analytics tracking is automatic
- Ads respect date ranges and targeting rules
- Tier priority: Gold > Silver > Bronze
