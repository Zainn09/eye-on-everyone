# Design Document: Eye-On Everyone Platform Enhancement

## Overview

This document describes the technical design for the platform enhancement features layered onto the existing Eye-On Everyone Next.js project management application. The work is purely additive — no existing routes, server actions, Prisma schema, or UI components are modified in breaking ways.

The six feature areas are:

1. **Task Management Panel** — renders the existing `Task` model inside `ProjectDetailClient`
2. **Checklist Panel** — renders the existing `Checklist`/`ChecklistItem` models inside `ProjectDetailClient`
3. **Checklist Summary Widget** — a sidebar widget on the Dashboard
4. **Visual Workflow Diagram** — an interactive per-project phase flowchart
5. **Status Intelligence Tags** — computed smart labels on project cards and project detail
6. **Avg Completion Time** — a new column in the Insights Individual Performance table

All new UI follows the existing dark-theme design system (`globals.css` CSS variables, `ui.tsx` component primitives, `recharts` for charts, `lucide-react` for icons).

---

## Architecture

### Rendering Model

The app uses Next.js App Router with a clear server/client split:

- **Server Components / Page files** (`page.tsx`) — fetch data via Prisma server actions, pass serialised props to client components.
- **Client Components** (`*Client.tsx`) — receive props, manage local UI state with `useState`/`useOptimistic`/`useTransition`, call server actions for mutations.

No new pages are introduced. All new UI is added inside existing client components or as new client sub-components imported by them.

### Data Flow

```
page.tsx (server)
  └─ getProjectById()          ← already fetches project + pages + activities + revisions
  └─ getUsers()                ← already fetches all active users
  └─ [NEW] getProjectTasks()   ← tasks with assignee/creator
  └─ [NEW] getProjectChecklists() ← checklists with items + creator
       │
       ▼
ProjectDetailClient (client)
  ├─ TaskPanel          (sub-component)
  ├─ ChecklistPanel     (sub-component)
  └─ WorkflowDiagram    (sub-component)
```

```
dashboard/page.tsx (server)
  └─ getProjects()             ← already fetches projects + pages + _count
  └─ [NEW] getAllChecklists()  ← all checklists visible to user
       │
       ▼
DashboardClient (client)
  └─ ChecklistSummaryWidget   (sub-component)
  └─ [UPDATED] project cards  ← StatusIntelligenceTag added inline
```

```
insights/page.tsx (server)
  └─ [UPDATED] getAdminInsights() ← adds avgCompletionTime per user
       │
       ▼
InsightsClient (client)
  └─ [UPDATED] Individual Performance table ← new column
```

### State Management

Mutations use `useTransition` + `useOptimistic` for instant feedback without full page reloads. The pattern already established in the codebase (e.g., `createTask` is already imported in `ProjectDetailClient`) is followed consistently.

---

## Components and Interfaces

### 1. TaskPanel

**File:** `src/app/(dashboard)/projects/[id]/TaskPanel.tsx`

A self-contained client component receiving initial task data as props and managing optimistic state locally.

```typescript
interface TaskPanelProps {
  projectId: string
  initialTasks: TaskWithRelations[]
  users: UserOption[]
  currentUser: { id: string; name: string; role: string }
}

interface TaskWithRelations {
  id: string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  dueDate: Date | null
  createdAt: Date
  assignee: { id: string; name: string } | null
  creator: { id: string; name: string }
}
```

**Layout:** Four status columns rendered as a horizontal scrollable strip on desktop, stacked vertically on mobile (≤768px). Each column header shows the status label and a count badge.

**Create form:** Inline form at the top of the TODO column. Fields: title (required), priority (select), assignee (select from `users`), due date (date input). Validation is client-side before calling `createTask`.

**Status transitions:** Each task card shows a "Move →" button. The allowed next status is derived from a local helper:
```
TODO → IN_PROGRESS
IN_PROGRESS → IN_REVIEW
IN_REVIEW → COMPLETED (Admin only)
```
Non-admin users see the "Mark Complete" button disabled with a tooltip.

**Delete:** Trash icon visible only to Admins. Calls `deleteTask`.

**Loading states:** `useTransition` `isPending` disables the triggering control and shows a spinner icon during the async call.

### 2. ChecklistPanel

**File:** `src/app/(dashboard)/projects/[id]/ChecklistPanel.tsx`

```typescript
interface ChecklistPanelProps {
  projectId: string
  initialChecklists: ChecklistWithItems[]
  currentUser: { id: string; name: string; role: string }
}

interface ChecklistWithItems {
  id: string
  title: string
  createdAt: Date
  creator: { id: string; name: string }
  items: ChecklistItem[]
}

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  order: number
}
```

**Completion percentage** is a pure function:
```typescript
function completionPct(items: ChecklistItem[]): number {
  if (items.length === 0) return 0
  return Math.round((items.filter(i => i.completed).length / items.length) * 100)
}
```

**Layout:** Vertical list of checklist cards. Each card has a header (title, completion %, progress bar, delete button), an item list with checkboxes, and an inline "Add item" form.

**Delete checklist:** Visible only to the checklist creator or an Admin.

**Progress bar:** Uses the existing `.progress` / `.progress-bar` CSS classes from `globals.css`.

### 3. ChecklistSummaryWidget

**File:** `src/app/(dashboard)/dashboard/ChecklistSummaryWidget.tsx`

```typescript
interface ChecklistSummaryWidgetProps {
  checklists: Array<{
    id: string
    title: string
    projectId: string | null
    projectName: string | null
    items: { completed: boolean }[]
  }>
}
```

Rendered inside `DashboardClient`'s right sidebar, below the existing Activity feed. Receives pre-fetched checklist data as props (not affected by the date range filter). Clicking a project-linked entry navigates to `/projects/[id]` via `<Link>`.

Empty state: renders a `ListChecks` icon with "No checklists yet" text.

### 4. WorkflowDiagram

**File:** `src/app/(dashboard)/projects/[id]/WorkflowDiagram.tsx`

```typescript
interface WorkflowDiagramProps {
  project: {
    id: string
    currentPhase: string
    status: string
    skippedDesignQA: boolean
    activities: Activity[]
    revisions: Revision[]
  }
}

interface PhaseNodeData {
  phase: Phase
  state: "completed" | "active" | "pending" | "skipped"
  revisionCount: number
  avgDays: number | null
  cycleCount: number  // how many times this phase appears in activity log
}
```

**Pan/Zoom:** Implemented with CSS transforms on a wrapper `div`. A `useRef` tracks `translateX`, `translateY`, and `scale`. Mouse wheel adjusts scale (clamped 0.5–2.0). Mouse drag (pointer events) adjusts translate. Touch events mirror mouse for mobile. No external graph library.

```typescript
// Zoom/pan state
const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
```

**Phase node rendering:** Each of the 7 phases is a `div` with inline styles. Node states:
- `completed`: filled background, checkmark icon, phase color
- `active`: pulsing CSS animation (`@keyframes pulse-ring`), phase color border glow
- `pending`: muted grey (`#374151`)
- `skipped`: dashed border, amber warning icon

**Cycle detection:** Counts occurrences of each phase in `activities` where `action === "phase_changed"` and the `details` string contains `"to {PHASE}"`. If count > 1, a repeat badge is shown on the node.

**Time per phase:** Derived from consecutive `phase_changed` activity timestamps (same logic as `computePhaseMetrics` in `insights.ts`, but scoped to this project's activities).

**Revision count per phase:** Counts `revisions` where `type` matches the phase group (design revisions for design phases, dev revisions for dev phases).

**Animated transition:** When `currentPhase` changes (detected via `useEffect` comparing previous value), the newly active node receives a CSS class that triggers a brief scale-up animation.

**Connector arrows:** Simple `div` elements with `border-top` styled as lines between nodes. Back-edge arrows (for cycle indicators) are rendered as curved SVG paths overlaid on the diagram.

### 5. StatusIntelligenceTag

**File:** `src/lib/statusTags.ts` (pure utility, no React)

```typescript
export type StatusTagType = "Blocked" | "Overdue" | "Needs Assistance" | "In Review" | "Pending" | null

export interface StatusTagConfig {
  label: StatusTagType
  color: string
  bgColor: string
}

export function computeStatusTag(
  project: ProjectForTag,
  needsAssistanceHighProjects: string[],  // project names from getAdminInsights
  now: Date = new Date()
): StatusTagConfig | null
```

Priority order (highest first):
1. `Blocked` — `project.status === "BLOCKED"` → red `#EF4444`
2. `Overdue` — `project.deadline < now && project.status !== "COMPLETED"` → red `#EF4444`
3. `Needs Assistance` — project name in `needsAssistanceHighProjects` OR last `phase_changed` activity > 14 days ago → amber `#F59E0B`
4. `In Review` — `currentPhase` in `["DESIGN_QA","DESIGN_APPROVAL","DEV_QA","CLIENT_PREVIEW"]` → cyan `#06B6D4`
5. `Pending` — `project.status === "NOT_STARTED"` → grey `#6B7280`

Returns `null` if none apply.

**Rendering:** A small `<StatusTag>` React component (inline in `DashboardClient` and `ProjectDetailClient`) renders the badge using the existing `.badge` CSS class with inline color overrides.

```typescript
// src/components/StatusTag.tsx
interface StatusTagProps {
  tag: StatusTagConfig | null
}
export function StatusTag({ tag }: StatusTagProps)
```

### 6. Avg Completion Time (Insights)

**Server action change** (`src/actions/insights.ts`):

The `userPerformance` mapping gains one new field:

```typescript
// Inside getAdminInsights(), userPerformance.map():
const completedWithDates = completedTasks.filter(t => t.createdAt && t.updatedAt)
const avgCompletionTime = completedWithDates.length > 0
  ? Math.round(
      (completedWithDates.reduce((sum, t) =>
        sum + (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()), 0
      ) / completedWithDates.length) / 86400000 * 10
    ) / 10
  : null
```

The `InsightsClientProps` interface gains `avgCompletionTime: number | null` per `userPerformance` entry.

**Table column:** Added as the last column "Avg. Days" in the Individual Performance table. Cells display:
- `"—"` when `avgCompletionTime === null`
- The numeric value with amber highlight when above team average
- Default text color when at or below team average

Team average is computed client-side:
```typescript
const teamAvg = useMemo(() => {
  const vals = userPerformance.filter(p => p.avgCompletionTime !== null).map(p => p.avgCompletionTime!)
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}, [userPerformance])
```

---

## Data Models

No Prisma schema changes are required. All models (`Task`, `Checklist`, `ChecklistItem`, `Activity`, `Revision`) already exist with the correct fields.

### Data fetching additions

**`page.tsx` for `/projects/[id]`** — extend the parallel fetch:

```typescript
const [project, users, tasks, checklists] = await Promise.all([
  getProjectById(id),
  getUsers(),
  getProjectTasks(id),       // already exists in tasks.ts
  getProjectChecklists(id),  // already exists in checklists.ts
])
```

**`dashboard/page.tsx`** — add checklist fetch:

```typescript
// New server action needed: getAllChecklistsForUser()
// Returns all checklists (project-linked + global) with project name
```

A new server action `getAllChecklistsForUser()` is added to `src/actions/checklists.ts`:

```typescript
export async function getAllChecklistsForUser() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.checklist.findMany({
    include: {
      items: { select: { completed: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
```

**`insights/page.tsx`** — no change needed; `getAdminInsights()` is updated in place.

### Type additions

A shared types file `src/types/platform.ts` is introduced for the new component prop interfaces to avoid duplication between files.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Checklist completion percentage is bounded and correct

*For any* array of checklist items (including the empty array), `completionPct` SHALL return an integer in the range [0, 100]. When the array is non-empty it SHALL equal `Math.round(completedCount / totalCount * 100)`. When the array is empty it SHALL return `0`.

**Validates: Requirements 2.2, 2.3, 3.3**

### Property 2: Whitespace-only input is always rejected

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines), submitting it as a task title or checklist title SHALL be rejected by the client-side validation, and the corresponding server action (`createTask` or `createChecklist`) SHALL NOT be called.

**Validates: Requirements 1.4, 2.5**

### Property 3: Non-Admin users cannot transition tasks to COMPLETED

*For any* user role that is not `"ADMIN"`, the task transition guard SHALL NOT include `"COMPLETED"` in the set of allowed next statuses, regardless of the task's current status.

**Validates: Requirements 1.6, 1.9**

### Property 4: Non-creator, non-Admin users cannot see the checklist delete button

*For any* checklist and any user whose `id` does not equal the checklist's `creatorId` and whose `role` is not `"ADMIN"`, the delete checklist control SHALL NOT be rendered in the output.

**Validates: Requirements 2.10**

### Property 5: Checklist item toggle is a round-trip

*For any* checklist item, toggling its `completed` state twice SHALL restore the item to its original `completed` value, and the checklist's `completionPct` computed before and after the double-toggle SHALL be equal.

**Validates: Requirements 2.7**

### Property 6: Checklist summary widget row renders all required fields

*For any* checklist object (with or without a linked project), the rendered widget row SHALL contain the checklist's title, the project name (or the string `"Global"` when `projectId` is null), and the completion percentage as a numeric string.

**Validates: Requirements 3.2, 3.3**

### Property 7: Checklist summary widget is independent of the date range filter

*For any* date range value passed to `DashboardClient`, the set of checklists rendered by `ChecklistSummaryWidget` SHALL be identical — the widget receives its data from a separate prop that is not filtered by date.

**Validates: Requirements 3.5**

### Property 8: Workflow diagram phase node states are mutually exclusive and exhaustive

*For any* `currentPhase` value from `PHASES_ORDER` and any `skippedDesignQA` boolean, the `buildPhaseNodeData` function SHALL assign exactly one state from `{completed, active, pending, skipped}` to each of the seven phases. Exactly one node SHALL be in state `active` (or zero nodes when `status === "COMPLETED"`). All phases that precede the active phase in `PHASES_ORDER` SHALL be in state `completed` (or `skipped` if they were skipped).

**Validates: Requirements 4.2, 4.3, 4.6**

### Property 9: Activity log computations are consistent with input data

*For any* array of `phase_changed` activity records for a single project, (a) the computed `avgDays` for each phase SHALL equal the arithmetic mean of the durations between consecutive timestamps where that phase was the origin, and (b) the `cycleCount` for each phase SHALL equal the number of times that phase appears as a destination in the activity log.

**Validates: Requirements 4.5, 4.9**

### Property 10: Status tag priority ordering is total and deterministic

*For any* project state, `computeStatusTag` SHALL return at most one tag. When multiple tag conditions are satisfied simultaneously, the returned tag SHALL always be the highest-priority applicable tag according to the order: Blocked > Overdue > Needs Assistance > In Review > Pending. The returned tag's `color` and `bgColor` SHALL match the specification for that tag type.

**Validates: Requirements 5.1, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9**

### Property 11: Avg completion time formula is correct and rounded

*For any* non-empty array of completed tasks where each task has `createdAt <= updatedAt`, `computeAvgCompletionTime` SHALL return a non-negative number rounded to exactly one decimal place that equals the arithmetic mean of `(updatedAt - createdAt)` in days across all tasks in the array.

**Validates: Requirements 6.2, 6.4**

### Property 12: Avg completion time cell highlighting follows team average

*For any* array of `userPerformance` entries with `avgCompletionTime` values, a cell SHALL be highlighted amber if and only if its `avgCompletionTime` is strictly greater than the arithmetic mean of all non-null `avgCompletionTime` values in the array.

**Validates: Requirements 6.5, 6.6**

---

## Error Handling

### Server Action Errors

All server actions already throw typed errors (`"Unauthorized"`, `"Forbidden"`, `"Only Admin can mark tasks as completed"`). Client components catch these in `try/catch` blocks inside `startTransition` callbacks and surface them as inline error messages using a local `error` state string rendered below the triggering control.

```typescript
const [error, setError] = useState<string | null>(null)

async function handleAction() {
  setError(null)
  try {
    await serverAction(...)
  } catch (e) {
    setError(e instanceof Error ? e.message : "Something went wrong")
  }
}
```

### Validation Errors

Client-side validation runs before any server call:
- Empty task/checklist title → inline error, no server call
- Empty checklist item title → inline error, no server call

### Empty States

Every new panel/widget has an explicit empty state:
- **TaskPanel**: "No tasks yet — create the first one" with a `Plus` icon
- **ChecklistPanel**: "No checklists yet" with a `ListChecks` icon
- **ChecklistSummaryWidget**: "No checklists yet" with a `ListChecks` icon
- **WorkflowDiagram**: always renders (7 phases always exist)

### Division by Zero

`completionPct()` guards against zero-item checklists by returning `0` immediately. `avgCompletionTime` returns `null` (not `0`) when there are no completed tasks, and the UI renders `"—"`.

---

## Testing Strategy

### Unit Tests

Focus on pure functions that contain non-trivial logic:

- `completionPct(items)` — zero items, all complete, partial, rounding edge cases
- `computeStatusTag(project, ...)` — each tag type, priority ordering, null case
- `computeAvgCompletionTime(tasks)` — empty array, single task, multiple tasks, rounding
- `buildPhaseNodeData(activities, revisions, currentPhase)` — skipped phase detection, cycle counting, time calculation
- Task transition guard helper — each role × each status combination

### Property-Based Tests

Use **fast-check** (TypeScript-native PBT library). Each test runs a minimum of 100 iterations.

**Tag format: `Feature: platform-enhancement, Property {N}: {property_text}`**

**Property 1 test** — `fc.array(fc.boolean())` generates item completion arrays of arbitrary length (including empty). Assert `completionPct` returns an integer in [0, 100] and matches the formula.

**Property 2 test** — `fc.stringMatching(/^\s+$/)` generates whitespace-only strings. Assert the validation function returns an error and the mock server action is not called.

**Property 3 test** — `fc.constantFrom("PROJECT_MANAGER","DESIGNER","DEVELOPER","QA","VIEWER")`. Assert the transition guard never includes `"COMPLETED"` for any non-Admin role.

**Property 4 test** — `fc.record({creatorId: fc.string(), userId: fc.string(), role: fc.constantFrom(...nonAdminRoles)})` where `userId !== creatorId`. Assert the delete button is not rendered.

**Property 5 test** — `fc.boolean()` as initial `completed` state. Assert double-toggle restores original value and `completionPct` is unchanged.

**Property 6 test** — `fc.record({title: fc.string(), projectId: fc.option(fc.string()), projectName: fc.option(fc.string()), items: fc.array(fc.boolean())})`. Assert rendered row contains title, project name or "Global", and percentage string.

**Property 7 test** — `fc.constantFrom("all","1y","6m","1m","1w")` as date range. Assert the checklist prop passed to the widget is reference-equal regardless of date range value.

**Property 8 test** — `fc.constantFrom(...PHASES_ORDER)` × `fc.boolean()` for `skippedDesignQA`. Assert exactly one `active` node (or zero for DELIVERED), all prior phases `completed`/`skipped`, all later phases `pending`, no phase has two states.

**Property 9 test** — `fc.array(fc.record({phase: fc.constantFrom(...PHASES_ORDER), timestamp: fc.date()}))`. Assert `avgDays` equals manual mean and `cycleCount` equals occurrence count.

**Property 10 test** — `fc.record({status, deadline, currentPhase, lastPhaseChangeDate, inNeedsAssistance})` generating all combinations. Assert returned tag is the highest-priority applicable one and its color matches the spec.

**Property 11 test** — `fc.array(fc.record({createdAt: fc.date(), updatedAt: fc.date()}), {minLength: 1})` with `updatedAt >= createdAt`. Assert result is non-negative, rounded to 1 decimal, equals manual mean.

**Property 12 test** — `fc.array(fc.option(fc.float({min: 0, max: 100})), {minLength: 1})`. Assert cells above the mean are flagged amber and cells at or below are not.

### Integration Tests

- `getProjectTasks` and `getProjectChecklists` return correct data shapes from a seeded test database
- `getAdminInsights` returns `avgCompletionTime` as a number or null per user
- `getAllChecklistsForUser` returns checklists with correct project name join

### Responsiveness

Manual verification at 320px, 768px, 1280px, 1920px breakpoints. The TaskPanel columns switch from horizontal scroll to vertical stack at `max-width: 768px` via a CSS media query. The WorkflowDiagram's pan/zoom container has `overflow: hidden` and `min-width: 0` to prevent container overflow at any viewport width.
