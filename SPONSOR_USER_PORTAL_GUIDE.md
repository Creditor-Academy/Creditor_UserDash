# Sponsor User Portal - Implementation Guide

## 📋 Overview

The Sponsor User Portal is a comprehensive self-service platform that allows users to become sponsors by creating, managing, and paying for their own ads within the LMS. This feature provides a complete workflow from ad creation to payment processing and admin approval.

## ✨ Features Implemented

### 1. **Sponsor Dashboard** (`/dashboard/sponsor`)

- View all ad submissions with their status
- Analytics cards showing:
  - Active ads count
  - Total impressions
  - Total clicks
  - Average CTR (Click-Through Rate)
- Submission status badges: Pending, Approved, Rejected, Active, Paused
- Payment status tracking: Paid/Unpaid
- Quick actions: Create, Edit, Delete, Pay

### 2. **Ad Creation Form** (`/dashboard/sponsor/create`)

- Complete ad details form with fields:
  - **Title** - Ad headline
  - **Description** - Ad copy
  - **Media Type** - Image, Video, Banner, Card, or Text
  - **Media Upload** - File upload with preview
  - **Placement** - Choose where ad appears:
    - Dashboard Banner (Full Width)
    - Dashboard Sidebar
    - Course Player Sidebar
    - Course Listing
    - Popup
  - **CTA Text & URL** - Call-to-action button configuration
  - **Date Range** - Start and end dates
  - **Tier Selection** - Bronze, Silver, Gold

### 3. **Edit Ad Form** (`/dashboard/sponsor/edit/:submissionId`)

- Pre-filled form with existing ad data
- Only editable for ads with "Pending" status
- Same interface as create form

### 4. **Payment Page** (`/dashboard/sponsor/payment/:submissionId`)

- Secure payment form with:
  - Card number (formatted with spaces)
  - Cardholder name
  - Expiry date (MM/YY format)
  - CVV (masked)
  - Billing address
- Order summary sidebar showing:
  - Ad details
  - Selected tier
  - Duration (30 days)
  - Total amount
- Payment verification and submission

### 5. **Pricing Tiers**

#### Bronze - $99/30 days

- Course listing placement
- Low frequency display
- Basic analytics
- Up to 5,000 impressions

#### Silver - $299/30 days

- Dashboard sidebar placement
- Medium frequency display
- Advanced analytics
- Up to 20,000 impressions
- Priority support

#### Gold - $599/30 days

- Premium dashboard banner placement
- High frequency display
- Full analytics dashboard
- Unlimited impressions
- Priority support
- Featured placement

## 🔄 Workflow

1. **Create Ad Campaign**
   - User navigates to Sponsor section in sidebar
   - Clicks "Create New Ad"
   - Fills in ad details and requirements
   - Selects pricing tier
   - Submits form

2. **Payment Processing**
   - System generates payment link
   - User redirected to payment page
   - User enters payment details
   - Payment processed and verified
   - Submission marked as "Paid"

3. **Admin Approval**
   - Admin receives notification of new paid submission
   - Admin reviews ad content and requirements
   - Admin approves or rejects the ad
   - User notified of decision

4. **Ad Goes Live**
   - Approved ads automatically go live
   - Start date and end date are respected
   - Real-time analytics tracking begins
   - User can monitor performance in dashboard

5. **Performance Monitoring**
   - User views impressions and clicks in real-time
   - Analytics updated automatically
   - CTR calculated and displayed
   - Performance metrics for each ad

## 🗂️ File Structure

```
src/
├── services/
│   └── sponsorService.js          # API service for sponsor operations
├── pages/
│   ├── Sponsor.jsx                # Main sponsor dashboard
│   ├── SponsorCreate.jsx          # Create/Edit ad form
│   └── SponsorPayment.jsx         # Payment processing page
└── components/
    └── layout/
        └── Sidebar.jsx            # Updated with Sponsor menu item
```

## 🔌 API Integration

### Current Implementation

Currently using localStorage for mock data. All functions in `sponsorService.js` are ready for backend integration.

### Backend Endpoints Needed

```javascript
// Submissions
GET    /api/sponsor/submissions?userId={userId}      // Get user's submissions
GET    /api/sponsor/submissions/{submissionId}       // Get submission by ID
POST   /api/sponsor/submissions                      // Create new submission
PUT    /api/sponsor/submissions/{submissionId}       // Update submission
DELETE /api/sponsor/submissions/{submissionId}       // Delete submission

// Payment
POST   /api/sponsor/payment/initiate                 // Initiate payment
POST   /api/sponsor/payment/verify                   // Verify payment

// Analytics
GET    /api/sponsor/analytics?userId={userId}        // Get analytics

// Pricing
GET    /api/sponsor/pricing                          // Get pricing tiers
```

### Data Models

#### Submission Object

```javascript
{
  id: string,
  userId: string,
  title: string,
  description: string,
  mediaType: 'image' | 'video' | 'banner' | 'card' | 'text',
  mediaUrl?: string,
  placement: 'dashboard_banner' | 'dashboard_sidebar' | 'course_player_sidebar' | 'course_listing' | 'popup',
  ctaText: string,
  ctaUrl: string,
  tier: 'Bronze' | 'Silver' | 'Gold',
  startDate: string (ISO),
  endDate: string (ISO),
  targetRoles: string[],
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paused',
  paymentStatus: 'unpaid' | 'paid' | 'refunded',
  impressions: number,
  clicks: number,
  submittedAt: string (ISO),
  updatedAt: string (ISO),
  paidAt?: string (ISO)
}
```

## 🎨 UI Components

### Status Badges

- **Pending Review** (Clock icon, Secondary)
- **Approved** (CheckCircle icon, Default)
- **Rejected** (XCircle icon, Destructive)
- **Active** (PlayCircle icon, Default)
- **Paused** (PauseCircle icon, Secondary)

### Payment Badges

- **Paid** (Green, CheckCircle)
- **Unpaid** (Secondary, Clock)

### Analytics Cards

- Clean card design with large numbers
- Color-coded for visual clarity
- Responsive grid layout

## 🔐 Security Features

1. **User Authentication**
   - Only authenticated users can access sponsor portal
   - User ID validated on all requests

2. **Payment Security**
   - Encrypted payment information
   - CVV masked input
   - Secure payment gateway integration (ready for Stripe/PayPal)

3. **Data Validation**
   - Required field validation
   - URL format validation
   - Date range validation
   - File size and type validation

## 📱 Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly buttons
- Optimized for tablets and phones

## 🚀 Getting Started

### For Development

1. The feature is already integrated into the sidebar
2. Mock data is stored in localStorage
3. No backend required for testing
4. Payment simulation included

### For Production

1. **Backend Integration**
   - Replace mock functions in `sponsorService.js`
   - Add actual API endpoints
   - Configure payment gateway (Stripe/PayPal)
   - Set up webhook handlers

2. **File Upload**
   - Configure S3 or cloud storage
   - Update media upload handler
   - Add file validation

3. **Admin Panel**
   - Create admin approval interface
   - Add notification system
   - Implement approval workflow

4. **Email Notifications**
   - New submission notification (to admin)
   - Approval notification (to user)
   - Rejection notification (to user)
   - Payment confirmation (to user)

## 📊 Admin Requirements

The admin side will need:

1. **Approval Dashboard**
   - View all pending submissions
   - Preview ad content
   - Approve/reject with reason
   - Bulk actions

2. **Ad Management**
   - Pause/resume active ads
   - Edit ad details
   - View detailed analytics
   - Manage pricing tiers

3. **Revenue Tracking**
   - Total revenue from sponsors
   - Revenue by tier
   - Payment history
   - Refund management

## 🎯 User Benefits

1. **Self-Service** - Complete control over ad campaigns
2. **Transparent Pricing** - Clear tier-based pricing
3. **Real-Time Analytics** - Monitor performance instantly
4. **Flexible Options** - Multiple media types and placements
5. **Easy Payment** - Integrated payment processing
6. **Performance Tracking** - See exactly how ads perform

## 🔄 Future Enhancements

1. **Advanced Targeting**
   - Category-specific targeting
   - Batch-specific targeting
   - Geographic targeting

2. **A/B Testing**
   - Test multiple ad variants
   - Compare performance
   - Optimize campaigns

3. **Automated Bidding**
   - Real-time bidding for placement
   - Dynamic pricing based on demand

4. **Campaign Scheduler**
   - Schedule multiple campaigns
   - Automatic start/stop
   - Recurring campaigns

5. **Advanced Analytics**
   - Conversion tracking
   - Audience insights
   - ROI calculator

## 📝 Notes

- All components use Tailwind CSS for styling
- Consistent with existing LMS design system
- Fully accessible with proper ARIA labels
- Toast notifications for user feedback
- Loading states for all async operations

## ✅ Testing Checklist

- [ ] Create new ad submission
- [ ] Edit pending submission
- [ ] Delete pending submission
- [ ] Process payment
- [ ] View analytics
- [ ] Test responsive design
- [ ] Test form validations
- [ ] Test file uploads
- [ ] Test navigation flow
- [ ] Test error handling

## 🆘 Support

For users:

- Clear onboarding guide
- "How it works" section on dashboard
- Money-back guarantee for non-approved ads
- 24/7 customer support

For developers:

- Comprehensive code comments
- Service layer abstraction
- Easy backend integration
- Extensible architecture

---

**Implementation Status**: ✅ Complete and Ready for Testing

All features are fully functional with mock data. Ready for backend integration when available.
