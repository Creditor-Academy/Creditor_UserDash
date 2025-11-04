# Course Activity Analytics - Testing Guide

## Quick Start

### 1. Access the Feature

1. Navigate to your application in the browser
2. Log in with an instructor or admin account
3. Go to the Instructor Dashboard
4. Click on "Course Analytics" in the left sidebar

### 2. What You Should See

The Course Analytics page should display:

- **Overview Stats Cards:**
  - Total Courses
  - Total Enrollments
  - Active Courses
  - Inactive Courses

- **Three Tabs:**
  - **Overview:** Shows most active and inactive courses
  - **Monthly Analysis:** Filter courses by specific month/year
  - **All Courses:** Complete list of all courses with activity metrics

### 3. Testing Features

#### A. Overview Tab
- [ ] Verify that "Most Active Courses" are displayed in ranked order
- [ ] Check that each course shows:
  - Rank badge (gold for #1, silver for #2, bronze for #3)
  - Course title
  - Number of enrollments
  - Number of active users
  - Average time spent
  - Completion rate percentage
  - Trend indicator (up arrow for active)
- [ ] Verify that "Most Inactive Courses" are displayed
- [ ] Check inactive courses show trend indicator (down arrow)

#### B. Monthly Analysis Tab
- [ ] Click on the "Monthly Analysis" tab
- [ ] Use the month dropdown to select different months
- [ ] Use the year dropdown to select different years
- [ ] Verify that data refreshes when filters change
- [ ] Check that the selected month/year is displayed

#### C. All Courses Tab
- [ ] Click on the "All Courses" tab
- [ ] Verify all courses are listed in order
- [ ] Check that each course shows:
  - Course number (#1, #2, etc.)
  - Course title
  - Enrollment count
  - Active user count
  - Activity percentage badge

#### D. Refresh Functionality
- [ ] Click the "Refresh" button in the top-right corner
- [ ] Verify that data reloads
- [ ] Check for success toast notification

### 4. Expected Behavior

#### With Backend Connected
When the backend is properly implemented and connected:
- Real course data should be displayed
- All metrics should be accurate
- Filtering by month/year should show actual historical data

#### Without Backend (Current State)
When backend is not available or not implemented:
- Sample/demo data will be displayed automatically
- A toast notification will indicate that sample data is being shown
- All UI features will still work to demonstrate functionality

### 5. Sample Data

If backend is not yet implemented, you should see sample courses like:
- Private Merchant Course (high activity)
- Sovereignty 101 (high activity)
- Business Credit Fundamentals (medium activity)
- Advanced Legal Strategies (low activity)
- Estate Planning Basics (low activity)

### 6. Browser Console Testing

Open the browser console (F12) to check for:

#### Successful API Call
```
✓ Course analytics loaded successfully
```

#### Failed API Call (Expected if backend not implemented)
```
Failed to fetch course analytics. Using sample data for demonstration.
```

#### Network Tab
Check the Network tab for API calls to:
- `/api/analytics/course-activity/summary`
- `/api/analytics/courses/activity`

### 7. Visual Testing Checklist

- [ ] Colors are consistent with the app theme
- [ ] Icons are displaying correctly
- [ ] Cards have proper spacing and shadows
- [ ] Text is readable and properly aligned
- [ ] Badges are displaying with correct colors
- [ ] Hover effects work on interactive elements
- [ ] Loading spinner appears when fetching data
- [ ] Responsive design works on mobile/tablet/desktop

### 8. Performance Testing

- [ ] Page loads quickly (< 2 seconds)
- [ ] Switching tabs is smooth
- [ ] Filtering by month doesn't cause lag
- [ ] Refresh button responds immediately

### 9. Error Handling

Test error scenarios:

#### A. Network Error
- Disconnect internet or block API in DevTools
- Try to refresh data
- Should show error toast: "Failed to load course analytics"
- Should fall back to sample data

#### B. Invalid Month Selection
- Should not allow invalid selections
- Dropdowns should only show valid options

#### C. No Data Available
- Should show appropriate "No data available" message
- Icons should be displayed in empty states

### 10. Accessibility Testing

- [ ] Tab navigation works correctly
- [ ] Keyboard shortcuts work for tabs
- [ ] Screen reader announces content properly
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG standards

## Common Issues and Solutions

### Issue: "Course Analytics" tab not showing
**Solution:** 
- Verify you're logged in as an instructor or admin
- Check that `Instructorpage.jsx` was updated correctly
- Clear browser cache and reload

### Issue: Page shows error immediately
**Solution:**
- Open browser console to see error details
- Check that all imports are correct
- Verify API base URL in `.env` file

### Issue: No data showing at all
**Solution:**
- Check browser console for JavaScript errors
- Verify that sample data fallback is working
- Check network tab for failed API calls

### Issue: Styles look broken
**Solution:**
- Verify Tailwind CSS is working
- Check that Shadcn UI components are imported
- Clear CSS cache

## Manual Testing Script

Run through this script to ensure everything works:

```
1. Open application in Chrome
2. Log in as instructor/admin
3. Navigate to /instructor
4. Click "Course Analytics" in sidebar
5. Verify Overview tab loads with data
6. Count courses in "Most Active" section (should be 3-5)
7. Count courses in "Most Inactive" section (should be 2-5)
8. Click "Monthly Analysis" tab
9. Change month to January
10. Change year to 2024
11. Verify loading spinner appears
12. Click "All Courses" tab
13. Verify complete list appears
14. Click "Refresh" button
15. Verify toast notification appears
16. Check browser console for errors (should be none or expected API errors)
17. Test on mobile viewport (resize browser)
18. Verify responsive design works
19. Close browser and reopen
20. Navigate back to Course Analytics
21. Verify data persists correctly
```

## Automated Testing (Future Enhancement)

To add automated tests, create test files:

### Unit Tests
```javascript
// analyticsService.test.js
describe('Analytics Service', () => {
  test('fetchMostActiveInactiveCourses returns data', async () => {
    const data = await fetchMostActiveInactiveCourses();
    expect(data).toHaveProperty('mostActive');
    expect(data).toHaveProperty('mostInactive');
  });
});
```

### Integration Tests
```javascript
// CourseActivityAnalytics.test.jsx
describe('CourseActivityAnalytics', () => {
  test('renders without crashing', () => {
    render(<CourseActivityAnalytics />);
    expect(screen.getByText('Course Activity Analytics')).toBeInTheDocument();
  });
});
```

## Backend Testing

Once backend is implemented, test the API endpoints directly:

### Using cURL
```bash
# Test course activity summary
curl -X GET "http://localhost:3000/api/analytics/course-activity/summary?year=2024&month=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test all courses activity
curl -X GET "http://localhost:3000/api/analytics/courses/activity?year=2024&month=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Import the API endpoints
2. Set up authentication
3. Test each endpoint
4. Verify response structure matches documentation

## Sign-Off Checklist

Before considering the feature complete:

- [ ] All UI components render correctly
- [ ] Sample data displays when backend is unavailable
- [ ] Real data displays when backend is available
- [ ] All three tabs work correctly
- [ ] Month/year filtering works
- [ ] Refresh button works
- [ ] No console errors (except expected API errors)
- [ ] Responsive design works on all screen sizes
- [ ] Performance is acceptable
- [ ] Error messages are user-friendly
- [ ] Code is well-documented
- [ ] Backend API documentation is complete
- [ ] Backend routes are implemented
- [ ] Database schema is created
- [ ] Security/authorization is in place

## Next Steps

After testing is complete:

1. **Backend Implementation:**
   - Follow `COURSE_ANALYTICS_IMPLEMENTATION.md`
   - Implement all required API endpoints
   - Set up database tables/views
   - Add authentication/authorization

2. **Data Collection:**
   - Start tracking course activities
   - Build historical data
   - Set up automated jobs for statistics calculation

3. **Enhancements:**
   - Add export to CSV functionality
   - Add email reports
   - Add more detailed analytics
   - Add predictive insights

4. **Monitoring:**
   - Set up error tracking
   - Monitor API performance
   - Track feature usage
   - Collect user feedback

## Support

If you encounter issues:
1. Check this testing guide
2. Review `COURSE_ANALYTICS_IMPLEMENTATION.md`
3. Check browser console for errors
4. Review backend logs
5. Contact development team

