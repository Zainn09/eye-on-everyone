#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces()
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  
  return 'localhost'
}

// Update .env file with new IP
function updateEnvFile(ip) {
  const envPath = path.join(__dirname, '.env')
  
  let envContent = ''
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8')
  }
  
  // Update or add AUTH_URL and NEXTAUTH_URL
  const lines = envContent.split('\n')
  const updatedLines = []
  let authUrlFound = false
  let nextAuthUrlFound = false
  
  for (const line of lines) {
    if (line.startsWith('AUTH_URL=')) {
      updatedLines.push(`AUTH_URL="http://${ip}:3000"`)
      authUrlFound = true
    } else if (line.startsWith('NEXTAUTH_URL=')) {
      updatedLines.push(`NEXTAUTH_URL="http://${ip}:3000"`)
      nextAuthUrlFound = true
    } else if (line.trim() !== '') {
      updatedLines.push(line)
    }
  }
  
  // Add if not found
  if (!authUrlFound) {
    updatedLines.push(`AUTH_URL="http://${ip}:3000"`)
  }
  if (!nextAuthUrlFound) {
    updatedLines.push(`NEXTAUTH_URL="http://${ip}:3000"`)
  }
  
  // Ensure AUTH_TRUST_HOST is set
  if (!updatedLines.some(line => line.startsWith('AUTH_TRUST_HOST='))) {
    updatedLines.push('AUTH_TRUST_HOST=true')
  }
  
  const newEnvContent = updatedLines.filter(line => line.trim() !== '').join('\n') + '\n'
  fs.writeFileSync(envPath, newEnvContent)
  
  return newEnvContent
}

// Update next.config.js with new IP
function updateNextConfig(ip) {
  const configPath = path.join(__dirname, 'next.config.js')
  
  if (!fs.existsSync(configPath)) {
    return
  }
  
  let configContent = fs.readFileSync(configPath, 'utf-8')
  
  // Update allowedDevOrigins array
  configContent = configContent.replace(
    /allowedDevOrigins:\s*\[[^\]]*\]/,
    `allowedDevOrigins: ['${ip}', 'localhost', '127.0.0.1']`
  )
  
  fs.writeFileSync(configPath, configContent)
}

// Main execution
console.log('\n╔════════════════════════════════════════════════════════════╗')
console.log('║         🚀 FlowDesk Dev Server Setup                       ║')
console.log('╚════════════════════════════════════════════════════════════╝\n')

const localIP = getLocalIP()
console.log(`📡 Detected Local IP: ${localIP}`)

// Update .env file
console.log('📝 Updating .env file...')
updateEnvFile(localIP)
console.log('✅ .env file updated')

// Update next.config.js
console.log('📝 Updating next.config.js...')
updateNextConfig(localIP)
console.log('✅ next.config.js updated\n')

// Display URLs
console.log('╔════════════════════════════════════════════════════════════╗')
console.log('║              🔗 ACCESS URLS                               ║')
console.log('╚════════════════════════════════════════════════════════════╝\n')

console.log('🖥️  LOCAL TESTING (This Computer):')
console.log('   http://localhost:3000\n')

console.log('🌐 NETWORK SHARING (Other Devices on WiFi):')
console.log(`   http://${localIP}:3000\n`)

console.log('📱 SHARE LINKS (No Login Required):')
console.log(`   http://${localIP}:3000/share/cmnokv8zr0008u33s3x63i77w`)
console.log(`   http://${localIP}:3000/share/cmnokv90t000zu33sf88hzj7n\n`)

console.log('🔐 Demo Credentials (password: password123):')
console.log('   • admin@projectmanager.com')
console.log('   • pm@projectmanager.com')
console.log('   • designer@projectmanager.com')
console.log('   • dev@projectmanager.com')
console.log('   • qa@projectmanager.com\n')

console.log('╔════════════════════════════════════════════════════════════╗')
console.log('║  Starting Next.js Development Server...                   ║')
console.log('╚════════════════════════════════════════════════════════════╝\n')

// Start the dev server
try {
  execSync('next dev --hostname 0.0.0.0', { stdio: 'inherit' })
} catch (error) {
  console.error('Error starting dev server:', error.message)
  process.exit(1)
}
