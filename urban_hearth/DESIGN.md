---
name: Urban Hearth
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#0051d5'
  on-tertiary: '#ffffff'
  tertiary-container: '#316bf3'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system serves a modern, urban room and PG (paying guest) rental platform tailored toward young working professionals, relocating students, and shared-living seekers. The aesthetic bridges the energetic warmth of finding a welcoming home with the rigorous operational trust demanded by rental housing platforms.

### Aesthetic Principles
- **Modern Softness:** Balanced geometry with accessible touch targets, soft structural corners, and clear separation of concerns.
- **Trust-First Verification:** Heavy emphasis on authenticated cues, landlord screening signals, transparent pricing breakdowns, and crisp, unambiguous statuses.
- **Tactile Utility:** Micro-elevations on actionable touchpoints like sticky rent buttons and tab segments, paired with crisp low-contrast borders for scan-heavy property catalogs.

## Colors

The palette establishes an immediate sensation of fresh security balanced by welcoming warmth:
- **Primary (`#0D9488` Teal 600):** Anchors primary calls to action, brand logos, active tab indicators, and verified badges. Radiates hygiene, freshness, and stability.
- **Secondary (`#D97706` Amber 600):** Represents warmth, hearth, and urgency tags (such as "Fast Filling", deposit guarantees, or "Zero Brokerage" spotlights). Provides energetic contrast without feeling alarming.
- **Tertiary (`#2563EB` Blue 600):** Utilized for structural informational cues, map pin clusters, and lease agreement verification steps.
- **Neutral Palette (`#0F172A` Slate 900 base):** Built with slate-infused cool grays. Surfaces use `#F8FAFC` for background canvas, `#FFFFFF` for cards in light mode, and `#E2E8F0` for hairline borders.
- **Dark Mode Readiness:** Cards flip to `#1E293B`, root surface to `#0F172A`, borders to `#334155`, while primary accents shift to `#14B8A6` (Teal 500) and secondary to `#F59E0B` (Amber 500) to maintain strict WCAG AA 4.5:1 text-contrast ratios.

## Typography

Typographic scale is powered exclusively by **Plus Jakarta Sans**, providing friendly humanist geometry with clean terminal forms suited for property metrics, floor plans, and monetary figures.

- **Numerics & Rent Prices:** Always set with `font-weight: 700` or `800` to give monetary pricing immediate optical priority during feed browsing.
- **Micro-copy & Status Badges:** Set in `label-sm` with tight tracking (`0.02em`) and uppercase transformation where badge distinction is required.
- **Hierarchy Transitions:** Large marketing displays scale down on mobile breakpoints to ensure titles like "Co-living PG in Indiranagar" never wrap past three lines.

## Layout & Spacing

A 12-column responsive fluid grid governs desktop displays (max-width `1280px`), transitioning to an 8-column layout on tablet devices (768px - 1024px) and a single/double-column card layout on mobile screen viewports (<768px).

### Layout Rules
- **Desktop Listing Splits:** Uses a split layout of 7 columns for listing streams and 5 columns for the interactive sticky map/filter panel.
- **Mobile Edge Boundaries:** Margins drop to `1rem` on mobile devices with an obligatory `80px` bottom safe-area offset to prevent content occlusion by the floating sticky CTA bar.
- **Grid Alignment:** Grid cards maintain consistent vertical rhythm via strict adherence to the `space-md` (16px) and `space-lg` (24px) container paddings.

## Elevation & Depth

Visual hierarchy uses a hybrid of low-contrast ghost borders and layered ambient drop-shadows with subtle teal/slate undertones.

- **Level 0 (Flat Ground):** `#F8FAFC` base page background; 0px elevation.
- **Level 1 (Cards & Inputs):** 1px solid border (`#E2E8F0` / dark `#334155`) paired with `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Hovered Cards & Dropdowns):** `box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`.
- **Level 3 (Floating Mobile Sticky Bar & Drawers):** `box-shadow: 0 -4px 20px -2px rgba(15, 23, 42, 0.12)`. Supported by backdrop blur `backdrop-filter: blur(12px)` and 90% opacity surface coloring.

## Shapes

The design system implements `roundedness: 2` (base radius of `0.5rem` / 8px).
- **Cards and Modals:** `rounded-lg` (`1rem` / 16px) to soften the physical footprint of multiple nested photos and information blocks.
- **Buttons, Text Inputs, and Dropdown Triggers:** Base radius of `0.5rem` (8px).
- **Pills & Tag Badges:** Overridden to full pill shape (`9999px`) for 'Verified', 'Zero Brokerage', and amenity chips to distinguish informational tags from clickable structural containers.
- **Bottom Sheet Drawer Panels:** Top-left and top-right radii set to `1.5rem` (`24px`).

## Components

### Property Cards
- Contained within `rounded-lg` surfaces with an image carousel header containing aspect ratio `16:9` or `4:3`.
- Overlaid pill tags positioned top-left of image: Verified (Teal fill, white text), Zero Brokerage (Amber fill, slate text).
- Heart-shaped save toggle positioned top-right with backdrop-blur circular button.
- Bottom details include monthly rent highlighted in `headline-sm`, room configuration (e.g., "Private Room", "Double Sharing"), and neighborhood location.

### Badges & Filter Chips
- **Verified Badge:** `#CCFBF1` background with `#0F766E` text and a checkmark icon.
- **Zero Brokerage Badge:** `#FEF3C7` background with `#B45309` text.
- **Amenity Icon Chips (e.g., AC, WiFi, Food Included):** Neutral surface (`#F1F5F9`), `rounded-full`, displaying an outline SVG icon followed by `label-md` text. Active state transitions to `#0D9488` text with `#CCFBF1` surface.

### Buttons & Sticky Action Bars
- **Primary CTA:** Teal background (`#0D9488`), white text, bold tracking, subtle focus ring.
- **Floating Sticky Action Bar (Mobile):** Fixed to screen bottom, dual layout: Left side contains pricing per month and deposit terms in compact vertical arrangement; right side houses the primary "Schedule Visit" or "Book Now" CTA button.
- **Secondary CTA:** Ghost style with 1px slate border and primary hover state.

### Drawer Bottom Sheets & Tabbed Views
- **Bottom Sheets:** Modal presentation on mobile viewports for filters, image galleries, and booking date pickers. Includes a centered drag handle (`36px x 4px`, neutral gray).
- **Tabbed Views:** Underline style for page-level navigation (Overview, Amenities, House Rules, Location) with an animated 2px teal indicator line; segmented pill style for search filters (All, Single Room, Shared Room, Full Flat).

### Form Inputs & Selectors
- Form inputs feature clear inner padding (`12px 16px`), explicit placeholder text, and outline borders shifting to teal on focus with a 3px soft-glow focus ring (`rgba(13, 148, 136, 0.2)`).