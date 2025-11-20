import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp
} from "lucide-react";
// Date formatting utilities (backend already provides formatted dates)
import { getUserAttendance } from "@/services/attendanceService";

// Helper function to calculate attendance percentage
const calculateAttendancePercentage = (present, total) => {
  if (total === 0) return 0;
  return ((present / total) * 100).toFixed(1);
};


const Attendance = () => {
  const [selectedMonth, setSelectedMonth] = useState("January 2024");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState({
    attendancePercentage: 0,
    daysPresent: 0,
    daysAbsent: 0,
    totalDays: 0
  });
  const [tableData, setTableData] = useState([]);
  const [absentEvents, setAbsentEvents] = useState([]);

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
        
        const attendance = Array.isArray(response.attendance) ? response.attendance : [];
        const statistics = response.statistics && typeof response.statistics === 'object' 
          ? response.statistics 
          : { total: 0, present: 0, absent: 0 };
        
        console.log('Extracted Data:', { attendance, statistics }); // Debug log
        console.log('Attendance array length:', attendance.length);
        console.log('Statistics:', statistics);
        
        // Calculate attendance percentage
        const attendancePercentage = calculateAttendancePercentage(
          statistics.present || 0,
          statistics.total || 0
        );
        
        // Update state with statistics - use actual counts from backend
        const presentCount = statistics.present || 0;
        const absentCount = statistics.absent || 0;
        const totalCount = statistics.total || 0;
        
        setAttendanceData({
          attendancePercentage: parseFloat(attendancePercentage),
          daysPresent: presentCount,
          daysAbsent: absentCount,
          totalDays: totalCount
        });
        
        // Transform attendance records for table
        // Backend returns: { id, date, classEvent, time, status, isPresent, createdAt }
        // status is "Present" or "Absent" (capitalized)
        // isPresent is true or false
        const transformedTableData = attendance.map((record) => {
          // Determine status from backend response
          // Backend sends status as "Present" or "Absent" (capitalized)
          let status = 'present';
          if (record.status) {
            status = record.status.toLowerCase(); // Convert "Present" -> "present", "Absent" -> "absent"
          } else if (record.isPresent !== undefined) {
            // Fallback to isPresent boolean if status is not provided
            status = record.isPresent ? 'present' : 'absent';
          }
          
          return {
            id: record.id,
            date: record.date || 'N/A', // Already formatted as "Nov 20, 2025" from backend
            className: record.classEvent || record.className || record.event?.title || 'N/A',
            time: record.time || 'N/A', // Already formatted as "11:15 AM - 11:24 AM" from backend
            status: status,
            isPresent: record.isPresent !== undefined ? record.isPresent : (status === 'present'),
            createdAt: record.createdAt
          };
        });
        
        setTableData(transformedTableData);
        
        // Separate absent events for display
        // Filter events where status is "absent" or isPresent is false
        const absentEventsList = transformedTableData.filter(record => {
          const isAbsent = record.status === 'absent' || record.isPresent === false;
          return isAbsent;
        });
        setAbsentEvents(absentEventsList);
        
        console.log('Processed Data:', {
          total: totalCount,
          present: presentCount,
          absent: absentCount,
          totalRecords: attendance.length,
          tableData: transformedTableData.length,
          absentEvents: absentEventsList.length,
          presentEvents: transformedTableData.filter(r => r.status === 'present' || r.isPresent === true).length
        }); // Debug log
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError(err.message || 'Failed to load attendance data');
        // Set default/empty data on error
        setAttendanceData({
          attendancePercentage: 0,
          daysPresent: 0,
          daysAbsent: 0,
          totalDays: 0
        });
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Present
          </Badge>
        );
      case "absent":
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
            {[1, 2, 3, 4].map((i) => (
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
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Attendance</h3>
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
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="January 2024">January 2024</SelectItem>
                <SelectItem value="December 2023">December 2023</SelectItem>
                <SelectItem value="November 2023">November 2023</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-9 w-9">
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
                  <p className="text-sm text-muted-foreground mb-1">Attendance %</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceData.attendancePercentage}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Days Present</p>
                  <p className="text-2xl font-bold text-green-600">{attendanceData.daysPresent}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Days Absent</p>
                  <p className="text-2xl font-bold text-red-600">{attendanceData.daysAbsent}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Days</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceData.totalDays}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* 3. Absent Events Section (if any) */}
        {absentEvents.length > 0 && (
          <Card className="rounded-xl shadow-sm border-red-100 bg-red-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Absent Events</h3>
                <Badge variant="destructive" className="text-sm">
                  {absentEvents.length} Event{absentEvents.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="space-y-3">
                {absentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-red-200 bg-white rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{event.className}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {event.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-4">
                      {getStatusBadge('absent')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. Attendance Table */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead>Class/Event</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.length > 0 ? (
                    tableData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.date}
                        </TableCell>
                        <TableCell className="font-medium">{row.className}</TableCell>
                        <TableCell className="text-muted-foreground">{row.time}</TableCell>
                        <TableCell>{getStatusBadge(row.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 5. Badge Section (if attendance > 75%) */}
        {attendanceData.attendancePercentage > 75 && (
          <Card className="rounded-xl shadow-sm bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Attendance Star</h3>
                  <p className="text-sm text-muted-foreground">
                    Great job! You've maintained excellent attendance this month.
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
