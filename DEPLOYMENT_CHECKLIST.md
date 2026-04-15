# FlowDesk Deployment Checklist

## 🚀 Pre-Deployment

### Code Quality
- [x] TypeScript compilation: 0 errors
- [x] Production build: successful
- [x] All routes generated correctly
- [x] No console.log statements in production code
- [x] No debug output in UI

### Database
- [x] Schema finalized and tested
- [x] Seed data prepared
- [ ] Backup strategy in place
- [ ] Migration plan documented

### Security
- [x] Environment variables configured
- [ ] AUTH_SECRET changed from default
- [x] Password hashing enabled (bcrypt, 12 rounds)
- [x] CSRF protection enabled (NextAuth)
- [x] SQL injection prevention (Prisma)
- [ ] Rate limiting configured (if needed)
- [ ] HTTPS enabled (production only)

### Configuration
- [x] `.env` file configured
- [ ] Production URLs set in `.env`
- [x] `AUTH_TRUST_HOST=true` set
- [ ] Database connection string updated for production
- [ ] CORS settings reviewed

---

## 📦 Deployment Steps

### 1. Environment Setup

```bash
# Production .env example
DATABASE_URL="file:./prod.db"  # or PostgreSQL/MySQL URL
AUTH_SECRET="<generate-strong-secret>"
AUTH_URL="https://yourdomain.com"
NEXTAUTH_URL="https://yourdomain.com"
AUTH_TRUST_HOST=true
NODE_ENV="production"
```

### 2. Database Migration

```bash
# Push schema to production database
npx prisma db push

# Seed initial data (optional)
npm run seed

# Or manually create admin user
```

### 3. Build Application

```bash
# Install dependencies
npm ci --production=false

# Build for production
npm run build

# Test production build locally
npm run start
```

### 4. Deploy to Platform

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

#### Docker
```dockerfile
# Dockerfile example
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Traditional Server
```bash
# On server
git clone <repo>
cd project-app
npm ci --production=false
npx prisma generate
npx prisma db push
npm run build
pm2 start npm --name "flowdesk" -- start
```

---

## ✅ Post-Deployment Verification

### Smoke Tests
- [ ] Homepage loads
- [ ] Login page accessible
- [ ] Can log in with admin account
- [ ] Dashboard loads with data
- [ ] Can create new project
- [ ] Can navigate between pages
- [ ] Notifications work
- [ ] Admin panel accessible

### Functionality Tests
- [ ] User signup flow works
- [ ] Admin approval workflow works
- [ ] Project creation works
- [ ] Phase transitions work
- [ ] Comments can be added
- [ ] Notifications are sent
- [ ] Share links work
- [ ] Analytics page loads

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] No console errors
- [ ] No 404 errors
- [ ] Images load correctly
- [ ] API responses < 1 second

### Security Tests
- [ ] Cannot access /admin without admin role
- [ ] Cannot access /dashboard without login
- [ ] Pending users redirected to /waiting-approval
- [ ] Share links work without authentication
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked

---

## 🔧 Production Configuration

### Database

#### SQLite (Development/Small Teams)
```env
DATABASE_URL="file:./prod.db"
```

#### PostgreSQL (Recommended for Production)
```env
DATABASE_URL="postgresql://user:password@host:5432/flowdesk?schema=public"
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma db push
npx prisma generate
```

### Email Notifications (Optional)

Add to `.env`:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="FlowDesk <noreply@yourdomain.com>"
```

### File Uploads (Optional)

Add to `.env`:
```env
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"  # 10MB
ALLOWED_FILE_TYPES="image/*,application/pdf"
```

---

## 📊 Monitoring & Maintenance

### Logging
- [ ] Error logging configured
- [ ] Access logs enabled
- [ ] Performance monitoring setup

### Backups
- [ ] Database backup schedule (daily recommended)
- [ ] Backup retention policy (30 days recommended)
- [ ] Backup restoration tested

### Updates
- [ ] Dependency update schedule (monthly)
- [ ] Security patch monitoring
- [ ] Breaking change review process

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
```bash
# Verify connection
npx prisma db pull

# Regenerate client
npx prisma generate
```

### Authentication Issues
```bash
# Verify environment variables
echo $AUTH_SECRET
echo $AUTH_URL

# Check session configuration
# Ensure cookies are not blocked
# Verify HTTPS in production
```

### Performance Issues
```bash
# Enable production mode
export NODE_ENV=production

# Optimize database
npx prisma db push --force-reset
npm run seed

# Check for slow queries
# Add database indexes if needed
```

---

## 📈 Scaling Considerations

### Database
- [ ] Move from SQLite to PostgreSQL/MySQL
- [ ] Add database indexes for common queries
- [ ] Implement connection pooling
- [ ] Set up read replicas (if needed)

### Application
- [ ] Enable Next.js caching
- [ ] Implement Redis for sessions
- [ ] Add CDN for static assets
- [ ] Enable gzip compression

### Infrastructure
- [ ] Load balancer setup
- [ ] Auto-scaling configuration
- [ ] Health check endpoints
- [ ] Monitoring and alerting

---

## 🔐 Security Hardening

### Production Checklist
- [ ] Change default AUTH_SECRET
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add CAPTCHA to signup (if needed)
- [ ] Enable CSP headers
- [ ] Configure CORS properly
- [ ] Disable directory listing
- [ ] Remove source maps in production
- [ ] Implement audit logging

### Headers Configuration

Add to `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ]
}
```

---

## 📞 Support & Maintenance

### Regular Tasks
- **Daily**: Monitor error logs
- **Weekly**: Review user feedback, check performance metrics
- **Monthly**: Update dependencies, review security advisories
- **Quarterly**: Database optimization, backup restoration test

### Emergency Contacts
- **Technical Lead**: [contact]
- **DevOps**: [contact]
- **Database Admin**: [contact]

### Documentation
- [ ] API documentation updated
- [ ] User guide created
- [ ] Admin guide created
- [ ] Troubleshooting guide updated

---

## ✅ Go-Live Checklist

### Final Verification
- [ ] All tests passing
- [ ] Production build successful
- [ ] Database migrated
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] DNS configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Team notified
- [ ] Documentation updated

### Launch
- [ ] Deploy to production
- [ ] Verify all routes work
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Announce to users

### Post-Launch (First 24 Hours)
- [ ] Monitor error rates
- [ ] Check server resources
- [ ] Review user feedback
- [ ] Address critical issues
- [ ] Document any issues found

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Version**: ___________
**Status**: ☐ Success ☐ Issues Found

---

## 🎉 Congratulations!

Your FlowDesk Project Manager is now live!

Remember to:
- Monitor the application regularly
- Keep dependencies updated
- Back up the database
- Listen to user feedback
- Iterate and improve

**Happy Project Managing! 🚀**
