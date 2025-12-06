import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// Using native table elements for better sticky header control
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
} from 'lucide-react';
import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subMonths,
  addMonths,
} from 'date-fns';
import { getUserAttendance } from '@/services/attendanceService';

// Helper function to calculate attendance percentage
const calculateAttendancePercentage = (present, total) => {
  if (total === 0) return 0;
  return ((present / total) * 100).toFixed(1);
};

const Attendance = () => {
  const [selectedMonth, setSelectedMonth] = useState('overall'); // "overall" or Date object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allAttendanceData, setAllAttendanceData] = useState([]); // Store all data from API
  const [attendanceData, setAttendanceData] = useState({
    attendancePercentage: 0,
    daysPresent: 0,
    daysAbsent: 0,
    totalDays: 0,
  });
  const [tableData, setTableData] = useState([]);

  // Helper function to parse date from backend
  const parseDate = dateString => {
    if (!dateString || dateString === 'N/A') return null;

    // Try multiple date formats that backend might return
    const formats = [
      'MMM d, yyyy', // "Nov 20, 2025" or "Nov 5, 2025"
      'MMM dd, yyyy', // "Nov 05, 2025"
      'MMMM d, yyyy', // "November 20, 2025"
      'MMMM dd, yyyy', // "November 05, 2025"
      'yyyy-MM-dd', // ISO date "2025-11-20"
      'MM/dd/yyyy', // "11/20/2025"
      'dd/MM/yyyy', // "20/11/2025"
    ];

    // Try parsing with each format
    for (const fmt of formats) {
      try {
        const parsed = parse(dateString, fmt, new Date());
        if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
          return parsed;
        }
      } catch (e) {
        // Continue to next format
      }
    }

    // Fallback: try native Date parsing
    try {
      const isoParsed = new Date(dateString);
      if (!isNaN(isoParsed.getTime()) && isoParsed.getFullYear() > 1900) {
        return isoParsed;
      }
    } catch (e) {
      console.warn('Failed to parse date:', dateString);
    }

    return null;
  };

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getUserAttendance();

        console.log('Attendance API Response:', response); // Debug log

        // response is already the extracted data object from the service
        // It contains { attendance: [], statistics: {} }
        // Ensure we have valid data structure
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format from server');
        }

        const attendance = Array.isArray(response.attendance)
          ? response.attendance
          : [];
        const statistics =
          response.statistics && typeof response.statistics === 'object'
            ? response.statistics
            : { total: 0, present: 0, absent: 0 };

        console.log('Extracted Data:', { attendance, statistics }); // Debug log
        console.log('Attendance array length:', attendance.length);
        console.log('Statistics:', statistics);

        // Transform attendance records for table with parsed dates
        // Backend returns: { id, date, classEvent, time, status, isPresent, createdAt, courseTitle, courseId, eventId }
        const transformedTableData = attendance.map((record, index) => {
          // Determine status from backend response
          let status = 'present';
          if (record.status) {
            status = record.status.toLowerCase();
          } else if (record.isPresent !== undefined) {
            status = record.isPresent ? 'present' : 'absent';
          }

          // Parse the date for filtering
          const parsedDate = parseDate(record.date);

          // Create a unique key from available fields
          // Use eventId + date + index as fallback if id is null
          const uniqueId =
            record.id ||
            `${record.eventId || 'event'}-${record.date || index}-${index}`;

          return {
            id: uniqueId,
            originalId: record.id,
            eventId: record.eventId,
            date: record.date || 'N/A', // Display date as string
            dateObj: parsedDate, // Store parsed date for filtering
            className:
              record.classEvent ||
              record.className ||
              record.event?.title ||
              'N/A',
            courseTitle: record.courseTitle || 'N/A',
            time: record.time || 'N/A',
            status: status,
            isPresent:
              record.isPresent !== undefined
                ? record.isPresent
                : status === 'present',
            createdAt: record.createdAt,
          };
        });

        // Store all data
        setAllAttendanceData(transformedTableData);

        // Set initial selected month to "overall" to show all data by default
        // User can then filter by specific month if needed
        setSelectedMonth('overall');

        console.log('Processed Data:', {
          totalRecords: attendance.length,
          tableData: transformedTableData.length,
        }); // Debug log
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError(err.message || 'Failed to load attendance data');
        setAllAttendanceData([]);
        setTableData([]);
        setAttendanceData({
          attendancePercentage: 0,
          daysPresent: 0,
          daysAbsent: 0,
          totalDays: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Filter data based on selected month
  useEffect(() => {
    if (allAttendanceData.length === 0) {
      setTableData([]);
      setAttendanceData({
        attendancePercentage: 0,
        daysPresent: 0,
        daysAbsent: 0,
        totalDays: 0,
      });
      return;
    }

    // If "overall" is selected, show all data
    let filteredData;
    if (
      selectedMonth === 'overall' ||
      typeof selectedMonth !== 'object' ||
      !(selectedMonth instanceof Date)
    ) {
      filteredData = allAttendanceData;
    } else {
      // Filter by specific month - ensure selectedMonth is a valid Date
      try {
        const monthStart = startOfMonth(selectedMonth);
        const monthEnd = endOfMonth(selectedMonth);

        filteredData = allAttendanceData.filter(record => {
          if (!record.dateObj) return false;
          return isWithinInterval(record.dateObj, {
            start: monthStart,
            end: monthEnd,
          });
        });
      } catch (error) {
        console.error('Error filtering by month:', error);
        filteredData = allAttendanceData;
      }
    }

    // Calculate statistics for filtered data
    // Use isPresent as primary source, fallback to status
    const presentCount = filteredData.filter(r => {
      if (r.isPresent !== undefined) return r.isPresent === true;
      return r.status === 'present';
    }).length;
    const absentCount = filteredData.filter(r => {
      if (r.isPresent !== undefined) return r.isPresent === false;
      return r.status === 'absent';
    }).length;
    const totalCount = filteredData.length;

    const attendancePercentage = calculateAttendancePercentage(
      presentCount,
      totalCount
    );

    setTableData(filteredData);
    setAttendanceData({
      attendancePercentage: parseFloat(attendancePercentage),
      daysPresent: presentCount,
      daysAbsent: absentCount,
      totalDays: totalCount,
    });
  }, [selectedMonth, allAttendanceData]);

  // Get status badge
  const getStatusBadge = status => {
    switch (status) {
      case 'present':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Present
          </Badge>
        );
      case 'absent':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get available months from data
  const getAvailableMonths = () => {
    const monthsSet = new Set();
    allAttendanceData.forEach(record => {
      if (record.dateObj && !isNaN(record.dateObj.getTime())) {
        try {
          const monthKey = format(startOfMonth(record.dateObj), 'yyyy-MM');
          monthsSet.add(monthKey);
        } catch (error) {
          console.warn(
            'Error formatting date for month key:',
            record.dateObj,
            error
          );
        }
      }
    });

    return Array.from(monthsSet)
      .map(key => {
        try {
          const [year, month] = key.split('-');
          const yearNum = parseInt(year, 10);
          const monthNum = parseInt(month, 10);

          // Validate parsed values
          if (
            isNaN(yearNum) ||
            isNaN(monthNum) ||
            monthNum < 1 ||
            monthNum > 12
          ) {
            console.warn('Invalid month key:', key);
            return null;
          }

          const date = new Date(yearNum, monthNum - 1, 1);
          if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
            return date;
          }
        } catch (error) {
          console.warn('Error parsing month key:', key, error);
        }
        return null;
      })
      .filter(date => date !== null && date instanceof Date)
      .sort((a, b) => b - a); // Sort descending (most recent first)
  };

  // Get available months from data
  const availableMonths = getAvailableMonths();

  // Check if we can navigate to previous/next month
  const getCurrentMonthIndex = () => {
    if (
      selectedMonth === 'overall' ||
      typeof selectedMonth !== 'object' ||
      !(selectedMonth instanceof Date) ||
      availableMonths.length === 0
    ) {
      return -1;
    }
    try {
      return availableMonths.findIndex(
        month =>
          format(startOfMonth(month), 'yyyy-MM') ===
          format(startOfMonth(selectedMonth), 'yyyy-MM')
      );
    } catch (error) {
      console.error('Error getting current month index:', error);
      return -1;
    }
  };

  const currentMonthIndex = getCurrentMonthIndex();

  // Can go to previous (older) month if not at the last available month
  // availableMonths is sorted descending: [0] = most recent, [length-1] = oldest
  const canGoPrevious =
    currentMonthIndex > -1 && currentMonthIndex < availableMonths.length - 1;

  // Can go to next (more recent) month if not at the first available month
  const canGoNext = currentMonthIndex > 0;

  // Handle month navigation - navigate through available months
  const handlePreviousMonth = () => {
    if (availableMonths.length === 0 || !canGoPrevious) return;

    // If currently on "overall", go to most recent month
    if (
      selectedMonth === 'overall' ||
      typeof selectedMonth !== 'object' ||
      !(selectedMonth instanceof Date)
    ) {
      if (availableMonths.length > 0) {
        setSelectedMonth(startOfMonth(availableMonths[0]));
      }
      return;
    }

    // Go to next older month (index + 1 since sorted descending)
    if (
      currentMonthIndex > -1 &&
      currentMonthIndex < availableMonths.length - 1
    ) {
      try {
        setSelectedMonth(startOfMonth(availableMonths[currentMonthIndex + 1]));
      } catch (error) {
        console.error('Error navigating to previous month:', error);
      }
    }
  };

  const handleNextMonth = () => {
    if (availableMonths.length === 0 || !canGoNext) return;

    // If currently on "overall", go to most recent month
    if (
      selectedMonth === 'overall' ||
      typeof selectedMonth !== 'object' ||
      !(selectedMonth instanceof Date)
    ) {
      if (availableMonths.length > 0) {
        setSelectedMonth(startOfMonth(availableMonths[0]));
      }
      return;
    }

    // Go to more recent month (index - 1 since sorted descending)
    if (currentMonthIndex > 0) {
      try {
        setSelectedMonth(startOfMonth(availableMonths[currentMonthIndex - 1]));
      } catch (error) {
        console.error('Error navigating to next month:', error);
      }
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full px-3 sm:px-4 md:px-6 py-6 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-[240px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="rounded-xl shadow-sm">
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-4">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full px-3 sm:px-4 md:px-6 py-6 max-w-7xl mx-auto space-y-6">
          <Card className="rounded-xl shadow-sm border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Attendance
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full px-3 sm:px-4 md:px-6 py-6 max-w-7xl mx-auto space-y-6">
        {/* 1. Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your class attendance and performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handlePreviousMonth}
              disabled={
                availableMonths.length === 0 ||
                selectedMonth === 'overall' ||
                !(selectedMonth instanceof Date) ||
                !canGoPrevious
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select
              value={
                selectedMonth === 'overall'
                  ? 'overall'
                  : selectedMonth instanceof Date
                    ? format(startOfMonth(selectedMonth), 'yyyy-MM')
                    : 'overall'
              }
              onValueChange={value => {
                if (value === 'overall') {
                  setSelectedMonth('overall');
                } else {
                  try {
                    const [year, month] = value.split('-');
                    const date = new Date(
                      parseInt(year),
                      parseInt(month) - 1,
                      1
                    );
                    if (!isNaN(date.getTime())) {
                      setSelectedMonth(startOfMonth(date));
                    }
                  } catch (error) {
                    console.error('Error parsing selected month:', error);
                  }
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month">
                  {selectedMonth === 'overall'
                    ? 'Overall'
                    : selectedMonth instanceof Date
                      ? format(selectedMonth, 'MMMM yyyy')
                      : 'Overall'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall</SelectItem>
                {availableMonths.length > 0 &&
                  availableMonths.map(month => {
                    const monthKey = format(startOfMonth(month), 'yyyy-MM');
                    const monthLabel = format(month, 'MMMM yyyy');
                    return (
                      <SelectItem key={monthKey} value={monthKey}>
                        {monthLabel}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handleNextMonth}
              disabled={
                availableMonths.length === 0 ||
                selectedMonth === 'overall' ||
                !(selectedMonth instanceof Date) ||
                !canGoNext
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 2. Compact Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Attendance %
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {attendanceData.attendancePercentage}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Days Present
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {attendanceData.daysPresent}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Days Absent
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {attendanceData.daysAbsent}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Days
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {attendanceData.totalDays}
                  </p>
                </div>
                <CalendarIcon className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Attendance Table */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Attendance
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[500px] sm:max-h-[600px] overflow-y-auto attendance-table-scroll">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b sticky top-0 z-10 bg-white shadow-sm">
                    <tr className="border-b border-gray-200">
                      <th className="w-[120px] h-12 px-4 text-left align-middle font-semibold bg-white">
                        Date
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-semibold bg-white">
                        Course
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-semibold bg-white">
                        Class/Event
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-semibold bg-white">
                        Time
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-semibold bg-white">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {tableData.length > 0 ? (
                      tableData.map((row, index) => (
                        <tr
                          key={
                            row.id ||
                            `attendance-${index}-${row.eventId || row.date || index}`
                          }
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle font-medium w-[120px]">
                            {row.date}
                          </td>
                          <td className="p-4 align-middle font-medium">
                            {row.courseTitle}
                          </td>
                          <td className="p-4 align-middle font-medium">
                            {row.className}
                          </td>
                          <td className="p-4 align-middle text-muted-foreground">
                            {row.time}
                          </td>
                          <td className="p-4 align-middle">
                            {getStatusBadge(row.status)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b transition-colors">
                        <td
                          colSpan={5}
                          className="p-4 align-middle text-center py-8 text-muted-foreground"
                        >
                          No attendance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Badge Section (if attendance > 75%) */}
        {attendanceData.attendancePercentage > 75 && (
          <Card className="rounded-xl shadow-sm bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Attendance Star
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Great job! You've maintained excellent attendance this
                    month.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Attendance;
