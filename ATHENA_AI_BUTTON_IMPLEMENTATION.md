# Athena AI Button Implementation

## Overview

Athena AI integration has been added to the LMS dashboard in two locations:

1. **Header Button**: Quick access button in the top-right corner of the dashboard header
2. **Dashboard Section**: Prominent featured section on the main dashboard page with features and benefits

Both provide seamless access to Athena AI while maintaining the user's login session via JWT token.

## Files Modified/Created

### New Files:

1. **`src/components/dashboard/AthenaAIButton.jsx`**
   - Reusable component for the Athena AI header button
   - Handles JWT token retrieval and validation
   - Manages redirect to Athena AI

2. **`src/components/dashboard/AthenaAISection.jsx`**
   - Featured dashboard section component
   - Displays Athena AI features and benefits
   - Includes prominent call-to-action button
   - Same redirect functionality as header button

### Modified Files:

1. **`src/components/dashboard/DashboardHeader.jsx`**
   - Added import for AthenaAIButton component
   - Integrated button into header's right section
   - Responsive implementation (desktop and mobile)

2. **`src/pages/Dashboard.jsx`**
   - Added import for AthenaAISection component
   - Integrated section into main dashboard page
   - Positioned after courses and before catalog banner

## Features

### ✅ JWT Token Management

- Retrieves JWT token from `localStorage` with key `"authToken"`
- Validates token existence before redirect
- Shows alert "Please log in first" if no token is found

### ✅ Secure Redirect

- Opens Athena AI in a new tab
- Appends token as query parameter: `http://localhost:5173/login?token=<JWT_TOKEN>`
- Uses `encodeURIComponent()` for safe URL encoding

### ✅ Responsive Design

- Desktop: Shows full button with "Open Athena AI" text
- Mobile/Tablet: Shows compact version with "Athena AI" text
- Uses Tailwind CSS for consistent styling

### ✅ Visual Design

- Gradient background (purple to blue)
- Sparkles icon with hover animation
- Matches existing dashboard button styles
- Rounded edges and smooth transitions
- Hover effects for better UX

## Usage

### Basic Usage

The button is automatically displayed in the dashboard header for all logged-in users.

```jsx
import AthenaAIButton from './AthenaAIButton';

// Default usage
<AthenaAIButton />

// With custom className
<AthenaAIButton className="custom-class" />
```

### Component Locations

#### 1. Dashboard Header Button

The compact button is placed in the dashboard header at:

```
Dashboard Header (Top Right)
  ├── Mobile Search Button
  ├── Athena AI Button ← NEW
  ├── Christmas Mode Toggle
  ├── Credits Badge
  ├── Notifications
  └── Profile Dropdown
```

#### 2. Dashboard Section

The featured section is positioned on the main dashboard page:

```
Dashboard Page Sections
  ├── Welcome Section
  ├── My Courses
  ├── Athena AI Section ← NEW FEATURED SECTION
  ├── Catalog Banner
  ├── Learning Sessions
  ├── Upcoming Courses
  ├── Groups
  └── Services
```

## Dashboard Section Features

The `AthenaAISection` component includes:

### Visual Elements

- **Gradient Background**: Purple-to-blue gradient with decorative blur elements
- **Icon Animations**: Pulsing sparkle icon for attention
- **Feature Grid**: Displays three key benefits with icons
- **Stats Bar**: Shows 24/7 availability and AI capabilities
- **Responsive Layout**: Adapts to mobile, tablet, and desktop

### Content Sections

1. **Header**: Title and subtitle introducing Athena AI
2. **Features List**: Three highlighted benefits (Smart Learning, 24/7 Assistance, Instant Answers)
3. **Call-to-Action**: Large, prominent "Open Athena AI" button
4. **Stats**: Quick facts about availability and capabilities

### User Experience

- **Visual Hierarchy**: Clear focus on the CTA button
- **Informative**: Educates users about Athena AI benefits
- **Engaging**: Animations and gradients draw attention
- **Accessible**: Includes ARIA labels and semantic HTML

## Customization

### Changing the Athena AI URL

#### Header Button

Edit `src/components/dashboard/AthenaAIButton.jsx`:

```jsx
// Current URL
const athenaURL = `http://localhost:5173/login?token=${encodeURIComponent(token)}`;

// Change to production URL
const athenaURL = `https://athena.yourdomain.com/login?token=${encodeURIComponent(token)}`;
```

#### Dashboard Section

Edit `src/components/dashboard/AthenaAISection.jsx`, line 17:

```jsx
// Current URL
const athenaURL = `http://localhost:5173/login?token=${encodeURIComponent(token)}`;

// Change to production URL
const athenaURL = `https://athena.yourdomain.com/login?token=${encodeURIComponent(token)}`;
```

### Changing the Token Storage Key

If your app uses a different key for storing the JWT token, update both components:

```jsx
// Current
const token = localStorage.getItem('authToken');

// Change to your key
const token = localStorage.getItem('yourTokenKey');
```

### Styling Modifications

The button uses Tailwind CSS classes. Modify the className in `AthenaAIButton.jsx`:

```jsx
className={`group relative inline-flex items-center gap-2 px-3 py-2
  rounded-2xl border border-purple-200
  bg-gradient-to-r from-purple-50 to-blue-50
  hover:from-purple-100 hover:to-blue-100
  text-purple-700 hover:text-purple-900
  shadow-sm hover:shadow transition-all duration-200 ${className}`}
```

**Color Scheme Options:**

- **Green theme**: `border-green-200 from-green-50 to-emerald-50 text-green-700`
- **Blue theme**: `border-blue-200 from-blue-50 to-cyan-50 text-blue-700`
- **Red theme**: `border-red-200 from-red-50 to-pink-50 text-red-700`

### Icon Customization

Change the icon by importing a different one from `lucide-react`:

```jsx
import { Sparkles, Bot, Zap, Rocket } from 'lucide-react';

// Use different icon
<Bot className="h-4 w-4 group-hover:animate-pulse" />;
```

### Dashboard Section Customization

#### Changing Feature List

Edit `src/components/dashboard/AthenaAISection.jsx` to modify the features displayed:

```jsx
// Add or modify features in the features list
<div className="flex items-start gap-3">
  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
    <YourIcon className="h-4 w-4 text-purple-600" />
  </div>
  <div>
    <h4 className="font-semibold text-gray-900 text-sm">Your Feature Title</h4>
    <p className="text-xs text-gray-600">Your feature description</p>
  </div>
</div>
```

#### Customizing Section Position

To move the Athena AI section to a different location on the dashboard, edit `src/pages/Dashboard.jsx` and move the `<AthenaAISection />` component to your preferred position.

#### Hiding the Dashboard Section

If you want to keep only the header button and hide the dashboard section:

1. Open `src/pages/Dashboard.jsx`
2. Comment out or remove the line: `<AthenaAISection />`

#### Customizing Section Colors

The section uses a purple-to-blue gradient theme. To change colors, edit the gradient classes in `AthenaAISection.jsx`:

```jsx
// Change gradient background
className = 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50';

// To green theme
className = 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50';

// To orange theme
className = 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50';
```

## Testing Checklist

- [ ] Button appears in dashboard header on desktop
- [ ] Button appears in dashboard header on mobile
- [ ] Button shows correct text on different screen sizes
- [ ] Clicking without token shows "Please log in first" alert
- [ ] Clicking with token redirects to Athena AI with token parameter
- [ ] New tab opens (doesn't navigate away from dashboard)
- [ ] Token is properly URL encoded
- [ ] Hover effects work correctly
- [ ] Icon animation works on hover

## Technical Details

### Dependencies

- React (already installed)
- lucide-react (already installed)
- Tailwind CSS (already configured)

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard `window.open()` API
- Uses standard `localStorage` API
- No polyfills required

### Security Considerations

1. **Token Exposure**: The token is passed as a URL parameter. Consider using POST request or secure cookie if available.
2. **HTTPS**: Ensure both apps use HTTPS in production to prevent token interception.
3. **Token Validation**: Athena AI should validate the token server-side.
4. **Token Expiration**: Implement token expiration checks if needed.

## Troubleshooting

### Button Not Showing

1. Check if you're logged into the dashboard
2. Clear browser cache
3. Check browser console for errors
4. Verify imports in `DashboardHeader.jsx`

### "Please log in first" Alert Always Shows

1. Check if token is stored in localStorage with key `"authToken"`
2. Open browser DevTools → Application → Local Storage
3. Verify the token exists and is not expired

### Redirect Not Working

1. Check if Athena AI is running on `http://localhost:5173`
2. Verify the URL in the component matches your Athena AI instance
3. Check browser console for CORS errors
4. Check if popup blocker is preventing the new tab

### Token Not Passed Correctly

1. Check browser Network tab to see the actual redirect URL
2. Verify token is properly URL encoded
3. Check Athena AI logs to see if token is received

## Future Enhancements

Potential improvements for future versions:

1. **Token Refresh**: Auto-refresh expired tokens before redirect
2. **Loading State**: Show loading indicator while validating token
3. **Error Handling**: More detailed error messages for different scenarios
4. **Analytics**: Track button clicks for usage metrics
5. **Customization**: Allow passing custom parameters via props
6. **Toast Notifications**: Use toast instead of alert for better UX
7. **Keyboard Shortcut**: Add keyboard shortcut (e.g., Ctrl+K) for quick access

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the implementation in `AthenaAIButton.jsx`
3. Check browser console for errors
4. Verify token storage in localStorage

## Changelog

### Version 1.0.0 (Initial Release)

- ✅ Added Athena AI button to dashboard header
- ✅ JWT token retrieval from localStorage
- ✅ Redirect to Athena AI with token parameter
- ✅ Responsive design for all screen sizes
- ✅ Gradient styling matching dashboard theme
- ✅ Icon animation on hover
- ✅ Alert for missing token
- ✅ Documentation and implementation guide
