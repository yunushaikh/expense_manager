const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();

// Database configuration
const config = {
  // Database type: 'sqlite' or 'mysql'
  type: process.env.DB_TYPE || 'sqlite',
  
  // SQLite configuration
  sqlite: {
    filename: './expenses.db'
  },
  
  // MySQL configuration
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'expense_manager',
    ssl: process.env.MYSQL_SSL_CA ? {
      ca: process.env.MYSQL_SSL_CA
    } : false
  }
};

// Database connection instances
let sqliteDb = null;
let mysqlConnection = null;

// Initialize database connection based on type
async function initializeDatabase() {
  try {
    if (config.type === 'mysql') {
      console.log('Connecting to MySQL database...');
      mysqlConnection = await mysql.createConnection(config.mysql);
      console.log('Connected to MySQL database');
      
      // Initialize MySQL tables
      await initializeMySQLTables();
    } else {
      console.log('Connecting to SQLite database...');
      sqliteDb = new sqlite3.Database(config.sqlite.filename, (err) => {
        if (err) {
          console.error('Error opening SQLite database:', err.message);
        } else {
          console.log('Connected to SQLite database');
        }
      });
      
      // Initialize SQLite tables
      initializeSQLiteTables();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Initialize SQLite tables
function initializeSQLiteTables() {
  if (!sqliteDb) return;
  
  sqliteDb.serialize(() => {
    // Expenses table
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Income table
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      source TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Categories table
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL
    )`);

    // Insert default categories
    const defaultCategories = [
      { name: 'Groceries', color: '#e74c3c' },
      { name: 'Breakfast', color: '#f1c40f' },
      { name: 'Kids', color: '#f39c12' },
      { name: 'Daily Items', color: '#2ecc71' },
      { name: 'Transportation', color: '#9b59b6' },
      { name: 'Entertainment', color: '#1abc9c' },
      { name: 'Healthcare', color: '#e67e22' },
      { name: 'Other', color: '#95a5a6' }
    ];

    defaultCategories.forEach(category => {
      sqliteDb.run(`INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)`, 
        [category.name, category.color]);
    });
  });
}

// Initialize MySQL tables
async function initializeMySQLTables() {
  if (!mysqlConnection) return;
  
  try {
    // Expenses table
    await mysqlConnection.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Income table
    await mysqlConnection.execute(`
      CREATE TABLE IF NOT EXISTS income (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        source VARCHAR(100) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await mysqlConnection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        color VARCHAR(20) NOT NULL
      )
    `);

    // Insert default categories
    const defaultCategories = [
      { name: 'Groceries', color: '#e74c3c' },
      { name: 'Breakfast', color: '#f1c40f' },
      { name: 'Kids', color: '#f39c12' },
      { name: 'Daily Items', color: '#2ecc71' },
      { name: 'Transportation', color: '#9b59b6' },
      { name: 'Entertainment', color: '#1abc9c' },
      { name: 'Healthcare', color: '#e67e22' },
      { name: 'Other', color: '#95a5a6' }
    ];

    for (const category of defaultCategories) {
      await mysqlConnection.execute(
        `INSERT IGNORE INTO categories (name, color) VALUES (?, ?)`,
        [category.name, category.color]
      );
    }

    console.log('MySQL tables initialized successfully');
  } catch (error) {
    console.error('Error initializing MySQL tables:', error);
    throw error;
  }
}

// Get database connection
function getConnection() {
  if (config.type === 'mysql') {
    return mysqlConnection;
  } else {
    return sqliteDb;
  }
}

// Get database type
function getDatabaseType() {
  return config.type;
}

// Close database connection
async function closeConnection() {
  try {
    if (config.type === 'mysql' && mysqlConnection) {
      await mysqlConnection.end();
      console.log('MySQL connection closed');
    } else if (sqliteDb) {
      sqliteDb.close((err) => {
        if (err) {
          console.error('Error closing SQLite database:', err.message);
        } else {
          console.log('SQLite database connection closed');
        }
      });
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

module.exports = {
  initializeDatabase,
  getConnection,
  getDatabaseType,
  closeConnection,
  config
};
