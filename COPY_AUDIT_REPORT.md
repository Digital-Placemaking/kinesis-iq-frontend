# Copy & Framing Audit Report

## Summary
This audit checks for consistent use of "Early Signals" and "Emerging Patterns" terminology, proper positioning of current features as inputs to future intelligence, and removal of language implying live trust scoring, risk trajectories, or unimplemented intelligence features.

---

## ✅ GOOD - Already Correctly Framed

### Landing Page (`app/page.tsx`)
- ✅ Line 1138: "early signals and emerging patterns"
- ✅ Line 865: "early signals and emerging patterns"
- ✅ Line 1390: "Early Signals & Reporting"
- ✅ Line 1399: "early signals and emerging patterns"

### How It Works Page (`app/how-it-works/page.tsx`)
- ✅ Line 163: "early signals and emerging patterns"
- ✅ Line 94: "Transform aggregated data into early signals"
- ✅ Line 255: "From data collection to early signals"
- ✅ Line 459: "early signals and emerging patterns"

### Demo/Reporting Page (`app/demo/reporting/page.tsx`)
- ✅ Line 2553-2554: "Early signals and emerging patterns identified from aggregated data • These inputs feed future intelligence layers"
- ✅ Line 2606: "Early Signals & Recommendations"
- ✅ Line 2610: "Early signals identified from aggregated data patterns • These inputs feed future intelligence layers"
- ✅ Line 2655: "Early signals and patterns derived from aggregated data • These inputs support future intelligence layers"

### About Page (`app/about-us/page.tsx`)
- ✅ Line 59: "early signals and emerging patterns"
- ✅ Line 77: "early signals and emerging patterns"
- ✅ Line 85-86: "early signals about sentiment, intent, behavior, and emerging patterns"

---

## ⚠️ ISSUES FOUND - Need Copy Fixes

### 1. Landing Page - "Trust" Signal (Too Strong)
**Location:** `app/page.tsx` line 1149
**Current:** "Our intelligent platform processes aggregated data to generate actionable signals about **trust**, sentiment, intent, behavior, and emerging trends."
**Issue:** "trust" could imply live trust scoring/assessment
**Fix:** Remove "trust" or replace with "engagement" or "community sentiment"
**Proposed:** "Our intelligent platform processes aggregated data to generate actionable signals about sentiment, intent, behavior, and emerging patterns."

### 2. Demo Page - "Analytics & Trends" (Inconsistent Terminology)
**Location:** `app/demo/reporting/page.tsx` line 2440
**Current:** "Analytics & Trends"
**Issue:** Should use "Emerging Patterns" instead of "Trends"
**Fix:** Change to "Analytics & Emerging Patterns"

### 3. Demo Page - "Performance Insights" (Inconsistent Terminology)
**Location:** `app/demo/reporting/page.tsx` line 2443
**Current:** "Engagement patterns and performance insights"
**Issue:** "insights" should be "signals" for consistency
**Fix:** Change to "Engagement patterns and performance signals"

### 4. Demo Page - "Predict Trends" (Too Strong)
**Location:** `app/demo/reporting/page.tsx` line 2778
**Current:** "Our platform uses probabilistic modeling and machine learning to identify patterns, **predict trends**, and generate actionable insights"
**Issue:** "predict trends" implies live predictive features; "insights" should be "signals"
**Fix:** Change to "identify emerging patterns" and "actionable signals"
**Proposed:** "Our platform uses probabilistic modeling and machine learning to identify patterns, detect emerging patterns, and generate actionable signals"

### 5. Demo Page - "Predictive Opportunity" Card Title (Potentially Too Strong)
**Location:** `app/demo/reporting/page.tsx` line 2696
**Current:** "Predictive Opportunity"
**Issue:** "Predictive" might imply live predictive features
**Fix:** Change to "Emerging Opportunity" or "Forward-Looking Opportunity"
**Proposed:** "Forward-Looking Opportunity"

### 6. Footer - "Actionable Insights" (Inconsistent Terminology)
**Location:** `app/components/Footer.tsx` line 102
**Current:** "Ready to transform real-world interactions into actionable insights?"
**Issue:** "insights" should be "signals" for consistency
**Fix:** Change to "actionable signals"

### 7. How It Works - "Predictive Insights" Title (Potentially Too Strong)
**Location:** `app/how-it-works/page.tsx` line 46
**Current:** Title: "Predictive Insights"
**Issue:** "Predictive" might imply live predictive features, but description is appropriately framed
**Fix:** Consider "Early Predictive Signals" or keep if description properly frames it
**Note:** Description says "See patterns before they fully emerge" which is good framing

### 8. Landing Page - "Predictive Insights" Feature Card (Potentially Too Strong)
**Location:** `app/page.tsx` line 1190, 1310
**Current:** Title: "Predictive Insights"
**Issue:** Same as above
**Fix:** Consider "Early Predictive Signals" or keep if description properly frames it

---

## 📋 RECOMMENDED FIXES (Copy-Only, No UI Changes)

### Priority 1 - Remove Strong Language
1. **Remove "trust" from landing page** - Replace with "engagement" or remove entirely
2. **Change "predict trends" to "identify emerging patterns"** in demo page
3. **Change "Predictive Opportunity" to "Forward-Looking Opportunity"** in demo page

### Priority 2 - Consistent Terminology
4. **"Analytics & Trends" → "Analytics & Emerging Patterns"** in demo page
5. **"performance insights" → "performance signals"** in demo page
6. **"actionable insights" → "actionable signals"** in footer

### Priority 3 - Consider Reframing (Optional)
7. **"Predictive Insights" titles** - Consider "Early Predictive Signals" but current framing may be acceptable if descriptions properly position as future inputs

---

## ✅ VERIFICATION CHECKLIST

- [x] "Early Signals" used consistently (not "Insights" where signals should be)
- [x] "Emerging Patterns" used consistently (not "Trends" where patterns should be)
- [x] Current dashboards positioned as "inputs to future intelligence layers"
- [ ] No mention of "trust scoring" or live trust assessment
- [ ] No mention of "risk trajectories" or risk assessment
- [ ] No claims about live predictive intelligence features
- [x] Language primes future capabilities without promising them

---

## Notes
- Most copy is well-framed with "Early Signals" and "Emerging Patterns"
- Main issues are minor terminology inconsistencies ("insights" vs "signals", "trends" vs "patterns")
- One potentially strong claim: "trust" signals (should be removed or reframed)
- "Predictive" terminology is used but descriptions properly frame as future-oriented

