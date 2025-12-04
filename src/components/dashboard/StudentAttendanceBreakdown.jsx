import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Award
} from "lucide-react";
import { format, parseISO } from "date-fns";

const StudentAttendanceBreakdown = ({ students = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("attendancePercentage");
  const [sortDirection, setSortDirection] = useState("desc");
  const [minAttendanceFilter, setMinAttendanceFilter] = useState(0);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (student) =>
          student.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply minimum attendance filter
    filtered = filtered.filter(
      (student) => student.attendancePercentage >= minAttendanceFilter
    );

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "studentName":
          aValue = a.studentName?.toLowerCase() || "";
          bValue = b.studentName?.toLowerCase() || "";
          break;
        case "attendancePercentage":
          aValue = a.attendancePercentage || 0;
          bValue = b.attendancePercentage || 0;
          break;
        case "attended":
          aValue = a.attended || 0;
          bValue = b.attended || 0;
          break;
        case "absent":
          aValue = a.absent || 0;
          bValue = b.absent || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [students, searchQuery, sortField, sortDirection, minAttendanceFilter]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAttendanceBadge = (percentage) => {
    if (percentage >= 75) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <Award className="h-3 w-3 mr-1" />
          Excellent
        </Badge>
      );
    } else if (percentage >= 60) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          Good
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          Needs Improvement
        </Badge>
      );
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = students.length;
    const excellent = students.filter((s) => s.attendancePercentage >= 75).length;
    const good = students.filter(
      (s) => s.attendancePercentage >= 60 && s.attendancePercentage < 75
    ).length;
    const needsImprovement = students.filter((s) => s.attendancePercentage < 60).length;
    const averageAttendance =
      students.reduce((sum, s) => sum + s.attendancePercentage, 0) / total || 0;

    return {
      total,
      excellent,
      good,
      needsImprovement,
      averageAttendance
    };
  }, [students]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Excellent (75%+)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? ((stats.excellent / stats.total) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Good (60-74%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.good}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? ((stats.good / stats.total) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Attendance Breakdown</CardTitle>
              <CardDescription>
                Detailed attendance records for all students
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Min Attendance:
              </span>
              <Input
                type="number"
                min="0"
                max="100"
                value={minAttendanceFilter}
                onChange={(e) => setMinAttendanceFilter(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          {/* Table */}
          {filteredAndSortedStudents.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("studentName")}
                      >
                        Student
                        <SortIcon field="studentName" />
                      </Button>
                    </TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("attended")}
                      >
                        Attended
                        <SortIcon field="attended" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("attendancePercentage")}
                      >
                        Attendance %
                        <SortIcon field="attendancePercentage" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedStudents.map((student, index) => (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(student.studentName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.studentId}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="font-medium">{student.attended}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="font-medium">{student.absent}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-yellow-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">{student.late}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${getProgressColor(
                                  student.attendancePercentage
                                )}`}
                                style={{ width: `${student.attendancePercentage}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-medium min-w-[50px] text-right">
                            {student.attendancePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getAttendanceBadge(student.attendancePercentage)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {student.lastAttendance
                          ? format(parseISO(student.lastAttendance), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                No students found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery || minAttendanceFilter > 0
                  ? "Try adjusting your filters"
                  : "No student data available"}
              </p>
            </div>
          )}

          {/* Results count */}
          {filteredAndSortedStudents.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredAndSortedStudents.length} of {students.length} students
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAttendanceBreakdown;

