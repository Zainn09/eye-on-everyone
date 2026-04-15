# FlowDesk Testing Guide

## 🧪 Manual Testing Checklist

### 1. User Registration & Approval Flow

#### Test New User Signup
- [ ] Navigate to `/signup`
- [ ] Fill in: Name, Email, Password (min 6 chars)
- [ ] Click "Sign Up"
- [ ] **Expected**: Success message → redirect to `/waiting-approval`
- [ ] **Expected**: See "Awaiting Approval" page with status steps

#### Test Pending User Cannot Login
- [ ] Navigate to `/login`
- [ ] Try to log in with the new user credentials
- [ ] **Expected**: Error message "Your account is pending admin approval"
- [ ] **Expected**: Link to "Check approval status" visible

#### Test Admin Approval Workflow
- [ ] Log in as admin: `admin@projectmanager.com` / `password123`
- [ ] Navigate to `/admin` (or click "Team" in sidebar)
- [ ] **Expected**: See "Pending Approvals" section at top with yellow/orange styling
- [ ] **Expected**: New user appears in pending list
- [ ] Select a role from dropdown (e.g., "Designer")
- [ ] Click "Approve" button
- [ ] **Expected**: User moves from pending to active section
- [ ] **Expected**: Success notification

#### Test Approved User Can Login
- [ ] Log out
- [ ] Log in with the newly approved user credentials
- [ ] **Expected**: Login succeeds → redirect to `/dashboard`
- [ ] **Expected**: User sees dashboard with appropriate role permissions

#### Test User Rejection
- [ ] Sign up another test user
- [ ] Log in as admin
- [ ] Go to `/admin`
- [ ] Click "Reject" on the new pending user
- [ ] Log out and try to log in as rejected user
- [ ] **Expected**: Error message "Your account has been rejected"

---

### 2. Design QA Skip Detection & Visual Indicators

#### Test QA Skip Flow
- [ ] Log in as admin or PM
- [ ] Create a new project (any details)
- [ ] **Expected**: No "Design QA" toggle visible in creation form
- [ ] Go to project detail page
- [ ] **Expected**: Project starts in "DESIGN" phase
- [ ] Click "Move to Client Approval" (skipping Design QA)
- [ ] **Expected**: Phase changes to "DESIGN_APPROVAL"

#### Test Neon Red Glow on Dashboard
- [ ] Navigate to `/dashboard`
- [ ] Find the project that skipped QA
- [ ] **Expected**: Project card has red pulsing glow border
- [ ] **Expected**: "⚠ QA Skipped" badge visible on card
- [ ] Hover over card
- [ ] **Expected**: Glow animation intensifies

#### Test Neon Red Banner on Detail Page
- [ ] Click on the QA-skipped project
- [ ] **Expected**: Red banner at top of page
- [ ] **Expected**: Banner text: "⚠ Design QA Skipped"
- [ ] **Expected**: Explanation text visible

#### Test Workflow Stepper Indicator
- [ ] On same project detail page, scroll to workflow stepper
- [ ] **Expected**: "Design QA" step has red dashed border
- [ ] **Expected**: Red X icon instead of checkmark
- [ ] **Expected**: "Skipped" label in red text
- [ ] **Expected**: Connector line to next phase is red

#### Test Normal QA Flow (No Red Glow)
- [ ] Create another new project
- [ ] Move from DESIGN → DESIGN_QA
- [ ] Move from DESIGN_QA → DESIGN_APPROVAL
- [ ] Go to dashboard
- [ ] **Expected**: NO red glow on this project card
- [ ] **Expected**: NO "QA Skipped" badge
- [ ] Go to project detail
- [ ] **Expected**: NO red banner
- [ ] **Expected**: Design QA step shows as completed (green)

---

### 3. Notification System

#### Test Notification Bell
- [ ] Log in as any user
- [ ] Look at header (top right)
- [ ] **Expected**: Bell icon visible
- [ ] If unread notifications exist:
  - [ ] **Expected**: Red badge with count (e.g., "3")
  - [ ] **Expected**: Badge shows "9+" if more than 9 unread

#### Test Notification Dropdown
- [ ] Click bell icon
- [ ] **Expected**: Dropdown opens with notification list
- [ ] **Expected**: Unread notifications have purple background
- [ ] **Expected**: Unread notifications have blue dot indicator
- [ ] **Expected**: Each notification shows: title, message, timestamp

#### Test Mark as Read
- [ ] Click on an unread notification
- [ ] **Expected**: Purple background disappears
- [ ] **Expected**: Blue dot disappears
- [ ] **Expected**: Checkmark icon appears
- [ ] **Expected**: Badge count decreases

#### Test Mark All as Read
- [ ] If multiple unread notifications exist
- [ ] Click "Mark all read" button (top right of dropdown)
- [ ] **Expected**: All notifications marked as read
- [ ] **Expected**: Badge disappears from bell icon
- [ ] **Expected**: All purple backgrounds removed

#### Test Notification Generation
- [ ] As admin, approve a pending user
- [ ] Log in as that user
- [ ] **Expected**: Notification "Account Approved" visible
- [ ] As PM, create a new project
- [ ] Log in as admin
- [ ] **Expected**: Notification "New Project Created" visible
- [ ] Add a comment to a project
- [ ] Log in as project creator
- [ ] **Expected**: Notification "New Comment" visible

---

### 4. Admin Panel Features

#### Test Pending Users Section
- [ ] Log in as admin
- [ ] Navigate to `/admin`
- [ ] **Expected**: "Pending Approvals" section at top
- [ ] **Expected**: Yellow/orange styling for pending section
- [ ] **Expected**: Count badge showing number of pending users
- [ ] If no pending users:
  - [ ] **Expected**: Green success message "No pending approvals — all caught up!"

#### Test Role Management
- [ ] In "Active Team Members" section
- [ ] Change a user's role via dropdown
- [ ] **Expected**: Role updates immediately
- [ ] **Expected**: Badge color changes based on role
- [ ] Refresh page
- [ ] **Expected**: Role change persists

#### Test Rejected Users Section
- [ ] If rejected users exist
- [ ] **Expected**: "Rejected Users" section visible at bottom
- [ ] **Expected**: Red styling for rejected section
- [ ] **Expected**: Users shown with "Rejected" badge

---

### 5. Project Workflow & Phase Transitions

#### Test Phase Transitions
- [ ] Create a new project
- [ ] **Expected**: Starts in "DESIGN" phase
- [ ] Click available phase transition buttons
- [ ] **Expected**: Only valid transitions shown (based on role)
- [ ] Move through phases: DESIGN → DESIGN_QA → DESIGN_APPROVAL → DEVELOPMENT → DEV_QA → CLIENT_PREVIEW → DELIVERED
- [ ] **Expected**: Each transition updates project status
- [ ] **Expected**: Activity log records each phase change
- [ ] **Expected**: Relevant team members receive notifications

#### Test Role-Based Permissions
- [ ] Log in as Designer
- [ ] **Expected**: Can move DESIGN → DESIGN_QA
- [ ] **Expected**: Cannot move to DESIGN_APPROVAL (PM/Admin only)
- [ ] Log in as QA
- [ ] **Expected**: Can move DESIGN_QA → DESIGN_APPROVAL or back to DESIGN
- [ ] Log in as Developer
- [ ] **Expected**: Can move DEVELOPMENT → DEV_QA

#### Test Workflow Stepper Visual
- [ ] On project detail page
- [ ] **Expected**: Current phase highlighted with purple glow
- [ ] **Expected**: Completed phases show green checkmarks
- [ ] **Expected**: Pending phases show gray
- [ ] **Expected**: Connector lines between phases
- [ ] **Expected**: Smooth animations on phase changes

---

### 6. Network Access & Multi-Device Testing

#### Test Local Network Access
- [ ] On development machine, run `npm run dev`
- [ ] Note the local IP address (e.g., 192.168.1.19)
- [ ] On another device (phone, tablet, another computer) on same WiFi
- [ ] Navigate to `http://192.168.x.x:3000` (use your IP)
- [ ] **Expected**: App loads correctly
- [ ] **Expected**: Can log in
- [ ] **Expected**: All features work

#### Test Cross-Device Session
- [ ] Log in on Device A
- [ ] Log in as same user on Device B
- [ ] Create a project on Device A
- [ ] Refresh Device B
- [ ] **Expected**: New project appears on Device B
- [ ] Add comment on Device B
- [ ] Refresh Device A
- [ ] **Expected**: Comment appears on Device A

---

### 7. Mobile Responsive Testing

#### Test on Mobile Device (or resize browser to mobile width)
- [ ] **Expected**: Sidebar hidden by default
- [ ] **Expected**: Hamburger menu appears (if implemented)
- [ ] **Expected**: Stats grid shows 2 columns on small screens
- [ ] **Expected**: Stats grid shows 1 column on very small screens
- [ ] **Expected**: Project cards stack vertically
- [ ] **Expected**: Kanban board scrolls horizontally
- [ ] **Expected**: Forms remain usable
- [ ] **Expected**: Modals adapt to screen size
- [ ] **Expected**: Tables scroll horizontally if needed
- [ ] **Expected**: Text remains readable (no overflow)

---

### 8. Dashboard Features

#### Test Project Filtering
- [ ] On dashboard, use search box
- [ ] Type project name or client name
- [ ] **Expected**: Projects filter in real-time
- [ ] Use status filter dropdown
- [ ] **Expected**: Only projects with selected status shown
- [ ] Use phase filter dropdown
- [ ] **Expected**: Only projects in selected phase shown
- [ ] Use priority filter dropdown
- [ ] **Expected**: Only projects with selected priority shown
- [ ] Clear all filters
- [ ] **Expected**: All projects shown again

#### Test Stats Cards
- [ ] **Expected**: "Total Projects" shows correct count
- [ ] **Expected**: "In Progress" shows correct count
- [ ] **Expected**: "Completed" shows correct count
- [ ] **Expected**: "Overdue" shows projects past deadline
- [ ] **Expected**: Each stat card has appropriate icon and color

#### Test Activity Sidebar
- [ ] **Expected**: Recent activity list visible on right
- [ ] **Expected**: Shows last 15 activities
- [ ] **Expected**: Each activity has icon, user name, action, timestamp
- [ ] **Expected**: Click activity → navigates to project
- [ ] **Expected**: Activities update when actions performed

---

### 9. Kanban Board

#### Test Board Layout
- [ ] Navigate to `/board`
- [ ] **Expected**: 7 columns (one per phase)
- [ ] **Expected**: Each column shows phase name and project count
- [ ] **Expected**: Projects sorted by priority (Urgent → High → Medium → Low)

#### Test Phase Movement from Board
- [ ] Find a project card
- [ ] **Expected**: Available transition buttons shown at bottom
- [ ] Click transition button
- [ ] **Expected**: Project moves to new column
- [ ] **Expected**: Column counts update
- [ ] **Expected**: Activity logged

---

### 10. Analytics Page

#### Test Charts & Visualizations
- [ ] Navigate to `/analytics`
- [ ] **Expected**: Pie chart showing status distribution
- [ ] **Expected**: Bar chart showing projects by phase
- [ ] **Expected**: Stats cards at top
- [ ] **Expected**: Completion rate percentage
- [ ] **Expected**: High priority count
- [ ] **Expected**: Charts update when data changes

---

### 11. Shareable Client Links

#### Test Share Link Generation
- [ ] Go to any project detail page
- [ ] Click "Share Link" button
- [ ] **Expected**: Button changes to "Copied!" with green styling
- [ ] **Expected**: Link copied to clipboard
- [ ] Paste link in new browser tab (or share with someone)
- [ ] **Expected**: Public view of project loads
- [ ] **Expected**: No login required
- [ ] **Expected**: Shows project name, client, brief, progress, deliverables
- [ ] **Expected**: Does NOT show comments, activity, or admin features

---

## 🐛 Known Issues to Watch For

### Critical
- None currently identified

### Minor
- None currently identified

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: Development / Production

| Test Category | Pass | Fail | Notes |
|--------------|------|------|-------|
| User Registration & Approval | ☐ | ☐ | |
| QA Skip Detection | ☐ | ☐ | |
| Notification System | ☐ | ☐ | |
| Admin Panel | ☐ | ☐ | |
| Project Workflow | ☐ | ☐ | |
| Network Access | ☐ | ☐ | |
| Mobile Responsive | ☐ | ☐ | |
| Dashboard Features | ☐ | ☐ | |
| Kanban Board | ☐ | ☐ | |
| Analytics | ☐ | ☐ | |
| Shareable Links | ☐ | ☐ | |

Overall Status: ☐ Pass ☐ Fail
```

---

## 🚀 Quick Start for Testing

```bash
# 1. Ensure database is seeded
npm run seed

# 2. Start dev server on local network
npm run dev

# 3. Access from any device
# http://192.168.x.x:3000

# 4. Use demo accounts (password: password123)
# - admin@projectmanager.com
# - pm@projectmanager.com
# - designer@projectmanager.com
# - dev@projectmanager.com
# - qa@projectmanager.com
```

---

**Happy Testing! 🎉**
