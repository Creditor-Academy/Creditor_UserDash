// Mock data for Sponsor Ads Module
// This simulates backend data storage

// Helper function to generate unique IDs
const generateId = () =>
  `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Initial mock ads data
let mockAdsData = [
  {
    id: 'ad_001',
    sponsorName: 'ABC Corp',
    title: 'Upgrade Your Learning',
    description: 'Special offer for LMS users. Get 50% off on premium courses.',
    mediaType: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
    placement: 'dashboard_banner',
    ctaText: 'Learn More',
    ctaUrl: 'https://example.com',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    frequency: 'always',
    targetRoles: ['student'],
    targetCategories: [],
    targetBatches: [],
    tier: 'Gold',
    status: 'active',
    impressions: 12000,
    clicks: 400,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'ad_002',
    sponsorName: 'Tech Solutions Inc',
    title: 'Master New Skills',
    description: 'Join thousands of learners advancing their careers.',
    mediaType: 'card',
    mediaUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    placement: 'dashboard_sidebar',
    ctaText: 'Explore',
    ctaUrl: 'https://example.com/tech',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    frequency: 'always',
    targetRoles: ['student', 'teacher'],
    targetCategories: [],
    targetBatches: [],
    tier: 'Silver',
    status: 'active',
    impressions: 8500,
    clicks: 250,
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-10T14:20:00Z',
  },
  {
    id: 'ad_003',
    sponsorName: 'EduPlatform Pro',
    title: 'Premium Learning Tools',
    description: 'Access advanced features and resources.',
    mediaType: 'text',
    placement: 'course_player_sidebar',
    ctaText: 'Get Started',
    ctaUrl: 'https://example.com/edu',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    frequency: 'once_per_session',
    targetRoles: ['student'],
    targetCategories: ['Business', 'Technology'],
    targetBatches: [],
    tier: 'Gold',
    status: 'active',
    impressions: 5600,
    clicks: 180,
    createdAt: '2025-01-08T00:00:00Z',
    updatedAt: '2025-01-12T09:15:00Z',
  },
  {
    id: 'ad_004',
    sponsorName: 'LearnFast Academy',
    title: 'Accelerate Your Growth',
    description: 'Premium courses designed for professionals.',
    mediaType: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop',
    placement: 'course_listing',
    ctaText: 'Discover',
    ctaUrl: 'https://example.com/learnfast',
    startDate: '2025-01-15',
    endDate: '2025-08-31',
    frequency: 'low_frequency',
    targetRoles: ['student'],
    targetCategories: [],
    targetBatches: [],
    tier: 'Bronze',
    status: 'active',
    impressions: 3200,
    clicks: 95,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-18T11:45:00Z',
  },
  {
    id: 'ad_005',
    sponsorName: 'SkillBoost',
    title: 'Unlock Your Potential',
    description: 'Transform your career with expert-led courses.',
    mediaType: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=400&fit=crop',
    placement: 'dashboard_banner',
    ctaText: 'Watch Now',
    ctaUrl: 'https://example.com/skillboost',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    frequency: 'always',
    targetRoles: ['student'],
    targetCategories: [],
    targetBatches: [],
    tier: 'Gold',
    status: 'active',
    impressions: 2100,
    clicks: 65,
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-01-25T16:30:00Z',
  },
  {
    id: 'ad_006',
    sponsorName: 'EduTech Solutions',
    title: 'Learn Anytime, Anywhere',
    description:
      'Access premium courses on any device. Start your learning journey today!',
    mediaType: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop',
    placement: 'dashboard_banner',
    ctaText: 'Get Started',
    ctaUrl: 'https://example.com/edutech',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    frequency: 'always',
    targetRoles: ['student'],
    targetCategories: [],
    targetBatches: [],
    tier: 'Silver',
    status: 'active',
    impressions: 9800,
    clicks: 320,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 'ad_007',
    sponsorName: 'CareerBoost Academy',
    title: 'Advance Your Career',
    description:
      'Professional development courses designed by industry experts. Join 50,000+ professionals.',
    mediaType: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop',
    placement: 'dashboard_banner',
    ctaText: 'Explore Courses',
    ctaUrl: 'https://example.com/careerboost',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    frequency: 'always',
    targetRoles: ['student'],
    targetCategories: [],
    targetBatches: [],
    tier: 'Gold',
    status: 'active',
    impressions: 15200,
    clicks: 580,
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: '2025-01-22T10:15:00Z',
  },
  {
    id: 'ad_008',
    sponsorName: 'LearnSmart Pro',
    title: 'Master New Skills Fast',
    description:
      'Accelerated learning programs with hands-on projects. Get certified in 30 days.',
    mediaType: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=400&fit=crop',
    placement: 'dashboard_banner',
    ctaText: 'Start Learning',
    ctaUrl: 'https://example.com/learnsmart',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    frequency: 'always',
    targetRoles: ['student'],
    targetCategories: [],
    targetBatches: [],
    tier: 'Silver',
    status: 'active',
    impressions: 11200,
    clicks: 420,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-25T16:45:00Z',
  },
];

// Simulate localStorage for persistence
const STORAGE_KEY = 'sponsor_ads_data';

// Load data from localStorage or use initial data
const loadAdsData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      mockAdsData = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading ads data:', error);
  }
  return mockAdsData;
};

// Save data to localStorage
const saveAdsData = data => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    mockAdsData = data;
  } catch (error) {
    console.error('Error saving ads data:', error);
  }
};

// Initialize on load
loadAdsData();

// API-like functions for managing ads
const sponsorAdsService = {
  // Get all ads
  getAllAds: () => {
    return Promise.resolve([...loadAdsData()]);
  },

  // Get active ads for a specific placement
  getActiveAdsByPlacement: (
    placement,
    userRole = 'student',
    userCategory = null
  ) => {
    const ads = loadAdsData();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    return Promise.resolve(
      ads
        .filter(ad => {
          // Check placement
          if (ad.placement !== placement) return false;

          // Check status
          if (ad.status !== 'active') return false;

          // Check date range
          if (ad.startDate > today || ad.endDate < today) return false;

          // Check role targeting
          if (ad.targetRoles && ad.targetRoles.length > 0) {
            if (!ad.targetRoles.includes(userRole)) return false;
          }

          // Check category targeting (if provided)
          if (
            ad.targetCategories &&
            ad.targetCategories.length > 0 &&
            userCategory
          ) {
            if (!ad.targetCategories.includes(userCategory)) return false;
          }

          return true;
        })
        .sort((a, b) => {
          // Sort by tier priority: Gold > Silver > Bronze
          const tierOrder = { Gold: 3, Silver: 2, Bronze: 1 };
          return tierOrder[b.tier] - tierOrder[a.tier];
        })
    );
  },

  // Get ad by ID
  getAdById: id => {
    const ads = loadAdsData();
    const ad = ads.find(a => a.id === id);
    return Promise.resolve(ad || null);
  },

  // Create new ad
  createAd: adData => {
    const ads = loadAdsData();
    const newAd = {
      ...adData,
      id: generateId(),
      status: 'active',
      impressions: 0,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ads.push(newAd);
    saveAdsData(ads);
    return Promise.resolve(newAd);
  },

  // Update ad
  updateAd: (id, updates) => {
    const ads = loadAdsData();
    const index = ads.findIndex(a => a.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Ad not found'));
    }
    ads[index] = {
      ...ads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveAdsData(ads);
    return Promise.resolve(ads[index]);
  },

  // Delete ad
  deleteAd: id => {
    const ads = loadAdsData();
    const filtered = ads.filter(a => a.id !== id);
    saveAdsData(filtered);
    return Promise.resolve(true);
  },

  // Toggle ad status (pause/resume)
  toggleAdStatus: id => {
    const ads = loadAdsData();
    const index = ads.findIndex(a => a.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Ad not found'));
    }
    ads[index].status = ads[index].status === 'active' ? 'paused' : 'active';
    ads[index].updatedAt = new Date().toISOString();
    saveAdsData(ads);
    return Promise.resolve(ads[index]);
  },

  // Track impression
  trackImpression: id => {
    const ads = loadAdsData();
    const index = ads.findIndex(a => a.id === id);
    if (index !== -1) {
      ads[index].impressions = (ads[index].impressions || 0) + 1;
      saveAdsData(ads);
    }
  },

  // Track click
  trackClick: id => {
    const ads = loadAdsData();
    const index = ads.findIndex(a => a.id === id);
    if (index !== -1) {
      ads[index].clicks = (ads[index].clicks || 0) + 1;
      saveAdsData(ads);
    }
  },

  // Get analytics summary
  getAnalyticsSummary: () => {
    const ads = loadAdsData();
    const totalImpressions = ads.reduce(
      (sum, ad) => sum + (ad.impressions || 0),
      0
    );
    const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
    const overallCTR =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const activeAdsCount = ads.filter(ad => ad.status === 'active').length;

    return Promise.resolve({
      totalImpressions,
      totalClicks,
      overallCTR: parseFloat(overallCTR.toFixed(2)),
      activeAdsCount,
      ads: ads.map(ad => ({
        id: ad.id,
        title: ad.title,
        impressions: ad.impressions || 0,
        clicks: ad.clicks || 0,
        ctr:
          ad.impressions > 0
            ? parseFloat(((ad.clicks / ad.impressions) * 100).toFixed(2))
            : 0,
        type: ad.mediaType,
        tier: ad.tier,
      })),
    });
  },
};

// Export the service
export { sponsorAdsService };

// Export initial data for reference
export const initialMockAds = mockAdsData;
