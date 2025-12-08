# Athena AI Button - Quick Start Guide

## What Was Added?

Two new **Athena AI access points** have been added to your LMS dashboard:

1. **Header Button**: Quick access button in the top-right corner
2. **Dashboard Section**: Prominent featured section on the main dashboard page

## Locations

### 1. Dashboard Header (Top-Right Corner)

```
┌─────────────────────────────────────────────────────────────┐
│ LMS Athena [Search] ... [Athena AI] [Credits] [🔔] [Profile]│
└─────────────────────────────────────────────────────────────┘
                            ↑
                    HEADER BUTTON
```

### 2. Dashboard Main Section

```
Dashboard Page
├── Welcome Section
├── My Courses
├── 🆕 Athena AI Section ← FEATURED SECTION
├── Catalog Banner
├── Learning Sessions
└── Services
```

## How It Works

1. **User clicks** "Open Athena AI" button
2. **System checks** for JWT token in localStorage (key: `authToken`)
3. **If token exists**: Opens Athena AI in new tab with token parameter
4. **If no token**: Shows alert "Please log in first"

## Files Changed

### ✅ Created:

- `src/components/dashboard/AthenaAIButton.jsx` - Reusable button component for header
- `src/components/dashboard/AthenaAISection.jsx` - Featured dashboard section component

### ✅ Modified:

- `src/components/dashboard/DashboardHeader.jsx` - Added button to header
- `src/pages/Dashboard.jsx` - Added Athena AI section to main dashboard

## Quick Test

1. **Start your dev server**:

   ```bash
   npm run dev
   ```

2. **Open browser** to `http://localhost:3000/dashboard`

3. **Look for the button** in the top-right corner (purple gradient with sparkle icon)

4. **Click the button**:
   - Should open new tab to: `http://localhost:5173/login?token=YOUR_JWT_TOKEN`

## Customization

### Change Athena AI URL

Update both components for production:

1. **Header Button** - Edit `src/components/dashboard/AthenaAIButton.jsx`, line 22:

```jsx
const athenaURL = `https://athena.yourdomain.com/login?token=${encodeURIComponent(token)}`;
```

2. **Dashboard Section** - Edit `src/components/dashboard/AthenaAISection.jsx`, line 22:

```jsx
const athenaURL = `https://athena.yourdomain.com/login?token=${encodeURIComponent(token)}`;
```

### Change Token Key

If your app uses a different localStorage key, update both components:

```jsx
// FROM:
const token = localStorage.getItem('authToken');

// TO:
const token = localStorage.getItem('yourCustomKey');
```

### Hide Dashboard Section

To keep only the header button, remove from `src/pages/Dashboard.jsx`:

```jsx
<AthenaAISection />
```

### Style Changes

Modify the button's appearance by editing the `className` in `AthenaAIButton.jsx`:

- **Border color**: `border-purple-200` → `border-blue-200`
- **Gradient**: `from-purple-50 to-blue-50` → `from-green-50 to-teal-50`
- **Text color**: `text-purple-700` → `text-blue-700`

## Features

### Header Button

✅ **Responsive**: Shows full text on desktop, compact on mobile  
✅ **Quick Access**: Always visible in the header  
✅ **Minimal Design**: Doesn't take up much space

### Dashboard Section

✅ **Informative**: Shows features and benefits of Athena AI  
✅ **Visual Appeal**: Eye-catching gradient design with animations  
✅ **Educational**: Helps users understand what Athena AI offers  
✅ **Prominent CTA**: Large, easy-to-find action button

### Both Components

✅ **Secure**: URL-encodes the JWT token  
✅ **User-friendly**: Opens in new tab (doesn't navigate away)  
✅ **Validated**: Checks for token before redirect  
✅ **Styled**: Matches existing dashboard design  
✅ **Accessible**: Includes proper ARIA labels and titles

## Visual Design

### Header Button

```
┌─────────────────────────────┐
│  ✨  Open Athena AI          │ ← Desktop
└─────────────────────────────┘

┌──────────────┐
│  ✨  Athena AI│ ← Mobile
└──────────────┘
```

### Dashboard Section

```
┌───────────────────────────────────────────────────────────┐
│  ✨ Athena AI Assistant                                   │
│     Your intelligent learning companion                   │
│                                                            │
│  Get instant help with coursework and personalized AI     │
│  assistance...                                             │
│                                                            │
│  🧠 Smart Learning    💬 24/7 Assistance    ⚡ Instant    │
│                                                            │
│             ┌──────────────────────┐                      │
│             │  ✨ Open Athena AI →  │                      │
│             └──────────────────────┘                      │
│                                                            │
│      24/7        AI Powered        ∞ Questions            │
└───────────────────────────────────────────────────────────┘
```

**Color Scheme:**

- **Header Button**: Light purple gradient
- **Dashboard Section**: Purple-to-blue gradient with decorative blurs
- Border: Light purple (#e9d5ff)
- Text: Dark purple (#7c3aed)
- Icons: Sparkles ✨ with animations

## Testing Checklist

Before deploying to production:

- [ ] Button visible on desktop
- [ ] Button visible on mobile/tablet
- [ ] Click works when logged in
- [ ] Alert shows when not logged in
- [ ] Redirects to correct Athena AI URL
- [ ] Token is properly encoded in URL
- [ ] Opens in new tab
- [ ] Hover animation works
- [ ] No console errors

## Troubleshooting

**Problem**: Button not visible  
**Solution**: Check if `AthenaAIButton` is imported in `DashboardHeader.jsx`

**Problem**: "Please log in first" always shows  
**Solution**: Verify JWT token exists in localStorage with key `authToken`

**Problem**: Wrong redirect URL  
**Solution**: Update the `athenaURL` constant in `AthenaAIButton.jsx`

**Problem**: Token not received by Athena AI  
**Solution**: Check Network tab in DevTools to verify URL parameters

## Next Steps

1. **Test the button** in development
2. **Update the URL** to your production Athena AI instance
3. **Verify token handling** on the Athena AI side
4. **Deploy** to production
5. **Monitor** user adoption and any issues

## Support Resources

- Full documentation: `ATHENA_AI_BUTTON_IMPLEMENTATION.md`
- Component location: `src/components/dashboard/AthenaAIButton.jsx`
- Header integration: `src/components/dashboard/DashboardHeader.jsx`

---

**Ready to use!** 🚀 The button is now live in your dashboard header.
