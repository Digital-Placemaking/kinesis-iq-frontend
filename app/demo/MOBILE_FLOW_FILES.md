# Mobile Flow Files - What You Can Change

## 🎯 Your Task: Reskin Mobile Onboarding/Survey Flow

You're reskinning the **mobile user-facing flow** (NOT the admin dashboard). This document lists all files that are part of the mobile flow and which ones you should modify.

---

## 📱 Complete Mobile Flow

The mobile flow consists of these screens (in order):

1. **Landing Page** - Email collection (`/{slug}`)
2. **Coupons List** - Browse available coupons (`/{slug}/coupons`)
3. **Survey** - Answer questions before getting coupon (`/{slug}/coupons/{couponId}/survey`)
4. **Coupon Completion** - See coupon code (`/{slug}/coupons/{couponId}/completed`)
5. **Survey Completion** - Thank you page (`/{slug}/survey/completed`)

---

## ✅ Files You SHOULD Modify (Mobile Flow Only)

### **Priority 1: Core Mobile Flow Components**

#### 1. Landing Page (Onboarding Start)
- **`app/[slug]/components/TenantLanding.tsx`** ⭐ **MAIN TARGET**
  - Email collection form
  - Social login buttons (Google, Apple)
  - "Take Poll" button
  - This is your **primary reskin target**

- **`app/[slug]/components/ui/SocialLoginButton.tsx`**
  - Google/Apple login button styling
  - Can reskin button appearance

#### 2. Survey Components
- **`app/components/survey/SurveyContainer.tsx`**
  - Main survey wrapper
  - Navigation between questions
  - Submit button
  - Can modify layout, spacing, navigation UI

- **`app/components/survey/QuestionCard.tsx`**
  - Question display wrapper
  - Routes to different question input types
  - Can modify card styling, layout

- **`app/components/survey/SurveyProgress.tsx`**
  - Progress bar/indicator
  - Shows "Question X of Y"
  - Can reskin progress indicator

- **`app/components/survey/SurveyNavigation.tsx`**
  - Previous/Next buttons
  - Submit button
  - Can reskin button styles

#### 3. Question Input Components (Your Main Targets)

- **`app/components/survey/questions/QuestionRating.tsx`** ⭐ **EMOTION SELECTION**
  - Used for `sentiment` question type
  - Currently shows 1-5 rating buttons
  - **RESKIN THIS** to show emotion icons/buttons instead

- **`app/components/survey/questions/QuestionRadio.tsx`** ⭐ **PREFERENCE RANKING**
  - Used for `ranked_choice` question type
  - Currently shows radio buttons (single selection)
  - **ADD DRAG-AND-DROP** for ranking functionality

- **`app/components/survey/questions/QuestionInput.tsx`** ⭐ **TEXT INPUT**
  - Used for `open_text` question type
  - Text input/textarea
  - Can reskin input styling

- **`app/components/survey/questions/QuestionCheckbox.tsx`**
  - Used for `multiple_choice` question type
  - Can reskin checkbox styling

- **`app/components/survey/questions/QuestionYesNo.tsx`**
  - Used for `yes_no` question type
  - Can reskin button styling

- **Other question types** (less common, but can reskin if needed):
  - `QuestionLikert.tsx`
  - `QuestionNPS.tsx`
  - `QuestionNumeric.tsx`
  - `QuestionSlider.tsx`
  - `QuestionDate.tsx`
  - `QuestionTime.tsx`

#### 4. Coupons List
- **`app/[slug]/coupons/components/CouponsList.tsx`**
  - List of available coupons
  - Header with tenant logo
  - Can reskin layout, spacing

- **`app/[slug]/coupons/components/CouponCard.tsx`**
  - Individual coupon card
  - "Claim Coupon" button
  - Can reskin card design, button styling

#### 5. Completion Pages
- **`app/[slug]/coupons/[couponId]/completed/components/CouponCompletion.tsx`**
  - Shows coupon code after survey
  - Copy/download/wallet buttons
  - Can reskin completion screen

- **`app/[slug]/coupons/[couponId]/completed/components/CouponCodeDisplay.tsx`**
  - Displays the coupon code
  - Can reskin code display

- **`app/[slug]/survey/completed/components/SurveyCompletion.tsx`**
  - Thank you page after anonymous survey
  - Email opt-in form
  - Can reskin completion screen

#### 6. Shared UI Components (Used in Mobile Flow)
- **`app/components/ui/TenantLogo.tsx`**
  - Displays tenant logo or fallback
  - Used throughout mobile flow
  - Can modify logo display styling

- **`app/components/ui/Card.tsx`**
  - Reusable card component
  - Used in surveys, coupons
  - Can modify card styling

- **`app/components/ui/ActionButton.tsx`**
  - Reusable button component
  - Used throughout mobile flow
  - Can modify button styling

- **`app/components/ui/Spinner.tsx`**
  - Loading spinner
  - Can modify spinner design

- **`app/components/ui/Modal.tsx`**
  - Modal/dialog component
  - Can modify modal styling

- **`app/components/ui/InfoBox.tsx`**
  - Info message box
  - Can modify info box styling

- **`app/components/ui/SectionSeparator.tsx`**
  - "Or continue with email" separator
  - Can modify separator styling

- **`app/components/Footer.tsx`**
  - Global footer (appears on mobile pages)
  - Can modify footer styling

#### 7. Global Styling
- **`app/globals.css`** ⭐ **MAIN STYLING FILE**
  - CSS variables (colors)
  - Tailwind configuration
  - Global styles
  - **MODIFY THIS** for colors, spacing, animations

---

## ⚠️ Files You Should NOT Modify (For This Task)

### Server Components (Data Fetching)
These fetch data from Supabase. Don't modify unless you understand the data flow:
- `app/[slug]/page.tsx` - Fetches tenant data
- `app/[slug]/coupons/page.tsx` - Fetches coupons
- `app/[slug]/coupons/[couponId]/survey/page.tsx` - Fetches survey
- `app/[slug]/coupons/[couponId]/completed/page.tsx` - Fetches coupon data
- `app/[slug]/survey/page.tsx` - Fetches survey
- `app/[slug]/survey/completed/page.tsx` - Fetches tenant data

### Server Actions (Backend Logic)
These handle database operations. Don't modify:
- `app/actions/*.ts` - All server actions

### Admin Dashboard (Not Part of Mobile Flow)
These are for business owners, not mobile users:
- `app/[slug]/admin/**/*` - Entire admin folder
- `app/admin/**/*` - Global admin pages

### Other Pages (Not Mobile Flow)
- `app/page.tsx` - Homepage (not tenant-specific)
- `app/about-us/page.tsx` - About page
- `app/contact/page.tsx` - Contact page

### Library/Utility Files
- `lib/**/*` - Utility functions, types, Supabase clients
- `proxy.ts` - Middleware (routing logic)

---

## 📋 Summary: Files to Change

### **Must Modify (Your Main Targets):**
1. ✅ `app/[slug]/components/TenantLanding.tsx` - Landing page
2. ✅ `app/components/survey/questions/QuestionRating.tsx` - Emotion selection
3. ✅ `app/components/survey/questions/QuestionRadio.tsx` - Preference ranking
4. ✅ `app/components/survey/questions/QuestionInput.tsx` - Text input
5. ✅ `app/globals.css` - Colors, spacing, animations

### **Should Modify (Complete the Flow):**
6. ✅ `app/components/survey/SurveyContainer.tsx` - Survey wrapper
7. ✅ `app/components/survey/QuestionCard.tsx` - Question card
8. ✅ `app/components/survey/SurveyProgress.tsx` - Progress bar
9. ✅ `app/components/survey/SurveyNavigation.tsx` - Navigation buttons
10. ✅ `app/[slug]/coupons/components/CouponCard.tsx` - Coupon cards
11. ✅ `app/[slug]/coupons/[couponId]/completed/components/CouponCompletion.tsx` - Completion screen

### **Can Modify (Polish):**
12. ✅ `app/components/ui/*.tsx` - Shared UI components
13. ✅ `app/components/Footer.tsx` - Footer
14. ✅ Other question input components (if needed)

---

## 🎨 What Changes Affect What

### **Changes to These Files Affect ONLY Mobile Flow:**
- `app/[slug]/components/**/*` - Only tenant-facing pages
- `app/components/survey/**/*` - Only survey components (used in mobile flow)
- `app/[slug]/coupons/**/*` - Only coupon pages (mobile flow)

### **Changes to These Files Affect ENTIRE App:**
- `app/globals.css` - Global styles (affects admin too)
- `app/components/ui/*.tsx` - Shared components (used everywhere)
- `app/components/Footer.tsx` - Footer (appears everywhere)

**Recommendation**: For this task, focus on mobile flow files. If you change global styles, test that admin pages still look okay.

---

## 🚀 Quick Start

1. **View the demo**: Go to `http://localhost:3000/demo` to see all screens
2. **Start with**: `app/globals.css` for colors/spacing
3. **Then modify**: `TenantLanding.tsx` for landing page
4. **Then modify**: Question input components for survey
5. **Test**: Use the demo page to see changes instantly

---

## 📝 Notes

- All changes are in your `Zain` branch (safe to experiment)
- Demo page (`/demo`) shows all mobile flow screens with mock data
- Once you get Supabase credentials, you can test with real data at `/{slug}`
- Focus on mobile flow only - admin dashboard is separate

