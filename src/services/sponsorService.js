// Sponsor Service - For users who want to become sponsors
// This service manages sponsor ad submissions, payments, and approvals

// import apiClient from './apiClient'; // Uncomment when ready for backend integration

// Helper function to generate unique IDs for mock data
const generateId = () =>
  `sponsor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Storage key for sponsor submissions
const STORAGE_KEY = 'sponsor_submissions';

// Initial dummy data for demonstration
const createDummyData = userId => [
  {
    id: 'sponsor_demo_001',
    userId: userId,
    title: 'Master Financial Freedom Course',
    description:
      'Learn advanced credit strategies and financial planning. Transform your financial future with our comprehensive course covering credit management, debt elimination, and wealth building.',
    mediaType: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=400&fit=crop',
    placement: 'dashboard_banner',
    ctaText: 'Enroll Now',
    ctaUrl: 'https://example.com/financial-freedom',
    tier: 'Gold',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    targetRoles: ['student'],
    status: 'active',
    paymentStatus: 'paid',
    impressions: 15420,
    clicks: 892,
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sponsor_demo_002',
    userId: userId,
    title: 'Credit Repair Masterclass',
    description:
      'Professional credit repair strategies that actually work. Get your credit score to 750+ with proven methods used by financial experts.',
    mediaType: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop',
    placement: 'dashboard_sidebar',
    ctaText: 'Learn More',
    ctaUrl: 'https://example.com/credit-repair',
    tier: 'Silver',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    targetRoles: ['student'],
    status: 'active',
    paymentStatus: 'paid',
    impressions: 8340,
    clicks: 445,
    submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sponsor_demo_003',
    userId: userId,
    title: 'Business Credit Building Program',
    description:
      'Build business credit from scratch. Separate personal and business finances, establish vendor relationships, and secure business funding.',
    mediaType: 'banner',
    mediaUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop',
    placement: 'dashboard_banner',
    ctaText: 'Get Started',
    ctaUrl: 'https://example.com/business-credit',
    tier: 'Gold',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    targetRoles: ['student'],
    status: 'approved',
    paymentStatus: 'unpaid',
    impressions: 0,
    clicks: 0,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sponsor_demo_004',
    userId: userId,
    title: 'Investment Portfolio Management',
    description:
      'Learn to build and manage a diversified investment portfolio. From stocks to real estate, master the art of wealth creation and passive income.',
    mediaType: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
    placement: 'course_listing',
    ctaText: 'Start Investing',
    ctaUrl: 'https://example.com/investment',
    tier: 'Bronze',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    targetRoles: ['student'],
    status: 'pending',
    paymentStatus: 'unpaid',
    impressions: 0,
    clicks: 0,
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sponsor_demo_005',
    userId: userId,
    title: 'Tax Strategy & Optimization',
    description:
      'Maximize your tax refunds and minimize liabilities legally. Learn advanced tax strategies used by the wealthy to keep more of your money.',
    mediaType: 'card',
    placement: 'dashboard_sidebar',
    ctaText: 'Discover How',
    ctaUrl: 'https://example.com/tax-strategy',
    tier: 'Silver',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    targetRoles: ['student'],
    status: 'pending',
    paymentStatus: 'unpaid',
    impressions: 0,
    clicks: 0,
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sponsor_demo_006',
    userId: userId,
    title: 'Debt Elimination Bootcamp',
    description:
      'Get out of debt fast! Proven strategies to eliminate credit card debt, student loans, and become debt-free in record time.',
    mediaType: 'image',
    mediaUrl:
      'https://images.unsplash.com/photo-1633158829875-e5316a358c6f?w=600&h=400&fit=crop',
    placement: 'course_player_sidebar',
    ctaText: 'Break Free',
    ctaUrl: 'https://example.com/debt-free',
    tier: 'Bronze',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    targetRoles: ['student'],
    status: 'active',
    paymentStatus: 'paid',
    impressions: 4230,
    clicks: 187,
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Load sponsor submissions from localStorage
const loadSubmissions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      // If no data exists, create dummy data for the current user
      // This will auto-populate on first load
      return [];
    }
  } catch (error) {
    console.error('Error loading sponsor submissions:', error);
    return [];
  }
};

// Save sponsor submissions to localStorage
const saveSubmissions = submissions => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch (error) {
    console.error('Error saving sponsor submissions:', error);
  }
};

// Sponsor Service API
const sponsorService = {
  // Get all submissions for current user
  getMySubmissions: async userId => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/sponsor/submissions?userId=${userId}`);
      // return response.data;

      let submissions = loadSubmissions();

      // If no submissions exist for this user, create dummy data
      const userSubmissions = submissions.filter(sub => sub.userId === userId);
      if (userSubmissions.length === 0) {
        const dummyData = createDummyData(userId);
        submissions = [...submissions, ...dummyData];
        saveSubmissions(submissions);
        return dummyData;
      }

      return userSubmissions;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  },

  // Get submission by ID
  getSubmissionById: async submissionId => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/sponsor/submissions/${submissionId}`);
      // return response.data;

      const submissions = loadSubmissions();
      return submissions.find(sub => sub.id === submissionId);
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw error;
    }
  },

  // Create new sponsor ad submission
  createSubmission: async (userId, submissionData) => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post('/sponsor/submissions', submissionData);
      // return response.data;

      const submissions = loadSubmissions();
      const newSubmission = {
        id: generateId(),
        userId,
        ...submissionData,
        status: 'pending', // pending, approved, rejected, active, paused
        paymentStatus: 'unpaid', // unpaid, paid, refunded
        impressions: 0,
        clicks: 0,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      submissions.push(newSubmission);
      saveSubmissions(submissions);
      return newSubmission;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  },

  // Update submission
  updateSubmission: async (submissionId, updates) => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.put(`/sponsor/submissions/${submissionId}`, updates);
      // return response.data;

      const submissions = loadSubmissions();
      const index = submissions.findIndex(sub => sub.id === submissionId);

      if (index === -1) {
        throw new Error('Submission not found');
      }

      submissions[index] = {
        ...submissions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      saveSubmissions(submissions);
      return submissions[index];
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  },

  // Delete submission
  deleteSubmission: async submissionId => {
    try {
      // TODO: Replace with actual API call
      // await apiClient.delete(`/sponsor/submissions/${submissionId}`);

      const submissions = loadSubmissions();
      const filtered = submissions.filter(sub => sub.id !== submissionId);
      saveSubmissions(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  },

  // Initiate payment for ad
  initiatePayment: async (submissionId, tier) => {
    try {
      // TODO: Replace with actual API call to payment gateway
      // const response = await apiClient.post('/sponsor/payment/initiate', {
      //   submissionId,
      //   tier,
      // });
      // return response.data;

      // Mock payment data
      const prices = {
        Bronze: 99,
        Silver: 299,
        Gold: 599,
      };

      return {
        paymentUrl: `/dashboard/sponsor/payment/${submissionId}?tier=${tier}&amount=${prices[tier]}`,
        amount: prices[tier],
        currency: 'USD',
      };
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  },

  // Verify payment
  verifyPayment: async (submissionId, paymentId) => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post('/sponsor/payment/verify', {
      //   submissionId,
      //   paymentId,
      // });
      // return response.data;

      // Mock payment verification
      const submissions = loadSubmissions();
      const index = submissions.findIndex(sub => sub.id === submissionId);

      if (index !== -1) {
        submissions[index].paymentStatus = 'paid';
        submissions[index].paidAt = new Date().toISOString();
        saveSubmissions(submissions);
      }

      return { success: true };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  // Get pricing tiers
  getPricingTiers: async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/sponsor/pricing');
      // return response.data;

      return [
        {
          name: 'Bronze',
          price: 99,
          duration: '30 days',
          features: [
            'Course listing placement',
            'Low frequency display',
            'Basic analytics',
            'Up to 5,000 impressions',
          ],
        },
        {
          name: 'Silver',
          price: 299,
          duration: '30 days',
          features: [
            'Dashboard sidebar placement',
            'Medium frequency display',
            'Advanced analytics',
            'Up to 20,000 impressions',
            'Priority support',
          ],
        },
        {
          name: 'Gold',
          price: 599,
          duration: '30 days',
          features: [
            'Premium dashboard banner placement',
            'High frequency display',
            'Full analytics dashboard',
            'Unlimited impressions',
            'Priority support',
            'Featured placement',
          ],
        },
      ];
    } catch (error) {
      console.error('Error fetching pricing tiers:', error);
      throw error;
    }
  },

  // Get analytics for sponsor's ads
  getAnalytics: async userId => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/sponsor/analytics?userId=${userId}`);
      // return response.data;

      let submissions = loadSubmissions();

      // If no submissions exist, create dummy data first
      const allUserSubmissions = submissions.filter(
        sub => sub.userId === userId
      );
      if (allUserSubmissions.length === 0) {
        const dummyData = createDummyData(userId);
        submissions = [...submissions, ...dummyData];
        saveSubmissions(submissions);
      }

      const userAds = submissions.filter(
        sub => sub.userId === userId && sub.status === 'active'
      );

      const totalImpressions = userAds.reduce(
        (sum, ad) => sum + (ad.impressions || 0),
        0
      );
      const totalClicks = userAds.reduce(
        (sum, ad) => sum + (ad.clicks || 0),
        0
      );
      const ctr =
        totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      return {
        totalImpressions,
        totalClicks,
        ctr: parseFloat(ctr.toFixed(2)),
        activeAds: userAds.length,
        ads: userAds.map(ad => ({
          id: ad.id,
          title: ad.title,
          impressions: ad.impressions || 0,
          clicks: ad.clicks || 0,
          ctr:
            ad.impressions > 0
              ? parseFloat(((ad.clicks / ad.impressions) * 100).toFixed(2))
              : 0,
        })),
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },
};

export default sponsorService;
