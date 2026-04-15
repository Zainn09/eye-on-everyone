const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

p.project.findMany({ select: { id: true, name: true, shareToken: true } })
  .then(r => {
    console.log(JSON.stringify(r, null, 2))
    p.$disconnect()
  })
  .catch(e => {
    console.error(e.message)
    p.$disconnect()
  })
