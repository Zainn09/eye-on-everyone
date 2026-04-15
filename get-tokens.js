const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getTokens() {
  const projects = await prisma.project.findMany({
    select: {
      name: true,
      clientName: true,
      shareToken: true
    },
    take: 6
  })
  
  console.log('\n🔗 SHARE TOKENS FOR TESTING:\n')
  console.log('Copy these URLs to test on other devices:\n')
  
  projects.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (${p.clientName})`)
    console.log(`   http://192.168.1.15:3000/share/${p.shareToken}`)
    console.log('')
  })
  
  await prisma.$disconnect()
}

getTokens().catch(console.error)
