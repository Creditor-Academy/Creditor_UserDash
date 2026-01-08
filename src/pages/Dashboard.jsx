import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import ProgressStats from '@/components/dashboard/ProgressStats';
import CourseCard from '@/components/dashboard/CourseCard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCredits } from '@/contexts/CreditsContext';
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Target,
  Clock,
  ChevronLeft,
  CheckCircle,
  Search,
  MonitorPlay,
  Award,
  Video,
} from 'lucide-react';

import { Link } from 'react-router-dom';
import DashboardCarousel from '@/components/dashboard/DashboardCarousel';
import DashboardGroup from '@/components/dashboard/DashboardGroup';
import UpcomingCourses from '@/pages/UpcomingCourses';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import DashboardTodo from '@/components/dashboard/DashboardTodo';
import MonthlyProgress from '@/components/dashboard/MonthlyProgress';
import DashboardAnnouncements from '@/components/dashboard/DashboardAnnouncements';
import LiveClasses from '@/components/dashboard/LiveClasses';
import CreditPurchaseModal from '@/components/credits/CreditPurchaseModal';
import SponsorBanner from '@/components/sponsorAds/SponsorBanner';
import SponsorSidebarAd from '@/components/sponsorAds/SponsorSidebarAd';
import SponsorAdPopup from '@/components/sponsorAds/SponsorAdPopup';
import axios from 'axios';
import { fetchUserCourses } from '../services/courseService';
import { useUser } from '@/contexts/UserContext';
import { getAuthHeader } from '../services/authHeader'; // adjust path as needed
import { getCourseTrialStatus } from '../utils/trialUtils';
import {
  bookConsultation,
  fetchUserConsultations,
} from '../services/consultationService';
import {
  bookWebsiteService,
  fetchUserWebsiteServices,
} from '../services/websiteService';
import CLogo from '@/assets/C-logo2.png';
import OfferPopup from '@/components/offer/OfferPopup';
import { useSponsorAds } from '@/contexts/SponsorAdsContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchDashboardSponsorAds } from '@/services/sponsorAdsService';

export function Dashboard() {
  const importantUpdateStyles = `
    .important-updates-wrapper {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
    .important-update-card {
      width: 100%;
      max-width: 100%;
      height: auto;
      min-height: fit-content;
      box-sizing: border-box;
      padding: clamp(10px, 1.6vw, 18px);
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow-y: auto;
      overflow-x: visible;
    }
    .important-update-card h4 {
      font-size: clamp(14px, 1.3vw, 18px);
      line-height: 1.2;
    }
    .important-update-card p {
      font-size: clamp(12px, 1.05vw, 15px);
      word-wrap: break-word;
      white-space: normal;
    }
    .important-update-card button {
      white-space: nowrap;
      align-self: flex-start;
    }
    @media (max-width: 768px) {
      .important-update-card {
        padding: clamp(10px, 4vw, 18px);
      }
    }
    @media (min-width: 1440px) {
      .important-updates-wrapper {
        max-width: 720px;
        margin-left: auto;
        margin-right: auto;
      }
    }
    .important-updates-scroll {
      scrollbar-width: none;
      -ms-overflow-style: none;
      scroll-behavior: smooth;
    }
    .important-updates-scroll::-webkit-scrollbar {
      height: 6px;
      background: transparent;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .important-updates-scroll::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 9999px;
    }
    .important-updates-scroll:hover::-webkit-scrollbar {
      opacity: 1;
    }
    .vcm-video {
      width: 100%;
      height: auto;
      max-height: 300px;
      object-fit: cover;
      border-radius: 8px;
      display: block;
    }
    @media (max-width: 768px) {
      .vcm-video {
        max-height: 200px;
      }
    }


  `;

  const { userProfile } = useUser();
  const { balance, membership, refreshBalance } = useCredits();
  const { userRole } = useAuth();
  const { getPrimaryAdForPlacement, getActiveAdsByPlacement } = useSponsorAds();
  const [isSponsorPopupOpen, setIsSponsorPopupOpen] = useState(false);
  const [bannerCarouselIndex, setBannerCarouselIndex] = useState(0);
  const [sidebarCarouselIndex, setSidebarCarouselIndex] = useState(0);

  const [dashboardBannerAds, setDashboardBannerAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [dashboardSidebarAds, setDashboardSidebarAds] = useState([]);

  useEffect(() => {
    const loadDashboardAds = async () => {
      try {
        const ads = await fetchDashboardSponsorAds();

        const now = new Date();

        // 🔹 SIDEBAR ADS
        const sidebarAds = ads
          .filter(ad => {
            if (ad.position !== 'SIDEBAR') return false;
            if (ad.status !== 'ACTIVE') return false;

            const now = new Date();
            const start = ad.start_date ? new Date(ad.start_date) : null;
            const end = ad.end_date ? new Date(ad.end_date) : null;

            if (start && now < start) return false;
            if (end && now > end) return false;

            return true;
          })
          .map(ad => ({
            id: ad.id,
            title: ad.title,
            description: ad.description,
            sponsorName: ad.sponsor_name,
            mediaUrl: ad.video_url || ad.image_url, // ✅ REQUIRED
            mediaType: ad.video_url ? 'video' : 'image', // ✅ REQUIRED
            ctaText: ad.link_url ? 'Learn more' : '',
            ctaUrl: ad.link_url,
          }))
          .slice(0, 5);

        setDashboardSidebarAds(sidebarAds);

        // 🔹 DASHBOARD BANNER ADS
        const bannerAds = ads
          .filter(ad => ad.position === 'DASHBOARD' && ad.status === 'ACTIVE')
          .map(ad => ({
            id: ad.id,
            title: ad.title,
            description: ad.description,
            sponsorName: ad.sponsor_name,
            mediaUrl: ad.image_url || ad.video_url,
            mediaType: ad.video_url ? 'video' : 'image',
            ctaUrl: ad.link_url,
            ctaText: ad.link_url ? 'Learn more' : '',
            tier: ad.tier || 'Gold',
          }));

        setDashboardBannerAds(bannerAds);
      } catch (err) {
        console.error(err);
      }
    };

    loadDashboardAds();
  }, []);

  useEffect(() => {
    setSidebarCarouselIndex(0);
  }, [dashboardSidebarAds.length]);

  const popupAd = useMemo(
    () => getPrimaryAdForPlacement('popup', { role: userRole }),
    [getPrimaryAdForPlacement, userRole]
  );

  useEffect(() => {
    if (!popupAd) return;
    const storageKey = `sponsor_popup_${popupAd.id}`;
    if (
      popupAd.frequency === 'once_per_session' &&
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem(storageKey)
    ) {
      return;
    }
    const shouldShow =
      popupAd.frequency === 'always' ||
      popupAd.frequency === 'once_per_session' ||
      (popupAd.frequency === 'low' && Math.random() < 0.4);
    if (!shouldShow) return;
    const timer = setTimeout(() => {
      setIsSponsorPopupOpen(true);
      if (
        popupAd.frequency === 'once_per_session' &&
        typeof window !== 'undefined'
      ) {
        window.sessionStorage.setItem(storageKey, 'shown');
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [popupAd]);

  // Auto-rotate banner carousel every 10 seconds
  useEffect(() => {
    if (dashboardBannerAds.length <= 1) return;

    const interval = setInterval(() => {
      setBannerCarouselIndex(prev =>
        prev === dashboardBannerAds.length - 1 ? 0 : prev + 1
      );
    }, 10000); // Rotate every 10 seconds

    return () => clearInterval(interval);
  }, [dashboardBannerAds.length]);

  // Reset carousel index when ads change
  useEffect(() => {
    setBannerCarouselIndex(0);
  }, [dashboardBannerAds.length]);

  // Auto-rotate sidebar carousel every 5-6 seconds (randomized between 5-6)
  useEffect(() => {
    if (dashboardSidebarAds.length <= 1) return;

    const getRandomInterval = () => Math.random() * 1000 + 5000; // 5000-6000ms

    let timeoutId;
    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        setSidebarCarouselIndex(prev =>
          prev === dashboardSidebarAds.length - 1 ? 0 : prev + 1
        );
        scheduleNext();
      }, getRandomInterval());
    };

    scheduleNext();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [dashboardSidebarAds.length]);

  // Reset sidebar carousel index when ads change
  useEffect(() => {
    setSidebarCarouselIndex(0);
  }, [dashboardSidebarAds.length]);

  // DEFENSIVE: Debounced refresh to prevent triggering infinite loops in other components
  const refreshBalanceRef = useRef(null);
  const importantUpdatesScrollRef = useRef(null);
  const debouncedRefreshBalance = useCallback(() => {
    if (refreshBalanceRef.current) {
      clearTimeout(refreshBalanceRef.current);
    }
    refreshBalanceRef.current = setTimeout(() => {
      if (refreshBalance) {
        refreshBalance();
      }
    }, 1000); // 1 second debounce to prevent cascade effects
  }, [refreshBalance]);

  // DEFENSIVE: Cleanup debounced refresh on unmount
  useEffect(() => {
    return () => {
      if (refreshBalanceRef.current) {
        clearTimeout(refreshBalanceRef.current);
      }
    };
  }, []);

  // DEFENSIVE: Memoize userProfile to prevent unnecessary re-renders
  const memoizedUserProfile = useMemo(() => userProfile, [userProfile?.id]);

  // Dashboard data structure based on backend getUserOverview endpoint
  // Expected response structure:
  // {
  //   summary: { activeCourses, completedCourses, totalLearningHours, averageProgress },
  //   weeklyPerformance: { studyHours, lessonsCompleted },
  //   monthlyProgressChart: [...],
  //   learningActivities: [...]
  // }
  //
  // NOTE: Using the working endpoints from your backend:
  // - /api/course/getCourses - for user courses
  // - /api/user/getUserProfile - for user profile
  //
  // The dashboard shows basic stats based on available data.
  // Progress tracking, time tracking, and detailed analytics will be added
  // when those features are implemented in the backend.
  const [dashboardData, setDashboardData] = useState({
    summary: {
      activeCourses: 0,
      completedCourses: 0,
      totalLearningHours: 0,
      averageProgress: 0,
    },
    weeklyPerformance: {
      studyHours: 0,
      lessonsCompleted: 0,
    },
    monthlyProgressChart: [],
    learningActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [userCourses, setUserCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [userCoursesMap, setUserCoursesMap] = useState({});
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showConsultInfo, setShowConsultInfo] = useState(false);
  const [showConsultBooking, setShowConsultBooking] = useState(false);
  const [showConsultConfirmation, setShowConsultConfirmation] = useState(false);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState('consultations'); // 'consultations' | 'website'
  const CONSULT_COST = 1000; // credits for 30 mins
  const [showWebsiteModal, setShowWebsiteModal] = useState(false);
  const WEBSITE_PACKS = [
    {
      id: 'basic',
      name: 'Basic Website',
      cost: 750,
      blurb: '2-3 pages with essential features',
      features: [
        'Custom Logo',
        'Contact Form',
        'Mobile Responsive',
        'SSL Security',
        'Hosting & Maintenance',
      ],
      icon: '🌐',
    },
    {
      id: 'premium',
      name: 'Premium Website',
      cost: 5000,
      blurb: '5-7+ custom pages with advanced features',
      features: [
        'Premium Design',
        'User Dashboard',
        'Member Portal',
        'Backend Integration',
        'SEO Optimization',
        'Live Chat',
      ],
      icon: '🚀',
    },
  ];
  const [selectedWebsitePack, setSelectedWebsitePack] = useState(
    WEBSITE_PACKS[0]
  );

  const [showWebsiteDetails, setShowWebsiteDetails] = useState(false);
  const [showWebsiteConfirmation, setShowWebsiteConfirmation] = useState(false);
  const [showWebsiteForm, setShowWebsiteForm] = useState(false);

  // Loading and error states for bookings
  const [isBookingConsultation, setIsBookingConsultation] = useState(false);
  const [isBookingWebsite, setIsBookingWebsite] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // History data state
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [websiteHistory, setWebsiteHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    'https://creditor-backend-testing-branch.onrender.com';
  // Get userId from localStorage or cookies, or fetch from profile
  // Don't use state for userId to avoid infinite loops - get it directly when needed

  const fetchUserOverview = async () => {
    try {
      setLoading(true);

      // Get userId - use from context if available, otherwise fetch from profile
      let currentUserId = localStorage.getItem('userId');
      if (!currentUserId && userProfile) {
        currentUserId = userProfile.id;
        localStorage.setItem('userId', currentUserId);
      } else if (!currentUserId) {
        currentUserId = await fetchUserProfile();
      }

      if (!currentUserId) {
        throw new Error('Unable to get user ID. Please log in again.');
      }

      // Use the new user progress endpoint from your backend
      try {
        const { api } = await import('@/services/apiClient');
        const progressResponse = await api.get(
          '/api/user/dashboard/userProgress'
        );
        const progressData = progressResponse?.data?.data || {};

        const allEnrolledCoursesCount =
          Number(progressData.allEnrolledCoursesCount) || 0;
        const completedCourses = Number(progressData.completedCourseCount) || 0;
        const modulesCompleted =
          Number(progressData.modulesCompletedCount) || 0;
        const assessmentsCompleted =
          Number(progressData.quizCompletedCount) || 0;
        const pendingCoursesCount =
          Number(progressData.pendingCoursesCount) || 0;

        const newDashboardData = {
          summary: {
            allEnrolledCoursesCount,
            completedCourses,
            totalLearningHours: 0, // Not provided by backend yet
            averageProgress: 0, // Not provided by backend yet
            modulesCompleted,
            assessmentsCompleted,
            pendingCoursesCount,
          },
          weeklyPerformance: {
            studyHours: 0, // Placeholder until backend provides
            lessonsCompleted: allEnrolledCoursesCount,
          },
          monthlyProgressChart: [],
          learningActivities: [],
        };

        setDashboardData(newDashboardData);
      } catch (progressError) {
        console.error('❌ Failed to fetch user progress:', progressError);
        console.error('❌ Error details:', {
          message: progressError.message,
          status: progressError.response?.status,
          data: progressError.response?.data,
        });
        // Set default values if endpoint fails
        setDashboardData({
          summary: {
            allEnrolledCoursesCount: 0,
            completedCourses: 0,
            totalLearningHours: 0,
            averageProgress: 0,
            modulesCompleted: 0,
            assessmentsCompleted: 0,
            pendingCoursesCount: 0,
          },
          weeklyPerformance: {
            studyHours: 0,
            lessonsCompleted: 0,
          },
          monthlyProgressChart: [],
          learningActivities: [],
        });
      }
    } catch (err) {
      console.error('Error fetching user overview:', err);

      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else if (err.response?.status === 403) {
        setError(
          'Access denied. You do not have permission to view this data.'
        );
      } else if (err.response?.status === 404) {
        setError('User data not found. Please contact support.');
      } else {
        setError(
          err.message || 'Failed to load dashboard data. Please try again.'
        );
      }

      // Set default values if API fails
      setDashboardData({
        summary: {
          allEnrolledCoursesCount: 0,
          completedCourses: 0,
          totalLearningHours: 0,
          averageProgress: 0,
          modulesCompleted: 0,
          assessmentsCompleted: 0,
          pendingCoursesCount: 0,
        },
        weeklyPerformance: {
          studyHours: 0,
          lessonsCompleted: 0,
        },
        monthlyProgressChart: [],
        learningActivities: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always try to fetch user overview - UserContext handles authentication
    fetchUserOverview();
  }, []); // Remove userId dependency to prevent infinite loop

  // Recording course IDs to filter out from My Courses
  const RECORDING_COURSE_IDS = [
    'a188173c-23a6-4cb7-9653-6a1a809e9914', // Become Private Recordings
    '7b798545-6f5f-4028-9b1e-e18c7d2b4c47', // Operate Private Recordings
    '199e328d-8366-4af1-9582-9ea545f8b59e', // Business Credit Recordings
    'd8e2e17f-af91-46e3-9a81-6e5b0214bc5e', // Private Merchant Recordings
    'd5330607-9a45-4298-8ead-976dd8810283', // Sovereignty 101 Recordings
    '814b3edf-86da-4b0d-bb8c-8a6da2d9b4df', // I Want Remedy Now Recordings
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const data = await fetchUserCourses();
        // Filter out recording courses from My Courses
        const filteredData = data.filter(
          course => !RECORDING_COURSE_IDS.includes(course.id)
        );

        // Process courses to include module counts, durations, and trial status
        const processedCourses = filteredData.map(course => {
          const trialStatus = getCourseTrialStatus(course);
          return {
            ...course,
            // Use _count.modules from the API response
            modulesCount: course._count?.modules || 0,
            totalDurationSecs: 0, // This can be updated if duration is available in the course data
            image:
              course.thumbnail ||
              course.image ||
              'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000',
            trialStatus,
          };
        });

        setUserCourses(processedCourses);
      } catch (err) {
        setCoursesError('Failed to fetch courses');
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch user profile to get userId and userName if not available
  const fetchUserProfile = async () => {
    try {
      // Backend's HttpOnly token cookie will be automatically sent with the request
      const response = await axios.get(`${API_BASE}/api/user/getUserProfile`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (response.data && response.data.data && response.data.data.id) {
        const userProfile = response.data.data;
        // Set user name for welcome message
        const name =
          `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
        setUserName(name || userProfile.email || 'User');
        return userProfile.id;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      throw err;
    }
  };

  // Use userProfile from context to set user name
  useEffect(() => {
    if (userProfile) {
      const name =
        `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
      setUserName(name || userProfile.email || 'User');
      // Set userId in localStorage when userProfile changes
      localStorage.setItem('userId', userProfile.id);

      // Fetch user history when profile is available
      fetchUserHistory();
    }
  }, [memoizedUserProfile]);

  // Auto-scroll for Important Updates section
  useEffect(() => {
    const scrollContainer = importantUpdatesScrollRef.current;
    if (!scrollContainer) return;

    let scrollTimeout = null;
    let currentIndex = 0;

    const stopScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
      }
    };

    const startScroll = () => {
      if (scrollTimeout) return;

      const cards = scrollContainer.querySelectorAll('.important-update-card');
      if (cards.length <= 1) {
        // No need to scroll if only one card
        return;
      }

      scrollTimeout = setTimeout(() => {
        // Use modulo to loop back to the start
        currentIndex = (currentIndex + 1) % cards.length;
        const nextCard = cards[currentIndex];

        if (nextCard) {
          let scrollLeft;
          // When looping to the first card, scroll to the absolute beginning.
          if (currentIndex === 0) {
            scrollLeft = 0;
          } else {
            // Otherwise, calculate the position of the next card.
            const parentRect = scrollContainer.getBoundingClientRect();
            const childRect = nextCard.getBoundingClientRect();
            scrollLeft =
              childRect.left - parentRect.left + scrollContainer.scrollLeft;
          }

          scrollContainer.scrollTo({
            left: scrollLeft,
            behavior: 'smooth',
          });
        }

        // Reset and schedule the next scroll
        scrollTimeout = null;
        startScroll();
      }, 6000);
    };

    scrollContainer.addEventListener('mouseenter', stopScroll);
    scrollContainer.addEventListener('mouseleave', startScroll);

    // Start the initial scroll
    startScroll();

    return () => {
      stopScroll();
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', stopScroll);
        scrollContainer.removeEventListener('mouseleave', startScroll);
      }
    };
  }, []);

  // Add retry functionality
  const handleRetry = () => {
    setError(null);
    fetchUserOverview();
  };

  // Fetch user history
  const fetchUserHistory = async () => {
    if (!memoizedUserProfile?.id) return;

    setHistoryLoading(true);
    setHistoryError('');

    try {
      console.log('[Dashboard] Fetching user history for:', userProfile.id);

      const [consultations, websites] = await Promise.all([
        fetchUserConsultations(userProfile.id),
        fetchUserWebsiteServices(userProfile.id),
      ]);

      console.log('[Dashboard] Consultation history:', consultations);
      console.log('[Dashboard] Website history:', websites);
      console.log('[Dashboard] Consultation data type:', typeof consultations);
      console.log('[Dashboard] Website data type:', typeof websites);
      console.log(
        '[Dashboard] Consultation is array:',
        Array.isArray(consultations)
      );
      console.log('[Dashboard] Website is array:', Array.isArray(websites));

      // Process consultation history
      const processedConsultations = Array.isArray(consultations)
        ? consultations.map(consultation => ({
            id: consultation.id,
            date: new Date(consultation.created_at).toLocaleDateString(),
            title: 'Consultation Session',
            credits: consultation.pricing?.credits || 1000, // Use actual pricing from backend
            status: consultation.status?.toLowerCase() || 'pending',
          }))
        : [];

      // Process website history
      const processedWebsites = Array.isArray(websites)
        ? websites.map(website => {
            // Determine service type and cost from pricing data
            const cost = website.pricing?.credits || 750; // Default to basic if no pricing data
            const serviceType = cost >= 5000 ? 'Premium' : 'Basic'; // Use cost to determine type

            return {
              id: website.id,
              date: new Date(website.created_at).toLocaleDateString(),
              title: `${serviceType} Website Service`,
              credits: cost,
              status: website.status?.toLowerCase() || 'pending',
            };
          })
        : [];

      setConsultationHistory(processedConsultations);
      setWebsiteHistory(processedWebsites);
    } catch (error) {
      console.error('[Dashboard] Failed to fetch user history:', error);
      setHistoryError('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle consultation booking
  const handleConsultationBooking = async () => {
    if (!memoizedUserProfile?.id) {
      setBookingError('User not logged in');
      return;
    }

    setIsBookingConsultation(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      // Create a future date for scheduling (e.g., 1 week from now)
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 7);
      scheduledAt.setHours(14, 0, 0, 0); // 2 PM

      console.log('[Dashboard] Booking consultation for user:', userProfile.id);
      console.log('[Dashboard] Scheduled at:', scheduledAt.toISOString());

      // Call the consultation booking API
      const result = await bookConsultation(
        userProfile.id,
        scheduledAt.toISOString()
      );

      console.log('[Dashboard] Consultation booking successful:', result);

      // Refresh balance to reflect credit deduction (with small delay for backend processing)
      try {
        console.log('[Dashboard] Current balance before refresh:', balance);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for backend processing
        debouncedRefreshBalance();
        console.log('[Dashboard] Balance refreshed after consultation booking');
        // Note: balance will be updated by the CreditsContext, check the UI for the new value
      } catch (refreshError) {
        console.warn('[Dashboard] Failed to refresh balance:', refreshError);
      }

      // Show success message
      setBookingSuccess(
        `Consultation redirection successfull! ${CONSULT_COST} credits deducted.`
      );

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setBookingSuccess('');
      }, 5000);

      // Refresh history to show new booking
      await fetchUserHistory();

      // Close the confirmation modal and show form
      setShowConsultConfirmation(false);
      setShowConsultForm(true);
    } catch (error) {
      console.error('[Dashboard] Consultation booking failed:', error);
      setBookingError(
        error?.response?.data?.message ||
          'Failed to book consultation. Please try again.'
      );
    } finally {
      setIsBookingConsultation(false);
    }
  };

  // Handle website service booking
  const handleWebsiteServiceBooking = async () => {
    if (!memoizedUserProfile?.id) {
      setBookingError('User not logged in');
      return;
    }

    setIsBookingWebsite(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      const serviceType = selectedWebsitePack.id; // 'basic' or 'premium'

      console.log(
        '[Dashboard] Booking website service for user:',
        userProfile.id
      );
      console.log('[Dashboard] Service type:', serviceType);

      // Call the website service booking API
      const result = await bookWebsiteService(userProfile.id, serviceType);

      console.log('[Dashboard] Website service booking successful:', result);

      // Refresh balance to reflect credit deduction (with small delay for backend processing)
      try {
        console.log('[Dashboard] Current balance before refresh:', balance);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for backend processing
        debouncedRefreshBalance();
        console.log(
          '[Dashboard] Balance refreshed after website service booking'
        );
        // Note: balance will be updated by the CreditsContext, check the UI for the new value
      } catch (refreshError) {
        console.warn('[Dashboard] Failed to refresh balance:', refreshError);
      }

      // Show success message
      setBookingSuccess(
        `${selectedWebsitePack.name} booked successfully! ${selectedWebsitePack.cost} credits deducted.`
      );

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setBookingSuccess('');
      }, 5000);

      // Refresh history to show new booking
      await fetchUserHistory();

      // Close the confirmation modal and show form
      setShowWebsiteConfirmation(false);
      setShowWebsiteForm(true);
    } catch (error) {
      console.error('[Dashboard] Website service booking failed:', error);
      setBookingError(
        error?.response?.data?.message ||
          'Failed to book website service. Please try again.'
      );
    } finally {
      setIsBookingWebsite(false);
    }
  };

  const inProgressCourses = [
    {
      id: '1',
      title: 'Constitutional Law Fundamentals',
      description:
        'Learn the essentials of US constitutional law including rights, powers, and judicial review.',
      image:
        'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?q=80&w=1000',
      progress: 62,
      lessonsCount: 42,
      category: 'Legal Studies',
      duration: '25 hours',
    },
    {
      id: '2',
      title: 'Civil Litigation Procedure',
      description:
        'Master the procedures and strategies involved in civil litigation in American courts.',
      image:
        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1000',
      progress: 35,
      lessonsCount: 28,
      category: 'Legal Practice',
      duration: '18 hours',
    },
    {
      id: '3',
      title: 'Criminal Law and Procedure',
      description:
        'Study the principles of criminal law, defenses, and procedural requirements in the US justice system.',
      image:
        'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=1000',
      progress: 78,
      lessonsCount: 36,
      category: 'Criminal Justice',
      duration: '22 hours',
    },
    {
      id: '4',
      title: 'Intellectual Property Law',
      description:
        'Explore copyright, trademark, and patent law with real-world case studies.',
      image:
        'https://images.unsplash.com/photo-1464983953574-0892a716854b?q=80&w=1000',
      progress: 50,
      lessonsCount: 30,
      category: 'IP Law',
      duration: '20 hours',
    },
    {
      id: '5',
      title: 'Family Law Essentials',
      description:
        'Understand the basics of family law, including divorce, custody, and adoption.',
      image:
        'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1000',
      progress: 20,
      lessonsCount: 18,
      category: 'Family Law',
      duration: '12 hours',
    },
    {
      id: '6',
      title: 'International Business Law',
      description:
        'Gain insights into cross-border transactions, trade regulations, and dispute resolution.',
      image:
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=1000',
      progress: 10,
      lessonsCount: 25,
      category: 'Business Law',
      duration: '16 hours',
    },
  ];

  const recommendedCourses = [
    // No upcoming courses at the moment
  ];

  // Carousel state for My Courses
  const courseScrollRef = useRef(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : true
  );
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const visibleCards = isSmallScreen ? 1 : 2;
  const totalCards = userCourses.length;

  const shimmerCardCount = useMemo(() => {
    const enrolledCount =
      Number(dashboardData.summary?.allEnrolledCoursesCount) || 0;
    const baseCount = Math.max(visibleCards, 2);
    if (enrolledCount > 0) {
      return Math.max(Math.min(enrolledCount, 4), baseCount);
    }
    return baseCount;
  }, [dashboardData.summary?.allEnrolledCoursesCount, visibleCards]);

  const CourseShimmerCard = () => (
    <div className="h-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="aspect-[16/9] relative bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
      </div>
      <div className="flex-1 flex flex-col p-4 space-y-4">
        <div className="space-y-2">
          <div className="h-5 rounded-md bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
          </div>
          <div className="h-4 rounded-md bg-gray-200 relative overflow-hidden w-3/4">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
          </div>
          <div className="h-4 rounded-md bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="h-4 w-20 rounded-full bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
          </div>
          <div className="h-4 w-16 rounded-full bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
          </div>
          <div className="h-4 w-24 rounded-full bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
          </div>
        </div>
        <div className="mt-auto space-y-3">
          <div className="h-4 w-28 rounded-md bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
          </div>
          <div className="h-10 rounded-xl bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleScroll = direction => {
    let newIndex = scrollIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex > totalCards - visibleCards)
      newIndex = totalCards - visibleCards;
    setScrollIndex(newIndex);
    if (courseScrollRef.current) {
      const cardWidth = courseScrollRef.current.firstChild?.offsetWidth || 320;
      const scrollAmount = newIndex * (cardWidth + 16); // 16px gap (gap-4)
      courseScrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const courseSectionTitle = 'My Courses';

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <main className="flex-1">
        <div className="w-full px-3 sm:px-4 md:px-6 py-6 max-w-7xl mx-auto">
          <section className="athena-hero-banner mb-8">
            <div className="athena-hero-content">
              <p className="athena-hero-kicker">Welcome Back</p>
              <h1>Welcome to Athena LMS, {userName || 'Scholar'}!</h1>
              <p>
                Your journey to knowledge excellence continues. Track your
                progress, unlock achievements, and reach your learning goals.
              </p>
              <div className="athena-hero-cta">
                <span className="progress-pill">📊 Track Progress</span>
                <span className="achievement-pill">🎯 Unlock Achievements</span>
              </div>
            </div>
            <div className="athena-hero-visual">
              <img src={CLogo} alt="Creditor Academy Logo" loading="lazy" />
              <div className="floating-glow" aria-hidden="true" />
            </div>
          </section>

          {/* Top grid section - align greeting with latest updates */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6 relative z-0">
            {/* Left section - greeting and latest updates */}
            <div className="xl:col-span-8 space-y-4">
              {/* Enhanced Greeting Section */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <div className="absolute inset-0 animate-gradient-shift bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-500/10"></div>
                <div className={`relative z-10 p-4 sm:p-5 backdrop-blur-sm`}>
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600">
                      <GraduationCap className="text-white w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold mb-1 leading-tight break-words bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Welcome back{userName ? `, ${userName}` : ''}!
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base leading-snug">
                        Continue your private education journey and achieve your
                        learning goals.
                      </p>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-700 text-sm">
                            Failed to load dashboard data
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRetry}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* LMS info placeholders to keep layout length consistent */}
                  <div className="mt-4 px-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>What we offer</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 px-1">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-blue-600 w-6 h-6" />
                        <span className="text-blue-800 font-semibold">
                          Reliable
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mt-2">
                        24/7 uptime with active monitoring.
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center gap-2">
                        <BookOpen className="text-emerald-600 w-6 h-6" />
                        <span className="text-emerald-800 font-semibold">
                          Guided
                        </span>
                      </div>
                      <p className="text-sm text-emerald-700 mt-2">
                        Clear paths from basics to mastery.
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <div className="flex items-center gap-2">
                        <Award className="text-orange-600 w-6 h-6" />
                        <span className="text-orange-800 font-semibold">
                          Certified
                        </span>
                      </div>
                      <p className="text-sm text-orange-700 mt-2">
                        Earn credentials you can share.
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                      <div className="flex items-center gap-2">
                        <MonitorPlay className="text-purple-600 w-6 h-6" />
                        <span className="text-purple-800 font-semibold">
                          Flexible
                        </span>
                      </div>
                      <p className="text-sm text-purple-700 mt-2">
                        Live sessions plus on‑demand replays.
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                      <div className="flex items-center gap-2">
                        <Clock className="text-yellow-600 w-6 h-6" />
                        <span className="text-yellow-800 font-semibold">
                          Evolving
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-2">
                        Continuous releases driven by feedback.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Courses Section (carousel with arrows) */}
              <div
                className={`mb-6 relative bg-white rounded-2xl shadow-lg border border-gray-200 p-4 `}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {courseSectionTitle}
                  </h2>
                  <Button
                    variant="outline"
                    asChild
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Link
                      to="/dashboard/courses"
                      className="flex items-center gap-2"
                    >
                      View all courses
                      <ChevronRight size={16} />
                    </Link>
                  </Button>
                </div>
                {/* Cards Row or Empty State */}
                {coursesLoading ? (
                  <div className="relative">
                    <div
                      className="flex gap-4 overflow-x-auto sm:overflow-x-hidden px-1 pb-1 custom-horizontal-scroll w-full"
                      aria-label="Loading your courses"
                    >
                      {Array.from({ length: shimmerCardCount }).map(
                        (_, idx) => (
                          <div
                            key={`course-shimmer-${idx}`}
                            className="w-full min-w-0 sm:min-w-[296px] sm:max-w-[296px] flex-shrink-0"
                          >
                            <CourseShimmerCard />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : userCourses && userCourses.length > 0 ? (
                  <div className="relative">
                    {/* Left Arrow */}
                    {scrollIndex > 0 && (
                      <button
                        onClick={() => handleScroll(-1)}
                        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full shadow-md p-2 hover:bg-blue-50 transition disabled:opacity-40"
                        style={{ marginLeft: '-24px' }}
                        aria-label="Scroll left"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    )}
                    {/* Cards Row */}
                    <div
                      ref={courseScrollRef}
                      className="flex gap-4 overflow-x-auto sm:overflow-x-hidden scroll-smooth px-1 pb-1 custom-horizontal-scroll w-full"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      {userCourses.map(course => (
                        <div
                          key={course.id}
                          className="w-full min-w-0 sm:min-w-[296px] sm:max-w-[296px] flex-shrink-0"
                        >
                          <CourseCard {...course} course={course} />
                        </div>
                      ))}
                    </div>
                    {/* Right Arrow */}
                    {scrollIndex < userCourses.length - visibleCards &&
                      userCourses.length > visibleCards && (
                        <button
                          onClick={() => handleScroll(1)}
                          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full shadow-md p-2 hover:bg-blue-50 transition disabled:opacity-40"
                          style={{ marginRight: '-24px' }}
                          aria-label="Scroll right"
                        >
                          <ChevronRight size={24} />
                        </button>
                      )}
                  </div>
                ) : (
                  <div
                    className={`flex flex-col items-center justify-center py-12`}
                  >
                    <div className="text-5xl mb-4 opacity-50">🎯</div>
                    <h3 className={`text-lg font-medium mb-2`}>
                      No courses enrolled
                    </h3>
                    <p className={`mb-4`}>
                      You are not enrolled in any courses yet.
                    </p>
                    <Button
                      variant="default"
                      className={`font-semibold shadow-md transition-all duration-300 `}
                      onClick={() =>
                        (window.location.href = '/dashboard/catalog')
                      }
                    >
                      Click to view courses
                    </Button>
                  </div>
                )}
              </div>
              {/* Dashboard Banner Ads - Between Courses and Calendar */}

              {dashboardBannerAds.length > 0 && (
                <div className="mb-6 relative">
                  {/* Banner */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateX(-${bannerCarouselIndex * 100}%)`,
                      }}
                    >
                      {dashboardBannerAds.map((ad, index) => (
                        <div key={ad.id} className="w-full flex-shrink-0">
                          <SponsorBanner
                            ad={ad}
                            isActive={index === bannerCarouselIndex}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 🔘 Banner Dots (MUST BE HERE) */}
                  {dashboardBannerAds.length > 1 && (
                    <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center items-center gap-2">
                      {dashboardBannerAds.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setBannerCarouselIndex(index)}
                          aria-label={`Go to slide ${index + 1}`}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === bannerCarouselIndex
                              ? 'bg-white w-6'
                              : 'bg-white/50 hover:bg-white/80 w-2'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right section - enhanced sidebar widgets */}
            <div className="xl:col-span-4 space-y-6">
              {dashboardSidebarAds.length > 0 && (
                <div className="relative overflow-hidden rounded-xl h-[200px]">
                  <div
                    className="flex flex-col transition-transform duration-500 ease-in-out h-full"
                    style={{
                      transform: `translateY(-${sidebarCarouselIndex * 100}%)`,
                    }}
                  >
                    {dashboardSidebarAds.map((ad, index) => (
                      <div
                        key={ad.id}
                        className="w-full flex-shrink-0 h-[200px]"
                      >
                        <SponsorSidebarAd
                          ad={ad}
                          isActive={index === sidebarCarouselIndex}
                        />
                      </div>
                    ))}
                  </div>

                  {dashboardSidebarAds.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                      {dashboardSidebarAds.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSidebarCarouselIndex(index)}
                          className={`h-1.5 rounded-full transition-all ${
                            index === sidebarCarouselIndex
                              ? 'bg-white w-4'
                              : 'bg-white/50 hover:bg-white/75 w-1.5'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Announcements*/}
              {/*<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Announcements</h3>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <DashboardAnnouncements />
              </div> */}

              {/* Important Updates Section */}
              <div
                className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-4 important-updates-wrapper `}
              >
                <style>{importantUpdateStyles}</style>
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-gray-800">
                      Important Updates
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Stay informed with the latest from Creditor Academy. For
                    prompt resolution of any concerns, connect with our
                    dedicated leads below.
                  </p>
                </div>
                <div
                  ref={importantUpdatesScrollRef}
                  className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory important-updates-scroll"
                >
                  {/* Athena LMS and Login Issues */}
                  <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white transition-all duration-300 hover:shadow-md hover:border-indigo-200 flex-shrink-0 snap-center important-update-card h-full">
                    <div className="flex items-start gap-3 h-full">
                      <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                        <MonitorPlay className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-2 h-full">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                          Athena LMS and Login Issues
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          If you're experiencing challenges with Athena LMS
                          access or login, reach out to our Platform Lead for
                          expert assistance.
                        </p>
                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm w-full sm:w-auto mt-auto"
                          onClick={() =>
                            window.open(
                              'https://scheduler.zoom.us/daniyal-hashim/athena-lesson-editor-team',
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                        >
                          Schedule Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Payments, Credits, and Debits Issues */}
                  <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white transition-all duration-300 hover:shadow-md hover:border-emerald-200 flex-shrink-0 snap-center important-update-card h-full">
                    <div className="flex items-start gap-3 h-full">
                      <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-2 h-full">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                          Credits and Debits Issues
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          For any queries or issues related to payments,
                          credits, or debits, consult our Payment Lead to ensure
                          smooth and accurate handling.
                        </p>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm w-full sm:w-auto mt-auto"
                          onClick={() =>
                            window.open(
                              'https://scheduler.zoom.us/mausam-jha',
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                        >
                          Schedule Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Progress tracker maintenance */}
                  <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white transition-all duration-300 hover:shadow-md hover:border-amber-200 flex-shrink-0 snap-center important-update-card h-full">
                    <div className="flex items-start gap-3 h-full">
                      <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-2 h-full">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                          Progress Tracker Under maintenance
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Progress tracker is under maintenance. You can track
                          Book Smart; Street Smart tracking is temporarily
                          unavailable.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="w-full">
                <DashboardCalendar />
              </div>

              {/* Todo */}
              {/* <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Upcoming Tasks</h3>
                <DashboardTodo />
              </div> */}
            </div>
          </div>
          {/* Catalog Banner Section */}
          <div
            className={`w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 `}
          >
            <div className="text-center mb-4"></div>
            <DashboardCarousel />
          </div>

          <div className="mb-6">
            <div
              className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 `}
            >
              <div className="flex items-center gap-3 mb-4">
                <MonitorPlay className="h-6 w-6 text-purple-500" />
                <h2 className={`text-2xl font-bold `}>Learning Sessions</h2>
              </div>
              <LiveClasses />
            </div>
          </div>

          <UpcomingCourses />
          {/* Groups Preview Section */}
          <div className="mb-6">
            <DashboardGroup />
          </div>
          {/* Services using credits */}
          <div className="mb-6">
            <div className="rounded-2xl shadow-lg border border-gray-200 bg-white p-6 md:p-8">
              {/* Simple, compact header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Award className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Creditor Academy Services
                    </h2>
                    <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                      At Creditor Academy, we offer a comprehensive suite of
                      professional services designed to empower businesses and
                      individuals with tailored solutions. Explore our key
                      offerings below and schedule a consultation to get
                      started.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1 text-sm">
                    {balance} credits
                  </span>
                  {!showServiceHistory ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowServiceHistory(true)}
                    >
                      History
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowServiceHistory(false)}
                    >
                      Go back
                    </Button>
                  )}
                </div>
              </div>
              <div className="mb-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              {/* Sliding container switches between main services and history */}
              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-300"
                  style={{
                    width: '200%',
                    transform: showServiceHistory
                      ? 'translateX(-50%)'
                      : 'translateX(0%)',
                  }}
                >
                  {/* Panel: Services */}
                  <div className="w-1/2 pr-0 md:pr-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Website Services */}
                      <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 transition-all duration-300 hover:shadow-xl hover:border-blue-200">
                        {/* decorative glows */}
                        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-blue-300/30 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
                        {/* illustration */}
                        <img
                          src="/Creditor_academy.png"
                          alt="website services"
                          loading="lazy"
                          className="pointer-events-none absolute -right-4 bottom-0 w-44 opacity-20 transition-opacity duration-300 group-hover:opacity-30"
                        />
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow text-white ring-4 ring-white/60 mb-4">
                            <MonitorPlay size={20} />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Website Services
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 flex-grow">
                            Elevate your online presence with our expert website
                            design, development, and maintenance solutions.
                            Whether you're launching a new site or optimizing an
                            existing one, we deliver user-friendly, responsive,
                            and high-performing websites that drive results.
                          </p>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                            onClick={() =>
                              window.open(
                                'https://scheduler.zoom.us/prerna-mishra/website-requirement-meeting',
                                '_blank',
                                'noopener,noreferrer'
                              )
                            }
                          >
                            Schedule Now
                          </Button>
                        </div>
                      </div>
                      {/* Digital Marketing and SEO Services */}
                      <div className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-6 transition-all duration-300 hover:shadow-xl hover:border-purple-200">
                        {/* decorative glows */}
                        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-purple-300/30 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-purple-200/30 blur-3xl" />
                        {/* illustration */}
                        <img
                          src="/Creditor_academy.png"
                          alt="digital marketing services"
                          loading="lazy"
                          className="pointer-events-none absolute -right-4 bottom-0 w-44 opacity-20 transition-opacity duration-300 group-hover:opacity-30"
                        />
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow text-white ring-4 ring-white/60 mb-4">
                            <Target size={20} />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Digital Marketing and SEO Services
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 flex-grow">
                            Boost your visibility and growth with our strategic
                            digital marketing and SEO expertise. From targeted
                            campaigns and content creation to advanced search
                            engine optimization, we help you attract, engage,
                            and convert your audience effectively.
                          </p>
                          <Button
                            className="bg-gray-300 text-gray-500 w-full cursor-not-allowed opacity-60"
                            disabled
                          >
                            Coming Soon...
                          </Button>
                        </div>
                      </div>
                      {/* Recruitment and Staffing Services */}
                      <div className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-6 transition-all duration-300 hover:shadow-xl hover:border-orange-200">
                        {/* decorative glows */}
                        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-orange-300/30 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-orange-200/30 blur-3xl" />
                        {/* illustration */}
                        <img
                          src="/Creditor_academy.png"
                          alt="recruitment services"
                          loading="lazy"
                          className="pointer-events-none absolute -right-4 bottom-0 w-44 opacity-20 transition-opacity duration-300 group-hover:opacity-30"
                        />
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center shadow text-white ring-4 ring-white/60 mb-4">
                            <GraduationCap size={20} />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Recruitment and Staffing Services (Including
                            Payroll)
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 flex-grow">
                            Streamline your talent acquisition with our
                            end-to-end recruitment, staffing, and payroll
                            management services. We connect you with top-tier
                            professionals while handling compliance, onboarding,
                            and seamless payroll processing for hassle-free
                            operations.
                          </p>
                          <Button
                            className="bg-gray-300 text-gray-500 w-full cursor-not-allowed opacity-60"
                            disabled
                          >
                            Coming Soon...
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Panel: History */}
                  <div className="w-1/2 pl-0 md:pl-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 h-full">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            History
                          </h3>
                          <p className="text-xs text-gray-600">
                            Consultation and website activity
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <button
                          onClick={() => setHistoryTab('consultations')}
                          className={`px-3 py-1.5 rounded-md text-sm border ${historyTab === 'consultations' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                        >
                          Consultations
                        </button>
                        <button
                          onClick={() => setHistoryTab('website')}
                          className={`px-3 py-1.5 rounded-md text-sm border ${historyTab === 'website' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                        >
                          Website
                        </button>
                      </div>
                      <div className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-4 bg-gray-50 text-gray-600 text-xs font-medium">
                          <div className="px-3 py-2">Date</div>
                          <div className="px-3 py-2">Item</div>
                          <div className="px-3 py-2">Credits</div>
                          <div className="px-3 py-2">Status</div>
                        </div>
                        <div
                          className="max-h-32 overflow-y-auto relative"
                          style={{
                            maxHeight: '8rem',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#d1d5db #f3f4f6',
                          }}
                        >
                          {historyLoading ? (
                            <div className="flex items-center justify-center py-10">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-600">
                                  Loading history...
                                </p>
                              </div>
                            </div>
                          ) : historyError ? (
                            <div className="flex items-center justify-center py-10">
                              <div className="text-center">
                                <p className="text-sm text-red-600 mb-2">
                                  {historyError}
                                </p>
                                <button
                                  onClick={fetchUserHistory}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  Try again
                                </button>
                              </div>
                            </div>
                          ) : (historyTab === 'consultations'
                              ? consultationHistory
                              : websiteHistory
                            ).length === 0 ? (
                            <div className="flex items-center justify-center py-10">
                              <p className="text-sm text-gray-600">
                                Your{' '}
                                {historyTab === 'consultations'
                                  ? 'consultation'
                                  : 'website'}{' '}
                                history will appear here once available.
                              </p>
                            </div>
                          ) : (
                            (historyTab === 'consultations'
                              ? consultationHistory
                              : websiteHistory
                            ).map(row => (
                              <div
                                key={row.id}
                                className="grid grid-cols-4 border-t"
                              >
                                <div className="px-3 py-2 text-sm text-gray-900">
                                  {row.date}
                                </div>
                                <div className="px-3 py-2 text-sm text-gray-700">
                                  {row.title}
                                </div>
                                <div className="px-3 py-2 text-sm font-medium text-gray-900">
                                  {row.credits}
                                </div>
                                <div className="px-3 py-2 text-sm">
                                  <span
                                    className={`inline-flex px-2 py-0.5 rounded-full border text-xs ${row.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : row.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                                  >
                                    {row.status}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                          {/* Subtle fade indicator for scrollable content */}
                          {(historyTab === 'consultations'
                            ? consultationHistory
                            : websiteHistory
                          ).length > 2 && (
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {popupAd && (
        <SponsorAdPopup
          ad={popupAd}
          open={isSponsorPopupOpen}
          onClose={() => setIsSponsorPopupOpen(false)}
        />
      )}
      {/* Credits Modal (reused for services top-up) */}
      {showCreditsModal && (
        <CreditPurchaseModal
          open={showCreditsModal}
          onClose={() => setShowCreditsModal(false)}
        />
      )}

      {/* Consultation Info Modal */}
      <Dialog open={showConsultInfo} onOpenChange={setShowConsultInfo}>
        <DialogContent
          onInteractOutside={e => e.preventDefault()}
          className="w-[95vw] sm:max-w-md p-4 sm:p-5 max-h-[80vh] overflow-auto"
        >
          <DialogHeader>
            <DialogTitle>About Consultations</DialogTitle>
            <DialogDescription>
              Book a 1:1 live session with an expert. Use your credits to
              reserve a time slot and get tailored guidance on your goals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3">
              <p className="font-medium text-emerald-800">How pricing works</p>
              <p className="text-emerald-700">1000 credits for 30 minutes.</p>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Flexible scheduling based on expert availability</li>
              <li>Focused help on coursework, projects, or strategy</li>
            </ul>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowConsultInfo(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Consultation Form Modal (embedded) */}
      <Dialog open={showConsultForm} onOpenChange={setShowConsultForm}>
        <DialogContent
          onInteractOutside={e => e.preventDefault()}
          className="w-[95vw] sm:max-w-2xl p-0 max-h-[85vh] overflow-auto"
        >
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Consultation Booking Form</DialogTitle>
            <DialogDescription>
              Provide your details to request a consultation time.
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-4">
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <iframe
                title="Consultation form"
                src="https://api.wonderengine.ai/widget/form/zIoXSg2Bzo4iPGAlPwD0"
                className="w-full"
                style={{ height: '70vh' }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Website Details Modal */}
      <Dialog open={showWebsiteDetails} onOpenChange={setShowWebsiteDetails}>
        <DialogContent
          onInteractOutside={e => e.preventDefault()}
          className="w-[95vw] sm:max-w-3xl p-0 max-h-[85vh] overflow-auto"
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Website Services Details</DialogTitle>
            <DialogDescription>
              Compare what's included in each pack.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 max-h-[70vh] overflow-auto">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-3 min-w-[640px] text-sm border rounded-lg overflow-hidden">
                <div className="col-span-1 bg-gray-50 px-3 py-2 font-medium text-gray-700">
                  Feature
                </div>
                <div className="px-3 py-2 bg-gray-50 font-medium text-gray-700">
                  Basic
                </div>
                <div className="px-3 py-2 bg-gray-50 font-medium text-gray-700">
                  Premium
                </div>

                {/* Number of Pages */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Number of Pages
                </div>
                <div className="px-3 py-2 border-t text-gray-700">
                  2-3 pages
                </div>
                <div className="px-3 py-2 border-t text-gray-700">
                  5-7+ custom pages
                </div>

                {/* Custom Logo */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Custom Logo
                </div>
                <div className="px-3 py-2 border-t text-gray-700">
                  Basic text/logo
                </div>
                <div className="px-3 py-2 border-t text-gray-700">
                  Premium design with revisions
                </div>

                {/* Policy Pages */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Policy Pages
                </div>
                <div className="px-3 py-2 border-t text-gray-700">
                  Basic templates
                </div>
                <div className="px-3 py-2 border-t text-gray-700">
                  Custom-written & formatted
                </div>

                {/* Contact Form */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Contact Form
                </div>
                <div className="px-3 py-2 border-t text-gray-700">
                  Basic with auto-email
                </div>
                <div className="px-3 py-2 border-t text-gray-700">
                  Advanced with CRM sync
                </div>

                {/* UI/UX Design */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  UI/UX Design
                </div>
                <div className="px-3 py-2 border-t text-gray-700">
                  Clean layout
                </div>
                <div className="px-3 py-2 border-t text-gray-700">
                  Brand-aligned premium design
                </div>

                {/* Security (SSL) */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Security (SSL)
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    HTTPS
                  </span>
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    HTTPS + Extra layers
                  </span>
                </div>

                {/* Mobile Responsive */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Mobile Responsive
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>

                {/* Underwriter-Ready Structure */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Underwriter-Ready Structure
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>

                {/* Hosting & Maintenance */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Hosting & Maintenance
                </div>
                <div className="px-3 py-2 border-t text-gray-700">Monthly</div>
                <div className="px-3 py-2 border-t text-gray-700">Monthly</div>

                {/* Detail User Dashboard */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Detail User Dashboard
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                    Not included
                  </span>
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>

                {/* Member Login / Portal */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Member Login / Portal
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                    Not included
                  </span>
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>

                {/* Backend Integration */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Backend Integration
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                    Not included
                  </span>
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>

                {/* Blog / Resource Section */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Blog / Resource Section
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                    Not included
                  </span>
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>

                {/* Chatbot / Live Chat */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Chatbot / Live Chat
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                    Not included
                  </span>
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>

                {/* Appointment Booking */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Appointment Booking
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                    Not included
                  </span>
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>

                {/* SEO Optimization */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  SEO Optimization
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                    Not included
                  </span>
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>

                {/* Client Training / Walkthrough */}
                <div className="col-span-1 px-3 py-2 border-t text-gray-900">
                  Client Training / Walkthrough
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                    Not included
                  </span>
                </div>
                <div className="px-3 py-2 border-t">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Included
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowWebsiteDetails(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inline Services History uses sliding panel above. Modal removed. */}

      {/* Consultation Booking Modal */}
      <Dialog open={showConsultBooking} onOpenChange={setShowConsultBooking}>
        <DialogContent
          onInteractOutside={e => e.preventDefault()}
          className="w-[95vw] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[85vh] overflow-auto"
        >
          <DialogHeader>
            <DialogTitle>Book a Consultation</DialogTitle>
            <DialogDescription>
              Review details and confirm your booking. Sessions are 30 minutes
              and use credits upon confirmation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {/* Status + Session Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-gray-500">Membership</p>
                <p
                  className={`text-xs inline-flex px-2 py-0.5 rounded-full border mt-1 ${membership?.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                >
                  {membership?.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-gray-500">Duration</p>
                <p className="text-lg font-semibold flex items-center gap-1">
                  <Clock size={16} /> 30 mins
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-gray-500">Cost</p>
                <p className="text-lg font-semibold">{CONSULT_COST} credits</p>
              </div>
            </div>

            {!membership?.isActive && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
                Membership inactive. Buy membership to enable booking.
              </div>
            )}
            {membership?.isActive && balance < CONSULT_COST && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                You do not have enough credits. Required {CONSULT_COST},
                available {balance}.
              </div>
            )}
            {/* Credits math */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-gray-500">Current credits</p>
                <p className="text-lg font-semibold">{balance}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-gray-500">Will be used</p>
                <p className="text-lg font-semibold">{CONSULT_COST}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-gray-500">Remaining</p>
                <p className="text-lg font-semibold">
                  {Math.max(0, (balance || 0) - CONSULT_COST)}
                </p>
              </div>
            </div>

            {/* What's included */}
            <div className="rounded-lg border p-3">
              <p className="font-medium text-gray-900 mb-2">What you get</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" /> Live
                  1:1 video call with an expert
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" />{' '}
                  Actionable recommendations and next steps
                </li>
              </ul>
            </div>

            {/* How it works */}
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-1">
                How booking works
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Click Book to request a time. We confirm availability.</li>
                <li>Reschedule up to 12 hours prior at no extra cost.</li>
              </ol>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {!membership?.isActive ? (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  setShowConsultBooking(false);
                  setShowCreditsModal(true);
                }}
              >
                Buy membership
              </Button>
            ) : balance < CONSULT_COST ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConsultBooking(false);
                    setShowCreditsModal(true);
                  }}
                >
                  Add credits
                </Button>
                <Button
                  onClick={() => setShowConsultBooking(false)}
                  variant="ghost"
                >
                  Close
                </Button>
              </>
            ) : (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  setShowConsultBooking(false);
                  setShowConsultConfirmation(true);
                }}
              >
                Book
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Consultation Confirmation Modal */}
      <Dialog
        open={showConsultConfirmation}
        onOpenChange={setShowConsultConfirmation}
      >
        <DialogContent
          onInteractOutside={e => e.preventDefault()}
          className="w-[95vw] sm:max-w-md p-4 sm:p-5 max-h-[80vh] overflow-auto"
        >
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              Please review the details before proceeding with your consultation
              booking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Booking Information */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">
                    Booking Process
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Clicking "Book Now" will deduct {CONSULT_COST} credits from
                    your account and redirect you to complete your booking.{' '}
                    <strong>
                      Credits will not be refunded if you don't complete the
                      booking process
                    </strong>
                    , so please ensure you finish selecting your time slot.
                  </p>
                </div>
              </div>
            </div>

            {/* Credit Summary */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600 text-sm">Current credits:</span>
                <span className="font-semibold text-gray-900">{balance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">After booking:</span>
                <span className="font-semibold text-gray-900">
                  {Math.max(0, (balance || 0) - CONSULT_COST)}
                </span>
              </div>
            </div>

            {/* Simple confirmation */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700 text-sm">
                Ready to book your consultation for {CONSULT_COST} credits?
              </p>
            </div>

            {/* Success Display */}
            {bookingSuccess && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-green-700 text-sm">
                {bookingSuccess}
              </div>
            )}

            {/* Error Display */}
            {bookingError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                {bookingError}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowConsultConfirmation(false);
                setBookingSuccess('');
                setBookingError('');
              }}
              className="flex-1"
              disabled={isBookingConsultation}
            >
              Cancel
            </Button>
            {!membership?.isActive ? (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                onClick={() => {
                  setShowConsultConfirmation(false);
                  setShowCreditsModal(true);
                }}
                disabled={isBookingConsultation}
              >
                Buy membership
              </Button>
            ) : balance < CONSULT_COST ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                onClick={() => {
                  setShowConsultConfirmation(false);
                  setShowCreditsModal(true);
                }}
                disabled={isBookingConsultation}
              >
                Add credits
              </Button>
            ) : (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                onClick={handleConsultationBooking}
                disabled={isBookingConsultation}
              >
                {isBookingConsultation
                  ? 'Redirecting...'
                  : `Book Now (${CONSULT_COST} credits)`}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Website Services Modal */}
      <Dialog open={showWebsiteModal} onOpenChange={setShowWebsiteModal}>
        <DialogContent
          onInteractOutside={e => e.preventDefault()}
          className="w-[95vw] sm:max-w-lg md:max-w-xl p-4 sm:p-6 max-h-[85vh] overflow-auto"
        >
          <DialogHeader>
            <DialogTitle>Choose a Website Pack</DialogTitle>
            <DialogDescription>
              Pay with credits for eligible packs. Select a pack to see the
              credits math.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Website Pack Options */}
            <div className="grid grid-cols-1 gap-3">
              {WEBSITE_PACKS.map(pack => (
                <button
                  key={pack.id}
                  onClick={() => setSelectedWebsitePack(pack)}
                  className={`text-left rounded-lg border p-3 transition ${
                    selectedWebsitePack.id === pack.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{pack.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900">
                          {pack.name}
                        </h3>
                        <span className="text-blue-700 font-semibold">
                          {pack.cost} credits
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{pack.blurb}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {pack.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 text-xs text-gray-700"
                          >
                            <CheckCircle
                              size={12}
                              className="text-green-500 flex-shrink-0"
                            />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Credits Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-gray-500">Current credits</p>
                <p className="text-lg font-semibold">{balance}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-gray-500">Will be used</p>
                <p className="text-lg font-semibold">
                  {selectedWebsitePack.cost}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-gray-500">Remaining</p>
                <p className="text-lg font-semibold">
                  {Math.max(0, (balance || 0) - selectedWebsitePack.cost)}
                </p>
              </div>
            </div>

            {/* Insufficient Credits Warning */}
            {balance < selectedWebsitePack.cost && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                Not enough credits for this pack. Add credits to proceed.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {!membership?.isActive ? (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  setShowWebsiteModal(false);
                  setShowCreditsModal(true);
                }}
              >
                Buy membership
              </Button>
            ) : balance < selectedWebsitePack.cost ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowWebsiteModal(false);
                    setShowCreditsModal(true);
                  }}
                >
                  Add credits
                </Button>
                <Button
                  onClick={() => setShowWebsiteModal(false)}
                  variant="ghost"
                >
                  Close
                </Button>
              </>
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setShowWebsiteModal(false);
                  setShowWebsiteConfirmation(true);
                }}
              >
                Proceed
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Website Credit Confirmation Modal */}
      <Dialog
        open={showWebsiteConfirmation}
        onOpenChange={setShowWebsiteConfirmation}
      >
        <DialogContent
          onInteractOutside={e => e.preventDefault()}
          className="w-[95vw] sm:max-w-md p-4 sm:p-5 max-h-[80vh] overflow-auto"
        >
          <DialogHeader>
            <DialogTitle>Confirm Your Website Purchase</DialogTitle>
            <DialogDescription>
              Please review the details before proceeding with your website
              request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">
                    Credits Deduction
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Clicking "Proceed" will deduct {selectedWebsitePack.cost}{' '}
                    credits for the {selectedWebsitePack.name}.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600 text-sm">Current credits:</span>
                <span className="font-semibold text-gray-900">{balance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">After purchase:</span>
                <span className="font-semibold text-gray-900">
                  {Math.max(
                    0,
                    (balance || 0) - (selectedWebsitePack?.cost || 0)
                  )}
                </span>
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700 text-sm">
                Ready to proceed with {selectedWebsitePack.name} for{' '}
                {selectedWebsitePack.cost} credits?
              </p>
            </div>

            {/* Success Display */}
            {bookingSuccess && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-green-700 text-sm">
                {bookingSuccess}
              </div>
            )}

            {/* Error Display */}
            {bookingError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                {bookingError}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowWebsiteConfirmation(false);
                setBookingSuccess('');
                setBookingError('');
              }}
              className="flex-1"
              disabled={isBookingWebsite}
            >
              Cancel
            </Button>
            {!membership?.isActive ? (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                onClick={() => {
                  setShowWebsiteConfirmation(false);
                  setShowCreditsModal(true);
                }}
                disabled={isBookingWebsite}
              >
                Buy membership
              </Button>
            ) : balance < (selectedWebsitePack?.cost || 0) ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                onClick={() => {
                  setShowWebsiteConfirmation(false);
                  setShowCreditsModal(true);
                }}
                disabled={isBookingWebsite}
              >
                Add credits
              </Button>
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                onClick={handleWebsiteServiceBooking}
                disabled={isBookingWebsite}
              >
                {isBookingWebsite
                  ? 'Processing...'
                  : `Proceed (${selectedWebsitePack.cost} credits)`}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Website Form Modal (embedded) */}
      <Dialog open={showWebsiteForm} onOpenChange={setShowWebsiteForm}>
        <DialogContent
          onInteractOutside={e => e.preventDefault()}
          className="w-[95vw] sm:max-w-3xl p-0 max-h-[85vh] overflow-auto"
        >
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Website Purchase Form</DialogTitle>
            <DialogDescription>
              Complete this form to proceed with your website request.
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-4">
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <iframe
                title="Website form"
                src="https://api.wonderengine.ai/widget/form/yhb8k42HP4nBj8voipXd"
                className="w-full"
                style={{ height: '70vh' }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Offer Popup */}
      <OfferPopup />
    </div>
  );
}

export default Dashboard;
