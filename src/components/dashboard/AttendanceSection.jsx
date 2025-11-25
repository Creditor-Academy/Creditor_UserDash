import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CalendarDays,
  UserCheck,
  FileText
} from "lucide-react";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceTable from "./AttendanceTable";
import StudentAttendanceBreakdown from "./StudentAttendanceBreakdown";

// Mock data - Replace with real data from props/API
const MOCK_ATTENDANCE_DATA = {
  overview: {
    totalClasses: 45,
    attendedClasses: 38,
    absentClasses: 5,
    lateClasses: 2,
    attendancePercentage: 84.4,
    onTimePercentage: 88.9
  },
  recentRecords: [
    {
      id: 1,
      date: "2024-01-15",
      className: "Financial Literacy 101",
      status: "present",
      time: "10:00 AM",
      instructor: "Dr. Sarah Johnson"
    },
    {
      id: 2,
      date: "2024-01-14",
      className: "Credit Building Basics",
      status: "present",
      time: "2:00 PM",
      instructor: "Prof. Michael Chen"
    },
    {
      id: 3,
      date: "2024-01-13",
      className: "Investment Strategies",
      status: "late",
      time: "11:00 AM",
      instructor: "Dr. Sarah Johnson"
    },
    {
      id: 4,
      date: "2024-01-12",
      className: "Financial Literacy 101",
      status: "absent",
      time: "10:00 AM",
      instructor: "Dr. Sarah Johnson"
    },
    {
      id: 5,
      date: "2024-01-11",
      className: "Credit Building Basics",
      status: "present",
      time: "2:00 PM",
      instructor: "Prof. Michael Chen"
    }
  ],
  studentBreakdown: [
    {
      id: 1,
      studentName: "John Doe",
      studentId: "STU001",
      totalClasses: 45,
      attended: 40,
      absent: 3,
      late: 2,
      attendancePercentage: 88.9,
      lastAttendance: "2024-01-15"
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentId: "STU002",
      totalClasses: 45,
      attended: 42,
      absent: 2,
      late: 1,
      attendancePercentage: 93.3,
      lastAttendance: "2024-01-15"
    },
    {
      id: 3,
      studentName: "Bob Johnson",
      studentId: "STU003",
      totalClasses: 45,
      attended: 35,
      absent: 8,
      late: 2,
      attendancePercentage: 77.8,
      lastAttendance: "2024-01-14"
    },
    {
      id: 4,
      studentName: "Alice Williams",
      studentId: "STU004",
      totalClasses: 45,
      attended: 44,
      absent: 1,
      late: 0,
      attendancePercentage: 97.8,
      lastAttendance: "2024-01-15"
    },
    {
      id: 5,
      studentName: "Charlie Brown",
      studentId: "STU005",
      totalClasses: 45,
      attended: 30,
      absent: 12,
      late: 3,
      attendancePercentage: 66.7,
      lastAttendance: "2024-01-12"
    }
  ],
  calendarData: {
    "2024-01-15": { status: "present", className: "Financial Literacy 101" },
    "2024-01-14": { status: "present", className: "Credit Building Basics" },
    "2024-01-13": { status: "late", className: "Investment Strategies" },
    "2024-01-12": { status: "absent", className: "Financial Literacy 101" },
    "2024-01-11": { status: "present", className: "Credit Building Basics" },
    "2024-01-10": { status: "present", className: "Financial Literacy 101" },
    "2024-01-09": { status: "present", className: "Investment Strategies" },
    "2024-01-08": { status: "absent", className: "Credit Building Basics" },
    "2024-01-05": { status: "present", className: "Financial Literacy 101" },
    "2024-01-04": { status: "late", className: "Investment Strategies" }
  }
};

const AttendanceSection = ({ 
  loading = false, 
  attendanceData = MOCK_ATTENDANCE_DATA,
  viewMode = "overview" // "overview" | "calendar" | "table" | "students"
}) => {
  const [activeView, setActiveView] = useState(viewMode);
  const [timeRange, setTimeRange] = useState("monthly"); // "daily" | "weekly" | "monthly"

  const { overview, recentRecords, studentBreakdown, calendarData } = attendanceData;

  // Calculate badge status
  const getAttendanceBadge = (percentage) => {
    if (percentage >= 75) {
      return <Badge className="bg-green-500 hover:bg-green-600">Excellent</Badge>;
    } else if (percentage >= 60) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Good</Badge>;
    } else {
      return <Badge variant="destructive">Needs Improvement</Badge>;
    }
  };

  if (loading) {
    return <AttendanceSectionSkeleton />;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Attendance</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your class attendance and performance
          </p>
        </div>
        {overview.attendancePercentage >= 75 && (
          <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {overview.attendancePercentage.toFixed(1)}% Attendance
          </Badge>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.attendancePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {overview.attendedClasses} of {overview.totalClasses} classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview.attendedClasses}</div>
            <p className="text-xs text-muted-foreground">
              On-time: {overview.onTimePercentage.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overview.absentClasses}</div>
            <p className="text-xs text-muted-foreground">
              {overview.lateClasses} late arrivals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Records
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Attendance */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Your last 5 class sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRecords.length > 0 ? (
                    recentRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {record.status === "present" && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          {record.status === "late" && (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                          {record.status === "absent" && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{record.className}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(record.date).toLocaleDateString()} • {record.time}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            record.status === "present"
                              ? "default"
                              : record.status === "late"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <EmptyState message="No attendance records found" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Attendance Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Statistics</CardTitle>
                <CardDescription>Performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Attendance</span>
                      <span className="text-sm font-bold">{overview.attendancePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${overview.attendancePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">On-Time Rate</span>
                      <span className="text-sm font-bold">{overview.onTimePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${overview.onTimePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Status</span>
                      {getAttendanceBadge(overview.attendancePercentage)}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{overview.attendedClasses}</p>
                        <p className="text-xs text-muted-foreground">Present</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{overview.lateClasses}</p>
                        <p className="text-xs text-muted-foreground">Late</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{overview.absentClasses}</p>
                        <p className="text-xs text-muted-foreground">Absent</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <AttendanceCalendar 
            calendarData={calendarData}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <AttendanceTable 
            records={recentRecords}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <StudentAttendanceBreakdown 
            students={studentBreakdown}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Loading Skeleton Component
const AttendanceSectionSkeleton = () => {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ message = "No data available" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
};

export default AttendanceSection;

