# 🚀 Quick Start Guide - FlowDesk Project Manager

## Start Development Server

```bash
npm run dev
```

The script will automatically:
- Detect your local IP
- Update configuration files
- Display access URLs
- Start the dev server

## Access URLs

After running `npm run dev`, you'll see:

```
🖥️  LOCAL TESTING (This Computer):
   http://localhost:3000

🌐 NETWORK SHARING (Other Devices on WiFi):
   http://192.168.1.17:3000  (your actual IP will be shown)

📱 SHARE LINKS (No Login Required):
   http://192.168.1.17:3000/share/cmnokv8zr0008u33s3x63i77w
   http://192.168.1.17:3000/share/cmnokv90t000zu33sf88hzj7n

🔐 Demo Credentials (password: password123):
   • admin@projectmanager.com
   • pm@projectmanager.com
   • designer@projectmanager.com
   • dev@projectmanager.com
   • qa@projectmanager.com
```

## Testing Scenarios

### Scenario 1: Local Testing
1. Run `npm run dev`
2. Open http://localhost:3000
3. Login with any demo credentials
4. Test features locally

### Scenario 2: Network Testing (Other Device)
1. Run `npm run dev` on your main computer
2. On another device on the same WiFi, open http://192.168.1.17:3000 (use the IP shown)
3. Login with demo credentials
4. Test features from another device

### Scenario 3: Share Link Testing
1. Run `npm run dev`
2. Open any share link (no login required)
3. View project preview
4. Test on multiple devices

### Scenario 4: Admin Panel Testing
1. Login as `admin@projectmanager.com`
2. Navigate to Admin panel
3. Manage users and projects

## Key Features

✅ **Auto IP Detection** - Automatically detects and configures your network IP
✅ **Dual URLs** - Access from localhost or network IP
✅ **Share Links** - Test without login
✅ **Demo Credentials** - Pre-configured test accounts
✅ **HMR Support** - Hot Module Replacement works on network IP
✅ **NextAuth Integration** - Secure authentication with network IP support

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't access from other device | Verify both devices are on same WiFi, use the IP shown in console |
| Login fails from network IP | Stop server (Ctrl+C), run `npm run dev` again |
| HMR not working | Script automatically updates config, restart server if needed |
| IP changed | Just run `npm run dev` again, it auto-detects new IP |

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Seed database
npm run seed
```

## Documentation

- **AUTO_IP_SETUP_COMPLETE.md** - Detailed setup documentation
- **README.md** - Full project documentation
- **IMPLEMENTATION_STATUS.md** - Feature checklist
- **TESTING_GUIDE.md** - Comprehensive testing guide
- **DEPLOYMENT_CHECKLIST.md** - Production deployment guide

---

**Ready to test?** Run `npm run dev` and start building! 🎉
