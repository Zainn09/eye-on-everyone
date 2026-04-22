# Implementation Plan: Eye-On Everyone Platform Enhancement

## Overview

Implement six additive feature areas on top of the existing Next.js app: Task Management Panel, Checklist Panel, Checklist Summary Widget, Visual Workflow Diagram, Status Intelligence Tags, and Avg Completion Time in Insights. All work is purely additive — no existing routes, Prisma schema, or server actions are broken. Implementation order: shared types → pure utilities → server actions → React components → page wiring → integration.

## Tasks

- [ ] 1. Set up shared types and testing infrastructure
  - Create `src/types/platform.ts` with all shared prop interfaces: `TaskWithRelations`, `TaskPanelProps`, `ChecklistWithItems`, `ChecklistItem`, `ChecklistPanelProps`, `ChecklistSummaryWidgetProps`, `WorkflowDiagramProps`, `PhaseNodeData`, `StatusTagType`, `StatusTagConfig`, `StatusTagProps`
  - Install `fast-check`, `vitest`, and `@vitest/ui` as dev dependencies: `npm install --save-dev fast-check vitest @vitest/ui`
  - Add `vitest.config.ts` at the workspace root configured for TypeScript with `globals: true` and `environment: "node"`
  - Add `"test": "vitest --run"` and `"test:watch": "vitest"` scripts to `package.json`
  - Create `src/__tests__/` directory with a `.gitkeep` placeholder
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [ ] 2. Implement `computeStatusTag` pure utility
  - Create `src/lib/statusTags.ts` exporting `computeStatusTag(project, needsAssistanceHighProjects, now?)` and the `StatusTagConfig` / `StatusTagType` types
  - Implement the five-level priority check in order: Blocked → Overdue → Needs Assistance → In Review → Pending; return `null` when none apply
  - The "Needs Assistance" check covers both: project name in `needsAssistanceHighProjects` array OR last `phase_changed` activity older than 14 days
  - Color map: Blocked/Overdue → `#EF4444`, Needs Assistance → `#F59E0B`, In Review → `#06B6D4`, Pending → `#6B7280`
  - _Requirements: 5.1, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ]* 2.1 Write property test for `computeStatusTag` — Property 10
    - **Property 10: Status tag priority ordering is total and deterministic**
    - Generate all combinations of `{status, deadline, currentPhase, lastPhaseChangeDate, inNeedsAssistance}` with `fc.record`
    - Assert at most one tag is returned; when multiple conditions are satisfied the returned tag is the highest-priority one; `color` and `bgColor` match the spec
    - **Validates: Requirements 5.1, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9**

- [ ] 3. Implement `StatusTag` React component
  - Create `src/components/StatusTag.tsx` as a `"use client"` component accepting `{ tag: StatusTagConfig | null }`
  - Render `null` when `tag` is `null`; otherwise render a `<span>` using the existing `.badge` CSS class with inline `color` and `background` overrides from `tag.color` / `tag.bgColor`
  - Export `StatusTag` as a named export
  - _Requirements: 5.2, 5.3_

- [ ] 4. Implement `getAllChecklistsForUser` server action
  - Add `getAllChecklistsForUser()` to `src/actions/checklists.ts`
  - Query `prisma.checklist.findMany` including `items: { select: { completed: true } }` and `project: { select: { id: true, name: true } }`, ordered by `createdAt desc`
  - Guard with `auth()` — return `[]` if unauthenticated
  - _Requirements: 3.1, 3.2_

- [ ] 5. Update `getAdminInsights` to add `avgCompletionTime` per user
  - In `src/actions/insights.ts`, extend the `userPerformance` mapping to compute `avgCompletionTime`
  - Filter `completedTasks` to those where both `createdAt` and `updatedAt` exist; compute arithmetic mean of `(updatedAt - createdAt)` in days; round to one decimal place using `Math.round(... * 10) / 10`; return `null` when there are no qualifying tasks
  - The formula: `Math.round((sum of ms durations / count / 86400000) * 10) / 10`
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 5.1 Write property test for `computeAvgCompletionTime` — Property 11
    - **Property 11: Avg completion time formula is correct and rounded**
    - Extract the computation into a standalone `computeAvgCompletionTime(tasks)` helper in `src/lib/insightsUtils.ts` and import it from `insights.ts`
    - Generate `fc.array(fc.record({createdAt: fc.date(), updatedAt: fc.date()}), {minLength: 1})` with `updatedAt >= createdAt` enforced via `fc.filter`
    - Assert result is non-negative, rounded to exactly 1 decimal place, and equals the manually computed mean
    - **Validates: Requirements 6.2, 6.4**

- [ ] 6. Implement `TaskPanel` component
  - Create `src/app/(dashboard)/projects/[id]/TaskPanel.tsx` as a `"use client"` component
  - Accept `TaskPanelProps` from `src/types/platform.ts`; manage optimistic task list with `useOptimistic` and mutations with `useTransition`
  - Render four status columns (TODO, IN_PROGRESS, IN_REVIEW, COMPLETED) as a horizontally scrollable strip on desktop; stack vertically at `max-width: 768px` via a CSS media query or inline responsive style
  - Each column header shows the status label and a count badge using the existing `Badge` component from `src/components/ui`
  - Inline create form at the top of the TODO column: title (required), priority select, assignee select from `users` prop, due date input; validate title is non-empty and non-whitespace before calling `createTask`
  - Task cards show title, priority badge, assignee name, due date, and a "Move →" button; derive allowed next status with a local helper (`TODO→IN_PROGRESS`, `IN_PROGRESS→IN_REVIEW`, `IN_REVIEW→COMPLETED` Admin-only); disable "Mark Complete" for non-Admins with a tooltip
  - Trash icon on each card visible only to Admins; calls `deleteTask`
  - Empty state: `Plus` icon + "No tasks yet — create the first one"
  - Catch server action errors in `try/catch` inside `startTransition`; surface as inline `error` state string
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [ ]* 6.1 Write property test for non-Admin task transition guard — Property 3
    - **Property 3: Non-Admin users cannot transition tasks to COMPLETED**
    - Extract the transition guard into a standalone `getAllowedNextStatuses(currentStatus, role)` helper in `src/lib/taskUtils.ts` and import it in `TaskPanel`
    - Use `fc.constantFrom("PROJECT_MANAGER","DESIGNER","DEVELOPER","QA","VIEWER")` × `fc.constantFrom("TODO","IN_PROGRESS","IN_REVIEW")` 
    - Assert `getAllowedNextStatuses` never includes `"COMPLETED"` for any non-Admin role
    - **Validates: Requirements 1.6, 1.9**

  - [ ]* 6.2 Write property test for whitespace title validation — Property 2
    - **Property 2: Whitespace-only input is always rejected**
    - Use `fc.stringMatching(/^\s+$/)` to generate whitespace-only strings
    - Assert the client-side `validateTitle` function (extracted to `src/lib/taskUtils.ts`) returns a non-empty error string and that a mock `createTask` is never called
    - **Validates: Requirements 1.4, 2.5**

- [ ] 7. Implement `ChecklistPanel` component
  - Create `src/app/(dashboard)/projects/[id]/ChecklistPanel.tsx` as a `"use client"` component
  - Accept `ChecklistPanelProps` from `src/types/platform.ts`; manage optimistic checklist list with `useOptimistic` and mutations with `useTransition`
  - Implement `completionPct(items: ChecklistItem[]): number` as a module-level pure function: return `0` for empty arrays, otherwise `Math.round(completed / total * 100)`
  - Each checklist card: header with title, completion percentage, progress bar (`.progress` / `.progress-bar` CSS classes), delete button; item list with checkboxes calling `toggleChecklistItem`; inline "Add item" form calling `addChecklistItem`
  - Delete checklist button visible only when `currentUser.id === checklist.creator.id || currentUser.role === "ADMIN"`; calls `deleteChecklist`
  - Validate item title is non-empty and non-whitespace before calling `addChecklistItem`
  - Empty state: `ListChecks` icon + "No checklists yet"
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [ ]* 7.1 Write property test for `completionPct` — Property 1
    - **Property 1: Checklist completion percentage is bounded and correct**
    - Use `fc.array(fc.boolean())` to generate item completion arrays of arbitrary length including empty
    - Assert `completionPct` returns an integer in [0, 100]; when empty returns `0`; when non-empty equals `Math.round(completedCount / totalCount * 100)`
    - **Validates: Requirements 2.2, 2.3, 3.3**

  - [ ]* 7.2 Write property test for checklist delete button visibility — Property 4
    - **Property 4: Non-creator, non-Admin users cannot see the checklist delete button**
    - Use `fc.record({creatorId: fc.string(), userId: fc.string({minLength: 1}), role: fc.constantFrom("PROJECT_MANAGER","DESIGNER","DEVELOPER","QA","VIEWER")})` with `fc.filter` to ensure `userId !== creatorId`
    - Render `ChecklistPanel` in a test environment and assert the delete button is not present in the output
    - **Validates: Requirements 2.10**

  - [ ]* 7.3 Write property test for checklist item toggle round-trip — Property 5
    - **Property 5: Checklist item toggle is a round-trip**
    - Use `fc.boolean()` as the initial `completed` state
    - Assert that toggling twice restores the original value and that `completionPct` computed before and after the double-toggle is equal
    - **Validates: Requirements 2.7**

- [ ] 8. Checkpoint — Ensure all tests pass
  - Run `npm test` and confirm all property tests and unit tests pass; ask the user if any questions arise before continuing

- [ ] 9. Implement `ChecklistSummaryWidget` component
  - Create `src/app/(dashboard)/dashboard/ChecklistSummaryWidget.tsx` as a `"use client"` component
  - Accept `ChecklistSummaryWidgetProps` from `src/types/platform.ts`; the prop is NOT filtered by date range (it is a separate prop)
  - Render a vertical list of rows; each row shows: checklist title, project name (or the string `"Global"` when `projectId` is `null`), and completion percentage computed inline with `completionPct`
  - Project-linked rows wrap in a `<Link href={"/projects/" + checklist.projectId}>` for navigation
  - Empty state: `ListChecks` icon + "No checklists yet"
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 9.1 Write property test for widget row rendering — Property 6
    - **Property 6: Checklist summary widget row renders all required fields**
    - Use `fc.record({title: fc.string({minLength: 1}), projectId: fc.option(fc.string({minLength: 1})), projectName: fc.option(fc.string({minLength: 1})), items: fc.array(fc.boolean())})` 
    - Assert rendered row contains the checklist title, the project name or `"Global"`, and the completion percentage as a numeric string
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 9.2 Write property test for widget independence from date range — Property 7
    - **Property 7: Checklist summary widget is independent of the date range filter**
    - Use `fc.constantFrom("all","1y","6m","1m","1w")` as the date range value
    - Assert the checklist prop passed to `ChecklistSummaryWidget` is reference-equal regardless of the date range value (the widget receives a separate `checklists` prop not derived from `dateFilteredProjects`)
    - **Validates: Requirements 3.5**

- [ ] 10. Implement `WorkflowDiagram` component
  - Create `src/app/(dashboard)/projects/[id]/WorkflowDiagram.tsx` as a `"use client"` component
  - Accept `WorkflowDiagramProps` from `src/types/platform.ts`
  - Extract `buildPhaseNodeData(activities, revisions, currentPhase, status, skippedDesignQA): PhaseNodeData[]` as a module-level pure function returning one `PhaseNodeData` per phase in `PHASES_ORDER`
    - State assignment: phases before `currentPhase` in `PHASES_ORDER` → `"completed"` (or `"skipped"` if `skippedDesignQA && phase === "DESIGN_QA"`); `currentPhase` → `"active"` (or `"completed"` when `status === "COMPLETED"`); phases after → `"pending"`
    - `cycleCount`: count occurrences of each phase as a destination in `phase_changed` activities by parsing `details` for `"to {PHASE}"`
    - `avgDays`: arithmetic mean of durations between consecutive `phase_changed` timestamps where that phase was the origin (same parsing logic as `computePhaseMetrics` in `insights.ts`)
    - `revisionCount`: count `revisions` where `type` matches the phase group
  - Implement pan/zoom with `useState({ x: 0, y: 0, scale: 1 })` and a wrapper `div` with CSS `transform`; mouse wheel adjusts `scale` clamped to [0.5, 2.0]; pointer drag adjusts `translate`
  - Render 7 phase nodes as `div` elements with inline styles per state: `completed` (filled, checkmark icon, phase color), `active` (pulsing CSS animation, phase color border glow), `pending` (muted grey `#374151`), `skipped` (dashed border, amber warning icon)
  - Connector lines between nodes as `div` elements with `border-top`; back-edge cycle indicators as SVG curved paths overlaid on the diagram
  - Show a repeat badge on nodes where `cycleCount > 1`
  - Use `useEffect` to detect `currentPhase` changes and apply a brief scale-up CSS animation to the newly active node
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 10.1 Write property test for `buildPhaseNodeData` phase states — Property 8
    - **Property 8: Workflow diagram phase node states are mutually exclusive and exhaustive**
    - Use `fc.constantFrom(...PHASES_ORDER)` × `fc.boolean()` for `skippedDesignQA`
    - Assert exactly one node is `active` (or zero when `status === "COMPLETED"`); all prior phases are `completed`/`skipped`; all later phases are `pending`; no phase has two states; all 7 phases are present
    - **Validates: Requirements 4.2, 4.3, 4.6**

  - [ ]* 10.2 Write property test for activity log computations — Property 9
    - **Property 9: Activity log computations are consistent with input data**
    - Use `fc.array(fc.record({phase: fc.constantFrom(...PHASES_ORDER), timestamp: fc.date()}))` to generate synthetic activity records
    - Assert `avgDays` equals the manually computed arithmetic mean of durations and `cycleCount` equals the occurrence count of each phase as a destination
    - **Validates: Requirements 4.5, 4.9**

- [ ] 11. Checkpoint — Ensure all tests pass
  - Run `npm test` and confirm all property tests pass; ask the user if any questions arise before continuing

- [ ] 12. Update `src/app/(dashboard)/projects/[id]/page.tsx` to fetch tasks and checklists
  - Extend the `Promise.all` to also call `getProjectTasks(id)` (already exists in `src/actions/tasks.ts`) and `getProjectChecklists(id)` (already exists in `src/actions/checklists.ts`)
  - Pass the results as `tasks` and `checklists` props to `ProjectDetailClient` after `JSON.parse(JSON.stringify(...))`
  - Add the corresponding imports at the top of the file
  - _Requirements: 1.1, 2.1_

- [ ] 13. Implement the full body of `ProjectDetailClient`
  - In `src/app/(dashboard)/projects/[id]/ProjectDetailClient.tsx`, add `tasks`, `checklists` to the props interface (types from `src/types/platform.ts`)
  - Import and render `TaskPanel`, `ChecklistPanel`, `WorkflowDiagram`, and `StatusTag`
  - Add `StatusTag` to the project header area, passing the result of `computeStatusTag(project, [], new Date())` (the `needsAssistanceHighProjects` list is empty here since this is the per-project view)
  - Add `WorkflowDiagram` in a dedicated section below the existing phase stepper, passing the project with its `activities` and `revisions`
  - Add `TaskPanel` and `ChecklistPanel` as tabbed or sectioned panels below the pages list, passing `initialTasks={tasks}`, `initialChecklists={checklists}`, `users`, and `currentUser`
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 4.1, 5.2, 5.3_

- [ ] 14. Update `src/app/(dashboard)/dashboard/page.tsx` to fetch all checklists
  - Add `getAllChecklistsForUser()` to the `Promise.all` fetch block
  - Pass the result as a `checklists` prop to `DashboardClient` after `JSON.parse(JSON.stringify(...))`
  - Add the import for `getAllChecklistsForUser` from `src/actions/checklists`
  - _Requirements: 3.1_

- [ ] 15. Update `DashboardClient` to add `ChecklistSummaryWidget` and `StatusTag` on project cards
  - In `src/app/(dashboard)/dashboard/DashboardClient.tsx`, add `checklists: ChecklistSummaryWidgetProps["checklists"]` to `DashboardClientProps`
  - Import `ChecklistSummaryWidget` and render it in the right sidebar below the Activity feed, passing `checklists` directly (not filtered by date range)
  - Import `StatusTag` and `computeStatusTag` from their respective modules; render `<StatusTag tag={computeStatusTag(project, [], new Date())} />` inside each project card in the projects grid, positioned below the status/phase badges row
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.2, 5.3_

- [ ] 16. Update `InsightsClient` to add the "Avg. Days" column
  - In `src/app/(dashboard)/insights/InsightsClient.tsx`, add `avgCompletionTime: number | null` to the `userPerformance` entry type in `InsightsClientProps`
  - Add `"Avg. Days"` as the last column header in the Individual Performance table
  - Compute `teamAvg` with `useMemo` over all non-null `avgCompletionTime` values
  - Render each cell: `"—"` when `null`; the numeric value with amber color (`#fbbf24`) when strictly above `teamAvg`; default text color when at or below `teamAvg`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 16.1 Write property test for avg completion time cell highlighting — Property 12
    - **Property 12: Avg completion time cell highlighting follows team average**
    - Use `fc.array(fc.option(fc.float({min: 0, max: 100})), {minLength: 1})` to generate arrays of nullable completion times
    - Assert cells with `avgCompletionTime` strictly greater than the arithmetic mean of all non-null values are flagged amber, and cells at or below are not
    - **Validates: Requirements 6.5, 6.6**

- [ ] 17. Final checkpoint — Ensure all tests pass and integration is complete
  - Run `npm test` to confirm all 12 property tests and any unit tests pass
  - Verify TypeScript compiles without errors: `npx tsc --noEmit`
  - Ask the user if any questions arise before considering the feature complete

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at natural breaks
- Property tests validate the 12 universal correctness properties defined in the design document
- All new UI follows the existing dark-theme design system (CSS variables in `globals.css`, `ui.tsx` primitives, `recharts`, `lucide-react`)
- No Prisma schema changes are required — all models already exist
- `fast-check` and `vitest` must be installed (Task 1) before any `*` test tasks can run
