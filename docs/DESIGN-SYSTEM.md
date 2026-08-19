# AI-Recruit360 Design System

## Overview
AI-Recruit360 is an enterprise-grade AI-powered recruitment intelligence platform. The visual identity follows a dark-first, precise, futuristic, and minimal design philosophy:

> **"Futuristic through precision, not decoration."**

---

## 🎨 Color System (Dark-First)

Centralized design tokens for colors ensure consistent visual hierarchy without unnecessary bright neon or decorative gradients.

### Surface & Background Tokens
- **Primary Background**: `#08090B` – Root app backdrop
- **Secondary Background**: `#0D0F12` – Sidebar and top header backgrounds
- **Surface**: `#12151A` – Standard cards and container elements
- **Elevated Surface**: `#171B21` – Modals, dropdown menus, and elevated cards
- **Border**: `#242932` – Standard container and structural borders
- **Subtle Border**: `#1C2027` – Table row dividers and inner section borders

### Typography Colors
- **Primary Text**: `#F5F7FA` – Headings, primary labels, and high-contrast text
- **Secondary Text**: `#A7AFBC` – Subtitles, body copy, and secondary meta labels
- **Muted Text**: `#68717E` – Form placeholders, inactive items, and micro-copy

### AI Accent Palette (Cyan Precision)
- **Primary AI Accent**: `#39D9FF` – Primary AI badges, focus rings, active states, active tab indicators
- **Bright AI Accent**: `#63E3FF` – Hover states for AI buttons and active highlights
- **Deep AI Accent**: `#0B8FB3` – Subtle borders, gradients, and low-light accents

### Semantic Status Tokens
- **Success**: `#35D07F` – Verified candidate match, passing scores, online status
- **Warning**: `#F5B942` – Pending reviews, warning badges, manual check flags
- **Danger**: `#FF5C67` – High risk scorecards, error states, destructive actions
- **Info**: `#6EA8FF` – System notifications and informational badges

---

## 🔤 Typography & Scale

The font family setup leverages `Inter` for primary UI elements, `Geist` for display headings, and `Geist Mono` for metrics and code.

### Font Scale & Hierarchy
- **Display**: 48px – 64px (`font-display font-bold`)
- **H1**: 36px – 44px (`text-[2rem]` to `text-[2.5rem]`)
- **H2**: 28px – 32px (`text-xl` to `text-2xl`)
- **H3**: 20px – 24px (`text-base` to `text-lg font-semibold`)
- **Body**: 14px – 16px (`text-sm` or `text-base`)
- **Small**: 12px – 13px (`text-xs`)
- **Micro**: 10px – 11px (`text-[10px]` or `text-[11px] font-semibold uppercase`)

### Font Weights
- `400` – Regular body copy
- `500` – Medium interactive labels and buttons
- `600` – Semibold section titles and badges
- `700` – Bold headings

---

## 📐 Spacing & Grid System

Consistent 8px rhythm eliminates arbitrary spacing across components:
- `8px` (`sm`) – Gap between micro-elements and badge padding
- `16px` (`md`) – Standard component padding and card inner space
- `24px` (`lg`) – Section grid gaps and container padding
- `32px` (`xl`) – Page header margin and large layout section gaps
- `48px` (`2xl`) – Major component section breaks
- `64px` (`3xl`) – Empty state and feature showcase padding

---

## 🔲 Border Radius

Restrained enterprise-style rounding avoids over-rounded consumer styling:
- `6px` (`sm`) – Buttons, inputs, small tags, tooltips
- `8px` (`md`) – Cards, selects, tab triggers, dialog containers
- `12px` (`lg`) – Elevated modal cards and floating containers
- `9999px` (`full`) – Exclusively for badges, avatars, and status pills

---

## 🧩 Component Primitives

The core UI component foundation (`frontend/components/ui/`) contains:
- **Button**: `primary`, `ai`, `secondary`, `outline`, `ghost`, `danger`, `link`.
- **Input & Textarea**: Dark surface background (`#12151A`), cyan focus ring (`#39D9FF`), clean placeholder contrast.
- **Select**: Dropdown select control with custom SVG indicator.
- **Badge**: Status indicators with background opacity and subtle borders.
- **Card**: Modular card layout with `elevated` background option (`#171B21`).
- **Dialog**: Accessible modal dialog primitive with backdrop blur and Escape listener.
- **Tooltip**: Hover tooltip primitive for AI confidence scores and metrics.
- **Tabs**: Tab switcher with active cyan border highlights.
- **Avatar**: Initials fallback & avatar image with status pill.
- **Skeleton & Progress**: Pulsing skeleton loaders and gradient AI progress bars.
- **Dropdown**: Contextual dropdown menus with items, headers, and dividers.
- **Table**: Data table foundation with clean header styling and row hover states.

---

## 📐 Layout Primitives

The layout foundation (`frontend/components/layout/`) contains:
- **ApplicationShell**: Responsive wrapper with desktop sidebar & mobile drawer.
- **Sidebar**: Sticky collapsible navigation sidebar.
- **TopBar**: Header top bar with search, status indicators, and profile menu.
- **PageHeader**: Standard title, badge, description, and action button header.
- **Section**: Section title, description, and header action row container.
- **EmptyState**: Clean placeholder for empty queries and collections.
- **LoadingState**: Spinner, AI pulse, and skeleton loading views.
- **ErrorState**: Accessible error alert box with retry button.

---

## ⚡ Motion Philosophy

Purposeful micro-interactions enhance feedback without distracting:
- **Micro Interactions**: `150ms cubic-bezier(0.4, 0, 0.2, 1)`
- **Component Transitions**: `250ms cubic-bezier(0.4, 0, 0.2, 1)`
- **Page Entrance Animations**: `300ms ease-out`
- **Restrictions**: No persistent floating elements, no particle effects.

---

## 📱 Responsiveness

Mobile-first responsive design supporting:
- Mobile (`< 640px`) – Collapsible mobile drawer sidebar
- Tablet (`640px - 1024px`) – Compact grid layouts
- Desktop (`1024px - 1440px`) – Standard multi-column layout
- Large Desktop (`> 1440px`) – Maximum container width `1280px` (`max-w-7xl`)

---

## ♿ Accessibility Rules

1. **Focus States**: High contrast visible focus ring (`2px solid #39D9FF`).
2. **Keyboard Navigation**: Native tab ordering, Escape listener for modal dialogs.
3. **Contrast**: All body copy exceeds WCAG AA contrast ratio against dark backgrounds.
4. **Non-Color Indicators**: Badges and status indicators pair text/icons with color.
