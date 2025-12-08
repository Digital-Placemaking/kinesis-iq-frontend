# Demo Page - Mobile Flow Preview

## What This Is

This demo page (`/demo`) shows the **complete mobile onboarding and survey flow** using mock data. It's perfect for:

- ✅ Viewing all mobile screens without needing Supabase credentials
- ✅ Testing your UI/UX changes instantly
- ✅ Seeing how components look before getting real data

## How to Use

1. **Start the dev server**: `npm run dev`
2. **Visit**: `http://localhost:3000/demo`
3. **Switch views**: Use the buttons in the top-right to see all 5 screens:
   - Landing Page (email collection)
   - Coupons List
   - Survey (with all question types)
   - Coupon Completion
   - Survey Completion

## What You'll See

All screens use **mock/dummy data** so you can:
- See the UI structure
- Test styling changes
- Understand the flow
- Make design changes

**Note**: Form submissions won't work (no backend), but that's fine for UI work!

## Files in This Folder

- **`page.tsx`** - The demo page component (shows all screens)
- **`MOBILE_FLOW_FILES.md`** - List of files you should modify for mobile flow
- **`REQUEST_FOR_TEAM.md`** - What to ask your team for (Supabase credentials)

## Next Steps

1. View the demo to see the current UI
2. Read `MOBILE_FLOW_FILES.md` to know which files to change
3. Start making your design changes
4. Test changes instantly in the demo

Once you get Supabase credentials, you can test with real data at `/{tenant-slug}`.

