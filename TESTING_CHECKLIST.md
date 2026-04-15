# ✅ Testing Checklist - FlowDesk Project Manager

## Pre-Testing Setup

- [ ] Ensure both devices are on the same WiFi network
- [ ] Run `npm run dev` on the main computer
- [ ] Note the detected IP address from the console output
- [ ] Have demo credentials ready

---

## Test 1: Local Testing (This Computer)

### Setup
```bash
npm run dev
```

### Tests
- [ ] Open http://localhost:3000 in browser
- [ ] Page loads without errors
- [ ] Login page displays correctly
- [ ] Enter credentials: `admin@projectmanager.com` / `password123`
- [ ] Click "Login" button
- [ ] Successfully redirected to dashboard
- [ ] Dashboard displays projects
- [ ] Sidebar navigation works
- [ ] Can navigate to different pages (Analytics, Board, Admin)

### Expected Result
✅ All features work on localhost

---

## Test 2: Network Testing (Other Device)

### Setup
1. Note the network IP from console (e.g., `192.168.1.17`)
2. Go to another device on the same WiFi
3. Open browser

### Tests
- [ ] Open http://192.168.1.17:3000 (use your detected IP)
- [ ] Page loads without errors
- [ ] No "Blocked cross-origin request" warnings in console
- [ ] Login page displays correctly
- [ ] Enter credentials: `admin@projectmanager.com` / `password123`
- [ ] Click "Login" button
- [ ] Successfully redirected to dashboard
- [ ] Dashboard displays projects
- [ ] All features work the same as localhost

### Expected Result
✅ All features work on network IP

---

## Test 3: Share Links (No Login Required)

### Setup
1. Note the share links from console output
2. Can test on same device or different device

### Tests
- [ ] Open first share link: http://192.168.1.17:3000/share/cmnokv8zr0008u33s3x63i77w
- [ ] Project preview displays without login
- [ ] Can view project details
- [ ] Can view workflow phases
- [ ] Go back and open second share link: http://192.168.1.17:3000/share/cmnokv90t000zu33sf88hzj7n
- [ ] Different project displays
- [ ] All share links work without authentication

### Expected Result
✅ Share links work without login

---

## Test 4: Admin Panel Testing

### Setup
1. Login as admin: `admin@projectmanager.com` / `password123`
2. Navigate to Admin panel

### Tests
- [ ] Admin panel loads
- [ ] Can see user list
- [ ] Can see project list
- [ ] Can manage user roles
- [ ] Can view pending users (if any)
- [ ] Can approve/reject pending users
- [ ] Can create new projects
- [ ] Can delete projects

### Expected Result
✅ Admin panel fully functional

---

## Test 5: Project Management Testing

### Setup
1. Login as PM: `pm@projectmanager.com` / `password123`
2. Navigate to Projects

### Tests
- [ ] Can view all projects
- [ ] Can create new project
- [ ] Can view project details
- [ ] Can move project through phases
- [ ] Can view workflow timeline
- [ ] Can add comments
- [ ] Can view activity log
- [ ] Can access Kanban board

### Expected Result
✅ Project management features work

---

## Test 6: Multi-Device Simultaneous Testing

### Setup
1. Open http://localhost:3000 on main computer
2. Open http://192.168.1.17:3000 on another device
3. Login on both devices

### Tests
- [ ] Both devices show same projects
- [ ] Create new project on device 1
- [ ] Refresh device 2 - new project appears
- [ ] Move project phase on device 1
- [ ] Refresh device 2 - phase change appears
- [ ] Add comment on device 1
- [ ] Refresh device 2 - comment appears
- [ ] Both devices stay in sync

### Expected Result
✅ Real-time data sync works across devices

---

## Test 7: HMR (Hot Module Replacement) Testing

### Setup
1. Open http://192.168.1.17:3000 on another device
2. Keep browser open
3. Edit a file on main computer (e.g., change button text)

### Tests
- [ ] Save file on main computer
- [ ] Browser on other device auto-refreshes
- [ ] Changes appear without manual refresh
- [ ] No console errors about cross-origin requests

### Expected Result
✅ HMR works on network IP

---

## Test 8: Error Handling Testing

### Setup
1. Login as any user
2. Navigate to different pages

### Tests
- [ ] Try invalid login credentials
- [ ] See appropriate error message
- [ ] Try accessing admin panel as non-admin
- [ ] See permission denied message
- [ ] Try accessing non-existent project
- [ ] See 404 or error message
- [ ] Network error handling works

### Expected Result
✅ Error handling works correctly

---

## Test 9: Responsive Design Testing

### Setup
1. Open http://192.168.1.17:3000 on mobile device
2. Or use browser dev tools to simulate mobile

### Tests
- [ ] Layout adapts to mobile screen
- [ ] Navigation works on mobile
- [ ] Buttons are clickable on mobile
- [ ] Forms are usable on mobile
- [ ] No horizontal scrolling needed
- [ ] Text is readable on mobile

### Expected Result
✅ Responsive design works

---

## Test 10: Performance Testing

### Setup
1. Open browser dev tools (F12)
2. Go to Network tab
3. Navigate through app

### Tests
- [ ] Page load time < 3 seconds
- [ ] No failed requests
- [ ] No console errors
- [ ] Images load correctly
- [ ] CSS loads correctly
- [ ] JavaScript loads correctly

### Expected Result
✅ Performance is acceptable

---

## Summary

### Total Tests: 10
- [ ] Test 1: Local Testing
- [ ] Test 2: Network Testing
- [ ] Test 3: Share Links
- [ ] Test 4: Admin Panel
- [ ] Test 5: Project Management
- [ ] Test 6: Multi-Device Sync
- [ ] Test 7: HMR
- [ ] Test 8: Error Handling
- [ ] Test 9: Responsive Design
- [ ] Test 10: Performance

### Overall Status
- [ ] All tests passed ✅
- [ ] Some tests failed ⚠️
- [ ] Ready for production 🚀

---

## Demo Credentials

```
Password: password123

Accounts:
• admin@projectmanager.com (Admin)
• pm@projectmanager.com (Project Manager)
• designer@projectmanager.com (Designer)
• dev@projectmanager.com (Developer)
• qa@projectmanager.com (QA)
```

---

## Quick Commands

```bash
# Start dev server with auto-IP detection
npm run dev

# Direct Next.js dev server (if needed)
npm run dev:direct

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Seed database
npm run seed
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't access from other device | Check both devices on same WiFi, use correct IP from console |
| Login fails | Stop server (Ctrl+C), run `npm run dev` again |
| HMR not working | Restart server, check `next.config.js` has correct IP |
| IP changed | Run `npm run dev` again, it auto-detects new IP |
| Share links don't work | Use network IP, not localhost |

---

**Last Updated**: April 15, 2026  
**Status**: Ready for Testing ✅
