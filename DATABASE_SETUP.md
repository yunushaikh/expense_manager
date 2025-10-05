# Database Setup Guide

This application supports both SQLite and MySQL databases. You can switch between them easily.

## 🗄️ Database Options

### SQLite (Default)
- **File-based database**
- **No setup required**
- **Perfect for development and small deployments**
- **Data stored in `expenses.db`**

### MySQL (Cloud/Local)
- **MySQL database (local or cloud)**
- **Better performance for production**
- **Supports concurrent users**
- **Data stored in MySQL server**

## 🚀 Quick Start

### Using SQLite (Default)
```bash
npm start
```

### Using MySQL
```bash
# Set up MySQL environment variables
node scripts/setup-mysql.js

# Follow the instructions to set environment variables
# Then start the application
npm start
```

## 🔄 Switching Databases

### Switch to MySQL
```bash
node scripts/switch-database.js mysql
npm start
```

### Switch to SQLite
```bash
node scripts/switch-database.js sqlite
npm start
```

## 🔧 Configuration

### Environment Variables
Set these environment variables for MySQL:

```bash
export DB_TYPE=mysql
export MYSQL_HOST=your-mysql-host
export MYSQL_PORT=3306
export MYSQL_USER=your-username
export MYSQL_PASSWORD=your-password
export MYSQL_DATABASE=your-database
export MYSQL_SSL_CA="your-ssl-certificate"  # Optional for SSL
```

### Database Configuration
- **SQLite:** Configured in `config/database.js`
- **MySQL:** Uses environment variables

## 📋 Database Schema

Both databases have identical schemas:

### Expenses Table
```sql
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Income Table
```sql
CREATE TABLE income (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  source VARCHAR(100) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(20) NOT NULL
);
```

## 🛠️ Development

### Check Database Status
```bash
curl http://localhost:5000/api/database/status
```

### Reset Database
```bash
# For SQLite: Delete expenses.db file
rm expenses.db

# For MySQL: Drop and recreate tables
# (Tables are auto-created on startup)
```

## 🔒 Security

- **SQLite:** File-based, local access only
- **MySQL:** Configurable SSL support
- **Credentials:** Stored in environment variables

## 📈 Performance

### SQLite
- ✅ Fast for small datasets
- ✅ No network latency
- ✅ Simple setup
- ❌ Limited concurrent users

### MySQL
- ✅ Better for large datasets
- ✅ Multiple concurrent users
- ✅ Advanced features
- ❌ Network dependency

## 🆘 Troubleshooting

### MySQL Connection Issues
1. Check environment variables
2. Verify MySQL server is running
3. Check credentials and permissions
4. Try switching back to SQLite

### Data Sync Issues
1. Check database status endpoint
2. Verify data in both databases
3. Check logs for errors

### Rollback to Previous Version
```bash
git checkout backup-before-mysql-integration-v1.0
```

## 📞 Support

If you encounter any issues:
1. Check the logs in `server.log`
2. Verify database status endpoint
3. Try switching between databases
4. Use the rollback command if needed
