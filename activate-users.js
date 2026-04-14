const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function run() {
  const result = await p.user.updateMany({
    where: {},
    data: { status: 'ACTIVE' }
  })
  console.log('Updated', result.count, 'existing users to ACTIVE status')
  await p.$disconnect()
}

run().catch(e => { console.error(e); process.exit(1) })
