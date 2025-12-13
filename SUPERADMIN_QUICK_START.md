# SuperAdmin Dashboard - Quick Start Guide

## Access the Dashboard

Navigate to: `http://localhost:5173/superadmin/`

## File Structure

```
src/superadmin/
├── SuperAdminApp.tsx                    # Entry point with theme provider
├── pages/
│   └── SuperAdminDashboard.tsx          # Main dashboard layout
├── components/
│   ├── Sidebar.tsx                      # Left navigation sidebar
│   ├── TopNav.tsx                       # Top navigation bar
│   ├── HeroPanel.tsx                    # Hero section
│   ├── MetricCard.tsx                   # KPI cards
│   ├── ActiveUsersChart.tsx             # User activity chart
│   ├── SalesCard.tsx                    # Sales metrics
│   └── VideoTable.tsx                   # Video content table
├── context/
│   └── ThemeContext.tsx                 # Theme management
└── theme/
    └── colors.ts                        # Color definitions
```

## Key Features

### 1. Theme System

- Toggle between dark and light modes
- Click the Sun/Moon icon in TopNav to switch
- Colors automatically update across all components

### 2. Responsive Layout

- Sidebar: Fixed left navigation (80px wide)
- TopNav: Fixed top bar (80px tall)
- Main content: Responsive grid layout
- Works on mobile, tablet, and desktop

### 3. Components

#### Sidebar

- Navigation icons for: Home, Dashboard, Analytics, Users, Sales, Settings
- Active state indicator with gradient
- Hover effects on inactive items

#### TopNav

- Search bar for analytics/reports/users
- Notification bell with indicator
- Theme toggle button
- User avatar with initials

#### Dashboard Content

- Hero panel with call-to-action
- 4 metric cards (Users, Clicks, Sales, Items)
- Active users chart with trend lines
- Sales card with growth indicator
- Video table with content metadata

## Customization

### Change Colors

Edit `src/superadmin/theme/colors.ts`:

```typescript
export const darkTheme = {
  bg: { primary: '#1A1A1F', ... },
  accent: { orange: '#FF7A3D', ... }
}
```

### Update Metrics

Edit `src/superadmin/pages/SuperAdminDashboard.tsx`:

```typescript
<MetricCard
  icon={Users}
  label="Total Users"
  value="8,462"  // Change this value
  color={colors.accent.blue}
/>
```

### Modify Navigation Items

Edit `src/superadmin/components/Sidebar.tsx`:

```typescript
const navItems: NavItem[] = [
  { icon: <Home size={22} />, label: 'Home' },
  // Add more items here
];
```

## Integration with Main App

The SuperAdmin dashboard is integrated into the main app via:

- Route: `/superadmin/*`
- Protected by: `SuperAdminRoute` component
- Entry point: `src/App.jsx`

## Data Flow

```
SuperAdminApp (ThemeProvider)
  └── SuperAdminDashboard
      ├── Sidebar (uses useTheme)
      ├── TopNav (uses useTheme)
      └── Dashboard Content
          ├── HeroPanel
          ├── MetricCards
          ├── ActiveUsersChart
          ├── SalesCard
          └── VideoTable
```

## Adding New Pages

1. Create a new file in `src/superadmin/pages/`
2. Import and use components from `src/superadmin/components/`
3. Use `useTheme()` hook for theme colors
4. Add route in main `App.jsx`

Example:

```typescript
// src/superadmin/pages/UsersPage.tsx
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

export default function UsersPage() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <div style={{ backgroundColor: colors.bg.primary }}>
      {/* Your content */}
    </div>
  );
}
```

## Connecting to APIs

Replace mock data with API calls:

```typescript
// In SuperAdminDashboard.tsx
useEffect(() => {
  fetchMetrics().then(data => {
    // Update state with real data
  });
}, []);
```

## Troubleshooting

### Theme not changing?

- Ensure component is wrapped with `ThemeProvider`
- Check that `useTheme()` is called inside a component

### Styles not applying?

- Verify Tailwind CSS is configured in main project
- Check color values in `theme/colors.ts`

### Route not working?

- Ensure `/superadmin/*` route is added to `App.jsx`
- Check that user has SuperAdmin role for `SuperAdminRoute`

## Performance Tips

1. **Memoize Components**: Use `React.memo()` for heavy components
2. **Lazy Load**: Use `React.lazy()` for pages not immediately needed
3. **Optimize Charts**: Consider using a charting library for complex visualizations
4. **CSS Variables**: Replace inline styles with CSS variables for better performance

## Next Steps

1. Connect to backend APIs for real data
2. Add more dashboard pages (Users, Analytics, Settings)
3. Implement user profile menu
4. Add notification system
5. Create admin settings page
