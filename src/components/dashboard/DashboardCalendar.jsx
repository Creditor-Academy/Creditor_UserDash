import React, { useContext } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import {
  getAllUpcomingEvents,
  expandRecurringEvents,
} from '@/services/calendarService';
import { SeasonalThemeContext } from '@/contexts/SeasonalThemeContext';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export function DashboardCalendar() {
  const { activeTheme } = useContext(SeasonalThemeContext);
  const today = new Date();
  const [date, setDate] = React.useState(today);
  const [allEvents, setAllEvents] = React.useState([]); // store all expanded events/occurrences
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [openEventId, setOpenEventId] = React.useState(null);
  const [showEventsView, setShowEventsView] = React.useState(false);
  const [viewingDate, setViewingDate] = React.useState(null);

  const formatTimeRange = (start, end) => {
    if (!start || !end) return 'Time not available';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeOptions = { hour: 'numeric', minute: '2-digit' };
    return `${startDate.toLocaleTimeString([], timeOptions)} - ${endDate.toLocaleTimeString([], timeOptions)}`;
  };

  React.useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Fetch all upcoming events (with occurrences) once
  React.useEffect(() => {
    async function fetchAllUpcoming() {
      setLoading(true);
      setError(null);
      try {
        const events = await getAllUpcomingEvents();
        console.log('Raw events from API:', events);

        // Use the utility function to expand recurring events
        const expanded = expandRecurringEvents(events);

        console.log('Expanded events:', expanded.length);
        // Debug live events
        expanded.forEach(event => {
          const isLive = isEventLive(event);
          if (isLive) {
            console.log('LIVE EVENT FOUND:', event.title, {
              startTime: event.startTime,
              endTime: event.endTime,
              now: new Date().toISOString(),
            });
          }
        });
        setAllEvents(expanded);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAllUpcoming();
  }, []);

  // Refresh events when timezone changes
  React.useEffect(() => {
    const handleTimezoneChange = () => {
      // Re-fetch events when timezone changes
      const fetchEvents = async () => {
        try {
          const events = await getAllUpcomingEvents();
          const expanded = expandRecurringEvents(events);
          setAllEvents(expanded);
        } catch (err) {
          console.error('Error refreshing events:', err);
        }
      };
      fetchEvents();
    };

    window.addEventListener('storage', e => {
      if (e.key === 'userTimezone') {
        handleTimezoneChange();
      }
    });

    return () => {
      window.removeEventListener('storage', handleTimezoneChange);
    };
  }, []);

  // Filter events for the selected date and add live status
  const selectedDateEvents = React.useMemo(() => {
    if (!date) return [];
    const filteredEvents = allEvents.filter(
      event =>
        event.date &&
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );

    // Add live status to events
    return filteredEvents.map(event => {
      const now = new Date();
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const isLive = now >= start && now <= end;
      const isUpcoming = now < start;
      const isEnded = now > end;

      return {
        ...event,
        isLive,
        isUpcoming,
        isEnded,
        status: isLive
          ? 'live'
          : isUpcoming
            ? 'upcoming'
            : isEnded
              ? 'ended'
              : 'unknown',
      };
    });
  }, [date, allEvents]);

  // Get events for a specific date
  const getEventsForDate = targetDate => {
    if (!targetDate) return [];
    const filteredEvents = allEvents.filter(
      event =>
        event.date &&
        event.date.getDate() === targetDate.getDate() &&
        event.date.getMonth() === targetDate.getMonth() &&
        event.date.getFullYear() === targetDate.getFullYear()
    );

    // Add live status to events
    return filteredEvents.map(event => {
      const now = new Date();
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const isLive = now >= start && now <= end;
      const isUpcoming = now < start;
      const isEnded = now > end;

      return {
        ...event,
        isLive,
        isUpcoming,
        isEnded,
        status: isLive
          ? 'live'
          : isUpcoming
            ? 'upcoming'
            : isEnded
              ? 'ended'
              : 'unknown',
      };
    });
  };

  // Handle date click - flip to events view
  const handleDateClick = selectedDate => {
    if (selectedDate) {
      const eventsForDate = getEventsForDate(selectedDate);
      if (eventsForDate.length > 0) {
        setViewingDate(selectedDate);
        setShowEventsView(true);
      }
    }
  };

  // Handle back button - flip back to calendar view
  const handleBackToCalendar = () => {
    setShowEventsView(false);
    setViewingDate(null);
  };

  // Get events for the viewing date
  const viewingDateEvents = React.useMemo(() => {
    if (!viewingDate) return [];
    return getEventsForDate(viewingDate);
  }, [viewingDate, allEvents]);

  // Check if an event is currently live
  const isEventLive = event => {
    if (!event.startTime || !event.endTime) {
      console.log('Event missing startTime or endTime:', event.title, {
        startTime: event.startTime,
        endTime: event.endTime,
      });
      return false;
    }
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const isLive = now >= startTime && now <= endTime;

    if (isLive) {
      console.log('Event is LIVE:', event.title, {
        now: now.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    }

    return isLive;
  };

  const getStatusColor = event => {
    if (isEventLive(event)) {
      return 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50';
    }

    const status = event.status || 'upcoming';
    switch (status) {
      case 'live':
        return 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-800/50';
      case 'upcoming':
        return 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50';
      case 'ongoing':
        return 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/50';
      case 'completed':
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:hover:bg-gray-700/50';
      case 'ended':
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:hover:bg-gray-700/50';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:hover:bg-gray-700/50';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'live':
        return 'LIVE';
      case 'upcoming':
        return 'UPCOMING';
      case 'ongoing':
        return 'ONGOING';
      case 'completed':
        return 'COMPLETED';
      case 'ended':
        return 'ENDED';
      default:
        return 'UNKNOWN';
    }
  };

  const handleJoinLiveClass = event => {
    if (event.isLive && event.description) {
      window.open(event.description, '_blank');
    }
  };

  const eventVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        type: 'spring',
        stiffness: 500,
        damping: 20,
      },
    }),
  };

  // Count live events for viewing date or selected date
  const liveEventsCount = React.useMemo(() => {
    const eventsToCount = showEventsView
      ? viewingDateEvents
      : selectedDateEvents;
    return eventsToCount.filter(event => event.isLive).length;
  }, [showEventsView, viewingDateEvents, selectedDateEvents]);

  const formatDate = date => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleJoinMeeting = event => {
    if (event.isLive && event.description) {
      window.open(event.description, '_blank');
    } else if (
      event.description &&
      (event.description.startsWith('http://') ||
        event.description.startsWith('https://'))
    ) {
      window.open(event.description, '_blank');
    } else if (event.meetingLink) {
      window.open(event.meetingLink, '_blank');
    }
  };

  return (
    <TooltipProvider>
      <Card className="border shadow hover:shadow-lg transition-all duration-300 hover:border-primary/20 group w-full max-w-sm relative overflow-hidden">
        {/* Flip Container */}
        <div
          className="relative w-full"
          style={{ perspective: '1000px', minHeight: '360px' }}
        >
          {/* Calendar View (Front) */}
          <motion.div
            className="absolute inset-0 w-full"
            animate={{
              rotateY: showEventsView ? 180 : 0,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              backfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="p-3 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
                >
                  <CalendarIcon size={18} className="text-primary" />
                </motion.div>
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors duration-300">
                  Calendar
                </h3>
                {liveEventsCount > 0 && !showEventsView && (
                  <Badge className="bg-purple-100 text-purple-600 text-xs px-2 py-0 ml-1">
                    {liveEventsCount} Live
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!showEventsView && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 mr-1 transition-transform hover:bg-primary/10"
                      onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                      <motion.div
                        animate={{ rotate: isCollapsed ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isCollapsed ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronUp size={14} />
                        )}
                      </motion.div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 transition-colors duration-300 hover:text-primary"
                      asChild
                    >
                      <Link to="/dashboard/calendar">View all</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {!showEventsView && (
              <>
                <Collapsible open={!isCollapsed} className="w-full">
                  <CollapsibleContent className="w-full">
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-2 border-b"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={d => {
                          if (d) {
                            setDate(d);
                            handleDateClick(d);
                          }
                        }}
                        className="w-full border rounded-md pointer-events-auto transition-all duration-300 hover:border-primary/30"
                        showOutsideDays={true}
                        classNames={{
                          months: 'w-full flex flex-col space-y-4',
                          month: 'space-y-4 w-full',
                          caption:
                            'flex justify-center pt-1 relative items-center',
                          caption_label: 'text-sm font-medium',
                          nav: 'space-x-1 flex items-center',
                          table: 'w-full border-collapse space-y-1',
                          head_row: 'flex w-full',
                          head_cell:
                            'text-muted-foreground rounded-md w-full font-normal text-[0.7rem] px-1',
                          row: 'flex w-full mt-2',
                          cell: 'h-7 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                          day: 'h-7 w-full p-0 text-xs aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground pointer-events-auto transition-all duration-200 hover:scale-110 flex flex-col items-center justify-center cursor-pointer',
                          day_selected:
                            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground hover:scale-100',
                          day_today:
                            'bg-accent text-accent-foreground ring-1 ring-primary',
                          day_outside: 'text-muted-foreground opacity-50',
                          day_disabled: 'text-muted-foreground opacity-30',
                          nav_button:
                            'h-6 w-6 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-accent flex items-center justify-center transition-all duration-200 hover:text-primary',
                          nav_button_previous: 'ml-1',
                          nav_button_next: 'mr-1',
                        }}
                        renderDay={day => {
                          const dayEvents = allEvents.filter(
                            event =>
                              event.date &&
                              event.date.getDate() === day.getDate() &&
                              event.date.getMonth() === day.getMonth() &&
                              event.date.getFullYear() === day.getFullYear()
                          );
                          const hasEvent = dayEvents.length > 0;
                          const hasLiveEvent = dayEvents.some(event => {
                            const now = new Date();
                            const start = new Date(event.startTime);
                            const end = new Date(event.endTime);
                            return now >= start && now <= end;
                          });

                          // Sort events by start time
                          const sortedEvents = [...dayEvents].sort((a, b) => {
                            return (
                              new Date(a.startTime) - new Date(b.startTime)
                            );
                          });

                          // Get upcoming events (not ended)
                          const upcomingEvents = sortedEvents.filter(event => {
                            const now = new Date();
                            const end = new Date(event.endTime);
                            return now < end;
                          });

                          // Theme colors
                          const indicatorColor =
                            activeTheme === 'newYear'
                              ? hasLiveEvent
                                ? 'bg-yellow-500' // Yellow for live events in New Year mode
                                : 'bg-blue-500' // Blue for regular events in New Year mode
                              : hasLiveEvent
                                ? 'bg-purple-500' // Purple for live events
                                : 'bg-blue-500'; // Blue for regular events

                          const dayContent = (
                            <div className="flex flex-col items-center justify-center w-full h-full relative">
                              <span>{day.getDate()}</span>
                              {hasEvent && (
                                <span
                                  className={`w-1.5 h-1.5 mt-0.5 rounded-full inline-block ${indicatorColor} ${
                                    hasLiveEvent ? 'animate-pulse' : ''
                                  }`}
                                ></span>
                              )}
                            </div>
                          );

                          // If there are events, wrap in tooltip
                          if (hasEvent) {
                            const pastEvents = sortedEvents.filter(event => {
                              const now = new Date();
                              const end = new Date(event.endTime);
                              return now > end;
                            });

                            return (
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  {dayContent}
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="max-w-xs p-3 bg-white border shadow-lg rounded-lg z-50"
                                  sideOffset={5}
                                >
                                  <div className="space-y-2">
                                    <div className="font-semibold text-sm text-gray-900 border-b pb-2">
                                      {dayEvents.length} Event
                                      {dayEvents.length > 1 ? 's' : ''} on{' '}
                                      {day.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </div>
                                    {upcomingEvents.length > 0 ? (
                                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                        <div className="text-xs font-medium text-gray-700 mb-1">
                                          Upcoming:
                                        </div>
                                        {upcomingEvents
                                          .slice(0, 3)
                                          .map((event, idx) => {
                                            const start = new Date(
                                              event.startTime
                                            );
                                            const end = new Date(event.endTime);
                                            const now = new Date();
                                            const isLive =
                                              now >= start && now <= end;
                                            const timeStr =
                                              start.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                              });

                                            return (
                                              <div
                                                key={`${event.id}-${idx}`}
                                                className={`text-xs p-2 rounded ${
                                                  isLive
                                                    ? 'bg-purple-50 border border-purple-200'
                                                    : 'bg-blue-50 border border-blue-100'
                                                }`}
                                              >
                                                <div className="flex items-center gap-1.5 mb-1">
                                                  {isLive && (
                                                    <motion.div
                                                      animate={{
                                                        scale: [1, 1.2, 1],
                                                      }}
                                                      transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                      }}
                                                    >
                                                      <Play
                                                        size={10}
                                                        className="text-purple-600"
                                                      />
                                                    </motion.div>
                                                  )}
                                                  <span className="font-medium text-gray-900">
                                                    {event.title}
                                                  </span>
                                                </div>
                                                <div className="text-gray-600">
                                                  {timeStr}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        {upcomingEvents.length > 3 && (
                                          <div className="text-xs text-gray-500 pt-1">
                                            +{upcomingEvents.length - 3} more
                                            upcoming event
                                            {upcomingEvents.length - 3 > 1
                                              ? 's'
                                              : ''}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-gray-500">
                                        All events for this date have ended
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          }

                          // No events, return without tooltip
                          return dayContent;
                        }}
                      />
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>

                {isCollapsed && (
                  <>
                    <div className="px-3 py-2">
                      <div className="text-sm font-medium group-hover:text-primary transition-colors duration-300">
                        {loading ? (
                          'Loading events...'
                        ) : error ? (
                          <span className="text-red-500">{error}</span>
                        ) : selectedDateEvents.length > 0 ? (
                          `Events for ${date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                        ) : (
                          `No events for ${date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                        )}
                      </div>
                    </div>
                    <ScrollArea className="h-[140px] px-3 pb-2">
                      <div className="space-y-2 pr-1">
                        {loading ? (
                          <div className="text-xs text-muted-foreground">
                            Loading events...
                          </div>
                        ) : error ? (
                          <div className="text-xs text-red-500">{error}</div>
                        ) : (
                          selectedDateEvents.map((event, index) => (
                            <Collapsible
                              key={`${event.id}-${event.date?.getTime()}`}
                              open={openEventId === event.id}
                              onOpenChange={() =>
                                setOpenEventId(prev =>
                                  prev === event.id ? null : event.id
                                )
                              }
                              className="rounded-md border border-transparent hover:border-primary/20 transition-all duration-300 bg-muted/40"
                            >
                              <CollapsibleTrigger asChild>
                                <motion.div
                                  custom={index}
                                  variants={eventVariants}
                                  initial="hidden"
                                  animate="visible"
                                  whileHover={{ scale: 1.02, x: 3 }}
                                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer group/event ${
                                    event.isLive
                                      ? 'bg-purple-50 hover:bg-purple-100 border border-purple-200'
                                      : 'bg-muted/50 hover:bg-accent/70'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {event.isLive && (
                                      <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{
                                          duration: 1,
                                          repeat: Infinity,
                                        }}
                                      >
                                        <Play
                                          size={12}
                                          className="text-purple-600"
                                        />
                                      </motion.div>
                                    )}
                                    <span className="text-xs line-clamp-1 group-hover/event:text-primary transition-colors duration-300">
                                      {event.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={`${getStatusColor(event.status)} text-xs py-0 px-2 transition-all duration-300 group-hover/event:scale-105`}
                                    >
                                      {getStatusText(event.status)}
                                    </Badge>
                                    <ChevronDown
                                      size={14}
                                      className={`text-muted-foreground transition-transform duration-200 ${openEventId === event.id ? 'rotate-180' : ''}`}
                                    />
                                  </div>
                                </motion.div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="px-2 pb-2">
                                <div className="text-xs text-muted-foreground mb-1">
                                  {formatTimeRange(
                                    event.startTime,
                                    event.endTime
                                  )}
                                </div>
                                {event.description && (
                                  <div className="text-xs text-gray-700 mb-2 line-clamp-3">
                                    {event.description}
                                  </div>
                                )}
                                {event.isLive && (
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleJoinLiveClass(event)}
                                  >
                                    Join Live
                                  </Button>
                                )}
                              </CollapsibleContent>
                            </Collapsible>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </>
            )}
          </motion.div>

          {/* Events View (Back) */}
          <motion.div
            className="absolute inset-0 w-full"
            animate={{
              rotateY: showEventsView ? 0 : 180,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              backfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="p-3 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 transition-transform hover:bg-primary/10"
                  onClick={handleBackToCalendar}
                >
                  <ArrowLeft size={14} />
                </Button>
                <CalendarIcon size={18} className="text-primary" />
                <h3 className="font-medium text-sm">
                  {viewingDate ? formatDate(viewingDate) : 'Events'}
                </h3>
                {liveEventsCount > 0 && (
                  <Badge className="bg-purple-100 text-purple-600 text-xs px-2 py-0 ml-1">
                    {liveEventsCount} Live
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-4 min-h-[450px]">
              {viewingDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-600">
                    No events on this date
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check back later for upcoming events
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] max-h-[400px]">
                  <div className="space-y-3 pr-4">
                    {viewingDateEvents.map((event, index) => (
                      <motion.div
                        key={`${event.id}-${event.date?.getTime()}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          event.isLive
                            ? 'bg-purple-50 border-purple-200 hover:bg-purple-100'
                            : 'bg-blue-50 border-blue-100 hover:bg-blue-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {event.isLive && (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <Play size={12} className="text-purple-600" />
                                </motion.div>
                              )}
                              <span className="text-sm font-medium text-gray-700">
                                {event.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span
                                className={`text-sm font-medium ${
                                  event.isLive
                                    ? 'text-purple-600'
                                    : 'text-blue-600'
                                }`}
                              >
                                {formatTimeRange(
                                  event.startTime,
                                  event.endTime
                                )}
                              </span>
                              <Badge
                                className={`text-xs px-2 py-0 ${getStatusColor(event.status)}`}
                              >
                                {getStatusText(event.status)}
                              </Badge>
                              {(event.isLive || event.description) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={`h-6 px-2 text-xs ${
                                    event.isLive
                                      ? 'border-purple-300 text-purple-600 hover:bg-purple-100'
                                      : 'border-blue-300 text-blue-600 hover:bg-blue-100'
                                  }`}
                                  onClick={() => handleJoinMeeting(event)}
                                >
                                  {event.isLive ? 'Join' : 'View'}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              )}
                            </div>
                            {event.description &&
                              !event.description.startsWith('http') && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </motion.div>
        </div>
      </Card>
    </TooltipProvider>
  );
}

export default DashboardCalendar;
