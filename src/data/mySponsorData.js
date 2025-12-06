export const mySponsorRequests = [
  {
    id: 'req_001',
    sponsorName: 'XYZ Sponsor',
    adTitle: 'Boost Your Learning',
    description:
      'Special offer for LMS users to unlock premium content bundles tailor-made for finance cohorts.',
    mediaUrl:
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80',
    placement: 'dashboard_banner',
    budget: 5000,
    startDate: '2025-02-01',
    endDate: '2025-03-15',
    status: 'Pending',
    website: 'https://example.com/boost',
    notes: 'Looking for a two-week push before the new semester.',
  },
  {
    id: 'req_002',
    sponsorName: 'FocusLabs',
    adTitle: 'Pomodoro Pro Upgrade',
    description:
      'Give every learner a productivity boost with our Pomodoro Pro plan.',
    mediaUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    placement: 'course_player',
    budget: 3200,
    startDate: '2025-03-01',
    endDate: '2025-04-10',
    status: 'Approved',
    website: 'https://focuslabs.io',
    notes: '',
  },
];

export const mySponsorAds = [
  {
    id: 'req_001',
    sponsorName: 'XYZ Sponsor',
    adTitle: 'Boost Your Learning',
    description:
      'Special offer for LMS users to unlock premium content bundles tailor-made for finance cohorts.',
    mediaUrl:
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80',
    placement: 'dashboard_banner',
    budget: 5000,
    startDate: '2025-02-01',
    endDate: '2025-03-15',
    status: 'Pending',
    website: 'https://example.com/boost',
    type: 'Image',
  },
  {
    id: 'req_002',
    sponsorName: 'FocusLabs',
    adTitle: 'Pomodoro Pro Upgrade',
    description:
      'Give every learner a productivity boost with our Pomodoro Pro plan.',
    mediaUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    placement: 'course_player',
    budget: 3200,
    startDate: '2025-03-01',
    endDate: '2025-04-10',
    status: 'Approved',
    website: 'https://focuslabs.io',
    type: 'Text+CTA',
  },
  {
    id: 'req_003',
    sponsorName: 'Nova FinServe',
    adTitle: 'Scholar Card',
    description: 'Earn tiered rewards every time you enroll or upgrade.',
    mediaUrl:
      'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=900&q=80',
    placement: 'sidebar_ad',
    budget: 2800,
    startDate: '2025-01-10',
    endDate: '2025-02-28',
    status: 'Rejected',
    website: 'https://nova.com/cards',
    type: 'Image',
  },
  {
    id: 'req_004',
    sponsorName: 'Lumen Devices',
    adTitle: 'Lecture-ready Tablets',
    description: 'Free stylus + extended warranty for Creditor learners.',
    mediaUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    placement: 'course_listing_page',
    budget: 4500,
    startDate: '2025-02-05',
    endDate: '2025-04-30',
    status: 'Paused',
    website: 'https://lumen.dev/tablets',
    type: 'Carousel',
  },
];

export const mySponsorAnalytics = [
  {
    adId: 'req_002',
    title: 'Pomodoro Pro Upgrade',
    adType: 'Text+CTA',
    impressions: 14800,
    clicks: 420,
    ctr: 2.84,
    timelineData: [
      { day: 'Mon', impressions: 1800 },
      { day: 'Tue', impressions: 2100 },
      { day: 'Wed', impressions: 2200 },
      { day: 'Thu', impressions: 1900 },
      { day: 'Fri', impressions: 2400 },
      { day: 'Sat', impressions: 1600 },
      { day: 'Sun', impressions: 1800 },
    ],
  },
  {
    adId: 'req_003',
    title: 'Scholar Card',
    adType: 'Image',
    impressions: 9600,
    clicks: 180,
    ctr: 1.87,
    timelineData: [
      { day: 'Mon', impressions: 1100 },
      { day: 'Tue', impressions: 1200 },
      { day: 'Wed', impressions: 1400 },
      { day: 'Thu', impressions: 1300 },
      { day: 'Fri', impressions: 1500 },
      { day: 'Sat', impressions: 1000 },
      { day: 'Sun', impressions: 1100 },
    ],
  },
  {
    adId: 'req_004',
    title: 'Lecture-ready Tablets',
    adType: 'Carousel',
    impressions: 17200,
    clicks: 510,
    ctr: 2.96,
    timelineData: [
      { day: 'Mon', impressions: 2000 },
      { day: 'Tue', impressions: 2300 },
      { day: 'Wed', impressions: 2500 },
      { day: 'Thu', impressions: 2400 },
      { day: 'Fri', impressions: 2600 },
      { day: 'Sat', impressions: 1700 },
      { day: 'Sun', impressions: 1700 },
    ],
  },
];
