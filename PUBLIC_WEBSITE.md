# Public-Facing Website Documentation

Documentation for the public-facing marketing website and demo dashboard pages.

## Overview

The public website consists of marketing pages and a demo dashboard that showcase KinesisIQ to stakeholders, governments, and businesses. These pages are separate from the multi-tenant application system and focus on clarity, accessibility, and demonstrating value.

## Structure Overview

### Page Hierarchy

```
app/
├── page.tsx                    # Landing page (homepage - orchestrator, ~72 lines)
├── components/
│   ├── landing/                # Landing page components
│   │   ├── HeroSection.tsx
│   │   ├── DetailsSection.tsx
│   │   ├── PlatformDescriptionSection.tsx
│   │   ├── TaglineSection.tsx
│   │   ├── HowItWorksPreviewSection.tsx
│   │   ├── ReportingSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── RotatingCenterMessage.tsx
│   │   ├── ScrollAnimation.tsx
│   │   └── constants.ts
│   ├── Navbar.tsx              # Global navigation
│   ├── Footer.tsx              # Site-wide footer
│   └── SequentialNetworkVisual.tsx
├── how-it-works/
│   └── page.tsx                # Platform explanation page
├── demo/
│   └── reporting/
│       ├── page.tsx            # Demo dashboard (main orchestrator)
│       ├── types.ts            # TypeScript type definitions
│       ├── mock-data.ts        # Mock data for demo
│       └── components/         # Demo-specific components
│           ├── KPICard.tsx
│           ├── FunnelChart.tsx
│           ├── SentimentDistribution.tsx
│           ├── LocationSummary.tsx
│           ├── TimeSeriesChart.tsx
│           ├── SignalCard.tsx
│           ├── SignalsCarousel.tsx
│           ├── InsightCard.tsx
│           ├── InsightsCarousel.tsx
│           ├── LearningCard.tsx
│           └── FeedbackCarousel.tsx
├── about-us/
│   └── page.tsx                # About page
└── contact/
    └── page.tsx                # Contact form page
```

### Component Organization

The landing page (`app/page.tsx`) has been refactored into modular components for maintainability:
- Main page orchestrator: ~72 lines (down from 1013 lines)
- Each section is a self-contained component in `app/components/landing/`
- Components follow consistent patterns and naming conventions
- All landing page data (quotes) is centralized in `constants.ts`

### Component Organization

- **Page Components**: Each page (`page.tsx`) orchestrates layout and imports necessary components
- **Demo Components**: All demo dashboard components are in `app/demo/reporting/components/` for modularity
- **Shared Components**: Reusable components used across multiple pages are in `app/components/`
- **Base UI**: shadcn/ui components in `components/ui/` provide foundational building blocks

## Layout Structure

### Root Layout (`app/layout.tsx`)

The root layout wraps all pages in the application and provides:

- **Font Configuration**: Geist Sans and Geist Mono fonts from Google Fonts, configured as CSS variables (`--font-geist-sans`, `--font-geist-mono`)
- **Metadata**: Site-wide metadata including title template, description, and favicon configuration
- **Dark Mode**: Inline script that adds `dark` class to `<html>` element on page load (prevents flash of light mode)
- **Global Styles**: Imports `globals.css` which contains Tailwind directives and CSS variables
- **Analytics**: Vercel Analytics component for performance and user behavior tracking
- **HTML Structure**: Provides `<html>` and `<body>` tags with proper lang attribute and hydration suppression
- **Public Layout Wrapper**: Uses `PublicLayout` component to conditionally render Navbar and Footer

**Key Features:**
- Dark mode is enforced by default via inline script (no flash)
- Font variables are available throughout the app via Tailwind
- All pages inherit this layout structure automatically
- Metadata template allows page-specific titles: `"%s | Digital Placemaking"`
- Navbar and Footer are automatically included for public pages (DRY principle)

### Public Layout (`app/components/PublicLayout.tsx`)

The `PublicLayout` component conditionally renders Navbar and Footer based on the current route:

- **Automatically includes** Navbar and Footer for all public-facing pages:
  - Landing page (`/`)
  - How It Works (`/how-it-works`)
  - About Us (`/about-us`)
  - Contact (`/contact`)
  - Demo pages (`/demo/*`)
  - 404 page (`/not-found`)

- **Automatically excludes** Navbar and Footer for:
  - Admin routes (`/[slug]/admin/*`)
  - Global admin routes (`/admin/*`)
  - Tenant-specific routes (which have their own navigation)

This ensures consistent navigation across all public pages while allowing tenant and admin pages to have their own navigation structure.

## Pages

- **`app/page.tsx`** - Landing page with hero section, value proposition, and testimonials
- **`app/how-it-works/page.tsx`** - Platform explanation and workflow visualization
- **`app/demo/reporting/page.tsx`** - Interactive demo dashboard with mock data
- **`app/about-us/page.tsx`** - About page with company information
- **`app/contact/page.tsx`** - Contact form

## Components

### Shared Components
- **`app/components/PublicLayout.tsx`** - Conditional wrapper that renders Navbar/Footer for public pages
- **`app/components/Navbar.tsx`** - Global navigation with hide-on-scroll behavior (rendered by PublicLayout)
- **`app/components/Footer.tsx`** - Site-wide footer (rendered by PublicLayout)
- **`app/components/SequentialNetworkVisual.tsx`** - Animated network visualization for landing page

### Landing Page Components
- **`app/components/landing/HeroSection.tsx`** - Hero section with branding, headline, CTAs, and network visualization
- **`app/components/landing/DetailsSection.tsx`** - Main content section with scroll-responsive effects
- **`app/components/landing/PlatformDescriptionSection.tsx`** - "What is KinesisIQ?" section with feature cards
- **`app/components/landing/TaglineSection.tsx`** - Platform tagline and value proposition
- **`app/components/landing/HowItWorksPreviewSection.tsx`** - Preview of platform capabilities
- **`app/components/landing/ReportingSection.tsx`** - Early Signals & Reporting section
- **`app/components/landing/TestimonialsSection.tsx`** - Scrolling testimonials/quotes
- **`app/components/landing/LoadingScreen.tsx`** - Full-screen loading animation
- **`app/components/landing/RotatingCenterMessage.tsx`** - Rotating center messages in network visual
- **`app/components/landing/ScrollAnimation.tsx`** - Scroll-triggered fade-up animation utility
- **`app/components/landing/constants.ts`** - Landing page constants and data (quotes)

### Demo Components
- **`app/demo/reporting/components/`** - Demo-specific components (charts, cards, carousels)

### Base UI Components
- **`components/ui/`** - Base UI components (shadcn/ui)

## Styling & Theming

### Global Styles

- **`app/globals.css`** - Global styles, Tailwind directives, and CSS variables
- Dark theme is the default base (`bg-zinc-950`, `text-white`)

### Brand Colors

Official accent colors are used sparingly:

- **Blue**: `#23137f` (navy)
- **Orange**: `#f16609` (primary accent)

These colors appear in:
- Navigation active states
- CTA buttons
- Network visualization nodes and lines
- Background gradient orbs (subtle, low opacity)

### Color Application

- Base: Black/charcoal (`zinc-950`, `zinc-900`)
- Text: White with zinc grays for hierarchy
- Accents: Orange and navy used intentionally for emphasis
- Gradients: Subtle radial gradients for depth, not overwhelming

To adjust colors or spacing:
1. Update Tailwind classes in component files
2. Modify CSS variables in `globals.css` if needed
3. Maintain contrast ratios for accessibility

## Responsive & Mobile Behavior

### General Pages

Landing, How It Works, About, and Contact pages are fully responsive. Content adapts to screen size while maintaining the same information hierarchy.

### Demo/Reporting Pages

The demo dashboard uses **adaptive behavior** rather than full parity:

- **Desktop**: Full analytics experience with all charts and visualizations
- **Mobile**: Curated preview with reduced information density
  - Single-column layout
  - Reduced chart heights
  - Hidden or deferred secondary visualizations
  - Stacked KPI cards

This approach prioritizes clarity over visual density on mobile. Desktop remains the primary experience.

### Responsive Patterns

- Tailwind responsive utilities (`sm:`, `md:`, `lg:`)
- Conditional rendering based on screen size where appropriate
- Fixed heights and min-heights prevent layout shifts during animations

## Copy & Framing Guidelines

### Terminology

The site uses specific language to position current features appropriately:

- **"Early Signals"** - Current data points and metrics (not "Insights" or "Analytics")
- **"Emerging Patterns"** - Trends and patterns in data (not "Predictions" or "Forecasts")
- **"Community Intelligence Dashboard"** - Current demo page title
- **"Data Acquisition & Reporting"** - Phase description, not a page title

### Positioning

Current UI elements represent:
- Inputs to future intelligence layers
- Early signals feeding broader systems
- Foundation for predictive capabilities

**Not implemented:**
- Trust scoring systems
- Risk trajectory calculations
- Live predictive intelligence engines
- Real-time trust/risk assessments

### Consistency

When adding new copy:
- Use "signals" instead of "insights"
- Use "emerging patterns" instead of "trends" or "predictions"
- Avoid language implying live intelligence features
- Frame current features as inputs to future capabilities

## Safe vs Stable Areas

### Safe to Iterate

- **Copy and messaging** - Update text, headlines, descriptions
- **Visual styling** - Adjust colors, spacing, animations
- **Component layouts** - Rearrange sections, modify card designs
- **Demo mock data** - Update `app/demo/reporting/mock-data.ts`
- **Landing page sections** - Add, remove, or modify hero content

### Stable Areas

- **Core layout structure** - `app/layout.tsx`, navigation patterns
- **Routing structure** - Page routes and URL patterns
- **Component interfaces** - Props and type definitions
- **Demo data structure** - Type definitions in `app/demo/reporting/types.ts`

When modifying stable areas, ensure:
- Backward compatibility with existing components
- Type safety is maintained
- Navigation patterns remain consistent

## Animation & Performance

### Animation Library

- **Framer Motion** - Used for scroll-triggered animations, transitions, and interactive elements
- Animations are intentional and restrained
- Performance optimized with `willChange` hints where appropriate

### Performance Considerations

- Images use Next.js `Image` component for optimization
- Animations use GPU-accelerated properties
- Mock data is lightweight and does not impact performance

## Setup

No environment variables are required for the public website and demo pages. The demo uses mock data and does not require backend connections.

To run locally:

```bash
npm install
npm run dev
```

Access at `http://localhost:3000`
