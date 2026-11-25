# Frontend Component Inventory

> **Document Status:** Architectural Blueprint (Pre-Implementation)
> **Scope:** `apps/web/src/app/layouts/`, `src/components/`, `src/features/*/components/`

---

## 1. Layout Components (`src/app/layouts/`)

| Component | Responsibility | Used By |
|---|---|---|
| `PublicLayout` | Sticky `PublicNavbar`, main outlet, `PublicFooter` | `/`, `/explore`, `/explore/:quizId`, `/about`, `/contact`, `/privacy`, `/terms` |
| `AuthLayout` | Brand header, centered `AuthCard` container (`max-w-md`), legal footer links | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| `AppShellLayout` | Collapsible desktop sidebar, mobile slide-over drawer, sticky `TopHeader`, breadcrumbs, main outlet | All `/app/*` workspace pages except `/play` |
| `QuizRunnerLayout` | Distraction-free full-screen shell: compact timer/progress header, offline banner, no sidebar/footer | `/app/sessions/:sessionId/play` |
| `AdminLayout` | Inherits `AppShellLayout` (or wraps `/admin/*` with a subtle `"Admin Mode"` badge + guard) | All `/admin/*` pages |

### Navigation Sub-Components
- `PublicNavbar` — Logo, links (`Explore`, `About`), responsive hamburger drawer, guest/auth CTA swap.
- `PublicFooter` — 3-column link directory + copyright.
- `AppSidebar` — Role-aware nav groups (`Workspace` + conditional `Admin`), active route highlight, collapse toggle.
- `AppTopHeader` — Mobile menu trigger, `Breadcrumbs`, offline indicator pill, `+ New Quiz` button, `UserMenuDropdown`.
- `MobileNavDrawer` — Accessible focus-trapped slide-over drawer for `<1024px`.

---

## 2. Shared UI Primitives (`src/components/ui/`)

Pure, domain-agnostic, accessible building blocks styled with Tailwind CSS tokens and Lucide icons:

| Component | Key Props / Variants | Notes |
|---|---|---|
| `Button` | `variant` (`primary`, `secondary`, `outline`, `ghost`, `danger`), `size` (`sm`, `md`, `lg`), `isLoading`, `leftIcon`, `rightIcon` | Prevents click during `isLoading`. |
| `Input` | `label` (optional via `FormField`), `error`, `leftAdornment`, `rightAdornment` | Supports `ref` forwarding for `react-hook-form`. |
| `PasswordInput` | Extends `Input` with accessible eye/eye-off visibility toggle | Prevents password value leak in aria-label. |
| `Textarea` | Auto-height optional, character counter slot, `error` state | Used in quiz descriptions, AI prompts, explanations. |
| `Select` | Native `<select>` wrapper with chevron icon + error state | Simple filter dropdowns and forms. |
| `Checkbox` & `Radio` | Custom accessible styled controls with label & description slot | Used in terms consent and quiz options. |
| `Switch` | Accessible `role="switch"` toggle | Used in settings, admin active toggles. |
| `Card` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Flat bordered SaaS surface. |
| `Badge` | `variant` (`neutral`, `primary`, `success`, `warning`, `danger`, `info`), `size` | Difficulty, status, AI-generated, pass/fail tags. |
| `Table` | Semantic `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | Styled base table primitives. |
| `Modal` | `isOpen`, `onClose`, `title`, `description`, `size` (`sm`, `md`, `lg`), `preventClose` | Focus trap, `Escape` key, portal mount. |
| `Drawer` | `side` (`left`, `right`, `bottom`), `isOpen`, `onClose` | Mobile nav, mobile quiz palette, admin quiz preview. |
| `Toast` & `Toaster` | `type` (`success`, `error`, `warning`, `info`), `title`, `description`, `action` | Managed by `ToastProvider`. |
| `Alert` | `variant` (`info`, `warning`, `error`, `success`), `title`, `onRetry` | Inline page/form feedback banners. |
| `Tabs` | `items` (`id`, `label`, `badge?`), `activeId`, `onChange`, `variant` (`underline`, `pills`) | URL-syncable or controlled. |
| `DropdownMenu` | `trigger`, `items` (label, icon, onClick, destructive, disabled) | Keyboard navigable menu. |
| `Pagination` | `page`, `totalPages`, `totalItems`, `pageSize`, `onPageChange` | Responsive compact mode on mobile. |
| `Skeleton` | `className` (text, circle, card, table-row presets) | Pulse loading placeholders. |
| `Spinner` | `size` (`sm`, `md`, `lg`) | Inline loading indicator. |
| `ProgressBar` | `value`, `max`, `variant`, `label` | Quiz progress & score bars. |
| `Avatar` | `src?`, `name`, `size` | Deterministic colored initials fallback. |
| `Tooltip` | `content`, `children` | Accessible hover/focus hint for icon-only buttons. |

---

## 3. Common & Feedback Components (`src/components/common/` & `src/components/feedback/`)

| Component | Responsibility | Reused Across |
|---|---|---|
| `FormField` | Wraps `label`, required asterisk, input slot, helper text, and error message with `htmlFor`/`aria-describedby` | Auth, Quiz Builder, AI Form, Profile, Settings, Contact |
| `PageHeader` | Standard page title, subtitle, optional breadcrumb slot, and right-aligned action buttons | All `/app/*` & `/admin/*` pages |
| `StatCard` | KPI label, formatted value (`tabular-nums`), optional trend/subtitle, Lucide icon | Dashboard, Analytics, Quiz Details, Result, Admin |
| `SearchInput` | Debounced search input with clear (`X`) button and search icon | Explore, My Quizzes, Attempts, Leaderboard, Admin |
| `FilterBar` | Responsive horizontal filter container with `"Clear all"` reset action | Explore, My Quizzes, Attempts, Admin |
| `DataTable` | Generic typed table (`columns`, `data`, `isLoading`, `emptyState`, `mobileCardRender`) | Attempts, Leaderboards, Quiz Details, Admin tables |
| `ChartContainer` | Consistent Recharts card wrapper handling title, timeframe slot, loading skeleton, error retry, and empty state | Dashboard, Analytics |
| `CountdownTimer` | Server-skew-adjusted countdown display (`MM:SS` / `HH:MM:SS`), warning/critical states, `onExpire` callback | Quiz Instructions (resume preview), Quiz Runner |
| `ConfirmDialog` | Standardized confirmation modal (`confirmLabel`, `isDestructive`, `isLoading`) | Delete Quiz, Submit Quiz, Exit Runner, Admin moderation |
| `EmptyState` | Icon, headline, explanation, primary/secondary CTA | Every list, table, and chart |
| `ErrorState` | Error icon, user-friendly message (from `ProblemDetail`), `"Try Again"` button | Query failure fallbacks across pages |
| `ErrorBoundary` | React class error boundary catching unexpected render crashes with reload/home CTA | Root `AppProviders` + per-route boundary |
| `QuizCard` | Displays title, category, difficulty badge, question count, duration, AI badge, creator, and action footer | Landing, Explore, Dashboard, My Quizzes |
| `DifficultyBadge` | Maps `EASY` / `MEDIUM` / `HARD` to consistent semantic `Badge` | Explore, Quiz Cards, Details, Runner |
| `QuizStatusBadge` | Maps `DRAFT` / `PUBLISHED` / `ARCHIVED` to consistent `Badge` | My Quizzes, Edit Quiz, Admin Moderation |

---

## 4. Feature-Specific Components (`src/features/*/components/`)

| Feature | Components | Responsibility |
|---|---|---|
| **auth** | `AuthCard`, `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `PasswordStrengthMeter` | Credential forms, client validation, strength meter, redirect handling |
| **dashboard** | `DashboardQuickActions`, `RecentAttemptsList`, `PerformanceSnapshotWidget` | Dashboard layout widgets & onboarding empty state |
| **quizzes** | `QuizMetadataForm`, `QuizFilterPanel`, `QuizAttemptHistoryMini`, `QuizActionsMenu` | Quiz create/edit metadata, publish/archive actions |
| **questions** | `QuestionBuilderList`, `QuestionEditorCard`, `OptionEditorRow` | Add/remove/reorder questions, single/multi-choice answer toggles, validation |
| **ai-generator** | `AiConfigForm`, `AiJobProgressCard`, `GeneratedQuestionList`, `GeneratedQuestionCard`, `QuizPreviewModal` | AI prompt inputs, job polling indicator, inline question edit & single-question regeneration |
| **quiz-session** | `QuestionStage`, `OptionCard`, `QuestionPalette`, `QuizRunnerHeader`, `SubmitQuizModal`, `MultiTabConflictOverlay`, `ResultBreakdownCard` | Interactive quiz runner, 4-state palette, optimistic answer save status, multi-tab lock, result summary |
| **attempts** | `AttemptSummaryHeader`, `AnswerReviewList`, `AnswerReviewCard` | Attempt filtering, correct vs selected option comparison, explanations |
| **analytics** | `PerformanceTrendChart`, `CategoryPerformanceChart`, `DifficultyPerformanceChart`, `AnalyticsRangeSelector` | Recharts wrappers with custom tooltips and mobile axis adaptations |
| **leaderboard** | `LeaderboardPodium`, `CurrentUserRankBanner`, `LeaderboardTable` | Top-3 highlight cards, pinned current-user rank, global/quiz tables |
| **profile** | `ProfileIdentityCard`, `ProfileForm`, `ChangePasswordCard`, `AppearancePreferencesCard` | Profile editing, password updates, theme selection |
| **admin** | `AdminOverviewCards`, `AdminUserTable`, `QuizModerationDrawer`, `CategoryFormModal`, `AiJobLogTable` | Admin user status/role modals, quiz preview moderation, category CRUD, AI telemetry |
