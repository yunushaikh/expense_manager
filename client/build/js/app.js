// Expense Manager Dashboard JavaScript

class ExpenseManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentMonth = 9; // September (has most recent data)
        this.currentYear = 2025;
        this.categories = [];
        this.expenses = [];
        this.income = [];
        this.summary = { totalIncome: 0, totalExpenses: 0, netIncome: 0 };
        this.yearlySummary = { totalIncome: 0, totalExpenses: 0, netIncome: 0 };
        
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategories();
        this.loadData();
        this.updateCurrentMonthDisplay();
        this.setDefaultDate();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.dataset.section);
            });
        });

        // Month selection
        document.querySelectorAll('[data-month]').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                this.currentMonth = parseInt(link.dataset.month);
                this.updateCurrentMonthDisplay();
                
                // Reload all data first
                await this.loadData();
                
                // Then refresh current section data dynamically
                this.reloadCurrentSection();
            });
        });

        // Refresh button
        document.getElementById('refresh-data').addEventListener('click', async () => {
            await this.loadData();
            this.reloadCurrentSection();
        });

        // Form submissions
        document.getElementById('save-expense').addEventListener('click', () => {
            this.saveExpense();
        });

        document.getElementById('save-income').addEventListener('click', () => {
            this.saveIncome();
        });

        // Modal events
        document.getElementById('addExpenseModal').addEventListener('show.bs.modal', () => {
            this.populateCategorySelect();
            // Initialize AI categorization
            setTimeout(() => this.setupAICategorization(), 100);
        });

        // Update buttons
        document.getElementById('update-expense').addEventListener('click', () => {
            this.updateExpense();
        });

        document.getElementById('update-income').addEventListener('click', () => {
            this.updateIncome();
        });

        // Edit modal events
        document.getElementById('editExpenseModal').addEventListener('show.bs.modal', () => {
            this.populateCategorySelect('edit-expense-category');
        });

    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(el => {
            el.classList.add('d-none');
        });

        // Show selected section
        document.getElementById(`${section}-section`).classList.remove('d-none');

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll(`[data-section="${section}"]`).forEach(link => {
            link.classList.add('active');
        });

        this.currentSection = section;

        // Load section-specific data
        if (section === 'dashboard') {
            this.loadDashboardData();
        } else if (section === 'expenses') {
            this.loadExpensesTable();
        } else if (section === 'income') {
            this.loadIncomeTable();
        } else if (section === 'reports') {
            this.loadReports();
        } else if (section === 'analytics') {
            this.loadAnalytics();
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            this.categories = await response.json();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadData() {
        await Promise.all([
            this.loadExpenses(),
            this.loadIncome(),
            this.loadSummary(),
            this.loadYearlyData()
        ]);
        
        if (this.currentSection === 'dashboard') {
            this.loadDashboardData();
        }
    }

    async loadExpenses() {
        try {
            const response = await fetch(`/api/expenses?month=${this.currentMonth}&year=${this.currentYear}`);
            this.expenses = await response.json();
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }

    async loadIncome() {
        try {
            const response = await fetch(`/api/income?month=${this.currentMonth}&year=${this.currentYear}`);
            this.income = await response.json();
        } catch (error) {
            console.error('Error loading income:', error);
        }
    }

    async loadSummary() {
        try {
            const response = await fetch(`/api/summary?month=${this.currentMonth}&year=${this.currentYear}`);
            this.summary = await response.json();
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    }

    async loadYearlyData() {
        try {
            const response = await fetch(`/api/summary?year=${this.currentYear}`);
            this.yearlySummary = await response.json();
        } catch (error) {
            console.error('Error loading yearly data:', error);
            this.yearlySummary = { totalIncome: 0, totalExpenses: 0, netIncome: 0 };
        }
    }

    async loadDashboardData() {
        // Load both current month and yearly data for dashboard
        await this.loadCurrentMonthData();
        await this.loadOverallData();
        this.updateSummaryCards();
        this.updateRecentTransactions();
        this.createOverallChart();
        this.createCategoryChart();
    }

    async loadCurrentMonthData() {
        try {
            // Load current month data for upper tiles
            const [expensesResponse, incomeResponse, summaryResponse] = await Promise.all([
                fetch(`/api/expenses?month=${this.currentMonth}&year=${this.currentYear}`),
                fetch(`/api/income?month=${this.currentMonth}&year=${this.currentYear}`),
                fetch(`/api/summary?month=${this.currentMonth}&year=${this.currentYear}`)
            ]);

            this.currentMonthExpenses = await expensesResponse.json();
            this.currentMonthIncome = await incomeResponse.json();
            this.currentMonthSummary = await summaryResponse.json();
        } catch (error) {
            console.error('Error loading current month data:', error);
            this.currentMonthExpenses = [];
            this.currentMonthIncome = [];
            this.currentMonthSummary = { totalIncome: 0, totalExpenses: 0, netIncome: 0 };
        }
    }

    async loadOverallData() {
        try {
            // Load all expenses and income for the year
            const [expensesResponse, incomeResponse, summaryResponse] = await Promise.all([
                fetch(`/api/expenses?year=${this.currentYear}`),
                fetch(`/api/income?year=${this.currentYear}`),
                fetch(`/api/summary?year=${this.currentYear}`)
            ]);

            this.expenses = await expensesResponse.json();
            this.income = await incomeResponse.json();
            this.summary = await summaryResponse.json();
        } catch (error) {
            console.error('Error loading overall data:', error);
        }
    }

    reloadCurrentSection() {
        // Reload the current section's data after month change
        if (this.currentSection === 'dashboard') {
            this.loadDashboardData();
        } else if (this.currentSection === 'expenses') {
            this.loadExpensesTable();
        } else if (this.currentSection === 'income') {
            this.loadIncomeTable();
        } else if (this.currentSection === 'reports') {
            this.loadReports();
        } else if (this.currentSection === 'analytics') {
            this.loadAnalytics();
        }
    }

    updateSummaryCards() {
        // Update current month summary cards (upper tiles)
        if (this.currentMonthSummary) {
            document.getElementById('current-month-income').textContent = this.formatCurrency(this.currentMonthSummary.totalIncome);
            document.getElementById('current-month-expenses').textContent = this.formatCurrency(this.currentMonthSummary.totalExpenses);
            document.getElementById('current-month-net').textContent = this.formatCurrency(this.currentMonthSummary.netIncome);
        }
        
        // Update total transactions (overall)
        document.getElementById('total-transactions').textContent = this.expenses.length + this.income.length;
        
        // Update yearly summary cards (lower tiles)
        if (this.yearlySummary) {
            document.getElementById('yearly-income').textContent = this.formatCurrency(this.yearlySummary.totalIncome);
            document.getElementById('yearly-expenses').textContent = this.formatCurrency(this.yearlySummary.totalExpenses);
            document.getElementById('yearly-balance').textContent = this.formatCurrency(this.yearlySummary.netIncome);
        }
    }

    updateRecentTransactions() {
        const tbody = document.querySelector('#recent-transactions tbody');
        tbody.innerHTML = '';

        // Combine and sort transactions
        const allTransactions = [
            ...this.expenses.map(expense => ({ ...expense, type: 'Expense', category: expense.category })),
            ...this.income.map(income => ({ ...income, type: 'Income', category: income.source }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        allTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td><span class="badge ${transaction.type === 'Income' ? 'bg-success' : 'bg-danger'}">${transaction.type}</span></td>
                <td>${transaction.description || 'No description'}</td>
                <td>${transaction.category}</td>
                <td class="${transaction.type === 'Income' ? 'text-success' : 'text-danger'}">${this.formatCurrency(transaction.amount)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    createOverallChart() {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
        // Initialize all 12 months with zero data
        const monthlyData = {};
        for (let month = 1; month <= 12; month++) {
            const monthKey = `${this.currentYear}-${String(month).padStart(2, '0')}`;
            monthlyData[monthKey] = { income: 0, expenses: 0, month: month - 1 };
        }
        
        // Process expenses
        this.expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].expenses += parseFloat(expense.amount);
            }
        });
        
        // Process income
        this.income.forEach(income => {
            const date = new Date(income.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].income += parseFloat(income.amount);
            }
        });
        
        // Prepare data for all 12 months
        const months = [];
        const incomeData = [];
        const expenseData = [];
        
        for (let month = 1; month <= 12; month++) {
            const monthKey = `${this.currentYear}-${String(month).padStart(2, '0')}`;
            const data = monthlyData[monthKey];
            const date = new Date(this.currentYear, month - 1, 1);
            months.push(date.toLocaleDateString('en-US', { month: 'short' }));
            incomeData.push(data.income);
            expenseData.push(data.expenses);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#1cc88a',
                    backgroundColor: 'rgba(28, 200, 138, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#e74a3b',
                    backgroundColor: 'rgba(231, 74, 59, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    createCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        // Group expenses by category
        const categoryTotals = {};
        this.expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const colors = labels.map(label => {
            const category = this.categories.find(cat => cat.name === label);
            return category ? category.color : '#95a5a6';
        });

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    loadExpensesTable() {
        const tbody = document.querySelector('#expenses-table tbody');
        tbody.innerHTML = '';

        this.expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(expense.date)}</td>
                <td><span class="badge" style="background-color: ${this.getCategoryColor(expense.category)}">${expense.category}</span></td>
                <td>${expense.description || 'No description'}</td>
                <td class="text-danger">${this.formatCurrency(expense.amount)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="app.editExpense(${expense.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteExpense(${expense.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    loadIncomeTable() {
        const tbody = document.querySelector('#income-table tbody');
        tbody.innerHTML = '';

        this.income.forEach(income => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(income.date)}</td>
                <td><span class="badge bg-success">${income.source}</span></td>
                <td>${income.description || 'No description'}</td>
                <td class="text-success">${this.formatCurrency(income.amount)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="app.editIncome(${income.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteIncome(${income.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    loadReports() {
        this.createIncomeExpenseChart();
        this.createTrendChart();
    }

    loadAnalytics() {
        this.createAnalyticsChart();
    }

    createIncomeExpenseChart() {
        const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [this.summary.totalIncome, this.summary.totalExpenses],
                    backgroundColor: ['#1cc88a', '#e74a3b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    async createTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        
        // Get last 6 months data
        const months = [];
        const incomeData = [];
        const expenseData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(this.currentYear, this.currentMonth - 1 - i, 1);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            months.push(date.toLocaleDateString('en-US', { month: 'short' }));
            
            // Fetch real data for each month
            try {
                const [expensesResponse, incomeResponse] = await Promise.all([
                    fetch(`/api/expenses?month=${month}&year=${year}`),
                    fetch(`/api/income?month=${month}&year=${year}`)
                ]);
                
                const expenses = await expensesResponse.json();
                const income = await incomeResponse.json();
                
                const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
                const totalIncome = income.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
                
                incomeData.push(totalIncome);
                expenseData.push(totalExpenses);
            } catch (error) {
                console.error('Error fetching trend data:', error);
                incomeData.push(0);
                expenseData.push(0);
            }
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#1cc88a',
                    backgroundColor: 'rgba(28, 200, 138, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#e74a3b',
                    backgroundColor: 'rgba(231, 74, 59, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    createAnalyticsChart() {
        const ctx = document.getElementById('analyticsChart').getContext('2d');
        
        // Category analysis
        const categoryTotals = {};
        this.expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount Spent',
                    data: data,
                    backgroundColor: '#4e73df',
                    borderColor: '#4e73df',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    populateCategorySelect(selectId = 'expense-category') {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Category</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expense-date').value = today;
        document.getElementById('income-date').value = today;
    }

    updateCurrentMonthDisplay() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('current-month').textContent = 
            `${monthNames[this.currentMonth - 1]} ${this.currentYear}`;
    }

    async saveExpense() {
        const amount = document.getElementById('expense-amount').value;
        const category = document.getElementById('expense-category').value;
        const description = document.getElementById('expense-description').value;
        const date = document.getElementById('expense-date').value;

        if (!amount || !category || !date) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, category, description, date })
            });

            if (response.ok) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addExpenseModal'));
                modal.hide();
                
                // Reset form
                document.getElementById('expense-form').reset();
                
                // Reload all data
                await this.loadData();
                
                // Refresh current view
                this.reloadCurrentSection();
                
                // Show success message
                this.showAlert('Expense added successfully!', 'success');
            } else {
                throw new Error('Failed to save expense');
            }
        } catch (error) {
            console.error('Error saving expense:', error);
            this.showAlert('Error saving expense. Please try again.', 'danger');
        }
    }

    async saveIncome() {
        const amount = document.getElementById('income-amount').value;
        const source = document.getElementById('income-source').value;
        const description = document.getElementById('income-description').value;
        const date = document.getElementById('income-date').value;

        if (!amount || !source || !date) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('/api/income', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, source, description, date })
            });

            if (response.ok) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addIncomeModal'));
                modal.hide();
                
                // Reset form
                document.getElementById('income-form').reset();
                
                // Reload all data
                await this.loadData();
                
                // Refresh current view
                this.reloadCurrentSection();
                
                // Show success message
                this.showAlert('Income added successfully!', 'success');
            } else {
                throw new Error('Failed to save income');
            }
        } catch (error) {
            console.error('Error saving income:', error);
            this.showAlert('Error saving income. Please try again.', 'danger');
        }
    }

    async deleteExpense(id) {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return;
        }

        try {
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Reload all data
                await this.loadData();
                
                // Refresh current view
                this.reloadCurrentSection();
                
                this.showAlert('Expense deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete expense');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            this.showAlert('Error deleting expense. Please try again.', 'danger');
        }
    }

    async deleteIncome(id) {
        if (!confirm('Are you sure you want to delete this income?')) {
            return;
        }

        try {
            const response = await fetch(`/api/income/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Reload all data
                await this.loadData();
                
                // Refresh current view
                this.reloadCurrentSection();
                
                this.showAlert('Income deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete income');
            }
        } catch (error) {
            console.error('Error deleting income:', error);
            this.showAlert('Error deleting income. Please try again.', 'danger');
        }
    }

    editExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (!expense) {
            this.showAlert('Expense not found!', 'danger');
            return;
        }

        // Populate the edit form
        document.getElementById('edit-expense-id').value = expense.id;
        document.getElementById('edit-expense-amount').value = expense.amount;
        document.getElementById('edit-expense-category').value = expense.category;
        document.getElementById('edit-expense-description').value = expense.description || '';
        document.getElementById('edit-expense-date').value = expense.date;

        // Populate category dropdown
        this.populateCategorySelect('edit-expense-category');

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editExpenseModal'));
        modal.show();
    }

    editIncome(id) {
        const income = this.income.find(inc => inc.id === id);
        if (!income) {
            this.showAlert('Income not found!', 'danger');
            return;
        }

        // Populate the edit form
        document.getElementById('edit-income-id').value = income.id;
        document.getElementById('edit-income-amount').value = income.amount;
        document.getElementById('edit-income-source').value = income.source;
        document.getElementById('edit-income-description').value = income.description || '';
        document.getElementById('edit-income-date').value = income.date;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editIncomeModal'));
        modal.show();
    }

    async updateExpense() {
        const id = document.getElementById('edit-expense-id').value;
        const amount = parseFloat(document.getElementById('edit-expense-amount').value);
        const category = document.getElementById('edit-expense-category').value;
        const description = document.getElementById('edit-expense-description').value;
        const date = document.getElementById('edit-expense-date').value;

        if (!amount || !category || !date) {
            this.showAlert('Please fill in all required fields.', 'warning');
            return;
        }

        try {
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    category,
                    description,
                    date
                })
            });

            if (response.ok) {
                this.showAlert('Expense updated successfully!', 'success');
                
                // Reload all data
                await this.loadData();
                
                // Refresh current view
                this.reloadCurrentSection();
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editExpenseModal'));
                modal.hide();
            } else {
                throw new Error('Failed to update expense');
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            this.showAlert('Error updating expense. Please try again.', 'danger');
        }
    }

    async updateIncome() {
        const id = document.getElementById('edit-income-id').value;
        const amount = parseFloat(document.getElementById('edit-income-amount').value);
        const source = document.getElementById('edit-income-source').value;
        const description = document.getElementById('edit-income-description').value;
        const date = document.getElementById('edit-income-date').value;

        if (!amount || !source || !date) {
            this.showAlert('Please fill in all required fields.', 'warning');
            return;
        }

        try {
            const response = await fetch(`/api/income/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    source,
                    description,
                    date
                })
            });

            if (response.ok) {
                this.showAlert('Income updated successfully!', 'success');
                
                // Reload all data
                await this.loadData();
                
                // Refresh current view
                this.reloadCurrentSection();
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editIncomeModal'));
                modal.hide();
            } else {
                throw new Error('Failed to update income');
            }
        } catch (error) {
            console.error('Error updating income:', error);
            this.showAlert('Error updating income. Please try again.', 'danger');
        }
    }

    getCategoryColor(categoryName) {
        const category = this.categories.find(cat => cat.name === categoryName);
        return category ? category.color : '#95a5a6';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // AI Feature 1: Smart Expense Categorization
    suggestCategory(description, amount = null) {
        const desc = description.toLowerCase();
        
        // Enhanced keyword matching for better categorization
        const categories = {
            'Food & Dining': ['restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'food', 'eat', 'dining', 'pizza', 'burger', 'sandwich', 'meal', 'starbucks', 'mcdonalds', 'kfc', 'dominos'],
            'Transportation': ['uber', 'taxi', 'bus', 'train', 'metro', 'fuel', 'gas', 'parking', 'transport', 'ride', 'cab', 'petrol', 'diesel', 'auto', 'rickshaw'],
            'Shopping': ['amazon', 'flipkart', 'mall', 'store', 'shop', 'purchase', 'buy', 'clothes', 'shirt', 'pants', 'shoes', 'electronics', 'gadgets', 'online'],
            'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment', 'fun', 'theater', 'concert', 'show', 'youtube', 'prime', 'disney'],
            'Healthcare': ['hospital', 'doctor', 'medicine', 'pharmacy', 'health', 'medical', 'clinic', 'medicine', 'tablet', 'injection', 'checkup', 'treatment', 'surgery'],
            'Utilities': ['electricity', 'water', 'internet', 'phone', 'utility', 'bill', 'wifi', 'mobile', 'broadband', 'electric', 'power', 'connection'],
            'Education': ['school', 'college', 'course', 'book', 'education', 'learning', 'tuition', 'student', 'study', 'exam', 'university', 'institute', 'training'],
            'Travel': ['hotel', 'flight', 'vacation', 'trip', 'travel', 'booking', 'ticket', 'journey', 'holiday', 'tourism', 'resort', 'airbnb'],
            'Groceries': ['grocery', 'supermarket', 'vegetables', 'fruits', 'milk', 'bread', 'rice', 'wheat', 'atta', 'dal', 'chicken', 'egg', 'vegetable', 'fruits', 'dairy'],
            'Gas': ['petrol', 'diesel', 'fuel', 'gas station', 'pump', 'filling', 'petrol pump', 'fuel station'],
            'Insurance': ['insurance', 'premium', 'policy', 'coverage', 'life insurance', 'health insurance', 'car insurance'],
            'Rent': ['rent', 'rental', 'apartment', 'house', 'accommodation', 'room', 'flat', 'lease'],
            'Subscriptions': ['subscription', 'monthly', 'yearly', 'recurring', 'membership', 'netflix', 'spotify', 'prime', 'gym', 'magazine'],
            'Kids': ['school', 'project', 'diamond', 'diya', 'cake', 'breakfast', 'eatables', 'kids', 'child', 'student', 'toys', 'children'],
            'Breakfast': ['breakfast', 'morning', 'idli', 'dosa', 'poha', 'upma', 'snacks', 'evening', 'tea', 'coffee', 'biscuits'],
            'Daily Items': ['daily', 'items', 'snacks', 'miscellaneous', 'general', 'soap', 'shampoo', 'toothpaste', 'tissue'],
            'Personal Care': ['beauty', 'cosmetics', 'skincare', 'haircut', 'salon', 'spa', 'massage', 'grooming', 'perfume', 'makeup'],
            'Home & Garden': ['furniture', 'decoration', 'plants', 'garden', 'home', 'repair', 'maintenance', 'cleaning', 'tools', 'appliances'],
            'Technology': ['software', 'app', 'computer', 'laptop', 'phone', 'gadget', 'tech', 'digital', 'online', 'internet', 'software'],
            'Fitness & Sports': ['gym', 'fitness', 'sports', 'exercise', 'yoga', 'running', 'swimming', 'equipment', 'workout', 'health'],
            'Gifts & Donations': ['gift', 'donation', 'charity', 'present', 'birthday', 'anniversary', 'wedding', 'festival', 'celebration'],
            'Business': ['office', 'meeting', 'business', 'work', 'professional', 'client', 'project', 'conference', 'seminar', 'training']
        };

        // Find the best matching category
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => desc.includes(keyword))) {
                return category;
            }
        }

        // If no match found, return 'Other'
        return 'Other';
    }

    // Auto-suggest category when user types in description
    setupAICategorization() {
        const descriptionInput = document.getElementById('expense-description');
        const categorySelect = document.getElementById('expense-category');
        
        if (descriptionInput && categorySelect) {
            descriptionInput.addEventListener('input', () => {
                const description = descriptionInput.value.trim();
                if (description.length > 3) { // Only suggest after 3 characters
                    const suggestedCategory = this.suggestCategory(description);
                    
                    // Update the category dropdown if it's empty or set to "Select Category"
                    if (categorySelect.value === '' || categorySelect.value === 'Select Category') {
                        categorySelect.value = suggestedCategory;
                        
                        // Show a subtle hint
                        this.showCategoryHint(suggestedCategory);
                    }
                }
            });
        }
    }

    // Show a subtle hint about the suggested category
    showCategoryHint(category) {
        // Remove any existing hint
        const existingHint = document.querySelector('.ai-category-hint');
        if (existingHint) {
            existingHint.remove();
        }

        // Create hint element
        const hint = document.createElement('div');
        hint.className = 'ai-category-hint text-muted small mt-1';
        hint.innerHTML = `🤖 AI suggests: <strong>${category}</strong>`;
        hint.style.fontSize = '0.8rem';
        hint.style.color = '#6c757d';
        
        // Insert after the category select
        const categorySelect = document.getElementById('expense-category');
        if (categorySelect && categorySelect.parentNode) {
            categorySelect.parentNode.appendChild(hint);
            
            // Remove hint after 3 seconds
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 3000);
        }
    }

    // AI Feature 2: Smart Spending Insights
    showAIInsights() {
        console.log('AI Insights clicked!'); // Debug log
        const modalElement = document.getElementById('aiInsightsModal');
        if (!modalElement) {
            console.error('AI Insights modal not found!');
            return;
        }
        
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Generate insights
        setTimeout(() => {
            this.generateAIInsights();
        }, 1000);
    }

    generateAIInsights() {
        console.log('Generating AI insights...'); // Debug log
        const insightsContent = document.getElementById('ai-insights-content');
        
        if (!insightsContent) {
            console.error('AI insights content element not found!');
            return;
        }
        
        try {
            // Do the real analysis immediately
            console.log('Analyzing spending patterns...');
            const analysis = this.analyzeSpendingPatterns();
            console.log('Analysis completed:', analysis);
            
            console.log('Creating insights HTML...');
            const insightsHTML = this.createInsightsHTML(analysis);
            console.log('HTML generated, updating content...');
            
            insightsContent.innerHTML = insightsHTML;
            console.log('AI insights generated successfully!');
            
        } catch (error) {
            console.error('Error generating AI insights:', error);
            insightsContent.innerHTML = `
                <div class="alert alert-danger">
                    <h5>Error generating insights</h5>
                    <p>There was an error analyzing your spending data. Please try again.</p>
                    <small>Error: ${error.message}</small>
                </div>
            `;
        }
    }

    analyzeSpendingPatterns() {
        console.log('Starting spending pattern analysis...');
        const currentMonth = this.currentMonth;
        const currentYear = this.currentYear;
        console.log('Current month:', currentMonth, 'Current year:', currentYear);
        console.log('Total expenses available:', this.expenses.length);
        
        // Get current month expenses
        const currentMonthExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() + 1 === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
        });
        console.log('Current month expenses found:', currentMonthExpenses.length);

        // Get last 3 months for comparison
        const last3Months = [];
        for (let i = 1; i <= 3; i++) {
            const month = currentMonth - i;
            const year = month <= 0 ? currentYear - 1 : currentYear;
            const actualMonth = month <= 0 ? month + 12 : month;
            
            const monthExpenses = this.expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() + 1 === actualMonth && 
                       expenseDate.getFullYear() === year;
            });
            
            last3Months.push({
                month: actualMonth,
                year: year,
                expenses: monthExpenses,
                total: monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
            });
        }

        // Calculate insights
        const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const avgLast3Months = last3Months.reduce((sum, month) => sum + month.total, 0) / 3;
        
        console.log('Current month total:', currentMonthTotal);
        console.log('Average last 3 months:', avgLast3Months);
        
        // Category analysis
        const categorySpending = {};
        currentMonthExpenses.forEach(expense => {
            const category = expense.category || 'Other';
            categorySpending[category] = (categorySpending[category] || 0) + parseFloat(expense.amount);
        });

        // Find top spending categories
        const topCategories = Object.entries(categorySpending)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        // Find highest single expense
        const highestExpense = currentMonthExpenses.reduce((max, exp) => 
            parseFloat(exp.amount) > parseFloat(max.amount) ? exp : max, 
            { amount: 0, description: 'None', category: 'N/A' }
        );

        // Calculate spending trend
        const trend = currentMonthTotal > avgLast3Months ? 'increasing' : 
                     currentMonthTotal < avgLast3Months ? 'decreasing' : 'stable';

        // Generate recommendations
        const recommendations = this.generateRecommendations({
            currentMonthTotal,
            avgLast3Months,
            trend,
            topCategories,
            highestExpense,
            categorySpending,
            currentMonthExpenses
        });

        return {
            currentMonthTotal,
            avgLast3Months,
            trend,
            topCategories,
            highestExpense,
            categorySpending,
            recommendations,
            currentMonthExpenses
        };
    }

    generateRecommendations(analysis) {
        const recommendations = [];
        
        // Spending trend recommendation
        if (analysis.trend === 'increasing' && analysis.avgLast3Months > 0) {
            const increasePercent = ((analysis.currentMonthTotal - analysis.avgLast3Months) / analysis.avgLast3Months * 100).toFixed(1);
            recommendations.push({
                type: 'warning',
                title: '📈 Spending Trend Alert',
                message: `Your spending is ${increasePercent}% higher than your 3-month average (₹${analysis.avgLast3Months.toFixed(2)}). This could indicate lifestyle inflation or unexpected expenses.`
            });
        } else if (analysis.trend === 'decreasing' && analysis.avgLast3Months > 0) {
            const decreasePercent = ((analysis.avgLast3Months - analysis.currentMonthTotal) / analysis.avgLast3Months * 100).toFixed(1);
            recommendations.push({
                type: 'success',
                title: '🎉 Great Job!',
                message: `Your spending is ${decreasePercent}% lower than your 3-month average. You're saving ₹${(analysis.avgLast3Months - analysis.currentMonthTotal).toFixed(2)} this month!`
            });
        }

        // Top category recommendation with specific advice
        if (analysis.topCategories.length > 0) {
            const [topCategory, amount] = analysis.topCategories[0];
            const percentage = (amount / analysis.currentMonthTotal * 100).toFixed(1);
            
            let advice = '';
            if (topCategory === 'Groceries') {
                advice = 'Consider meal planning or bulk buying to reduce grocery costs.';
            } else if (topCategory === 'Transportation') {
                advice = 'Look into carpooling, public transport, or fuel-efficient driving.';
            } else if (topCategory === 'Entertainment') {
                advice = 'Consider free or low-cost entertainment options.';
            } else if (topCategory === 'Food & Dining') {
                advice = 'Try cooking at home more often to reduce dining out costs.';
            } else {
                advice = 'Review if this spending aligns with your financial goals.';
            }
            
            recommendations.push({
                type: 'info',
                title: '🏆 Top Spending Category',
                message: `${topCategory} accounts for ${percentage}% of your spending (₹${amount.toFixed(2)}). ${advice}`
            });
        }

        // High expense recommendation
        if (parseFloat(analysis.highestExpense.amount) > analysis.currentMonthTotal * 0.3) {
            const expensePercent = (parseFloat(analysis.highestExpense.amount) / analysis.currentMonthTotal * 100).toFixed(1);
            recommendations.push({
                type: 'warning',
                title: '💸 High Single Expense',
                message: `Your highest expense "${analysis.highestExpense.description}" (₹${analysis.highestExpense.amount}) represents ${expensePercent}% of your monthly spending. Consider if this was necessary or could be reduced.`
            });
        }

        // Category diversity recommendation
        const categoryCount = Object.keys(analysis.categorySpending).length;
        if (categoryCount < 3) {
            recommendations.push({
                type: 'info',
                title: '📊 Spending Diversity',
                message: `You're spending in only ${categoryCount} categories. Diversifying your expenses can help identify areas for optimization.`
            });
        }

        // Daily spending analysis
        const avgDailySpending = analysis.currentMonthTotal / 30;
        if (avgDailySpending > 100) {
            recommendations.push({
                type: 'info',
                title: '📅 Daily Spending',
                message: `You're spending an average of ₹${avgDailySpending.toFixed(2)} per day. Consider setting a daily budget to control expenses.`
            });
        }

        // Transaction frequency analysis
        const avgTransactionsPerDay = analysis.currentMonthExpenses.length / 30;
        if (avgTransactionsPerDay > 2) {
            recommendations.push({
                type: 'info',
                title: '🔄 Transaction Frequency',
                message: `You make ${avgTransactionsPerDay.toFixed(1)} transactions per day on average. Consider consolidating small purchases.`
            });
        }

        // Savings opportunity
        if (analysis.currentMonthTotal > 0) {
            const potentialSavings = analysis.currentMonthTotal * 0.1; // 10% savings opportunity
            recommendations.push({
                type: 'success',
                title: '💰 Savings Opportunity',
                message: `By reducing your expenses by just 10%, you could save ₹${potentialSavings.toFixed(2)} this month!`
            });
        }

        return recommendations;
    }

    createInsightsHTML(analysis) {
        const trendIcon = analysis.trend === 'increasing' ? '📈' : 
                         analysis.trend === 'decreasing' ? '📉' : '➡️';
        const trendColor = analysis.trend === 'increasing' ? 'text-warning' : 
                          analysis.trend === 'decreasing' ? 'text-success' : 'text-info';

        return `
            <div class="row">
                <!-- Spending Overview -->
                <div class="col-md-6 mb-4">
                    <div class="card border-primary">
                        <div class="card-header bg-primary text-white">
                            <h6 class="mb-0">📊 Spending Overview</h6>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-primary">₹${analysis.currentMonthTotal.toFixed(2)}</h4>
                                    <small class="text-muted">This Month</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-secondary">₹${analysis.avgLast3Months.toFixed(2)}</h4>
                                    <small class="text-muted">3-Month Avg</small>
                                </div>
                            </div>
                            <hr>
                            <div class="text-center">
                                <span class="badge bg-info">${trendIcon} ${analysis.trend.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Categories -->
                <div class="col-md-6 mb-4">
                    <div class="card border-success">
                        <div class="card-header bg-success text-white">
                            <h6 class="mb-0">🏆 Top Categories</h6>
                        </div>
                        <div class="card-body">
                            ${analysis.topCategories.map(([category, amount], index) => `
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span>${index + 1}. ${category}</span>
                                    <span class="badge bg-success">₹${amount.toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Highest Expense -->
                <div class="col-md-6 mb-4">
                    <div class="card border-warning">
                        <div class="card-header bg-warning text-dark">
                            <h6 class="mb-0">💸 Highest Expense</h6>
                        </div>
                        <div class="card-body">
                            <h5 class="text-warning">₹${parseFloat(analysis.highestExpense.amount).toFixed(2)}</h5>
                            <p class="mb-1"><strong>${analysis.highestExpense.description}</strong></p>
                            <small class="text-muted">Category: ${analysis.highestExpense.category}</small>
                        </div>
                    </div>
                </div>

                <!-- AI Recommendations -->
                <div class="col-md-6 mb-4">
                    <div class="card border-info">
                        <div class="card-header bg-info text-white">
                            <h6 class="mb-0">🤖 AI Recommendations</h6>
                        </div>
                        <div class="card-body">
                            ${analysis.recommendations.map(rec => `
                                <div class="alert alert-${rec.type} alert-sm mb-2">
                                    <strong>${rec.title}</strong><br>
                                    <small>${rec.message}</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Stats -->
            <div class="row">
                <div class="col-12">
                    <div class="card border-secondary">
                        <div class="card-header bg-secondary text-white">
                            <h6 class="mb-0">📈 Detailed Analysis</h6>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-md-3">
                                    <h5 class="text-primary">${analysis.currentMonthExpenses.length}</h5>
                                    <small class="text-muted">Total Transactions</small>
                                </div>
                                <div class="col-md-3">
                                    <h5 class="text-success">${Object.keys(analysis.categorySpending).length}</h5>
                                    <small class="text-muted">Categories Used</small>
                                </div>
                                <div class="col-md-3">
                                    <h5 class="text-info">₹${(analysis.currentMonthTotal / analysis.currentMonthExpenses.length || 0).toFixed(2)}</h5>
                                    <small class="text-muted">Avg per Transaction</small>
                                </div>
                                <div class="col-md-3">
                                    <h5 class="text-warning">₹${(analysis.currentMonthTotal / 30).toFixed(2)}</h5>
                                    <small class="text-muted">Daily Average</small>
                                </div>
                            </div>
                            <hr>
                            <div class="row text-center">
                                <div class="col-md-4">
                                    <h6 class="text-primary">${trendIcon} ${analysis.trend.toUpperCase()}</h6>
                                    <small class="text-muted">Spending Trend</small>
                                </div>
                                <div class="col-md-4">
                                    <h6 class="text-success">₹${(analysis.currentMonthTotal * 0.1).toFixed(2)}</h6>
                                    <small class="text-muted">10% Savings Potential</small>
                                </div>
                                <div class="col-md-4">
                                    <h6 class="text-info">${(analysis.currentMonthExpenses.length / 30).toFixed(1)}</h6>
                                    <small class="text-muted">Transactions/Day</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    refreshAIInsights() {
        const insightsContent = document.getElementById('ai-insights-content');
        insightsContent.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-info" role="status">
                    <span class="visually-hidden">Refreshing...</span>
                </div>
                <p class="mt-2">Refreshing AI analysis...</p>
            </div>
        `;
        
        setTimeout(() => {
            this.generateAIInsights();
        }, 1000);
    }

    showAlert(message, type) {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }

}

// Initialize the application
const app = new ExpenseManager();
window.expenseManager = app;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    app.init();
});
