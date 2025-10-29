# Course Activity Analytics Implementation Guide

## Overview
This document describes the implementation of the Course Activity Analytics feature that tracks the most active and inactive courses every month.

## Frontend Implementation

### Files Created
1. **`src/services/analyticsService.js`** - Service layer for making API calls
2. **`src/components/dashboard/CourseActivityAnalytics.jsx`** - Main UI component
3. Updated **`src/pages/Instructorpage.jsx`** - Added Analytics tab

### Features Implemented
- Track most active courses monthly
- Track most inactive courses monthly
- Display course enrollment statistics
- Show active user counts per course
- Calculate completion rates
- Track time spent on courses
- Monthly filtering and analysis
- Historical trend viewing

## Backend API Endpoints Required

### 1. Get Course Activity Summary
**Endpoint:** `GET /api/analytics/course-activity/summary`

**Query Parameters:**
- `year` (required): Year (e.g., 2024)
- `month` (required): Month (1-12)

**Response:**
```json
{
  "success": true,
  "data": {
    "mostActive": [
      {
        "id": "course-id-1",
        "title": "Course Title",
        "enrollments": 245,
        "activeUsers": 189,
        "completionRate": 78,
        "avgTimeSpent": 1250,
        "trend": "up"
      }
    ],
    "mostInactive": [
      {
        "id": "course-id-4",
        "title": "Course Title",
        "enrollments": 34,
        "activeUsers": 12,
        "completionRate": 35,
        "avgTimeSpent": 280,
        "trend": "down"
      }
    ]
  }
}
```

### 2. Get All Courses Activity
**Endpoint:** `GET /api/analytics/courses/activity`

**Query Parameters:**
- `year` (required): Year
- `month` (required): Month (1-12)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "course-id",
      "title": "Course Title",
      "enrollments": 198,
      "activeUsers": 156,
      "completionRate": 82,
      "avgTimeSpent": 980,
      "totalModulesCompleted": 542,
      "totalAssessmentsCompleted": 423
    }
  ]
}
```

### 3. Get Course Activity by Month
**Endpoint:** `GET /api/analytics/course-activity`

**Query Parameters:**
- `year` (required): Year
- `month` (required): Month (1-12)

**Response:**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 10,
    "totalEnrollments": 1284,
    "totalActiveCourses": 12,
    "totalInactiveCourses": 3,
    "averageCompletionRate": 67.5,
    "courses": [...]
  }
}
```

### 4. Get Course Statistics
**Endpoint:** `GET /api/analytics/course/:courseId/statistics`

**Query Parameters:**
- `year` (optional): Year
- `month` (optional): Month (1-12)

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "course-id",
    "title": "Course Title",
    "statistics": {
      "totalEnrollments": 245,
      "activeUsers": 189,
      "completedUsers": 191,
      "completionRate": 77.96,
      "avgTimeSpent": 1250,
      "totalTimeSpent": 237250,
      "modulesCompleted": 1456,
      "assessmentsCompleted": 1234,
      "avgScore": 85.5
    }
  }
}
```

### 5. Get Course Activity Trends
**Endpoint:** `GET /api/analytics/course-activity/trends`

**Description:** Returns last 6 months of course activity data

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "year": 2024,
      "month": 10,
      "totalEnrollments": 1284,
      "activeCoursesCount": 12,
      "averageCompletionRate": 67.5
    },
    {
      "year": 2024,
      "month": 9,
      "totalEnrollments": 1156,
      "activeCoursesCount": 11,
      "averageCompletionRate": 65.2
    }
  ]
}
```

### 6. Track Course Activity Event (Optional)
**Endpoint:** `POST /api/analytics/course/track`

**Request Body:**
```json
{
  "courseId": "course-id",
  "eventType": "view|start|complete|module_complete",
  "metadata": {
    "moduleId": "module-id",
    "duration": 120
  },
  "timestamp": "2024-10-14T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event tracked successfully"
}
```

## Backend Database Schema Recommendations

### CourseActivity Table
```sql
CREATE TABLE course_activity (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50), -- 'enroll', 'start', 'complete', 'view', 'module_complete'
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB, -- Additional data like module_id, time_spent, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_course_activity_course_id ON course_activity(course_id);
CREATE INDEX idx_course_activity_user_id ON course_activity(user_id);
CREATE INDEX idx_course_activity_timestamp ON course_activity(timestamp);
CREATE INDEX idx_course_activity_event_type ON course_activity(event_type);
```

### CourseStatistics View (Optional - for performance)
```sql
CREATE MATERIALIZED VIEW course_statistics_monthly AS
SELECT 
  course_id,
  EXTRACT(YEAR FROM timestamp) as year,
  EXTRACT(MONTH FROM timestamp) as month,
  COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'enroll') as enrollments,
  COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'start') as active_users,
  COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'complete') as completed_users,
  AVG(CAST(metadata->>'time_spent' AS INTEGER)) as avg_time_spent
FROM course_activity
GROUP BY course_id, year, month;

-- Refresh periodically
CREATE INDEX idx_course_stats_month ON course_statistics_monthly(year, month);
```

## Backend Implementation Example (Node.js/Express)

### Controller: `analyticsController.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get course activity summary
exports.getCourseActivitySummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required'
      });
    }
    
    // Get date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    // Get all courses with activity in this month
    const courses = await prisma.course.findMany({
      include: {
        userCourses: {
          where: {
            enrolledAt: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        _count: {
          select: {
            userCourses: true
          }
        }
      }
    });
    
    // Calculate activity metrics for each course
    const courseMetrics = await Promise.all(
      courses.map(async (course) => {
        const enrollments = course._count.userCourses;
        
        // Get active users (users who accessed the course in the month)
        const activeUsers = await prisma.courseActivity.count({
          where: {
            courseId: course.id,
            timestamp: {
              gte: startDate,
              lte: endDate
            },
            eventType: {
              in: ['start', 'view', 'module_complete']
            }
          },
          distinct: ['userId']
        });
        
        // Get completion rate
        const completedUsers = await prisma.userCourse.count({
          where: {
            courseId: course.id,
            completedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        });
        
        const completionRate = enrollments > 0 
          ? Math.round((completedUsers / enrollments) * 100) 
          : 0;
        
        // Get average time spent
        const timeData = await prisma.courseActivity.aggregate({
          where: {
            courseId: course.id,
            timestamp: {
              gte: startDate,
              lte: endDate
            }
          },
          _avg: {
            timeSpent: true
          }
        });
        
        return {
          id: course.id,
          title: course.title,
          enrollments,
          activeUsers,
          completionRate,
          avgTimeSpent: Math.round(timeData._avg.timeSpent || 0),
          activityScore: activeUsers // Used for sorting
        };
      })
    );
    
    // Sort by activity
    courseMetrics.sort((a, b) => b.activityScore - a.activityScore);
    
    // Get top 5 active and bottom 5 inactive
    const mostActive = courseMetrics.slice(0, 5).map(c => ({
      ...c,
      trend: 'up'
    }));
    
    const mostInactive = courseMetrics
      .slice(-5)
      .reverse()
      .map(c => ({
        ...c,
        trend: 'down'
      }));
    
    res.json({
      success: true,
      data: {
        mostActive,
        mostInactive
      }
    });
    
  } catch (error) {
    console.error('Error fetching course activity summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course activity summary'
    });
  }
};

// Get all courses activity
exports.getAllCoursesActivity = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            userCourses: true
          }
        }
      }
    });
    
    const coursesWithActivity = await Promise.all(
      courses.map(async (course) => {
        const activeUsers = await prisma.courseActivity.count({
          where: {
            courseId: course.id,
            timestamp: {
              gte: startDate,
              lte: endDate
            }
          },
          distinct: ['userId']
        });
        
        return {
          id: course.id,
          title: course.title,
          enrollments: course._count.userCourses,
          activeUsers
        };
      })
    );
    
    res.json({
      success: true,
      data: coursesWithActivity
    });
    
  } catch (error) {
    console.error('Error fetching all courses activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses activity'
    });
  }
};
```

## Metrics Calculation Logic

### Active Users
A user is considered "active" if they have performed any of the following actions in the month:
- Viewed course content
- Started a module
- Completed a module
- Submitted an assessment
- Accessed course materials

### Inactive Courses
Courses are considered "inactive" based on:
- Low enrollment numbers (< 50 enrollments)
- Low active user percentage (< 30% of enrolled users are active)
- Low completion rate (< 40%)
- Low average time spent (< 300 minutes)

### Activity Score Formula
```
Activity Score = (activeUsers * 0.4) + (completionRate * 0.3) + (enrollments * 0.2) + (avgTimeSpent/10 * 0.1)
```

## Usage

### For Instructors/Admins
1. Navigate to the Instructor Dashboard
2. Click on the "Course Analytics" tab in the sidebar
3. View the overview of most active and inactive courses
4. Switch to "Monthly Analysis" tab to filter by specific months
5. Check "All Courses" tab to see complete list with metrics

### For Developers
```javascript
// Import the service
import { fetchMostActiveInactiveCourses } from '@/services/analyticsService';

// Fetch data
const data = await fetchMostActiveInactiveCourses();
console.log(data.mostActive);
console.log(data.mostInactive);
```

## Testing

### Test Data Setup
For testing without backend, the component automatically falls back to sample data if the API calls fail.

### Integration Testing
1. Ensure backend endpoints are available
2. Check browser console for API call logs
3. Verify data displays correctly in the UI
4. Test month/year filtering
5. Test refresh functionality

## Future Enhancements
1. Export analytics data to CSV/PDF
2. Email reports to instructors
3. Real-time activity tracking
4. Predictive analytics for course performance
5. Comparison between months
6. Course recommendations based on activity
7. Student engagement notifications
8. Custom date range selection

## Troubleshooting

### Common Issues

1. **No data showing:**
   - Check if backend endpoints are implemented
   - Verify API base URL in `.env` file
   - Check browser console for errors
   - Ensure user has proper authentication

2. **Sample data showing instead of real data:**
   - This is expected behavior when backend is not available
   - Implement backend endpoints to see real data

3. **Performance issues:**
   - Consider implementing database indexes
   - Use materialized views for pre-computed statistics
   - Implement caching (Redis)
   - Add pagination for large datasets

## Security Considerations
- Ensure only instructors and admins can access analytics
- Validate user permissions on backend
- Sanitize all input parameters
- Rate limit API endpoints
- Log analytics access for audit trails

