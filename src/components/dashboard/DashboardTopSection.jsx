import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  BookOpen,
  Award,
  MonitorPlay,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CourseCard from '@/components/dashboard/CourseCard';
import SponsorBanner from '@/components/sponsorAds/SponsorBanner';
import SponsorSidebarAd from '@/components/sponsorAds/SponsorSidebarAd';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';

import { fetchUserCourses } from '@/services/courseService';
import { fetchDashboardSponsorAds } from '@/services/sponsorAdsService';
import { useUser } from '@/contexts/UserContext';
import { getCourseTrialStatus } from '@/utils/trialUtils';

const DashboardTopSection = ({ isWinter }) => {

  const { userProfile } = useUser();
  const userName = useMemo(() => {
    if (!userProfile) return '';
    return (
      `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() ||
      userProfile.email ||
      'User'
    );
  }, [userProfile]);

  const [error, setError] = useState(null);
  const handleRetry = () => window.location.reload();
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [userCourses, setUserCourses] = useState([]);
  const courseSectionTitle = 'My Courses';

  const RECORDING_COURSE_IDS = [
    'a188173c-23a6-4cb7-9653-6a1a809e9914',
    '7b798545-6f5f-4028-9b1e-e18c7d2b4c47',
    '199e328d-8366-4af1-9582-9ea545f8b59e',
    'd8e2e17f-af91-46e3-9a81-6e5b0214bc5e',
    'd5330607-9a45-4298-8ead-976dd8810283',
    '814b3edf-86da-4b0d-bb8c-8a6da2d9b4df',
  ];

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const data = await fetchUserCourses();
        const filtered = data.filter(
          c => !RECORDING_COURSE_IDS.includes(c.id)
        );
        setUserCourses(
          filtered.map(course => ({
            ...course,
            modulesCount: course._count?.modules || 0,
            trialStatus: getCourseTrialStatus(course),
            image:
              course.thumbnail ||
              course.image ||
              'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
          }))
        );
      } catch {
        setError('Failed to load courses');
      } finally {
        setCoursesLoading(false);
      }
    };
    loadCourses();
  }, []);

  /* =========================
     COURSE CAROUSEL
  ========================= */
  const courseScrollRef = useRef(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : true
  );

  useEffect(() => {
    const resize = () => setIsSmallScreen(window.innerWidth < 640);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const visibleCards = isSmallScreen ? 1 : 2;

  const handleScroll = dir => {
    const max = userCourses.length - visibleCards;
    const next = Math.max(0, Math.min(scrollIndex + dir, max));
    setScrollIndex(next);
    if (courseScrollRef.current) {
      const cardW = courseScrollRef.current.firstChild?.offsetWidth || 320;
      courseScrollRef.current.scrollTo({
        left: next * (cardW + 16),
        behavior: 'smooth',
      });
    }
  };

  const shimmerCardCount = Math.max(visibleCards, 2);

  const CourseShimmerCard = () => (
    <div className="h-[340px] rounded-2xl bg-gray-100 animate-pulse" />
  );

  /* =========================
     SPONSOR ADS
  ========================= */
  const [dashboardBannerAds, setDashboardBannerAds] = useState([]);
  const [dashboardSidebarAds, setDashboardSidebarAds] = useState([]);
  const [bannerCarouselIndex, setBannerCarouselIndex] = useState(0);
  const [sidebarCarouselIndex, setSidebarCarouselIndex] = useState(0);

  useEffect(() => {
    const loadAds = async () => {
      try {
        const ads = await fetchDashboardSponsorAds();
        const now = new Date();
  
        const normalizeAd = ad => {
          const start = ad.start_date ? new Date(ad.start_date) : null;
          const end = ad.end_date ? new Date(ad.end_date) : null;
  
          if (start && now < start) return null;
          if (end && now > end) return null;
  
          return {
            id: ad.id,
            title: ad.title,
            description: ad.description,
            sponsorName: ad.sponsor_name,
            mediaUrl: ad.video_url || ad.image_url, // ✅ FIX
            mediaType: ad.video_url ? 'video' : 'image', // ✅ FIX
            ctaUrl: ad.link_url,
            ctaText: ad.link_url ? 'Learn more' : '',
          };
        };
  
        setDashboardBannerAds(
          ads
            .filter(a => a.position === 'DASHBOARD' && a.status === 'ACTIVE')
            .map(normalizeAd)
            .filter(Boolean)
        );
  
        setDashboardSidebarAds(
          ads
            .filter(a => a.position === 'SIDEBAR' && a.status === 'ACTIVE')
            .map(normalizeAd)
            .filter(Boolean)
        );
      } catch (err) {
        console.error('Failed to load sponsor ads', err);
      }
    };
  
    loadAds();
  }, []);
  

  useEffect(() => {
    if (dashboardBannerAds.length <= 1) return;
    const i = setInterval(
      () =>
        setBannerCarouselIndex(p =>
          p === dashboardBannerAds.length - 1 ? 0 : p + 1
        ),
      10000
    );
    return () => clearInterval(i);
  }, [dashboardBannerAds.length]);

  useEffect(() => {
    if (dashboardSidebarAds.length <= 1) return;
    const i = setInterval(
      () =>
        setSidebarCarouselIndex(p =>
          p === dashboardSidebarAds.length - 1 ? 0 : p + 1
        ),
      5500
    );
    return () => clearInterval(i);
  }, [dashboardSidebarAds.length]);

  /* =========================
     IMPORTANT UPDATES
  ========================= */
  const importantUpdatesScrollRef = useRef(null);
  const customScrollbarStyles = `
    .important-updates-scroll { scrollbar-width:none }
    .important-updates-scroll::-webkit-scrollbar{display:none}
  `;

  useEffect(() => {
    const container = importantUpdatesScrollRef.current;
    if (!container) return;
  
    const cards = container.querySelectorAll('.important-update-card');
    if (cards.length <= 1) return;
  
    let index = 0;
  
    const interval = setInterval(() => {
      index = (index + 1) % cards.length;
  
      const card = cards[index];
      if (!card) return;
  
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
  
      const scrollLeft =
        container.scrollLeft +
        (cardRect.left - containerRect.left) -
        (containerRect.width / 2 - cardRect.width / 2);
  
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }, 6000);
  
    return () => clearInterval(interval);
  }, []);
  
  

  /* =========================
     UI (UNCHANGED)
  ========================= */
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6 relative z-0">

      {/* ================= LEFT SECTION ================= */}
      <div className="xl:col-span-8 space-y-4">

        {/* ================= GREETING ================= */}
        <div
          className={`relative rounded-2xl overflow-hidden shadow-lg border ${
            isWinter
              ? 'border-cyan-200 bg-gradient-to-br from-cyan-50/80 to-blue-50/80'
              : 'border-gray-200'
          }`}
        >
          <div
            className={`absolute inset-0 animate-gradient-shift ${
              isWinter
                ? 'bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-cyan-500/10'
                : 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-500/10'
            }`}
          />
          <div className="relative z-10 p-4 sm:p-5 backdrop-blur-sm">

            <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                  isWinter
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}
              >
                {isWinter ? (
                  <span className="text-2xl sm:text-3xl">❄️</span>
                ) : (
                  <GraduationCap className="text-white w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2
                  className={`text-xl sm:text-2xl font-bold mb-1 leading-tight bg-clip-text text-transparent ${
                    isWinter
                      ? 'bg-gradient-to-r from-cyan-700 to-blue-700'
                      : 'bg-gradient-to-r from-gray-800 to-gray-600'
                  }`}
                >
                  {isWinter ? '❄️ ' : ''}
                  Welcome back{userName ? `, ${userName}` : ''}!
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Continue your private education journey and achieve your goals.
                </p>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-red-700 text-sm">
                    Failed to load dashboard data
                  </span>
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

            {/* ================= WHAT WE OFFER ================= */}
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
                  <span className="font-semibold text-blue-800">Reliable</span>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  24/7 uptime with monitoring.
                </p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-emerald-600 w-6 h-6" />
                  <span className="font-semibold text-emerald-800">Guided</span>
                </div>
                <p className="text-sm text-emerald-700 mt-2">
                  Clear paths from basics to mastery.
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center gap-2">
                  <Award className="text-orange-600 w-6 h-6" />
                  <span className="font-semibold text-orange-800">Certified</span>
                </div>
                <p className="text-sm text-orange-700 mt-2">
                  Shareable credentials.
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-2">
                  <MonitorPlay className="text-purple-600 w-6 h-6" />
                  <span className="font-semibold text-purple-800">Flexible</span>
                </div>
                <p className="text-sm text-purple-700 mt-2">
                  Live + on-demand learning.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                <div className="flex items-center gap-2">
                  <Clock className="text-yellow-600 w-6 h-6" />
                  <span className="font-semibold text-yellow-800">Evolving</span>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  Continuous improvements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MY COURSES ================= */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold">{courseSectionTitle}</h2>
            <Button variant="outline" asChild>
              <Link to="/dashboard/courses" className="flex items-center gap-2">
                View all <ChevronRight size={16} />
              </Link>
            </Button>
          </div>

          {coursesLoading ? (
            <div className="flex gap-4 px-1 pb-1">
              {Array.from({ length: shimmerCardCount }).map((_, idx) => (
                <div key={idx} className="min-w-[296px]">
                  <CourseShimmerCard />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {scrollIndex > 0 && (
                <button
                  onClick={() => handleScroll(-1)}
                  className="hidden sm:flex absolute left-[-24px] top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow"
                >
                  <ChevronLeft />
                </button>
              )}

              <div
                ref={courseScrollRef}
                className="flex gap-4 overflow-x-auto sm:overflow-x-hidden px-1 pb-1 scroll-smooth"
              >
                {userCourses.map(course => (
                  <div
                    key={course.id}
                    className="min-w-[296px] max-w-[296px] flex-shrink-0"
                  >
                    <CourseCard course={course} {...course} />
                  </div>
                ))}
              </div>

              {scrollIndex < userCourses.length - visibleCards && (
                <button
                  onClick={() => handleScroll(1)}
                  className="hidden sm:flex absolute right-[-24px] top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow"
                >
                  <ChevronRight />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ================= BANNERS ================= */}
        {dashboardBannerAds.length > 0 && (
          <div className="mb-6 relative">
            <div className="relative overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${bannerCarouselIndex * 100}%)`,
                }}
              >
                {dashboardBannerAds.map((ad, index) => (
                  <div key={ad.id} className="w-full flex-shrink-0">
                    <SponsorBanner ad={ad} isActive={index === bannerCarouselIndex} />
                  </div>
                ))}
              </div>
            </div>

            {/* Banner dots */}
            {dashboardBannerAds.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center gap-2">
                {dashboardBannerAds.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setBannerCarouselIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === bannerCarouselIndex
                        ? 'bg-white w-6'
                        : 'bg-white/50 w-2'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= RIGHT SIDEBAR ================= */}
      <div className="xl:col-span-4 space-y-6">

        {/* Sidebar ads */}
        {dashboardSidebarAds.length > 0 && (
          <div className="relative overflow-hidden rounded-xl h-[200px]">
            <div
              className="flex flex-col transition-transform duration-500"
              style={{
                transform: `translateY(-${sidebarCarouselIndex * 100}%)`,
              }}
            >
              {dashboardSidebarAds.map(ad => (
                <div key={ad.id} className="h-[200px]">
                  <SponsorSidebarAd ad={ad} />
                </div>
              ))}
            </div>

            {/* Sidebar dots */}
            {dashboardSidebarAds.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {dashboardSidebarAds.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSidebarCarouselIndex(index)}
                    className={`h-1.5 rounded-full ${
                      index === sidebarCarouselIndex
                        ? 'bg-white w-4'
                        : 'bg-white/50 w-1.5'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Important Updates */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 xl:max-w-[720px] xl:mx-auto">
<style>{customScrollbarStyles}</style>

<div className="mb-2">
  <div className="flex items-center gap-2 mb-2">
    <Award className="h-5 w-5 text-emerald-600" />
    <h3 className="text-lg font-bold text-gray-800">
      Important Updates
    </h3>
  </div>
  <p className="text-sm text-gray-600">
    Stay informed with the latest from Creditor Academy. For prompt resolution
    of any concerns, connect with our dedicated leads below.
  </p>
</div>

<div
  ref={importantUpdatesScrollRef}
  className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory important-updates-scroll"
>
  {/* ================= Athena LMS ================= */}
  <div className="important-update-card w-full min-w-[280px] max-w-[320px] p-[clamp(12px,1.6vw,18px)] flex flex-col gap-2.5 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white transition-all duration-300 hover:shadow-md hover:border-indigo-200 flex-shrink-0 snap-center">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
        <MonitorPlay className="h-5 w-5 text-white" />
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <h4 className="text-[clamp(14px,1.3vw,18px)] font-semibold text-gray-900 leading-tight">
          Athena LMS and Login Issues
        </h4>

        <p className="text-[clamp(12px,1.05vw,15px)] text-gray-600">
          If you're facing Athena LMS access or login problems, reach out to
          our Platform Lead for quick help.
        </p>

        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm w-full sm:w-auto mt-auto self-start"
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

  {/* ================= Payments ================= */}
  <div className="important-update-card w-full min-w-[280px] max-w-[320px] p-[clamp(12px,1.6vw,18px)] flex flex-col gap-2.5 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white transition-all duration-300 hover:shadow-md hover:border-emerald-200 flex-shrink-0 snap-center">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
        <CheckCircle className="h-5 w-5 text-white" />
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <h4 className="text-[clamp(14px,1.3vw,18px)] font-semibold text-gray-900 leading-tight">
          Credits and Debits Issues
        </h4>

        <p className="text-[clamp(12px,1.05vw,15px)] text-gray-600">
          For any payment, credit, or debit related issues, connect with our
          Payment Lead to resolve them quickly.
        </p>

        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm w-full sm:w-auto mt-auto self-start"
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

  {/* ================= Maintenance ================= */}
  <div className="important-update-card w-full min-w-[280px] max-w-[320px] p-[clamp(12px,1.6vw,18px)] flex flex-col gap-2.5 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white transition-all duration-300 hover:shadow-md hover:border-amber-200 flex-shrink-0 snap-center">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
        <Clock className="h-5 w-5 text-white" />
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <h4 className="text-[clamp(14px,1.3vw,18px)] font-semibold text-gray-900 leading-tight">
          Progress Tracker Under Maintenance
        </h4>

        <p className="text-[clamp(12px,1.05vw,15px)] text-gray-600">
          Progress tracking is temporarily unavailable. Book Smart tracking
          continues to function normally.
        </p>
      </div>
    </div>
  </div>
</div>
</div>


        <DashboardCalendar />
      </div>
    </div>
  );
};

export default DashboardTopSection;
