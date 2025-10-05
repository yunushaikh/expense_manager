const { getConnection, getDatabaseType } = require('../config/database');

class DatabaseService {
  constructor() {
    this.db = getConnection();
    this.dbType = getDatabaseType();
  }

  // Generic query execution
  async query(sql, params = []) {
    if (this.dbType === 'mysql') {
      const [rows] = await this.db.execute(sql, params);
      return rows;
    } else {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
  }

  // Generic single row query
  async queryOne(sql, params = []) {
    if (this.dbType === 'mysql') {
      const [rows] = await this.db.execute(sql, params);
      return rows[0] || null;
    } else {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
    }
  }

  // Generic insert/update/delete
  async run(sql, params = []) {
    if (this.dbType === 'mysql') {
      const [result] = await this.db.execute(sql, params);
      return { lastID: result.insertId, changes: result.affectedRows };
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }
  }

  // Expenses operations
  async getExpenses(filters = {}) {
    let sql = 'SELECT * FROM expenses';
    let params = [];
    let conditions = [];

    // Handle date filtering
    if (filters.month && filters.year) {
      if (this.dbType === 'mysql') {
        conditions.push('MONTH(date) = ? AND YEAR(date) = ?');
      } else {
        conditions.push('strftime("%m", date) = ? AND strftime("%Y", date) = ?');
      }
      params.push(filters.month, filters.year);
    } else if (filters.year) {
      if (this.dbType === 'mysql') {
        conditions.push('YEAR(date) = ?');
      } else {
        conditions.push('strftime("%Y", date) = ?');
      }
      params.push(filters.year);
    }

    if (filters.date) {
      conditions.push('date = ?');
      params.push(filters.date);
    }

    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    return await this.query(sql, params);
  }

  async addExpense(expense) {
    const { amount, category, description, date } = expense;
    const sql = 'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)';
    return await this.run(sql, [amount, category, description, date]);
  }

  async updateExpense(id, expense) {
    const { amount, category, description, date } = expense;
    const sql = 'UPDATE expenses SET amount = ?, category = ?, description = ?, date = ? WHERE id = ?';
    return await this.run(sql, [amount, category, description, date, id]);
  }

  async deleteExpense(id) {
    const sql = 'DELETE FROM expenses WHERE id = ?';
    return await this.run(sql, [id]);
  }

  // Income operations
  async getIncome(filters = {}) {
    let sql = 'SELECT * FROM income';
    let params = [];
    let conditions = [];

    // Handle date filtering
    if (filters.month && filters.year) {
      if (this.dbType === 'mysql') {
        conditions.push('MONTH(date) = ? AND YEAR(date) = ?');
      } else {
        conditions.push('strftime("%m", date) = ? AND strftime("%Y", date) = ?');
      }
      params.push(filters.month, filters.year);
    } else if (filters.year) {
      if (this.dbType === 'mysql') {
        conditions.push('YEAR(date) = ?');
      } else {
        conditions.push('strftime("%Y", date) = ?');
      }
      params.push(filters.year);
    }

    if (filters.date) {
      conditions.push('date = ?');
      params.push(filters.date);
    }

    if (filters.source) {
      conditions.push('source = ?');
      params.push(filters.source);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    return await this.query(sql, params);
  }

  async addIncome(income) {
    const { amount, source, description, date } = income;
    const sql = 'INSERT INTO income (amount, source, description, date) VALUES (?, ?, ?, ?)';
    return await this.run(sql, [amount, source, description, date]);
  }

  async updateIncome(id, income) {
    const { amount, source, description, date } = income;
    const sql = 'UPDATE income SET amount = ?, source = ?, description = ?, date = ? WHERE id = ?';
    return await this.run(sql, [amount, source, description, date, id]);
  }

  async deleteIncome(id) {
    const sql = 'DELETE FROM income WHERE id = ?';
    return await this.run(sql, [id]);
  }

  // Categories operations
  async getCategories() {
    const sql = 'SELECT * FROM categories ORDER BY name';
    return await this.query(sql);
  }

  // Summary operations
  async getSummary(filters = {}) {
    let expenseSql = 'SELECT SUM(amount) as total FROM expenses';
    let incomeSql = 'SELECT SUM(amount) as total FROM income';
    let params = [];
    let conditions = [];

    // Handle date filtering
    if (filters.month && filters.year) {
      if (this.dbType === 'mysql') {
        conditions.push('MONTH(date) = ? AND YEAR(date) = ?');
      } else {
        conditions.push('strftime("%m", date) = ? AND strftime("%Y", date) = ?');
      }
      params.push(filters.month, filters.year);
    } else if (filters.year) {
      if (this.dbType === 'mysql') {
        conditions.push('YEAR(date) = ?');
      } else {
        conditions.push('strftime("%Y", date) = ?');
      }
      params.push(filters.year);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      expenseSql += whereClause;
      incomeSql += whereClause;
    }

    const [expenseResult, incomeResult] = await Promise.all([
      this.queryOne(expenseSql, params),
      this.queryOne(incomeSql, params)
    ]);

    const totalExpenses = expenseResult?.total || 0;
    const totalIncome = incomeResult?.total || 0;
    const netIncome = totalIncome - totalExpenses;

    return {
      totalExpenses,
      totalIncome,
      netIncome
    };
  }
}

module.exports = DatabaseService;
