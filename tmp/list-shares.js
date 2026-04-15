const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
const ip = process.argv[2] || 'localhost'

p.project.findMany({ select: { name: true, shareToken: true }, orderBy: { createdAt: 'asc' } })
  .then(projects => {
    for (const proj of projects) {
      console.log(`   http://${ip}:3000/share/${proj.shareToken}  (${proj.name})`)
    }
    p.$disconnect()
  })
  .catch(() => {
    p.$disconnect()
  })
