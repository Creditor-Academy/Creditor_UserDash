import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
import { format, parseISO } from "date-fns";

// Mock data
const MOCK_ATTENDANCE = {
  attendancePercentage: 87.5,
  daysPresent: 28,
  daysAbsent: 3,
  totalDays: 31,
  currentMonth: "January 2024"
};

const MOCK_TABLE_DATA = [
  { id: 1, date: "2024-01-31", status: "absent", className: "Financial Literacy 101", time: "10:00 AM - 11:30 AM" },
  { id: 2, date: "2024-01-30", status: "present", className: "Financial Literacy 101", time: "10:00 AM - 11:30 AM" },
  { id: 3, date: "2024-01-29", status: "present", className: "Credit Building Basics", time: "2:00 PM - 3:30 PM" },
  { id: 4, date: "2024-01-26", status: "present", className: "Investment Strategies", time: "11:00 AM - 12:30 PM" },
  { id: 5, date: "2024-01-25", status: "present", className: "Financial Literacy 101", time: "10:00 AM - 11:30 AM" },
  { id: 6, date: "2024-01-24", status: "present", className: "Credit Building Basics", time: "2:00 PM - 3:30 PM" },
  { id: 7, date: "2024-01-23", status: "present", className: "Investment Strategies", time: "11:00 AM - 12:30 PM" },
  { id: 8, date: "2024-01-22", status: "present", className: "Financial Literacy 101", time: "10:00 AM - 11:30 AM" }
];


const Attendance = () => {
  const [selectedMonth, setSelectedMonth] = useState("January 2024");

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
                  <p className="text-2xl font-bold text-gray-900">{MOCK_ATTENDANCE.attendancePercentage}%</p>
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
                  <p className="text-2xl font-bold text-green-600">{MOCK_ATTENDANCE.daysPresent}</p>
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
                  <p className="text-2xl font-bold text-red-600">{MOCK_ATTENDANCE.daysAbsent}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{MOCK_ATTENDANCE.totalDays}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* 3. Attendance Table */}
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
                  {MOCK_TABLE_DATA.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(row.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">{row.className}</TableCell>
                      <TableCell className="text-muted-foreground">{row.time}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 4. Badge Section (if attendance > 75%) */}
        {MOCK_ATTENDANCE.attendancePercentage > 75 && (
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
