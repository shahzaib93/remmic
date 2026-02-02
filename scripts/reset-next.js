#!/usr/bin/env node

/**
 * Reset Next.js build cache and temporary files to fix chunk errors
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🧹 Resetting Next.js cache and build files...')

const filesToRemove = [
  '.next',
  'node_modules/.cache',
  '.swc',
]

for (const file of filesToRemove) {
  const fullPath = path.join(process.cwd(), file)
  if (fs.existsSync(fullPath)) {
    console.log(`📁 Removing ${file}...`)
    try {
      execSync(`rm -rf "${fullPath}"`, { stdio: 'inherit' })
    } catch (error) {
      console.error(`❌ Failed to remove ${file}:`, error.message)
    }
  }
}

console.log('🧼 Cleaning npm cache...')
try {
  execSync('npm cache clean --force', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ Failed to clean npm cache:', error.message)
}

console.log('✅ Reset complete! You can now run "npm run dev" or "npm run build"')