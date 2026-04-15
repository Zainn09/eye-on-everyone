# 🔗 Share URL Testing Guide

## Your Network Configuration

**Your Local IP:** `192.168.1.15`  
**Server Port:** `3000`  
**Server Status:** ✅ Running

---

## 📱 How to Test Share URLs on Other Devices

### Step 1: Access the App on Your Main Computer

1. Open your browser and go to:
   ```
   http://192.168.1.15:3000
   ```

2. Log in with admin credentials:
   - **Email:** `admin@projectmanager.com`
   - **Password:** `password123`

### Step 2: Get a Share Link

1. Navigate to **Dashboard** (`/dashboard`)
2. Click on any project to open the detail page
3. Look for the **"Share Link"** button in the top right corner
4. Click **"Share Link"**
5. The button will change to **"Copied!"** with green styling
6. The share URL is now in your clipboard

**Example Share URL Format:**
```
http://192.168.1.15:3000/share/[unique-token]
```

### Step 3: Test on Another Device

#### Option A: Manual Entry
1. On your other laptop/device (connected to same WiFi)
2. Open a browser
3. Type the share URL manually:
   ```
   http://192.168.1.15:3000/share/[token-from-clipboard]
   ```

#### Option B: Send via Message
1. Paste the copied URL into:
   - WhatsApp/Telegram to yourself
   - Email to yourself
   - Slack/Discord
2. Open the message on your other device
3. Click the link

#### Option C: QR Code (if available)
1. Use a QR code generator with the share URL
2. Scan with your phone/tablet

---

## ✅ What to Verify on the Shared View

### Public Access (No Login Required)
- [ ] Page loads without asking for login
- [ ] No authentication required
- [ ] Can view project details

### Project Information Displayed
- [ ] Project name visible
- [ ] Client name visible
- [ ] Project brief/description visible
- [ ] Current phase/status visible
- [ ] Deadline visible
- [ ] Progress percentage visible

### Workflow Progress
- [ ] Workflow stepper shows all phases
- [ ] Current phase is highlighted
- [ ] Completed phases show checkmarks
- [ ] Progress bar shows percentage

### Deliverables List
- [ ] All pages/tasks listed
- [ ] Page names visible
- [ ] Page types visible (Homepage, Product, etc.)
- [ ] Design status visible
- [ ] Development status visible
- [ ] Status badges color-coded

### What Should NOT Be Visible
- [ ] Comments section (hidden from public)
- [ ] Activity timeline (hidden from public)
- [ ] Edit buttons (no editing allowed)
- [ ] Delete buttons (no deletion allowed)
- [ ] Internal notes (private)
- [ ] Team member assignments (private)

### UI/UX
- [ ] FlowDesk logo visible
- [ ] "Client Preview View" badge visible
- [ ] Clean, professional layout
- [ ] Responsive on mobile devices
- [ ] No broken images or styles

---

## 🧪 Test Scenarios

### Scenario 1: Basic Share Link Test
```
1. Log in as admin on Device A (your main computer)
2. Go to Dashboard → Click "Luxe Fashion Store" project
3. Click "Share Link" button
4. Open browser on Device B (other laptop)
5. Paste URL: http://192.168.1.15:3000/share/[token]
6. ✅ Verify: Project loads without login
7. ✅ Verify: All public info visible
```

### Scenario 2: Multiple Projects
```
1. Get share links for 3 different projects
2. Test each link on Device B
3. ✅ Verify: Each link shows correct project
4. ✅ Verify: Links don't interfere with each other
```

### Scenario 3: Mobile Device Test
```
1. Get share link on computer
2. Send link to your phone (via WhatsApp/email)
3. Open link on phone
4. ✅ Verify: Mobile responsive layout
5. ✅ Verify: All content readable
6. ✅ Verify: No horizontal scrolling
```

### Scenario 4: Incognito/Private Mode
```
1. Get share link
2. Open in incognito/private browser window
3. ✅ Verify: Works without any cookies/session
4. ✅ Verify: No login prompt
```

### Scenario 5: Different Browsers
```
Test the same share link on:
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)
- [ ] Mobile browsers
```

### Scenario 6: Project with Skipped QA
```
1. Create a project and skip Design QA
   (Move DESIGN → CLIENT_APPROVAL directly)
2. Get share link for this project
3. Open on Device B
4. ✅ Verify: Red glow/warning NOT visible in public view
   (Internal indicators should be hidden from clients)
```

---

## 🔍 Troubleshooting

### Issue: "Cannot connect" or "Site can't be reached"

**Solution:**
1. Verify both devices are on the same WiFi network
2. Check your IP address hasn't changed:
   ```bash
   ipconfig | findstr IPv4
   ```
3. Ensure dev server is running:
   ```bash
   npm run dev
   ```
4. Try accessing from main computer first:
   ```
   http://192.168.1.15:3000
   ```

### Issue: "Invalid token" or "Project not found"

**Solution:**
1. Verify the share token is correct (no typos)
2. Check the project still exists in database
3. Try generating a new share link
4. Check browser console for errors

### Issue: Asks for login on shared link

**Solution:**
1. Verify URL starts with `/share/` not `/projects/`
2. Check middleware.ts has `/share` in public paths
3. Clear browser cache and try again
4. Try in incognito mode

### Issue: Styles broken or missing

**Solution:**
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console for 404 errors
3. Verify Next.js dev server is running
4. Check network tab for failed asset loads

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________
Main Device: ___________
Test Device: ___________

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| Share link copies to clipboard | ☐ | ☐ | |
| Link works on same device | ☐ | ☐ | |
| Link works on other laptop | ☐ | ☐ | |
| Link works on mobile | ☐ | ☐ | |
| No login required | ☐ | ☐ | |
| Project info visible | ☐ | ☐ | |
| Workflow progress visible | ☐ | ☐ | |
| Deliverables list visible | ☐ | ☐ | |
| Comments hidden | ☐ | ☐ | |
| Activity hidden | ☐ | ☐ | |
| Mobile responsive | ☐ | ☐ | |
| Works in incognito | ☐ | ☐ | |

Overall Status: ☐ Pass ☐ Fail
```

---

## 🎯 Quick Test Commands

### Get Your Current IP
```bash
ipconfig | findstr IPv4
```

### Check Server Status
```bash
# Server should show:
# - Local: http://localhost:3000
# - Network: http://0.0.0.0:3000
```

### Test URLs to Try

**Main App (requires login):**
```
http://192.168.1.15:3000
http://192.168.1.15:3000/login
http://192.168.1.15:3000/dashboard
```

**Share URLs (no login required):**
```
http://192.168.1.15:3000/share/[token-here]
```

**Example with actual token from database:**
```sql
-- To get a share token from database:
SELECT shareToken FROM Project LIMIT 1;
```

---

## 📱 Device Testing Checklist

### Desktop/Laptop (Other Computer)
- [ ] Windows laptop
- [ ] Mac laptop
- [ ] Linux machine

### Mobile Devices
- [ ] iPhone (Safari)
- [ ] Android phone (Chrome)
- [ ] iPad/Tablet

### Browsers
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari
- [ ] Mobile browsers

---

## 🔐 Security Verification

### Public Share Link Should:
- [ ] Work without authentication
- [ ] Show only public project information
- [ ] Hide sensitive data (comments, internal notes)
- [ ] Not allow editing
- [ ] Not allow deletion
- [ ] Not expose user information
- [ ] Use unique, non-guessable tokens

### Public Share Link Should NOT:
- [ ] Require login
- [ ] Show admin features
- [ ] Allow project modifications
- [ ] Expose team member details
- [ ] Show internal comments
- [ ] Display activity logs

---

## 📝 Sample Share Tokens

Your projects have these share tokens (from seed data):

1. **Luxe Fashion Store**: Check database for token
2. **TechFlow SaaS Dashboard**: Check database for token
3. **Green Earth NGO Site**: Check database for token

To get actual tokens:
```bash
# Run this in your project directory
npx prisma studio
# Then browse to Project table and copy shareToken values
```

---

## 🚀 Quick Start Testing

### 1. Start Server (Already Running)
```bash
# Server is running at:
# http://192.168.1.15:3000
```

### 2. Get a Share Link
1. Go to: `http://192.168.1.15:3000`
2. Login as admin
3. Click any project
4. Click "Share Link" button
5. Link copied!

### 3. Test on Other Device
1. Connect other device to same WiFi
2. Open browser
3. Paste the share URL
4. Should load without login!

---

## ✅ Expected Behavior

### ✅ CORRECT:
- Share link opens without login
- Shows project name, client, brief
- Shows workflow progress
- Shows deliverables with status
- Clean, professional layout
- Works on mobile
- FlowDesk branding visible

### ❌ INCORRECT:
- Asks for login
- Shows "404 Not Found"
- Shows comments/activity
- Shows edit buttons
- Broken layout
- Missing information
- Requires authentication

---

## 🎉 Success Criteria

Your share URL feature is working correctly if:

1. ✅ Link copies to clipboard when clicked
2. ✅ Link works on other devices (same WiFi)
3. ✅ No login required for shared view
4. ✅ Project information displays correctly
5. ✅ Workflow progress visible
6. ✅ Deliverables list visible
7. ✅ Comments/activity hidden from public
8. ✅ Mobile responsive
9. ✅ Professional appearance
10. ✅ Unique token per project

---

**Your Server is Ready!**

Access your app at: **http://192.168.1.15:3000**

Test share URLs on any device connected to your WiFi network.

**Happy Testing! 🚀**
