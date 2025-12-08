# Attendance Section - Usage Guide

## Overview

The Attendance Section is a complete, production-ready UI component for tracking class attendance in your LMS Dashboard.

## Components Created

1. **AttendanceSection.jsx** - Main component with overview cards and tabbed views
2. **AttendanceCalendar.jsx** - Calendar view with daily/weekly/monthly views
3. **AttendanceTable.jsx** - Sortable and filterable attendance records table
4. **StudentAttendanceBreakdown.jsx** - Student-wise attendance breakdown with statistics

## Features

✅ Attendance Overview Summary Cards
✅ Attendance Calendar View (Daily/Weekly/Monthly)
✅ Attendance Table (Filterable + Sortable)
✅ Student-wise Attendance Breakdown
✅ Badge Highlight for 75%+ Attendance
✅ Smooth Loading Skeletons
✅ Empty States
✅ Responsive Design
✅ Reusable Components

## Usage

### Basic Usage

```jsx
import AttendanceSection from '@/components/dashboard/AttendanceSection';

function MyDashboard() {
  return (
    <div className="container mx-auto p-6">
      <AttendanceSection />
    </div>
  );
}
```

### With Custom Data

```jsx
import AttendanceSection from '@/components/dashboard/AttendanceSection';

function MyDashboard() {
  const attendanceData = {
    overview: {
      totalClasses: 50,
      attendedClasses: 42,
      absentClasses: 6,
      lateClasses: 2,
      attendancePercentage: 84.0,
      onTimePercentage: 88.0,
    },
    recentRecords: [
      // Your attendance records
    ],
    studentBreakdown: [
      // Your student data
    ],
    calendarData: {
      '2024-01-15': { status: 'present', className: 'Math 101' },
      // More dates...
    },
  };

  return (
    <div className="container mx-auto p-6">
      <AttendanceSection
        attendanceData={attendanceData}
        loading={false}
        viewMode="overview"
      />
    </div>
  );
}
```

### Adding to Dashboard.jsx

Add this to your Dashboard component:

```jsx
import AttendanceSection from '@/components/dashboard/AttendanceSection';

// Inside your Dashboard component's return:
<div className="mb-8">
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
    <AttendanceSection />
  </div>
</div>;
```

## Props

### AttendanceSection

| Prop             | Type      | Default                | Description            |
| ---------------- | --------- | ---------------------- | ---------------------- |
| `loading`        | `boolean` | `false`                | Shows loading skeleton |
| `attendanceData` | `object`  | `MOCK_ATTENDANCE_DATA` | Attendance data object |
| `viewMode`       | `string`  | `"overview"`           | Initial tab view       |

### Data Structure

```typescript
{
  overview: {
    totalClasses: number;
    attendedClasses: number;
    absentClasses: number;
    lateClasses: number;
    attendancePercentage: number;
    onTimePercentage: number;
  },
  recentRecords: Array<{
    id: number;
    date: string; // ISO date string
    className: string;
    status: "present" | "late" | "absent";
    time: string;
    instructor: string;
  }>,
  studentBreakdown: Array<{
    id: number;
    studentName: string;
    studentId: string;
    totalClasses: number;
    attended: number;
    absent: number;
    late: number;
    attendancePercentage: number;
    lastAttendance: string; // ISO date string
  }>,
  calendarData: {
    [date: string]: {
      status: "present" | "late" | "absent";
      className: string;
      time?: string;
      instructor?: string;
    }
  }
}
```

## Notes

- All components use static/mock data by default
- No backend logic is implemented - only UI components
- Fully responsive and accessible
- Uses ShadCN/UI components for consistency
- Ready for backend integration
