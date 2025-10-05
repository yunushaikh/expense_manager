#!/usr/bin/env node

// MySQL setup instructions
function setupMySQL() {
  console.log('🔧 MySQL Database Setup Instructions');
  console.log('');
  console.log('📋 To use MySQL database, set the following environment variables:');
  console.log('');
  console.log('export DB_TYPE=mysql');
  console.log('export MYSQL_HOST=your-mysql-host');
  console.log('export MYSQL_PORT=3306');
  console.log('export MYSQL_USER=your-mysql-username');
  console.log('export MYSQL_PASSWORD=your-mysql-password');
  console.log('export MYSQL_DATABASE=your-database-name');
  console.log('');
  console.log('For SSL connections (like Aiven), also set:');
  console.log('export MYSQL_SSL_CA="your-ssl-certificate"');
  console.log('');
  console.log('🚀 After setting environment variables:');
  console.log('   npm start');
  console.log('');
  console.log('🔄 To switch back to SQLite:');
  console.log('   node scripts/switch-database.js sqlite');
  console.log('   npm start');
  console.log('');
  console.log('📖 For more details, see DATABASE_SETUP.md');
}

setupMySQL();
