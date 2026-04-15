# FlowDesk Project Manager

A modern, full-featured project management application built for design, development, and QA teams. Track projects through customizable workflow phases, manage team collaboration, and maintain client communication — all in one beautiful interface.

![FlowDesk](https://img.shields.io/badge/Status-Production%20Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-0%20Errors-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black)

## ✨ Features

### 🔐 User Management & Authentication
- **Role-based access control** (Admin, Project Manager, Designer, Developer, QA, Viewer)
- **Approval workflow** for new user registrations
- **Secure authentication** with NextAuth v5
- **Session management** with JWT tokens

### 📊 Project Management
- **Multi-phase workflow** (Design → QA → Approval → Development → QA → Preview → Delivered)
- **Flexible phase transitions** based on user roles
- **Priority levels** (Low, Medium, High, Urgent)
- **Status tracking** (Not Started, In Progress, Completed, Blocked, On Hold)
- **Deadline management** with overdue indicators
- **Progress calculation** based on current phase

### 🎨 Visual Workflow Indicators
- **Neon red glow** for projects that skip Design QA
- **Animated workflow stepper** showing project progress
- **Color-coded phase badges** for quick status recognition
- **Real-time progress bars** on project cards

### 💬 Collaboration Tools
- **Comment system** on projects and pages
- **Activity timeline** tracking all project changes
- **Revision management** for design and development changes
- **Real-time notifications** with unread badges
- **@mention support** in comments

### 👥 Team Features
- **Admin panel** for user approval and role management
- **Task assignment** to team members
- **Workload tracking** per user
- **Team activity feed** showing recent actions

### 📈 Analytics & Reporting
- **Status distribution** pie charts
- **Phase distribution** bar charts
- **Completion rate** tracking
- **Overdue project** monitoring
- **Priority breakdown** visualization

### 🔗 Client Collaboration
- **Shareable project links** for client preview
- **Public project view** without login required
- **Progress visualization** for clients
- **Deliverables list** with status indicators

### 📱 Modern UI/UX
- **Dark theme** with neon accents
- **Responsive design** for mobile, tablet, and desktop
- **Smooth animations** and transitions
- **Glassmorphism effects** on cards
- **Intuitive navigation** with sidebar and breadcrumbs

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- SQLite (included)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd project-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your settings

# Initialize database
npx prisma db push

# Seed with demo data
npm run seed

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Demo Accounts

All demo accounts use password: `password123`

| Role | Email | Permissions |
|------|-------|-------------|
| Admin | admin@projectmanager.com | Full system access |
| Project Manager | pm@projectmanager.com | Create/manage projects |
| Designer | designer@projectmanager.com | Design phase management |
| Developer | dev@projectmanager.com | Development phase management |
| QA | qa@projectmanager.com | QA phase management |

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16.2** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Lucide React** - Icon library
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma** - ORM for database
- **SQLite** - Database (easily swappable)
- **NextAuth v5** - Authentication
- **bcryptjs** - Password hashing

### Styling
- **Custom CSS** - Design system with CSS variables
- **CSS Animations** - Smooth transitions and effects
- **Responsive Design** - Mobile-first approach

---

## 📁 Project Structure

```
project-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── actions/               # Server actions
│   │   ├── auth.ts           # Authentication actions
│   │   ├── projects.ts       # Project CRUD
│   │   ├── pages.ts          # Page/task management
│   │   └── misc.ts           # Comments, notifications, etc.
│   ├── app/
│   │   ├── (auth)/           # Auth pages (login, signup)
│   │   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── share/            # Public share pages
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── ui.tsx            # Reusable UI components
│   │   ├── Header.tsx        # App header with notifications
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   └── AuthProvider.tsx  # Session provider
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Prisma client
│   │   ├── workflow.ts       # Workflow state machine
│   │   └── utils.ts          # Utility functions
│   └── types/
│       └── next-auth.d.ts    # NextAuth type extensions
├── public/                    # Static assets
├── .env                       # Environment variables
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

---

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true
```

### Local Network Access

To access the app from other devices on your network:

1. Find your local IP address (e.g., 192.168.1.19)
2. Update `.env`:
   ```env
   AUTH_URL="http://192.168.1.19:3000"
   NEXTAUTH_URL="http://192.168.1.19:3000"
   ```
3. Run: `npm run dev`
4. Access from any device: `http://192.168.1.19:3000`

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server on 0.0.0.0:3000

# Database
npm run seed             # Seed database with demo data
npm run activate-users   # Set all users to ACTIVE status

# Build
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint
```

---

## 🎯 Workflow Phases

The system supports a 7-phase workflow:

1. **DESIGN** - Initial design work
2. **DESIGN_QA** - Design quality assurance (optional)
3. **DESIGN_APPROVAL** - Client approval of designs
4. **DEVELOPMENT** - Implementation phase
5. **DEV_QA** - Development quality assurance
6. **CLIENT_PREVIEW** - Client review of implementation
7. **DELIVERED** - Project completed

### Phase Transitions

Each role has specific permissions for phase transitions:

- **Designers** can move: DESIGN → DESIGN_QA
- **QA** can move: DESIGN_QA ↔ DESIGN, DEV_QA ↔ DEVELOPMENT
- **Developers** can move: DEVELOPMENT → DEV_QA
- **PM/Admin** can move: any phase (with restrictions)

### Skipping Design QA

Projects can skip Design QA by moving directly from DESIGN → DESIGN_APPROVAL. These projects are visually flagged with a **neon red glow** to indicate the QA step was bypassed.

---

## 🔒 Security Features

- **Password hashing** with bcrypt (12 rounds)
- **JWT-based sessions** with secure cookies
- **Role-based access control** on all routes
- **Server-side validation** on all actions
- **CSRF protection** via NextAuth
- **SQL injection prevention** via Prisma
- **XSS protection** via React's built-in escaping

---

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

### Quick Test

```bash
# 1. Seed database
npm run seed

# 2. Start server
npm run dev

# 3. Test user approval flow
# - Sign up at /signup
# - Log in as admin
# - Approve user at /admin
# - Log in as approved user

# 4. Test QA skip detection
# - Create project
# - Move DESIGN → CLIENT_APPROVAL
# - Verify red glow on dashboard
```

---

## 📊 Database Schema

### Core Models

- **User** - Authentication and role management
- **Project** - Main project entity
- **Page** - Individual deliverables/tasks
- **Comment** - Discussion threads
- **Activity** - Audit log
- **Revision** - Change requests
- **Notification** - User notifications
- **Attachment** - File uploads

See [prisma/schema.prisma](./prisma/schema.prisma) for full schema.

---

## 🎨 Design System

### Color Palette

- **Primary**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Danger**: Red (#EF4444)
- **Info**: Blue (#3B82F6)

### Typography

- **Display**: Outfit (headings)
- **Body**: Inter (content)

### Spacing

- **Base unit**: 0.25rem (4px)
- **Scale**: 4, 8, 12, 16, 24, 32, 48, 64px

---

## 🚧 Roadmap

### Planned Features

- [ ] File upload and attachment management
- [ ] Email notifications
- [ ] Slack/Discord integration
- [ ] Time tracking per task
- [ ] Gantt chart view
- [ ] Export to PDF/Excel
- [ ] Custom workflow templates
- [ ] API documentation
- [ ] Webhooks for external integrations

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- Authentication by [NextAuth](https://next-auth.js.org/)
- Database ORM by [Prisma](https://www.prisma.io/)

---

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [link-to-docs]

---

**Built with ❤️ for modern development teams**
