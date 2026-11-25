# Junior Developer Guide: Building the Frontend UI (Without API Integration)

> **Who this guide is for:** Junior / Beginner React Developer
> **Your Goal Right Now:** Build clean, responsive, accessible UI pages and reusable components in `apps/web` using **mock (dummy) data**, while the backend API is being built in parallel.
> **Rule #1:** **Do NOT write `fetch()` calls, backend URLs, or authentication token logic yet.** Focus 100% on layout, components, React state, routing, and visual polish so we can plug in the real API cleanly later.

---

## 1. Before You Write Any Code

### 1.1 Where You Work
- Work **only** inside `apps/web/` (and do **not** modify `apps/api/`).
- Helpful reference docs already in this repo:
  - [Design System & Tailwind Rules](./frontend-design-system.md)
  - [All Routes & Layouts](./frontend-route-map.md)
  - [What Goes on Every Page](./frontend-page-specifications.md)
  - [Reusable Component List](./frontend-component-inventory.md)

### 1.2 Commands You Will Run Every Day
Run these from the **root folder** (`ai_quiz_monorepo/`):

```bash
pnpm dev:web     # Starts the frontend dev server at http://localhost:3000
pnpm build:web   # Checks TypeScript types + builds the app (run before finishing a task!)
pnpm lint:web    # Checks ESLint code quality rules
```

> **Wait for setup confirmation from your lead:** Make sure `react-router`, `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, and `recharts` are installed in `apps/web` before starting Milestone 1. Do not install extra packages on your own without asking first.

---

## 2. Two TypeScript Rules in This Project That Will Trip You Up (Read First!)

Our `apps/web/tsconfig.app.json` has strict TypeScript settings enabled (`erasableSyntaxOnly: true` and `verbatimModuleSyntax: true`). Keep these two rules in mind so `pnpm build:web` passes:

### Rule A: Never use TypeScript `enum`
```ts
// ❌ BAD — TypeScript build will fail in this project
enum QuizDifficulty {
  Easy = 'EASY',
  Medium = 'MEDIUM',
  Hard = 'HARD',
}

// ✅ GOOD — Use `as const` object + union type instead
export const QUIZ_DIFFICULTY = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;

export type QuizDifficulty = (typeof QUIZ_DIFFICULTY)[keyof typeof QUIZ_DIFFICULTY];
```

### Rule B: Always use `import type` when importing interfaces or types
```ts
// ❌ BAD — Will fail with verbatimModuleSyntax
import { QuizItem } from '../types/quiz';

// ✅ GOOD
import type { QuizItem } from '../types/quiz';
```

### Rule C: No unused variables or `any`
- If you import an icon or declare a variable you don't use, `pnpm build:web` will fail. Remove unused imports before committing.
- Avoid `any`. Write simple `interface` or `type` definitions for your mock data.

---

## 3. Folder Structure (What You Need to Know Right Now)

You don't need to touch advanced API/query folders yet. Focus on these folders inside `apps/web/src/`:

```text
apps/web/src/
├── app/
│   ├── layouts/        # Page wrappers (PublicLayout, AuthLayout, AppShellLayout, QuizRunnerLayout)
│   └── router/         # React Router paths & route definitions
├── components/
│   ├── ui/             # Basic building blocks: Button, Input, Card, Badge, Modal, Alert, Skeleton
│   └── common/         # Shared widgets: PageHeader, StatCard, QuizCard, EmptyState, SearchInput
├── features/           # One folder per app area (auth, quizzes, ai-generator, quiz-session, etc.)
│   └── quizzes/
│       ├── components/ # Components used only by quizzes
│       └── pages/      # Actual route pages (e.g., ExplorePage.tsx, QuizDetailsPage.tsx)
├── mocks/              # 👈 Put ALL dummy/sample JSON data here (never inside JSX!)
├── types/              # TypeScript interfaces for your mock data (Quiz, Question, Attempt...)
└── styles/             # Tailwind CSS setup & design tokens
```

### Why put dummy data in `src/mocks/` instead of inside the page?
When the backend is ready, we will replace `mockQuizzes` with a data hook. If your page component receives clean typed data from `src/mocks/quizzes.ts`, integrating the backend later takes 10 minutes instead of rewriting the whole page!

---

## 4. Visual Design Cheat Sheet (Copy-Paste Reference)

Keep the UI **clean, calm, and uncluttered** (think Notion or Linear, not flashy gaming sites).

| Element | Recommended Tailwind Classes |
|---|---|
| **Page Background** | `bg-slate-50 text-slate-900 min-h-screen` |
| **Card Surface** | `bg-white border border-slate-200 rounded-xl p-5 sm:p-6` |
| **Primary Button** | `bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2.5 disabled:opacity-50` |
| **Secondary Button** | `bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium rounded-lg px-4 py-2.5` |
| **Danger Button** | `bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg px-4 py-2.5` |
| **Text Input** | `w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20` |
| **Page Title (`h1`)** | `text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900` |
| **Section Title (`h2`)** | `text-lg font-semibold text-slate-900` |
| **Muted Helper Text** | `text-sm text-slate-500` |
| **Timer / Score Numbers** | `font-mono tabular-nums` (keeps numbers from jumping as seconds tick!) |
| **Success / Correct** | `bg-emerald-50 text-emerald-700 border border-emerald-200` |
| **Warning / Marked** | `bg-amber-50 text-amber-700 border border-amber-200` |
| **Error / Wrong** | `bg-rose-50 text-rose-700 border border-rose-200` |
| **AI / Info** | `bg-sky-50 text-sky-700 border border-sky-200` |

### Icons
Always use **Lucide React** (`import { Clock, Sparkles, CheckCircle2 } from 'lucide-react'`). Keep icon sizes consistent (`w-4 h-4` inside buttons/badges, `w-5 h-5` in nav items).

---

## 5. Your Task Roadmap (Build in This Exact Order!)

Work through these **6 Milestones** from easiest to hardest. Finish and review one milestone before moving to the next.

### Milestone 0: Mock Data & Types (Warm-Up)
Create clean TypeScript types in `src/types/` and realistic dummy data in `src/mocks/`:
- `src/mocks/categories.ts` (e.g., Java, React, Databases, System Design)
- `src/mocks/quizzes.ts` (6–8 sample quizzes across `EASY`, `MEDIUM`, `HARD` and `DRAFT`, `PUBLISHED`)
- `src/mocks/questions.ts` (sample single-choice and multiple-choice questions with options + explanations)
- `src/mocks/attempts.ts` (sample past quiz attempts & scores)
- `src/mocks/analytics.ts` (sample chart arrays for Recharts)
- `src/mocks/leaderboard.ts` (10 sample ranked users)
- `src/mocks/user.ts` (1 sample logged-in user object)

---

### Milestone 1: Core UI Components & App Layouts
Build reusable components first so every page looks identical and takes half the time to code:

1. **UI Primitives (`src/components/ui/`):**
   - `Button` (variants: `primary`, `secondary`, `outline`, `ghost`, `danger`; `isLoading` spinner state)
   - `Input`, `Textarea`, `Select`, `Checkbox`
   - `Card` (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`)
   - `Badge` (for Difficulty & Status pills)
   - `Alert` (inline error/info banner)
   - `Modal` (for confirmations like "Submit Quiz?" or "Delete Quiz?")
   - `Skeleton` (gray pulsing placeholder boxes)
   - `Pagination`
2. **Common Components (`src/components/common/`):**
   - `PageHeader` (Title, subtitle, action buttons on the right)
   - `StatCard` (Icon + label + big number)
   - `EmptyState` (Icon + message + CTA button when a list is empty)
   - `SearchInput` + `FilterBar`
   - `QuizCard` (Displays title, category badge, difficulty badge, question count, duration, and button)
3. **4 Layouts (`src/app/layouts/`):**
   - `PublicLayout`: Top navbar (Logo, `Explore`, `About`, `Login`, `Register`) + Footer.
   - `AuthLayout`: Centered card on `bg-slate-50` for auth forms.
   - `AppShellLayout`: Left sidebar (`Dashboard`, `Quizzes`, `AI Generator`, `My Attempts`, `Analytics`, `Leaderboard`) + Top bar (mobile hamburger button + user avatar/name menu). Must collapse into a slide-out drawer on mobile!
   - `QuizRunnerLayout`: Full-screen distraction-free layout **without** sidebar or footer (only quiz title, timer, question progress, and Finish button).

---

### Milestone 2: Static Public & Authentication Pages (Easiest Pages)
Great for practicing JSX, forms, and React Router `<Link>`:

| Order | Page | Route | Key UI Practice |
|---|---|---|---|
| 1 | **Landing Page** | `/` | Hero section, 3-step feature cards, featured `QuizCard`s |
| 2 | **About / Privacy / Terms** | `/about`, `/privacy`, `/terms` | Clean readable typography (`max-w-3xl mx-auto`) |
| 3 | **Contact Page** | `/contact` | Validated form (`useState`) + fake "Message sent!" alert on submit |
| 4 | **Login Page** | `/login` | Email + password with Show/Hide password toggle + inline validation error |
| 5 | **Register Page** | `/register` | Name, email, password, confirm password, terms checkbox |
| 6 | **Forgot & Reset Password** | `/forgot-password`, `/reset-password` | Clean form + confirmation state UI |
| 7 | **403 & 404 Error Pages** | `/403`, `*` | Friendly icon + `"Go Back Home"` button |

> **Tip for Auth Pages right now:** When the user submits the Login form, validate that email/password aren't empty, show a brief loading state (`setTimeout`), and navigate to `/app/dashboard` using `useNavigate()`.

---

### Milestone 3: Quiz Discovery, Details & User Profile
Practice `.map()` lists, client-side filtering with `useState`, and tabs:

| Order | Page | Route | Key UI Practice |
|---|---|---|---|
| 8 | **Public Explore** | `/explore` | Search bar + Category/Difficulty filter + `QuizCard` grid |
| 9 | **Public Quiz Details** | `/explore/:quizId` | Read `:quizId` via `useParams()`, find matching quiz from `mocks/quizzes.ts`, show `"Sign in to Start"` |
| 10 | **My Quizzes & Library** | `/app/quizzes` | Tabs (`All Quizzes` / `My Quizzes`), filter pills, Delete confirmation `Modal` |
| 11 | **Quiz Details (Logged In)** | `/app/quizzes/:quizId` | Metadata summary, past attempts table for this quiz, `"Start Quiz"` button |
| 12 | **Profile & Settings** | `/app/profile`, `/app/settings` | Editable profile form, change password UI, theme preference UI |

---

### Milestone 4: Interactive Creation & Quiz-Taking Pages (Core Experience)
Take your time here—these pages teach real React state management (`useState`, `useEffect` timer):

| Order | Page | Route | Key UI Practice |
|---|---|---|---|
| 13 | **Create / Edit Quiz** | `/app/quizzes/create`, `/app/quizzes/:quizId/edit` | Dynamic array of questions: Add Question, Remove Question, Add/Remove Options (2–6), mark Correct Answer. *(Use `crypto.randomUUID()` for `key`, never array index!)* |
| 14 | **AI Quiz Generator** | `/app/ai/generate` | Topic/Difficulty/Count form -> click Generate -> show 2-second simulated loading state -> display editable generated question cards + `"Regenerate"` button on each card + `"Preview"` modal |
| 15 | **Quiz Instructions** | `/app/sessions/:sessionId/instructions` | Quiz rules checklist + `"Begin Quiz"` button linking to `/play` |
| 16 | **Interactive Quiz Runner** | `/app/sessions/:sessionId/play` | Uses `QuizRunnerLayout`. Show 1 question at a time, Previous/Next buttons, clickable Question Number Palette (showing **Not Visited**, **Visited**, **Answered**, **Marked for Review**), countdown timer (`useEffect` + `setInterval`), and Submit confirmation `Modal` |
| 17 | **Quiz Result** | `/app/sessions/:sessionId/result` | Score percentage card, Correct/Incorrect/Skipped counts, buttons to Review Answers or go to Dashboard |

---

### Milestone 5: History, Review, Analytics & Leaderboards
Practice tables, mobile card views, and Recharts:

| Order | Page | Route | Key UI Practice |
|---|---|---|---|
| 18 | **User Dashboard** | `/app/dashboard` | 4 `StatCard`s, compact trend chart, 5 recent attempts list, Quick Actions |
| 19 | **Attempt History** | `/app/attempts` | Search/status filter + table on desktop, stacked cards on mobile |
| 20 | **Answer Review** | `/app/attempts/:attemptId` | Filter tabs (`All`, `Incorrect Only`, `Correct`), highlight user's choice vs correct answer + explanation box |
| 21 | **Performance Analytics** | `/app/analytics` | Date range selector (`7d`, `30d`, `All`) + 3 Recharts charts (`AreaChart` trend, `BarChart` by category, `BarChart` by difficulty) wrapped in `<ResponsiveContainer>` |
| 22 | **Global & Quiz Leaderboards** | `/app/leaderboard`, `/app/quizzes/:quizId/leaderboard` | Top 3 highlight cards, ranked table, highlighted `"You"` row |

*(Skip `/admin/*` pages for now unless your lead explicitly assigns them after Milestone 5.)*

---

## 6. How to Design All 4 UI States (Without a Backend!)

Every page you build shouldn't only show the "happy path". Your lead will check **4 states** on every page:

1. **Loading State:** Show `<Skeleton />` placeholders matching your cards/tables.
2. **Empty State:** Show `<EmptyState />` (e.g., `"No quizzes match your filter"` with a `"Clear Filters"` button).
3. **Error State:** Show `<Alert variant="error" />` with a `"Try Again"` button.
4. **Success / Ready State:** The normal populated page.

### Beginner-Friendly Trick to Preview All 4 States
On list/dashboard pages, you can temporarily test your states cleanly with a local constant or small dev-only state toggle while building:

```tsx
// Easy way to verify your loading/empty/error UI before backend exists:
type ViewState = 'ready' | 'loading' | 'empty' | 'error';
const [previewState] = useState<ViewState>('ready');
```

That way you can flip `'ready'` -> `'loading'` -> `'empty'` -> `'error'` in 1 second to take screenshots or verify your layout handles every case gracefully!

---

## 7. Beginner React Checklist (Avoid Common Mistakes)

- **Always use `type="button"` on non-submit buttons** inside forms, otherwise clicking "Add Option" or "Mark for Review" will accidentally submit your form!
- **Never mutate state arrays directly:**
  - ❌ `questions.push(newQuestion); setQuestions(questions);`
  - ✅ `setQuestions((prev) => [...prev, newQuestion]);`
- **Never use array index as `key` on editable/reorderable lists:**
  - ❌ `questions.map((q, index) => <QuestionCard key={index} ... />)`
  - ✅ `questions.map((q) => <QuestionCard key={q.id} ... />)`
- **Every `<input>` needs a `<label>`** connected via `htmlFor` and `id` (or wrapped properly) for accessibility.
- **Check mobile first:** Resize Chrome DevTools to **375px wide** (iPhone SE). Make sure nothing overflows horizontally and buttons don't overlap.
- **Keep components small:** If a page file gets over ~200 lines, split parts into smaller components inside `features/<name>/components/`.

---

## 8. "Done" Checklist Before Submitting Each Task

Before opening a PR or asking your lead to review a page:

- [ ] `pnpm build:web` succeeds with **0 TypeScript errors**
- [ ] `pnpm lint:web` succeeds with **0 ESLint errors**
- [ ] Tested in browser at **Mobile (`375px`)**, **Tablet (`768px`)**, and **Desktop (`1280px`)**
- [ ] Loading skeleton, Empty state, and Error alert are implemented and verified
- [ ] All interactive buttons, tabs, modals, and filters work with mock data
- [ ] All dummy data lives in `src/mocks/` (not hardcoded inline inside large JSX blocks)
- [ ] No `enum`, no `any`, no `fetch()` calls, and no backend API URLs added
