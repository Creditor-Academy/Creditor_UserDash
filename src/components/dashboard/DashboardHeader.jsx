import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Calendar,
  Mail,
  BellDot,
  BookOpen,
  Loader2,
  Lock,
  AlertCircle,
  Users,
  User,
  Menu,
  Menu as MenuIcon,
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import NotificationModal from './NotificationModal';
import InboxModal from './InboxModal';
import CalendarModal from './CalendarModal';
import UserDetailsModal from '@/components/UserDetailsModal';
import CreditPurchaseModal from '@/components/credits/CreditPurchaseModal';
import { search } from '@/services/searchService';
import { fetchUserCourses } from '@/services/courseService';
import {
  fetchDetailedUserProfile,
  fetchUserCoursesByUserId,
  fetchAllUsersAdmin,
  fetchUserProfile,
  fetchPublicUserProfile,
} from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotifications } from '@/services/notificationService';
import { useCredits } from '@/contexts/CreditsContext';
import { SeasonalThemeContext } from '@/contexts/SeasonalThemeContext';

export function DashboardHeader({ sidebarCollapsed, onMobileMenuClick }) {
  const { activeTheme, setTheme } = useContext(SeasonalThemeContext);
  const { isInstructorOrAdmin, hasRole } = useAuth();
  const { balance, addCredits } = useCredits();
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [inboxModalOpen, setInboxModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(true);
  const [showEnrollmentAlert, setShowEnrollmentAlert] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState(null);
  const [apiNotifications, setApiNotifications] = useState([]);
  const [viewerTimezone, setViewerTimezone] = useState(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Display helper: format credit points using USD-style units (K, M, B, T)
  // Show exact numbers for 100-999 range, clamp others to 100 and append '+' if clamped
  const formatCreditPoints = value => {
    const num = Number(value) || 0;
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    const formatWithClamp = (val, suffix) => {
      let display = val;
      let clamped = false;
      if (display > 100) {
        display = 100;
        clamped = true;
      }
      // Keep at most one decimal place; strip trailing .0
      const rounded = Math.round(display * 10) / 10;
      const text = rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
      return `${sign}${text}${suffix}${clamped ? '+' : ''}`;
    };

    // Units in descending order for easy promotion (e.g., 100M -> 1B)
    const units = [
      { value: 1_000_000_000_000, suffix: 'T' },
      { value: 1_000_000_000, suffix: 'B' },
      { value: 1_000_000, suffix: 'M' },
      { value: 1_000, suffix: 'K' },
    ];

    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (abs >= u.value) {
        const val = abs / u.value;
        // If value is at least 100 of this unit, promote to the next higher unit
        if (val >= 100 && i > 0) {
          const higher = units[i - 1];
          const hasPlus = abs > 100 * u.value; // strictly greater than the threshold
          return `${sign}1${higher.suffix}${hasPlus ? '+' : ''}`;
        }
        return formatWithClamp(val, u.suffix);
      }
    }

    // For values 100-999, show exact number without clamping
    if (abs >= 100 && abs < 1000) {
      return `${sign}${Math.round(abs)}`;
    }

    // For small values (< 100), show exact number
    // For large values (>= 1000), clamp to 100 and add +
    if (abs < 100) {
      return `${sign}${Math.round(abs)}`;
    } else {
      return `${sign}100+`;
    }
  };

  // Listen for a global request to open the credits modal
  useEffect(() => {
    const handler = () => setCreditsModalOpen(true);
    window.addEventListener('open-credits-modal', handler);
    return () => window.removeEventListener('open-credits-modal', handler);
  }, []);

  // Local notifications persistence helpers
  const LOCAL_NOTIFS_KEY = 'local_notifications';
  const READ_ALL_AT_KEY = 'notifications_read_all_at';
  const readLocalNotifications = () => {
    try {
      const raw = localStorage.getItem(LOCAL_NOTIFS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const writeLocalNotifications = items => {
    try {
      localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(items || []));
    } catch {}
  };
  const readReadAllAt = () => {
    try {
      return localStorage.getItem(READ_ALL_AT_KEY) || null;
    } catch {
      return null;
    }
  };
  const writeReadAllAt = isoString => {
    try {
      localStorage.setItem(READ_ALL_AT_KEY, isoString || '');
    } catch {}
  };

  // Fetch enrolled courses on component mount with caching
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        // Check if we have cached enrolled courses (valid for 5 minutes)
        const cached = localStorage.getItem('enrolledCourses');
        const cacheTime = localStorage.getItem('enrolledCoursesTime');
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        if (cached && cacheTime && now - parseInt(cacheTime) < CACHE_DURATION) {
          console.log(
            '✅ Using cached enrolled courses - avoiding getCourses API call!'
          );
          setEnrolledCourses(JSON.parse(cached));
          setIsLoadingEnrolled(false);
          return;
        }

        console.log('🔄 Fetching enrolled courses from API...');
        const courses = await fetchUserCourses();
        setEnrolledCourses(courses);

        // Cache the results
        localStorage.setItem('enrolledCourses', JSON.stringify(courses));
        localStorage.setItem('enrolledCoursesTime', now.toString());
      } catch (error) {
        console.error('Failed to fetch enrolled courses:', error);
        setEnrolledCourses([]);
      } finally {
        setIsLoadingEnrolled(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  // Fetch current viewer profile to get timezone for consistent date formatting
  useEffect(() => {
    const loadViewerProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        if (profile && (profile.timezone || profile.timeZone)) {
          setViewerTimezone(profile.timezone || profile.timeZone);
        }
      } catch (e) {
        // Non-fatal
      }
    };
    loadViewerProfile();
  }, []);

  // Centralized notifications fetcher
  const refreshNotifications = async () => {
    try {
      const response = await fetchNotifications();
      console.log('Full notification response:', response);
      console.log('Response data:', response.data);

      // Backend returns: { success: true, notifications: [...] }
      // Handle different possible response structures
      let notificationsRaw =
        response.data?.notifications ||
        response.data?.data?.notifications ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);

      console.log('Parsed notifications raw:', notificationsRaw);
      // Do not show ticket-reply notifications to admins
      if (hasRole && hasRole('admin')) {
        notificationsRaw = notificationsRaw.filter(
          n => (n.type || n.related_type)?.toString().toUpperCase() !== 'TICKET'
        );
      }
      const readAllAt = readReadAllAt();
      const readAllAtTime = readAllAt ? new Date(readAllAt).getTime() : null;
      // Apply client-side read cutoff so items before readAllAt are treated as read
      const notifications = notificationsRaw.map(n => {
        if (!readAllAtTime) return n;
        const createdTime = n.created_at
          ? new Date(n.created_at).getTime()
          : null;
        if (createdTime && createdTime <= readAllAtTime) {
          return { ...n, read: true };
        }
        return n;
      });

      // Merge with local notifications currently in state by id
      setApiNotifications(prev => {
        const localItems = readLocalNotifications();
        const byId = new Map();
        [...localItems, ...notifications, ...prev].forEach(n =>
          byId.set(String(n.id ?? n._id), n)
        );
        const merged = Array.from(byId.values());
        return merged;
      });

      let localItems = readLocalNotifications().map(n => {
        if (!readAllAtTime) return n;
        const createdTime = n.created_at
          ? new Date(n.created_at).getTime()
          : null;
        if (createdTime && createdTime <= readAllAtTime) {
          return { ...n, read: true };
        }
        return n;
      });
      if (hasRole && hasRole('admin')) {
        localItems = localItems.filter(
          n => (n.type || n.related_type)?.toString().toUpperCase() !== 'TICKET'
        );
      }
      const unread = [...notifications, ...localItems].filter(
        n => !n.read
      ).length;
      setUnreadNotifications(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      // On failure, at least reflect local unread count
      const localItems = readLocalNotifications();
      setApiNotifications(prev => {
        const byId = new Map();
        [...localItems, ...prev].forEach(n =>
          byId.set(String(n.id ?? n._id), n)
        );
        return Array.from(byId.values());
      });
      setUnreadNotifications(localItems.filter(n => !n.read).length);
    }
  };

  // Retry helper to handle eventual consistency from backend
  const refreshNotificationsWithRetry = async () => {
    await refreshNotifications();
    setTimeout(() => {
      refreshNotifications();
    }, 1500);
  };

  // Initial notifications load: hydrate locals, then refresh from API
  useEffect(() => {
    const locals = readLocalNotifications();
    const readAllAt = readReadAllAt();
    const readAllAtTime = readAllAt ? new Date(readAllAt).getTime() : null;
    if (locals.length) {
      const normalizedLocals = readAllAtTime
        ? locals.map(n => {
            const t = n.created_at ? new Date(n.created_at).getTime() : null;
            return t && t <= readAllAtTime ? { ...n, read: true } : n;
          })
        : locals;
      setApiNotifications(prev => [...normalizedLocals, ...prev]);
      setUnreadNotifications(normalizedLocals.filter(n => !n.read).length);
    }
    refreshNotificationsWithRetry();
  }, []);

  // Refresh notifications when modal opens
  useEffect(() => {
    if (!notificationModalOpen) return;
    refreshNotificationsWithRetry();
  }, [notificationModalOpen]);

  // Listen for global refresh events (e.g., after creating a course)
  useEffect(() => {
    const handler = () => refreshNotificationsWithRetry();
    window.addEventListener('refresh-notifications', handler);
    return () => window.removeEventListener('refresh-notifications', handler);
  }, []);

  // Listen for adding a local notification (frontend fallback)
  useEffect(() => {
    const handler = e => {
      const incoming = e?.detail;
      if (!incoming) return;
      setApiNotifications(prev => [incoming, ...prev]);
      if (!incoming.read) setUnreadNotifications(prev => prev + 1);
      // Persist
      const locals = readLocalNotifications();
      writeLocalNotifications([incoming, ...locals]);
    };
    window.addEventListener('add-local-notification', handler);
    return () => window.removeEventListener('add-local-notification', handler);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(null);
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const data = await search(searchQuery);
          // Ensure data has the correct structure
          if (data && data.results) {
            setSearchResults(data);
          } else {
            // Fallback structure if response doesn't match
            setSearchResults({
              results: {
                courses: [],
                users: [],
              },
            });
          }
          setShowDropdown(true);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults({
            results: {
              courses: [],
              users: [],
            },
          });
          setShowDropdown(true);
        } finally {
          setIsSearching(false);
        }
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Hide dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Handle keyboard navigation
  const handleKeyDown = e => {
    if (!showDropdown || !searchResults) return;

    const totalResults =
      (searchResults.results?.courses?.length || 0) +
      (searchResults.results?.users?.length || 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedResultIndex(prev =>
          prev < totalResults - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedResultIndex(prev =>
          prev > 0 ? prev - 1 : totalResults - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedResultIndex >= 0) {
          // Navigate to the selected result
          const courses = searchResults.results?.courses || [];
          const users = searchResults.results?.users || [];

          if (selectedResultIndex < courses.length) {
            handleCourseClick(courses[selectedResultIndex].id);
          } else {
            const userIndex = selectedResultIndex - courses.length;
            if (userIndex < users.length) {
              handleUserClick(users[userIndex].id);
            }
          }
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedResultIndex(-1);
        setShowMobileSearch(false);
        break;
    }
  };

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedResultIndex(-1);
  }, [searchResults]);

  const handleCourseClick = courseId => {
    // Check if user is enrolled in this course
    const isEnrolled = enrolledCourses.some(course => course.id === courseId);

    if (isEnrolled) {
      setShowDropdown(false);
      setSearchQuery('');
      setShowMobileSearch(false);
      navigate(`/dashboard/courses/${courseId}/modules`);
    } else {
      // Show enrollment alert
      setSelectedCourseId(courseId);
      setShowEnrollmentAlert(true);
      setShowDropdown(false);
      setShowMobileSearch(false);
    }
  };

  const handleUserClick = async userId => {
    setShowDropdown(false);
    setSearchQuery('');
    setShowMobileSearch(false);
    setUserDetailsError(null);
    setUserDetailsLoading(true);
    setShowUserDetailsModal(true);

    try {
      if (isInstructorOrAdmin()) {
        // For instructors/admins, fetch detailed profile
        let userData = await fetchDetailedUserProfile(userId);

        // Fallback: if no activity_log/last_login present, try pulling from admin user list
        if (!userData?.activity_log || userData.activity_log.length === 0) {
          try {
            const allUsers = await fetchAllUsersAdmin();
            const match = (allUsers || []).find(u => u.id === userId);
            if (match?.activity_log && match.activity_log.length > 0) {
              userData = { ...userData, activity_log: match.activity_log };
            }
          } catch (e) {
            // Non-fatal: keep userData as-is
          }
        }

        setSelectedUser(userData);
      } else {
        // For regular users, fetch public-safe profile, then merge courses
        try {
          const publicProfile = await fetchPublicUserProfile(userId);
          try {
            const coursesData = await fetchUserCoursesByUserId(userId);
            setSelectedUser({ ...publicProfile, courses: coursesData || [] });
          } catch (coursesError) {
            console.warn('Could not fetch courses for user:', coursesError);
            setSelectedUser(publicProfile);
          }
        } catch (publicErr) {
          console.warn(
            'Could not fetch public user profile, fallback to search result user:',
            publicErr
          );
          const users = searchResults.results?.users || [];
          const fallback = users.find(user => user.id === userId);
          if (fallback) {
            setSelectedUser(fallback);
          } else {
            setUserDetailsError('User data not found');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setUserDetailsError(error?.message || 'Failed to fetch user details');
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (searchQuery.trim() !== '' && searchResults) {
      setShowDropdown(true);
    }
  };

  const closeEnrollmentAlert = () => {
    setShowEnrollmentAlert(false);
    setSelectedCourseId(null);
  };

  // Handle notification updates
  const handleNotificationUpdate = newCount => {
    setUnreadNotifications(newCount);
  };

  // Handler passed to modal when all marked as read
  // Note: The API call is already handled in NotificationModal.handleMarkAllAsRead()
  // This callback only handles local state updates and persistence
  const handleAllMarkedRead = () => {
    // Persist read-all cutoff and update local storage
    const nowIso = new Date().toISOString();
    writeReadAllAt(nowIso);
    const locals = readLocalNotifications();
    const updatedLocals = locals.map(n => ({ ...n, read: true }));
    writeLocalNotifications(updatedLocals);

    setApiNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadNotifications(0);

    // Optionally re-fetch for UI sync
    setTimeout(() => {
      refreshNotifications();
    }, 500);
  };

  return (
    <>
      <header
        className={`app-header sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/95 relative ${
          activeTheme === 'newYear' ? 'newyear-app-header' : ''
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 sm:px-6">
          {/* Left: Mobile menu + Logo */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              aria-label="Open menu"
              onClick={() => onMobileMenuClick && onMobileMenuClick()}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <button
              className="flex items-center focus:outline-none"
              onClick={() => {
                if (window.location.pathname === '/dashboard') {
                  window.location.reload();
                } else {
                  window.location.href = '/dashboard';
                }
              }}
            >
              <h1
                className={`text-base sm:text-lg font-bold ${
                  activeTheme === 'newYear'
                    ? 'text-gray-900'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                }`}
              >
                LMS Athena
              </h1>
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-4 lg:mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search courses and users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 pr-4 py-3 w-full bg-gray-50 border-0 rounded-2xl text-gray-800 text-sm h-12 shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-200"
                style={{ outline: 'none' }}
              />
            </form>

            {/* Search Results Dropdown */}
            {showDropdown && searchResults && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50 search-results-dropdown"
              >
                {/* Total Results Header */}
                {(searchResults.results?.courses?.length > 0 ||
                  searchResults.results?.users?.length > 0) && (
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-700">
                      Found {searchResults.results?.courses?.length || 0} course
                      {(searchResults.results?.courses?.length || 0) !== 1
                        ? 's'
                        : ''}
                      {searchResults.results?.users?.length > 0 && (
                        <span>
                          {' '}
                          and {searchResults.results.users.length} user
                          {searchResults.results.users.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Courses Section */}
                {searchResults.results?.courses?.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Courses ({searchResults.results.courses.length})
                    </h3>
                    <div className="space-y-2">
                      {searchResults.results.courses.map((course, index) => {
                        const isEnrolled = enrolledCourses.some(
                          ec => ec.id === course.id
                        );
                        const isSelected = selectedResultIndex === index;
                        return (
                          <button
                            key={course.id}
                            onClick={() => handleCourseClick(course.id)}
                            onMouseEnter={() => setSelectedResultIndex(index)}
                            onMouseLeave={() => setSelectedResultIndex(-1)}
                            className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                          >
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {course.title}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                Course
                                {isEnrolled ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Enrolled
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Not Enrolled
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Users Section - Show for all users */}
                {searchResults.results?.users?.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Users ({searchResults.results.users.length})
                    </h3>
                    <div className="space-y-2">
                      {searchResults.results.users.map((user, index) => {
                        const userRole = user.user_roles?.[0]?.role || 'user';
                        const roleColor =
                          userRole === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : userRole === 'instructor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600';
                        const isSelected =
                          selectedResultIndex ===
                          searchResults.results.courses.length + index;

                        return (
                          <button
                            key={user.id}
                            onClick={() => handleUserClick(user.id)}
                            onMouseEnter={() =>
                              setSelectedResultIndex(
                                searchResults.results.courses.length + index
                              )
                            }
                            onMouseLeave={() => setSelectedResultIndex(-1)}
                            className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                          >
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={`${user.first_name} ${user.last_name}`}
                                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <User className="h-4 w-4 text-green-600" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                {user.email}
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColor}`}
                                >
                                  {userRole.charAt(0).toUpperCase() +
                                    userRole.slice(1)}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No Results Message */}
                {!searchResults.results?.courses?.length &&
                  !searchResults.results?.users?.length && (
                    <div className="p-4 text-center text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="font-medium">
                        No results found for "{searchQuery}"
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try different keywords or check your spelling
                      </p>
                    </div>
                  )}

                {/* Loading State */}
                {isSearching && (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-blue-500" />
                    <p>Searching...</p>
                  </div>
                )}

                {/* Keyboard Navigation Hints */}
                {showDropdown &&
                  searchResults &&
                  !isSearching &&
                  (searchResults.results?.courses?.length > 0 ||
                    searchResults.results?.users?.length > 0) && (
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                      <div className="flex items-center justify-center gap-4">
                        <span>↑↓ Navigate</span>
                        <span>Enter Select</span>
                        <span>Esc Close</span>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Right - Enhanced Icons and Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() =>
                setTheme(activeTheme === 'newYear' ? 'default' : 'newYear')
              }
              aria-pressed={activeTheme === 'newYear'}
              className={`hidden sm:inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors newyear-toggle-btn ${
                activeTheme === 'newYear'
                  ? 'text-gray-900 border-gray-300 bg-gray-50 hover:bg-gray-100'
                  : 'text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {activeTheme === 'newYear'
                ? 'Disable New Year Theme'
                : '🎆 Enable New Year Theme'}
            </button>
            {/* Credits Badge */}
            <button
              onClick={() => setCreditsModalOpen(true)}
              className="group relative px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur hover:bg-white text-gray-900 flex items-center gap-1.5 sm:gap-2 shadow-sm hover:shadow transition-all"
              aria-label="Open credits purchase"
              title="Manage credits"
            >
              <span className="inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-300 text-black text-[9px] sm:text-[10px] font-extrabold shadow-inner">
                CP
              </span>
              <span className="text-xs sm:text-sm font-semibold tabular-nums tracking-wide">
                {formatCreditPoints(balance)}
              </span>
              <span className="ml-1 inline-flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                +
              </span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationModalOpen(true)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Notifications"
              title="Notifications"
            >
              <BellDot className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="ml-1 sm:ml-2">
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden p-4 border-t border-gray-200 bg-white">
            <form onSubmit={handleSearchSubmit} className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search courses and users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 pr-4 py-3 w-full bg-gray-50 border-0 rounded-2xl text-gray-800 text-sm h-12 shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-200"
                style={{ outline: 'none' }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setShowMobileSearch(false);
                  setShowDropdown(false);
                  setSearchQuery('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </form>

            {/* Mobile Search Results Dropdown */}
            {showDropdown && searchResults && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
              >
                {/* Total Results Header */}
                {(searchResults.results?.courses?.length > 0 ||
                  searchResults.results?.users?.length > 0) && (
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-700">
                      Found {searchResults.results?.courses?.length || 0} course
                      {(searchResults.results?.courses?.length || 0) !== 1
                        ? 's'
                        : ''}
                      {searchResults.results?.users?.length > 0 && (
                        <span>
                          {' '}
                          and {searchResults.results.users.length} user
                          {searchResults.results.users.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Courses Section */}
                {searchResults.results?.courses?.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Courses ({searchResults.results.courses.length})
                    </h3>
                    <div className="space-y-2">
                      {searchResults.results.courses.map((course, index) => {
                        const isEnrolled = enrolledCourses.some(
                          ec => ec.id === course.id
                        );
                        const isSelected = selectedResultIndex === index;
                        return (
                          <button
                            key={course.id}
                            onClick={() => handleCourseClick(course.id)}
                            onMouseEnter={() => setSelectedResultIndex(index)}
                            onMouseLeave={() => setSelectedResultIndex(-1)}
                            className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                          >
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {course.title}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                Course
                                {isEnrolled ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Enrolled
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Not Enrolled
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Users Section - Show for all users */}
                {searchResults.results?.users?.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Users ({searchResults.results.users.length})
                    </h3>
                    <div className="space-y-2">
                      {searchResults.results.users.map((user, index) => {
                        const userRole = user.user_roles?.[0]?.role || 'user';
                        const roleColor =
                          userRole === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : userRole === 'instructor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600';
                        const isSelected =
                          selectedResultIndex ===
                          searchResults.results.courses.length + index;

                        return (
                          <button
                            key={user.id}
                            onClick={() => handleUserClick(user.id)}
                            onMouseEnter={() =>
                              setSelectedResultIndex(
                                searchResults.results.courses.length + index
                              )
                            }
                            onMouseLeave={() => setSelectedResultIndex(-1)}
                            className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                          >
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={`${user.first_name} ${user.last_name}`}
                                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <User className="h-4 w-4 text-green-600" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                {user.email}
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColor}`}
                                >
                                  {userRole.charAt(0).toUpperCase() +
                                    userRole.slice(1)}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No Results Message */}
                {!searchResults.results?.courses?.length &&
                  !searchResults.results?.users?.length && (
                    <div className="p-4 text-center text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="font-medium">
                        No results found for "{searchQuery}"
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try different keywords or check your spelling
                      </p>
                    </div>
                  )}

                {/* Loading State */}
                {isSearching && (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-blue-500" />
                    <p>Searching...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Calendar Modal */}
        <CalendarModal
          open={calendarModalOpen}
          onOpenChange={setCalendarModalOpen}
        />

        {/* Notification Modal */}
        <NotificationModal
          open={notificationModalOpen}
          onOpenChange={setNotificationModalOpen}
          onNotificationUpdate={handleNotificationUpdate}
          notificationsFromApi={apiNotifications}
          onMarkedAllRead={handleAllMarkedRead}
        />

        {/* Inbox Modal */}
        <InboxModal open={inboxModalOpen} onOpenChange={setInboxModalOpen} />

        {/* User Details Modal */}
        <UserDetailsModal
          isOpen={showUserDetailsModal}
          onClose={() => {
            setShowUserDetailsModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          isLoading={userDetailsLoading}
          error={userDetailsError}
          isInstructorOrAdmin={isInstructorOrAdmin()}
          viewerTimezone={viewerTimezone}
        />
      </header>

      {/* Credits Modal - render outside header to center across full viewport */}
      <CreditPurchaseModal
        open={creditsModalOpen}
        onClose={() => setCreditsModalOpen(false)}
        balance={balance}
        onBalanceChange={(_, meta) => {
          const delta = meta?.added ?? 0;
          if (delta) addCredits(delta);
        }}
      />

      {/* Enrollment Alert Modal */}
      {showEnrollmentAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Course Not Enrolled
                </h3>
                <p className="text-sm text-gray-600">
                  You need to enroll in this course to access its modules.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/dashboard/catalog')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Browse Catalog
              </Button>
              <Button
                onClick={closeEnrollmentAlert}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardHeader;
