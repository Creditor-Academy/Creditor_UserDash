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
import { SeasonalThemeContext } from '@/contexts/SeasonalThemeContext';
import AthenaHeroBanner from '../components/dashboard/AthenaHeroBanner';
import DashboardTopSection from '../components/dashboard/DashboardTopSection';
import DashboardServices from '../components/dashboard/DashboardServices';

export function Dashboard() {
  const { activeTheme } = useContext(SeasonalThemeContext);
  const isThemeActive = activeTheme === 'active';
  const isWinter = isThemeActive; // Winter theme is active when seasonal theme is active
  // Minimal custom CSS for webkit scrollbar styling (not possible with Tailwind)
  const customScrollbarStyles = `
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
    <div className={`relative flex flex-col min-h-screen ${isWinter ? 'bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
      {/* Winter snowflakes effect */}
      {isWinter && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-10 text-3xl opacity-10 animate-pulse">❄️</div>
          <div className="absolute top-40 right-20 text-4xl opacity-15 animate-pulse delay-300">❄️</div>
          <div className="absolute bottom-60 left-1/4 text-2xl opacity-10 animate-pulse delay-700">❄️</div>
          <div className="absolute top-1/3 right-1/3 text-3xl opacity-12 animate-pulse delay-500">❄️</div>
        </div>
      )}
      <main className="flex-1 relative z-10">
        <div className="w-full max-w-7xl mx-auto">

        <AthenaHeroBanner
          isThemeActive={isThemeActive}
          userName={userName}
          userProfile={userProfile}
        />

        <DashboardTopSection isWinter={isWinter} />




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


          <DashboardServices
            balance={balance}
            showServiceHistory={showServiceHistory}
            setShowServiceHistory={setShowServiceHistory}
          />

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
