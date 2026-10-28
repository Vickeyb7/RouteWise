---
name: Precision Mobility
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0daee'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff3ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dfe9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#434655'
  inverse-surface: '#273140'
  inverse-on-surface: '#ebf1ff'
  outline: '#747687'
  outline-variant: '#c4c5d8'
  surface-tint: '#1b4de7'
  primary: '#0040da'
  on-primary: '#ffffff'
  primary-container: '#315cf5'
  on-primary-container: '#ecedff'
  inverse-primary: '#b8c4ff'
  secondary: '#505f78'
  on-secondary: '#ffffff'
  secondary-container: '#d0e0fe'
  on-secondary-container: '#54637c'
  tertiary: '#005e58'
  on-tertiary: '#ffffff'
  tertiary-container: '#007972'
  on-tertiary-container: '#9ffff5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001355'
  on-primary-fixed-variant: '#0036bc'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#b7c7e4'
  on-secondary-fixed: '#0b1c32'
  on-secondary-fixed-variant: '#38475f'
  tertiary-fixed: '#7cf6eb'
  tertiary-fixed-dim: '#5dd9ce'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504b'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  title-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  numeric-data-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  numeric-data-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-tablet: 1rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-tablet: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system merges the mathematical rigor of contemporary fintech with the effortless, dynamic orchestration of high-end travel tech. It is built for discerning travelers, corporate commuters, and data-minded road-trippers who expect absolute transparency, cost breakdown integrity, and multi-modal route optimization.

### Aesthetic Persona
- **Architectural & Calculated:** Information surfaces mirror modern balance sheets and developer telemetry dashboards—clean visual divisions, high-density tabular alignments, and zero ornamental noise.
- **Dynamic Movement:** Accent tones and micro-interactions guide forward momentum, referencing navigation waypoints, highway interchanges, and real-time cost delta indices.
- **Restraint & Trust:** A predominantly cool, airy slate-white foundation anchored by deep midnight navy, projecting institutional stability, precision calculations, and frictionless ergonomics.

## Colors

The palette balances utility-grade contrast with specialized semantic accents engineered for computational comparison engines:

- **Primary (`#315CF5`):** The action driver. Used for active navigation paths, primary CTAs, active route states, and metric selection indicators.
- **Secondary (`#14243A`):** Deep Midnight Navy. Anchors top-level chrome, major navigational sidebars, headers, and core brand milestones.
- **Tertiary / Accent (`#13A89E`):** Teal Accent. Denotes optimal cost savings, fuel efficiency gains, EV charging landmarks, and value metrics.
- **Neutral Surface & Ink:**
  - Canvas Background: `#F6F8FC`
  - Container / Card Surface: `#FFFFFF`
  - Body Text: `#182230`
  - Muted Label / Supporting Ink: `#667085`
  - Structural Borders: `#E4E9F0`
- **Functional Semantics:**
  - Positive / Cost Saved: `#16845B`
  - Warning / Toll / Surge: `#B7791F`
  - Alert / Disruption: `#C43D4B`

Ensure currency values, price differences, and comparative metric ribbons maintain a minimum contrast ratio of 4.5:1 against the `#FFFFFF` and `#F6F8FC` surfaces.

## Typography

Typography prioritizes extreme legibility across deep data tables, route comparison cards, and analytical widgets.

- **Engineered Numerals:** Enable `font-feature-settings: "tnum" 1, "cv05" 1, "zero" 1` across all cost displays, trip distances, duration splits, and currency symbols (`₹ INR`). This ensures zero jitter during dynamic updates and absolute column vertical alignment.
- **Hierarchy Formulation:** Titles and headers feature tight tracking (`-0.01em` to `-0.03em`) to mimic executive briefing decks, while micro labels (`label-sm`) leverage slight positive letter-spacing and uppercase transformations for status tags and toll category indicators.
- **Line Heights:** Generous line heights on body copy preserve reading comfort during comprehensive itinerary perusals, contrasting with compact tabular line heights optimized for multi-metric comparison matrices.

## Layout & Spacing

The layout is anchored in an analytical, responsive 12-column layout designed to manage side-by-side route comparisons, interactive geospatial views, and breakdown drawers without visual crowding.

### Breakpoints & Fluidity
- **Desktop (≥ 1280px):** 12-column system, max container width `1440px`. Split pane layout: 4 columns for itinerary inputs/cost metrics filters, 8 columns for multi-mode route visualizer and comparison matrix. Outer margins fixed at `2rem` (`32px`), gutters at `1.25rem` (`20px`).
- **Tablet (768px – 1279px):** 8-column layout. Adaptive collapse moves configuration toolbars into a collapsible top bar or persistent sticky header; map and comparisons stack into high-efficiency tabbed groups. Outer margins scale to `1.5rem` (`24px`), gutters to `1rem` (`16px`).
- **Mobile (< 768px):** 4-column layout. Pure single-column flow with full-width comparison cards, bottom sticky metric tray for quick mode switches, and drawer-based breakdown inspectors. Outer margins sit at `1rem` (`16px`), gutters at `0.75rem` (`12px`).

### Spacing Rules
Internal padding adheres to an absolute 4px/8px modular rhythm. Use `space-sm` (`8px`) for tight metric groupings within widgets, `space-md` (`16px`) for primary component inner paddings, and `space-xl` (`40px`) to delineate distinct travel modes or macro calculation sections.

## Elevation & Depth

Visual hierarchy uses a refined blend of **crisp micro-outlines** and **ambient low-opacity shadows** to emulate high-end financial consoles (Stripe/Linear):

- **Structural Canvas:** The base canvas (`#F6F8FC`) provides subtle warmth. High-order data widgets, comparison cards, and map overlays occupy pure white cards (`#FFFFFF`) with uniform 1px micro-borders (`#E4E9F0`).
- **Layering & Depth Levels:**
  - *Base Surface (Cards, Unselected Routes):* Zero shadow, framed purely by `1px solid #E4E9F0`.
  - *Resting Elevators (Active Cards, Floating Search Bars):* Shadow configuration: `0px 1px 3px rgba(20, 36, 58, 0.04), 0px 4px 12px rgba(20, 36, 58, 0.03)`.
  - *Floating Interactive Overlays (Route Tooltips, Popovers, Segment Modals):* Shadow configuration: `0px 12px 32px -4px rgba(20, 36, 58, 0.08), 0px 4px 8px -2px rgba(20, 36, 58, 0.03)`.
- **Selected & Optimized Focus:** Instead of aggressive elevation hops, selected trip configurations reinforce depth via a 1.5px border highlight using Primary Blue (`#315CF5`) accompanied by an ambient 4px perimeter ring at `12%` opacity (`rgba(49, 92, 245, 0.12)`).

## Shapes

The design system employs a calibrated curvature profile (`Level 2: Rounded`) that softens data-dense interfaces while retaining industrial precision.

- **Default Form Factors (`roundedness: 2` = 0.5rem / 8px):** Applied to core control surfaces including form inputs, segmented control segments, dropdown triggers, and individual comparison table row items.
- **Card & Surface Enclosures (`rounded-lg` = 1rem / 16px):** Outer wrappers for multi-modal travel widgets, route summary cards, and interactive cost breakdown tables.
- **Floating Command Sheets & Dialogs (`rounded-xl` = 1.5rem / 24px):** Bottom drawers on mobile, modal pricing inspector dialogs, and route filter sheets.
- **Analytical Indicators & Badges:** Micro tags (e.g., "Cheapest", "EV Friendly", "Fastest") utilize pill contours (`9999px`) to immediately distinguish categorical statuses from rectangular functional inputs.

## Components

### Buttons & Interactive Controls
- **Primary Action:** Solid `#315CF5` background, `#FFFFFF` text, 0.5rem radius, height `40px` (desktop) / `44px` (mobile). Hover state darkens to `#2649D0` with subtle elevation `0px 2px 6px rgba(49, 92, 245, 0.25)`.
- **Secondary Action:** Transparent background with `1px solid #E4E9F0`, text `#182230`. Hover produces `#FFFFFF` surface with border `#14243A`.
- **Cost Difference Highlight Button:** Muted teal tint (`rgba(19, 168, 158, 0.10)`) with `#13A89E` text for low-priority suggestions and alternate transit toggles.

### Inputs & Route Segment Fields
- Background `#FFFFFF`, border `1px solid #E4E9F0`, height `44px`, text `#182230`, placeholder `#667085`.
- Active focus state: border `#315CF5`, box shadow `0 0 0 3px rgba(49, 92, 245, 0.12)`.
- Multi-waypoint connectors: 2px dashed vertical guides linking Origin, Waypoint, and Destination pins using `#E4E9F0`.

### Cards & Comparison Panels
- White base (`#FFFFFF`) with 1px border (`#E4E9F0`) and `16px` border-radius.
- Cards maintain distinct internal header, metric-grid, and breakdown sections demarcated by `1px solid #F6F8FC` dividing lines.
- Hoverable trip cards produce a hairline border transition to `#315CF5` at 50% opacity.

### Comparison Badges & Status Chips
- Height `24px`, font `label-sm`, full pill radius (`9999px`), horizontal padding `8px`.
- *Best Value:* Background `rgba(19, 168, 158, 0.12)`, text `#13A89E`.
- *Toll Heavy / Surcharged:* Background `rgba(183, 121, 31, 0.12)`, text `#B7791F`.
- *Optimal Route:* Background `rgba(49, 92, 245, 0.12)`, text `#315CF5`.

### Checkboxes & Radio Controls
- Size `18px`, border `1.5px solid #E4E9F0`, radius `4px` (checkbox) or `50%` (radio).
- Checked state fills `#315CF5` with crisp white inner glyphs; focus states project the standard primary ambient halo.

### Specialized Travel Widgets
- **Multi-Modal Metric Bar:** Compact visual progress segments illustrating trip splits (e.g., Expressway Tolls vs. Fuel/EV vs. Ferry fees) using proportionate horizontal bars colored in `#315CF5`, `#13A89E`, and `#B7791F`.
- **Tabular Currency Delta Display:** Side-by-side fare indicators rendering currency symbols (`₹`) in muted text, integers in `numeric-data-md` with `tnum` font features, and difference metrics (`+ ₹420` / `- ₹180`) highlighted in semantic error or success tones.