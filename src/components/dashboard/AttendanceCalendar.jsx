import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
} from 'lucide-react';

const AttendanceCalendar = ({
  calendarData = {},
  timeRange = 'monthly',
  onTimeRangeChange,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get attendance status for a specific date
  const getAttendanceStatus = date => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return calendarData[dateKey] || null;
  };

  // Get dates for current view
  const getViewDates = () => {
    switch (timeRange) {
      case 'daily':
        return [selectedDate];
      case 'weekly':
        return eachDayOfInterval({
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
        });
      case 'monthly':
      default:
        return eachDayOfInterval({
          start: startOfMonth(currentMonth),
          end: endOfMonth(currentMonth),
        });
    }
  };

  // Get attendance summary for current view
  const getViewSummary = () => {
    const dates = getViewDates();
    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      total: 0,
    };

    dates.forEach(date => {
      const attendance = getAttendanceStatus(date);
      if (attendance) {
        summary[attendance.status]++;
        summary.total++;
      }
    });

    return summary;
  };

  const summary = getViewSummary();
  const selectedAttendance = getAttendanceStatus(selectedDate);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily View</SelectItem>
              <SelectItem value="weekly">Weekly View</SelectItem>
              <SelectItem value="monthly">Monthly View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Badges */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {summary.present} Present
          </Badge>
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            {summary.late} Late
          </Badge>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <XCircle className="h-3 w-3 mr-1" />
            {summary.absent} Absent
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
            <CardDescription>
              {timeRange === 'daily' && 'Daily attendance view'}
              {timeRange === 'weekly' && 'Weekly attendance view'}
              {timeRange === 'monthly' && 'Monthly attendance view'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              modifiers={{
                present: Object.keys(calendarData)
                  .filter(key => calendarData[key]?.status === 'present')
                  .map(key => parseISO(key)),
                absent: Object.keys(calendarData)
                  .filter(key => calendarData[key]?.status === 'absent')
                  .map(key => parseISO(key)),
                late: Object.keys(calendarData)
                  .filter(key => calendarData[key]?.status === 'late')
                  .map(key => parseISO(key)),
              }}
              modifiersClassNames={{
                present: 'bg-green-500 text-white hover:bg-green-600',
                absent: 'bg-red-500 text-white hover:bg-red-600',
                late: 'bg-yellow-500 text-white hover:bg-yellow-600',
              }}
              classNames={{
                day_selected: 'bg-blue-600 text-white hover:bg-blue-700',
                day_today: 'bg-blue-100 font-semibold',
              }}
            />

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-500" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-yellow-500" />
                <span>Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-red-500" />
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-blue-100 border-2 border-blue-500" />
                <span>Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle>Date Details</CardTitle>
            <CardDescription>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAttendance ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAttendance.status === 'present' && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {selectedAttendance.status === 'late' && (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    {selectedAttendance.status === 'absent' && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <Badge
                      variant={
                        selectedAttendance.status === 'present'
                          ? 'default'
                          : selectedAttendance.status === 'late'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {selectedAttendance.status.charAt(0).toUpperCase() +
                        selectedAttendance.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">
                    {selectedAttendance.className}
                  </p>
                  {selectedAttendance.time && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Time: {selectedAttendance.time}
                    </p>
                  )}
                  {selectedAttendance.instructor && (
                    <p className="text-xs text-muted-foreground">
                      Instructor: {selectedAttendance.instructor}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium text-muted-foreground">
                  No attendance record
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  No class scheduled for this date
                </p>
              </div>
            )}

            {/* Weekly/Monthly Summary */}
            {(timeRange === 'weekly' || timeRange === 'monthly') && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-semibold mb-3">Summary</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Classes</span>
                    <span className="font-medium">{summary.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Present</span>
                    <span className="font-medium">{summary.present}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-600">Late</span>
                    <span className="font-medium">{summary.late}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600">Absent</span>
                    <span className="font-medium">{summary.absent}</span>
                  </div>
                  {summary.total > 0 && (
                    <div className="pt-2 mt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Attendance Rate</span>
                        <span className="font-bold">
                          {((summary.present / summary.total) * 100).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
