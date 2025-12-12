# Athena AI Credit System - Design Documentation

## 🎨 Overview

The Athena AI section has been redesigned with a **clean, minimal UI** featuring a **credit-based unlocking system**. Users can unlock and use AI-powered features by spending credits.

---

## ✨ Features

### Available AI Tools

| Feature              | Icon        | Cost        | Description                             |
| -------------------- | ----------- | ----------- | --------------------------------------- |
| **Generate Logo**    | ✨ Sparkles | 50 credits  | AI-powered logo creation for your brand |
| **Generate Image**   | 🖼️ Image    | 30 credits  | Create custom images with AI            |
| **Brandkit**         | 🎨 Palette  | 100 credits | Complete brand identity package         |
| **Generate Content** | 📄 FileText | 25 credits  | AI-written articles, posts, and copy    |

---

## 🎯 Design Principles

### Clean & Minimal

- ✅ Simple card-based layout
- ✅ Clear visual hierarchy
- ✅ Minimal color palette (gray, purple, blue, indigo, emerald)
- ✅ No unnecessary decorations
- ✅ Focus on functionality

### Credit System

- ✅ **Locked State**: Features show lock icon when insufficient credits
- ✅ **Unlocked State**: Features are clickable and ready to use
- ✅ **Credit Display**: Current balance shown in header
- ✅ **Cost Badge**: Each feature shows its credit cost
- ✅ **Quick Purchase**: "Buy Credits" button for easy access

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  ✨ Athena AI                    [💰 150 credits]      │
│     AI-powered creative tools                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ ✨ Logo  │  │ 🖼️ Image │  │ 🎨 Brand │  │ 📄 Content││
│  │  50 ⓒ   │  │  30 ⓒ   │  │  100 ⓒ  │  │  25 ⓒ   ││
│  │ [Use Now]│  │ [Use Now]│  │ [🔒 Lock]│  │ [Use Now]││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Need more credits?              [💰 Buy Credits]       │
│  Purchase credits to unlock all features                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Credit Unlocking Flow

### 1. User Clicks Feature

```
User clicks "Generate Logo" (50 credits)
    ↓
Check: balance >= 50?
    ├─ Yes → Deduct credits → Open Athena AI
    └─ No  → Show Credit Purchase Modal
```

### 2. Locked Feature Behavior

- **Visual**: Grayed out with lock overlay
- **Interaction**: Clicking opens credit purchase modal
- **Message**: Shows "X credits needed"

### 3. Unlocked Feature Behavior

- **Visual**: Colored card with hover effects
- **Interaction**: Clicking opens Athena AI with feature parameter
- **Credits**: Automatically deducted before opening

---

## 🎨 Visual States

### Locked Feature

```
┌─────────────────────┐
│ 🔒 Lock Overlay     │
│                     │
│ [Gray Icon]         │
│ Feature Name        │
│ Description         │
│ [🔒 Unlock]         │
└─────────────────────┘
```

### Unlocked Feature

```
┌─────────────────────┐
│ [Colored Icon]  50ⓒ│
│                     │
│ Feature Name        │
│ Description         │
│ [⚡ Use Now →]      │
└─────────────────────┘
```

---

## 💳 Credit Costs

### Feature Pricing

- **Logo Generation**: 50 credits (Premium feature)
- **Image Generation**: 30 credits (Standard feature)
- **Brandkit**: 100 credits (Premium package)
- **Content Generation**: 25 credits (Standard feature)

### Credit Display

- **Header**: Shows current balance with coin icon
- **Feature Cards**: Show cost badge when unlocked
- **Locked Cards**: Show "X credits needed" message

---

## 🔄 User Interactions

### Opening Athena AI

1. **Check Authentication**: Verify JWT token exists
2. **Check Credits**: Verify user has enough credits
3. **Deduct Credits**: Spend credits via `spendCredits()`
4. **Open Athena AI**: Redirect with token and feature parameter
5. **Log Activity**: Console logs for debugging

### Insufficient Credits

1. **Show Lock State**: Feature appears grayed out
2. **Click Feature**: Opens credit purchase modal
3. **Purchase Credits**: User buys credits
4. **Refresh Balance**: Balance updates automatically
5. **Feature Unlocks**: User can now use the feature

---

## 📱 Responsive Design

### Desktop (1024px+)

- 4-column grid layout
- Full feature descriptions
- Hover effects enabled

### Tablet (768px - 1023px)

- 2-column grid layout
- Compact feature cards
- Touch-friendly buttons

### Mobile (<768px)

- 1-column grid layout
- Stacked feature cards
- Full-width buttons

---

## 🎯 Key Components

### 1. Feature Card

```jsx
<FeatureCard>
  - Icon (colored when unlocked, gray when locked) - Feature name - Description
  - Credit cost badge - Action button (Use Now / Unlock) - Lock overlay (when
  insufficient credits)
</FeatureCard>
```

### 2. Credit Header

```jsx
<CreditHeader>
  - Athena AI logo - Title and subtitle - Current credit balance
</CreditHeader>
```

### 3. Footer CTA

```jsx
<FooterCTA>- "Need more credits?" message - "Buy Credits" button</FooterCTA>
```

---

## 🔧 Technical Implementation

### Credit Integration

```jsx
import { useCredits } from '@/contexts/CreditsContext';

const { balance, spendCredits } = useCredits();

// Check if user has enough credits
const hasCredits = balance >= feature.cost;

// Deduct credits when using feature
spendCredits(feature.cost, {
  feature: featureId,
  type: 'athena_ai',
});
```

### Feature Unlocking

```jsx
const handleOpenAthenaAI = featureId => {
  const feature = features.find(f => f.id === featureId);

  if (balance < feature.cost) {
    // Open credit purchase modal
    setCreditsModalOpen(true);
    return;
  }

  // Deduct credits
  spendCredits(feature.cost, { feature: featureId });

  // Open Athena AI with feature parameter
  const athenaURL = `http://localhost:5173/login?token=${token}&feature=${featureId}`;
  window.open(athenaURL, '_blank');
};
```

### Color System

Each feature has a unique color theme:

- **Purple**: Logo Generation
- **Blue**: Image Generation
- **Indigo**: Brandkit
- **Emerald**: Content Generation

---

## 🎨 Color Palette

### Feature Colors

```css
Purple:  bg-purple-50, border-purple-200, text-purple-700
Blue:    bg-blue-50, border-blue-200, text-blue-700
Indigo:  bg-indigo-50, border-indigo-200, text-indigo-700
Emerald: bg-emerald-50, border-emerald-200, text-emerald-700
```

### State Colors

```css
Locked:   bg-gray-50, border-gray-200, text-gray-500
Unlocked: Feature-specific colors
Hover:    Shadow effects, scale transforms
```

---

## 📊 User Experience Flow

### First-Time User

1. Sees all features locked
2. Views credit costs
3. Clicks "Buy Credits"
4. Purchases credits
5. Features unlock automatically
6. Can now use any unlocked feature

### Returning User

1. Sees current credit balance
2. Views which features are unlocked
3. Clicks unlocked feature
4. Credits deducted automatically
5. Athena AI opens with feature selected

### Low Credits User

1. Some features locked, some unlocked
2. Can use unlocked features
3. Sees "Buy Credits" CTA
4. Can purchase more credits anytime

---

## 🔒 Security Features

### Token Handling

- ✅ JWT token retrieved from localStorage
- ✅ Token validated before redirect
- ✅ URL-safe encoding with `encodeURIComponent()`
- ✅ Feature parameter added to URL
- ✅ Secure console logging (only 10 chars)

### Credit Deduction

- ✅ Credits checked before feature access
- ✅ Credits deducted via context API
- ✅ Transaction logged for audit
- ✅ Balance refreshed after purchase

---

## 📝 Customization Options

### Adding New Features

```jsx
const features = [
  // ... existing features
  {
    id: 'new-feature',
    name: 'New Feature',
    description: 'Feature description',
    icon: YourIcon,
    cost: 75,
    color: 'purple', // or 'blue', 'indigo', 'emerald'
  },
];
```

### Changing Credit Costs

```jsx
{
  id: 'logo',
  cost: 50, // Change this value
  // ...
}
```

### Customizing Colors

```jsx
const getColorClasses = color => {
  const colors = {
    // Add your custom color scheme
    custom: {
      bg: 'bg-custom-50',
      border: 'border-custom-200',
      // ...
    },
  };
};
```

---

## ✅ Testing Checklist

### Feature Unlocking

- [ ] Locked features show lock overlay
- [ ] Unlocked features are clickable
- [ ] Credit costs displayed correctly
- [ ] Balance updates after purchase
- [ ] Features unlock after credit purchase

### Credit Deduction

- [ ] Credits deducted when using feature
- [ ] Transaction logged correctly
- [ ] Balance refreshes automatically
- [ ] Insufficient credits handled gracefully

### UI/UX

- [ ] Responsive on all screen sizes
- [ ] Hover effects work correctly
- [ ] Colors match design system
- [ ] Icons display correctly
- [ ] Text is readable

### Integration

- [ ] Athena AI opens with correct URL
- [ ] Feature parameter passed correctly
- [ ] Token encoding works
- [ ] Credit purchase modal opens
- [ ] Balance syncs with backend

---

## 🚀 Future Enhancements

Potential improvements:

- [ ] Feature usage analytics
- [ ] Credit history per feature
- [ ] Bulk unlock discounts
- [ ] Feature previews/demos
- [ ] Usage limits per feature
- [ ] Feature recommendations
- [ ] Credit bundles for features
- [ ] Feature favorites/bookmarks

---

## 📚 Summary

### What Changed

- ✅ Redesigned with clean, minimal UI
- ✅ Added credit-based unlocking system
- ✅ Four AI features (Logo, Image, Brandkit, Content)
- ✅ Lock/unlock states with visual feedback
- ✅ Integrated with credits context
- ✅ Credit purchase flow
- ✅ Responsive design

### What Stayed the Same

- ✅ Athena AI redirect functionality
- ✅ Token handling and security
- ✅ Console logging for debugging
- ✅ Component structure

### Result

**A clean, user-friendly credit system** that makes Athena AI features accessible and valuable for LMS users! 🎉
