#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Database switching script
function switchDatabase(dbType) {
  if (!['sqlite', 'mysql'].includes(dbType)) {
    console.error('Invalid database type. Use "sqlite" or "mysql"');
    process.exit(1);
  }

  // Update package.json scripts to set environment variable
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Update start script to include DB_TYPE
  packageJson.scripts.start = `DB_TYPE=${dbType} node server.js`;
  packageJson.scripts.dev = `DB_TYPE=${dbType} nodemon server.js`;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log(`✅ Database switched to ${dbType.toUpperCase()}`);
  console.log(`📝 Updated package.json scripts`);
  console.log(`🚀 Run 'npm start' to use ${dbType} database`);
}

// Get database type from command line argument
const dbType = process.argv[2];

if (!dbType) {
  console.log('Usage: node scripts/switch-database.js <sqlite|mysql>');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/switch-database.js sqlite');
  console.log('  node scripts/switch-database.js mysql');
  process.exit(1);
}

switchDatabase(dbType);
