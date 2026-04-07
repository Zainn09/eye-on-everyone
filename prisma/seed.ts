import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create Users
  const hashedPassword = await bcrypt.hash("password123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@projectmanager.com" },
    update: {},
    create: {
      name: "Alex Admin",
      email: "admin@projectmanager.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  const pm = await prisma.user.upsert({
    where: { email: "pm@projectmanager.com" },
    update: {},
    create: {
      name: "Sara Manager",
      email: "pm@projectmanager.com",
      password: hashedPassword,
      role: "PROJECT_MANAGER",
    },
  })

  const designer = await prisma.user.upsert({
    where: { email: "designer@projectmanager.com" },
    update: {},
    create: {
      name: "David Designer",
      email: "designer@projectmanager.com",
      password: hashedPassword,
      role: "DESIGNER",
    },
  })

  const developer = await prisma.user.upsert({
    where: { email: "dev@projectmanager.com" },
    update: {},
    create: {
      name: "Emma Developer",
      email: "dev@projectmanager.com",
      password: hashedPassword,
      role: "DEVELOPER",
    },
  })

  const qa = await prisma.user.upsert({
    where: { email: "qa@projectmanager.com" },
    update: {},
    create: {
      name: "Quinn QA",
      email: "qa@projectmanager.com",
      password: hashedPassword,
      role: "QA",
    },
  })

  console.log("✅ Created users")

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: "Luxe Fashion Store",
      clientName: "Luxe Apparel Co.",
      brief: "Complete e-commerce redesign with focus on luxury feel. Need homepage, collection pages, product pages, and checkout flow. Brand colors: Gold & Black.",
      priority: "HIGH",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: "IN_PROGRESS",
      currentPhase: "DESIGN",
      designQAEnabled: true,
      creatorId: admin.id,
      pages: {
        create: [
          { name: "Homepage", type: "HOMEPAGE", designStatus: "COMPLETED", devStatus: "NOT_STARTED", order: 0, assigneeId: designer.id, figmaLink: "https://figma.com/file/example1" },
          { name: "Collection Page", type: "COLLECTION", designStatus: "IN_PROGRESS", devStatus: "NOT_STARTED", order: 1, assigneeId: designer.id },
          { name: "Product Page", type: "PRODUCT", designStatus: "NOT_STARTED", devStatus: "NOT_STARTED", order: 2 },
          { name: "Cart & Checkout", type: "CUSTOM", designStatus: "NOT_STARTED", devStatus: "NOT_STARTED", order: 3 },
        ]
      },
      activities: {
        create: [
          { action: "created_project", details: "Project created", userId: admin.id },
          { action: "phase_changed", details: "Moved to Design phase", userId: pm.id },
          { action: "page_added", details: "Added Homepage page", userId: designer.id },
          { action: "design_updated", details: "Homepage design completed", userId: designer.id },
        ]
      }
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: "TechFlow SaaS Dashboard",
      clientName: "TechFlow Inc.",
      brief: "Build a modern SaaS analytics dashboard with real-time charts, user management, billing pages, and API integration documentation.",
      priority: "URGENT",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: "IN_PROGRESS",
      currentPhase: "DEVELOPMENT",
      designQAEnabled: false,
      creatorId: admin.id,
      pages: {
        create: [
          { name: "Dashboard Home", type: "HOMEPAGE", designStatus: "COMPLETED", devStatus: "IN_PROGRESS", order: 0, assigneeId: developer.id },
          { name: "Analytics", type: "CUSTOM", designStatus: "COMPLETED", devStatus: "IN_PROGRESS", order: 1, assigneeId: developer.id },
          { name: "User Management", type: "CUSTOM", designStatus: "COMPLETED", devStatus: "NOT_STARTED", order: 2 },
          { name: "Billing", type: "CUSTOM", designStatus: "COMPLETED", devStatus: "NOT_STARTED", order: 3 },
        ]
      },
      activities: {
        create: [
          { action: "created_project", details: "Project created", userId: admin.id },
          { action: "phase_changed", details: "Design completed", userId: designer.id },
          { action: "phase_changed", details: "Moved to Development", userId: pm.id },
        ]
      }
    },
  })

  const project3 = await prisma.project.create({
    data: {
      name: "Green Earth NGO Site",
      clientName: "Green Earth Foundation",
      brief: "Nonprofit website redesign. Need homepage, about us, campaigns, donation page, blog, and contact form. Focus on warmth and community.",
      priority: "MEDIUM",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
      status: "IN_PROGRESS",
      currentPhase: "DEV_QA",
      designQAEnabled: true,
      creatorId: pm.id,
      pages: {
        create: [
          { name: "Homepage", type: "HOMEPAGE", designStatus: "COMPLETED", devStatus: "COMPLETED", qaStatus: "APPROVED", order: 0 },
          { name: "About Us", type: "CUSTOM", designStatus: "COMPLETED", devStatus: "COMPLETED", qaStatus: "PENDING", order: 1 },
          { name: "Campaigns", type: "CUSTOM", designStatus: "COMPLETED", devStatus: "IN_PROGRESS", qaStatus: "PENDING", order: 2 },
          { name: "Donation Page", type: "CUSTOM", designStatus: "COMPLETED", devStatus: "NOT_STARTED", qaStatus: "PENDING", order: 3 },
        ]
      },
      activities: {
        create: [
          { action: "created_project", details: "Project created", userId: pm.id },
          { action: "phase_changed", details: "Moved to Dev QA", userId: qa.id },
        ]
      }
    },
  })

  const project4 = await prisma.project.create({
    data: {
      name: "Nova Restaurant App",
      clientName: "Nova Dining Group",
      brief: "Modern restaurant website with online reservations, menu showcase, events page, and blog. Mobile-first design.",
      priority: "LOW",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      status: "NOT_STARTED",
      currentPhase: "DESIGN",
      designQAEnabled: true,
      creatorId: admin.id,
      pages: {
        create: [
          { name: "Homepage", type: "HOMEPAGE", designStatus: "NOT_STARTED", devStatus: "NOT_STARTED", order: 0 },
          { name: "Menu", type: "CUSTOM", designStatus: "NOT_STARTED", devStatus: "NOT_STARTED", order: 1 },
          { name: "Reservations", type: "CUSTOM", designStatus: "NOT_STARTED", devStatus: "NOT_STARTED", order: 2 },
        ]
      },
      activities: {
        create: [
          { action: "created_project", details: "Project created", userId: admin.id },
        ]
      }
    },
  })

  const project5 = await prisma.project.create({
    data: {
      name: "SportsPro E-Commerce",
      clientName: "SportsPro Ltd.",
      brief: "Large-scale sports equipment store. Multiple categories, product filtering, compare feature, loyalty program pages.",
      priority: "HIGH",
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // overdue
      status: "BLOCKED",
      currentPhase: "DESIGN_APPROVAL",
      designQAEnabled: true,
      creatorId: pm.id,
      pages: {
        create: [
          { name: "Homepage", type: "HOMEPAGE", designStatus: "COMPLETED", devStatus: "NOT_STARTED", order: 0 },
          { name: "Category Page", type: "COLLECTION", designStatus: "COMPLETED", devStatus: "NOT_STARTED", order: 1 },
          { name: "Product Page", type: "PRODUCT", designStatus: "COMPLETED", devStatus: "NOT_STARTED", order: 2 },
        ]
      },
      activities: {
        create: [
          { action: "created_project", details: "Project created", userId: pm.id },
          { action: "phase_changed", details: "Waiting for client approval", userId: designer.id },
        ]
      }
    },
  })

  const project6 = await prisma.project.create({
    data: {
      name: "HealthFirst Clinic Portal",
      clientName: "HealthFirst Medical",
      brief: "Patient portal with appointment booking, doctor profiles, health records access, and telemedicine integration.",
      priority: "URGENT",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: "IN_PROGRESS",
      currentPhase: "CLIENT_PREVIEW",
      designQAEnabled: true,
      creatorId: admin.id,
      pages: {
        create: [
          { name: "Homepage", type: "HOMEPAGE", designStatus: "COMPLETED", devStatus: "COMPLETED", qaStatus: "APPROVED", order: 0 },
          { name: "Doctor Profiles", type: "CUSTOM", designStatus: "COMPLETED", devStatus: "COMPLETED", qaStatus: "APPROVED", order: 1 },
          { name: "Appointment Booking", type: "CUSTOM", designStatus: "COMPLETED", devStatus: "COMPLETED", qaStatus: "APPROVED", order: 2 },
        ]
      },
      activities: {
        create: [
          { action: "created_project", details: "Project created", userId: admin.id },
          { action: "phase_changed", details: "Sent to Client Preview", userId: pm.id },
        ]
      }
    },
  })

  // Add some comments
  await prisma.comment.create({
    data: {
      content: "Homepage design looks great! Please finalize the hero section font before moving on.",
      userId: pm.id,
      projectId: project1.id,
    }
  })

  await prisma.comment.create({
    data: {
      content: "@David Designer — can you update the button colors to match the brand guide?",
      userId: admin.id,
      projectId: project1.id,
    }
  })

  // Add a revision
  await prisma.revision.create({
    data: {
      version: 1,
      description: "Client requested changes to the hero banner — needs larger CTA button and updated copy.",
      type: "design",
      status: "open",
      projectId: project5.id,
    }
  })

  // Add notifications
  await prisma.notification.createMany({
    data: [
      { title: "Project Overdue", message: "SportsPro E-Commerce is past its deadline", userId: admin.id, link: `/projects/${project5.id}` },
      { title: "New Comment", message: "Sara Manager commented on Luxe Fashion Store", userId: designer.id, link: `/projects/${project1.id}` },
      { title: "Phase Changed", message: "HealthFirst Clinic Portal moved to Client Preview", userId: qa.id, link: `/projects/${project6.id}` },
    ]
  })

  console.log("✅ Created projects, pages, comments, revisions, notifications")
  console.log("")
  console.log("🎉 Seed complete! Demo accounts:")
  console.log("   Admin:   admin@projectmanager.com / password123")
  console.log("   PM:      pm@projectmanager.com / password123")
  console.log("   Designer: designer@projectmanager.com / password123")
  console.log("   Dev:     dev@projectmanager.com / password123")
  console.log("   QA:      qa@projectmanager.com / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
