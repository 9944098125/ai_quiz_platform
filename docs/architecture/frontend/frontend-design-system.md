# Frontend Design System & UI/UX Standards

> **Document Status:** Architectural Blueprint (Pre-Implementation)
> **Styling Stack:** Tailwind CSS (CSS-first `@theme` tokens) + Lucide React icons

---

## 1. Brand & Visual Direction

- **Personality:** Focused, trustworthy, calm, modern educational SaaS (comparable to Linear, Notion, and Duolingo's clarity—without playful clutter or heavy enterprise density).
- **Guiding Rules:**
  - **Content First:** High-contrast readable typography for long quiz stems, code snippets, and answer explanations.
  - **Restrained Color:** Neutral canvas (`slate`/`zinc`) occupies 90%+ of screen real estate; primary indigo (`indigo-600`) marks primary actions and active states; semantic colors are reserved strictly for status, validation, and quiz feedback.
  - **No Decorative Noise:** Avoid multi-stop neon gradients, glassmorphism blur cards, excessive drop shadows, or unnecessary micro-animations—especially during quiz taking.
  - **Accessible by Default:** WCAG 2.1 AA contrast (`>= 4.5:1` body text, `>= 3:1` UI borders/icons), visible `:focus-visible` rings, and icon + text pairings for every status state (never color-alone).

---

## 2. Design Tokens (`src/styles/tokens.css`)

### 2.1 Color Palette

#### Light Mode (Default Workspace)
| Token Role | Tailwind / Hex Reference | Usage |
|---|---|---|
| `--bg-canvas` | `#F8FAFC` (`slate-50`) | App shell background, subtle page backdrop |
| `--bg-surface` | `#FFFFFF` | Cards, quiz stage, modals, tables, inputs |
| `--bg-subtle` | `#F1F5F9` (`slate-100`) | Hover states, table headers, secondary pills |
| `--border-default` | `#E2E8F0` (`slate-200`) | Card borders, dividers, input borders |
| `--border-strong` | `#CBD5E1` (`slate-300`) | Interactive control borders on hover |
| `--text-primary` | `#0F172A` (`slate-900`) | Headings, question text, primary values |
| `--text-secondary` | `#475569` (`slate-600`) | Descriptions, table cells, metadata |
| `--text-muted` | `#64748B` (`slate-500`) | Placeholders, timestamps, helper copy |
| `--primary` | `#4F46E5` (`indigo-600`) | Primary buttons, active nav, selected radio border |
| `--primary-hover` | `#4338CA` (`indigo-700`) | Primary button hover |
| `--primary-subtle` | `#EEF2FF` (`indigo-50`) | Selected answer fill, active sidebar item |

#### Dark Mode (`prefers-color-scheme: dark` / `.dark` class)
| Token Role | Value | Usage |
|---|---|---|
| `--bg-canvas` | `#0B0F19` | App shell background |
| `--bg-surface` | `#111827` | Cards, quiz stage, modals |
| `--bg-subtle` | `#1E293B` | Hover surfaces, table headers |
| `--border-default` | `#1F2937` | Borders & dividers |
| `--text-primary` | `#F8FAFC` | Headings & question text |
| `--text-secondary` | `#94A3B8` | Supporting labels |
| `--primary` | `#6366F1` (`indigo-500`) | Primary interactive accent |
| `--primary-subtle` | `rgba(99, 102, 241, 0.14)` | Selected states |

#### Semantic & Quiz-State Colors
| State | Foreground | Background | Border | Icon |
|---|---|---|---|---|
| **Success / Correct** | `#047857` (`emerald-700`) | `#ECFDF5` (`emerald-50`) | `#A7F3D0` | `CheckCircle2` |
| **Warning / Marked / Low Time** | `#B45309` (`amber-700`) | `#FFFBEB` (`amber-50`) | `#FDE68A` | `Flag` / `AlertTriangle` |
| **Danger / Incorrect / Critical Time** | `#BE123C` (`rose-700`) | `#FFF1F2` (`rose-50`) | `#FECDD3` | `XCircle` / `AlertOctagon` |
| **Info / AI Generating** | `#0369A1` (`sky-700`) | `#F0F9FF` (`sky-50`) | `#BAE6FD` | `Sparkles` / `Info` |

---

## 3. Typography, Spacing, Radius & Shadows

### 3.1 Typography
- **Primary Sans:** `'Inter', system-ui, -apple-system, sans-serif`
- **Monospace:** `'JetBrains Mono', ui-monospace, SFMono-Regular, monospace` (strictly for countdown timers using `tabular-nums`, numeric scores, and question codes).
- **Type Scale:**
  - Page Title (`h1`): `1.5rem` (24px) mobile -> `1.875rem` (30px) desktop, `font-semibold`, `tracking-tight`
  - Section Heading (`h2`): `1.125rem` (18px) -> `1.25rem` (20px), `font-semibold`
  - Card / Question Title (`h3`): `1rem` (16px) -> `1.125rem` (18px), `font-medium`, `leading-snug`
  - Body / Option Text: `0.9375rem`–`1rem` (15–16px), `leading-relaxed` (`1.6`) for comfortable reading
  - Caption / Metadata: `0.75rem`–`0.8125rem` (12–13px)

### 3.2 Spacing & Layout Grid
- Base unit: **4px** (`0.25rem`).
- Page max-width inside workspace: `1280px` (`max-w-7xl`) centered with `24px` (`px-6`) desktop padding, `16px` (`px-4`) mobile padding.
- Quiz runner question card max-width: `768px` (`max-w-3xl`) for optimal 60–75 character reading line length.
- Card internal padding: `20px` (`p-5`) or `24px` (`p-6`).
- Section vertical rhythm: `24px` (`space-y-6`).

### 3.3 Border Radius & Elevation
- **Radius:**
  - Inputs, buttons, small badges: `8px` (`rounded-lg`)
  - Cards, tables, dropdowns: `12px` (`rounded-xl`)
  - Modals, drawers: `16px` (`rounded-2xl`)
  - Pills / status dots: `9999px` (`rounded-full`)
- **Elevation (Flat-first SaaS):**
  - Default cards rely on `1px solid var(--border-default)` + crisp surface contrast rather than heavy shadows.
  - `shadow-sm`: Interactive cards on hover / sticky headers.
  - `shadow-lg`: Floating dropdowns, popovers, and modal dialogs only.

---

## 4. Core Component Conventions

| Component | Variants / States | Accessibility & Behavior Rules |
|---|---|---|
| **Button** | `primary`, `secondary`, `outline`, `ghost`, `danger`; sizes `sm` (`32px`), `md` (`40px`), `lg` (`44px`); `isLoading` | Always show spinner + preserve width or disable pointer events during `isLoading`. Native `<button type="button">` unless explicitly `type="submit"`. |
| **Input / Textarea** | Default, error (`border-rose-500`), disabled, prefix/suffix icon slots | Always paired with `<label htmlFor>`, `aria-invalid`, and `aria-describedby` pointing to error text. |
| **Select** | Native accessible `<select>` wrapper for simple filters; custom accessible combobox/listbox for searchable categories | Keyboard navigable (`ArrowUp`/`Down`, `Enter`, `Escape`). |
| **Card** | `default`, `interactive` (hover border highlight), `highlighted` | Clear header / body / footer slots. Avoid clickable `<div>`; use `<Link>` or `<button>` inside. |
| **Table (`DataTable`)** | Sortable headers, row hover, sticky header on scroll, mobile card-list fallback | Never force horizontal scroll for simple 4–5 column tables on mobile; switch to stacked summary cards below `768px`. |
| **Modal / ConfirmDialog** | `sm`, `md`, `lg`; destructive variant for delete/submit confirmation | Focus trap, `Escape` closes (unless `preventClose`), restores focus to trigger element on close. |
| **Toast** | `success`, `error`, `warning`, `info`; auto-dismiss `5s` (persistent for critical errors) | Placed in `aria-live="polite"` bottom-right (desktop) / top-center (mobile). Max 3 visible simultaneously. |
| **Alert** | Inline banner (`info`, `warning`, `error`, `success`) with optional retry action | Used for form-level API errors, offline banner, and timer warnings (`< 60s`). |
| **Badge** | Difficulty (`EASY` emerald, `MEDIUM` amber, `HARD` rose), Status (`DRAFT` slate, `PUBLISHED` indigo, `ARCHIVED` zinc), AI Tag (`Sparkles` + sky) | Pill shape, `text-xs font-medium`, paired with icon where conveying status. |
| **Tabs** | Underline tabs for page sub-views (`Discover` / `My Quizzes`), segmented pill tabs for chart timeframes | WAI-ARIA `tablist` / `tab` / `tabpanel` with arrow-key support. |
| **DropdownMenu** | Trigger button + aligned menu items + destructive separator | Click outside & `Escape` dismiss; keyboard focus management. |
| **Pagination** | Prev / page numbers / Next + `"Showing X–Y of Z"` summary | Disables boundaries; syncs `?page=` URL param. |
| **Skeleton** | Matching card, KPI, table-row, and question-stage shapes | Use `animate-pulse` subtly; never show blank white screen during loading. |
| **EmptyState** | Centered Lucide icon in subtle circle + concise headline + 1-line explanation + 1 primary CTA | Every list/table/chart must implement a domain-specific empty state. |

---

## 5. Responsive Adaptation Rules

| Breakpoint | Viewport | Layout Adaptation |
|---|---|---|
| **Desktop (`lg+`)** | `>= 1024px` | Fixed collapsible sidebar (`240px` / `64px`), multi-column dashboard grids (`2–4 cols`), split-pane Quiz Runner (Question stage + persistent Question Palette sidebar), full data tables. |
| **Tablet (`md`)** | `768px – 1023px` | Sidebar collapses to slide-over drawer via hamburger button; dashboard uses `2-column` grid; Quiz Runner palette collapses into top/side toggle drawer. |
| **Mobile (`<768px`)** | `< 768px` | Full-width single-column stack; sticky compact header; tables render as stacked mobile cards; primary actions (`Submit`, `Next Question`) sit in a sticky thumb-zone bottom bar; charts reduce tick density and expand tooltip tap targets. |

---

## 6. Quiz-Taking Accessibility & Keyboard Ergonomics

- **Answer Shortcuts (Optional & Non-Intrusive):** Keys `1`–`6` (or `A`–`F`) select options when focus is not inside a text input; `ArrowLeft`/`ArrowRight` or `N`/`P` navigate questions; `M` toggles Mark for Review.
- **Timer Announcements:** Use `aria-live="polite"` **only** at key thresholds (`5 minutes remaining`, `1 minute remaining`, `Time expired — submitting quiz`) so screen readers are never spammed every second.
- **Color-Blind-Safe Palette Indicators:** Question navigator tiles differentiate states via **fill + border + icon/badge** (not color alone):
  - *Not Visited:* Outline only (`border-slate-300`)
  - *Visited Unanswered:* Subtle slate fill + dashed border
  - *Answered:* Solid Indigo fill + white text
  - *Marked for Review:* Amber border + corner Flag dot (can combine with Answered!)
