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

    // AI Feature 3: Budget Forecasting
    showAIForecasting() {
        console.log('AI Forecasting clicked!');
        const modalElement = document.getElementById('aiForecastingModal');
        if (!modalElement) {
            console.error('AI Forecasting modal not found!');
            return;
        }
        
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Generate forecast
        setTimeout(() => {
            this.generateAIForecasting();
        }, 1000);
    }

    generateAIForecasting() {
        console.log('Generating AI forecasting...');
        const forecastingContent = document.getElementById('ai-forecasting-content');
        
        if (!forecastingContent) {
            console.error('AI forecasting content element not found!');
            return;
        }
        
        try {
            // Analyze spending patterns for forecasting
            console.log('Analyzing spending patterns for forecasting...');
            const forecast = this.analyzeSpendingForForecast();
            console.log('Forecast analysis completed:', forecast);
            
            console.log('Creating forecasting HTML...');
            const forecastingHTML = this.createForecastingHTML(forecast);
            console.log('HTML generated, updating content...');
            
            forecastingContent.innerHTML = forecastingHTML;
            console.log('AI forecasting generated successfully!');
            
        } catch (error) {
            console.error('Error generating AI forecasting:', error);
            forecastingContent.innerHTML = `
                <div class="alert alert-danger">
                    <h5>Error generating forecast</h5>
                    <p>There was an error predicting your future spending. Please try again.</p>
                    <small>Error: ${error.message}</small>
                </div>
            `;
        }
    }

    analyzeSpendingForForecast() {
        console.log('Starting spending analysis for forecasting...');
        
        // Get last 6 months of data for better predictions
        const last6Months = [];
        const currentMonth = this.currentMonth;
        const currentYear = this.currentYear;
        
        for (let i = 0; i < 6; i++) {
            const month = currentMonth - i;
            const year = month <= 0 ? currentYear - 1 : currentYear;
            const actualMonth = month <= 0 ? month + 12 : month;
            
            const monthExpenses = this.expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() + 1 === actualMonth && 
                       expenseDate.getFullYear() === year;
            });
            
            const monthIncome = this.income.filter(income => {
                const incomeDate = new Date(income.date);
                return incomeDate.getMonth() + 1 === actualMonth && 
                       incomeDate.getFullYear() === year;
            });
            
            const totalExpenses = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
            const totalIncome = monthIncome.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
            
            last6Months.push({
                month: actualMonth,
                year: year,
                monthName: new Date(year, actualMonth - 1).toLocaleDateString('en-US', { month: 'long' }),
                expenses: monthExpenses,
                income: monthIncome,
                totalExpenses: totalExpenses,
                totalIncome: totalIncome,
                netIncome: totalIncome - totalExpenses
            });
        }
        
        // Calculate trends and patterns
        const avgMonthlyExpenses = last6Months.reduce((sum, month) => sum + month.totalExpenses, 0) / 6;
        const avgMonthlyIncome = last6Months.reduce((sum, month) => sum + month.totalIncome, 0) / 6;
        
        // Calculate growth rates
        const recent3Months = last6Months.slice(0, 3);
        const older3Months = last6Months.slice(3, 6);
        
        const recentAvgExpenses = recent3Months.reduce((sum, month) => sum + month.totalExpenses, 0) / 3;
        const olderAvgExpenses = older3Months.reduce((sum, month) => sum + month.totalExpenses, 0) / 3;
        
        const expenseGrowthRate = olderAvgExpenses > 0 ? ((recentAvgExpenses - olderAvgExpenses) / olderAvgExpenses) * 100 : 0;
        
        // Category-wise analysis for forecasting
        const categoryTrends = {};
        last6Months.forEach(month => {
            month.expenses.forEach(expense => {
                const category = expense.category || 'Other';
                if (!categoryTrends[category]) {
                    categoryTrends[category] = [];
                }
                categoryTrends[category].push(parseFloat(expense.amount));
            });
        });
        
        // Calculate category averages and growth
        const categoryForecasts = {};
        Object.keys(categoryTrends).forEach(category => {
            const amounts = categoryTrends[category];
            const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
            const recentAvg = amounts.slice(0, 3).reduce((sum, amount) => sum + amount, 0) / Math.min(3, amounts.length);
            const olderAvg = amounts.slice(3).reduce((sum, amount) => sum + amount, 0) / Math.max(1, amounts.length - 3);
            
            const growthRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
            
            categoryForecasts[category] = {
                currentAvg: avgAmount,
                growthRate: growthRate,
                predictedNextMonth: avgAmount * (1 + growthRate / 100)
            };
        });
        
        // Predict next 3 months
        const next3Months = [];
        for (let i = 1; i <= 3; i++) {
            const nextMonth = currentMonth + i;
            const nextYear = nextMonth > 12 ? currentYear + 1 : currentYear;
            const actualNextMonth = nextMonth > 12 ? nextMonth - 12 : nextMonth;
            
            const predictedExpenses = avgMonthlyExpenses * (1 + expenseGrowthRate / 100) * Math.pow(1 + expenseGrowthRate / 100, i - 1);
            const predictedIncome = avgMonthlyIncome; // Assume income stays stable
            
            next3Months.push({
                month: actualNextMonth,
                year: nextYear,
                monthName: new Date(nextYear, actualNextMonth - 1).toLocaleDateString('en-US', { month: 'long' }),
                predictedExpenses: predictedExpenses,
                predictedIncome: predictedIncome,
                predictedNet: predictedIncome - predictedExpenses
            });
        }
        
        // Calculate year-end predictions
        const monthsRemaining = 12 - currentMonth + 1;
        const predictedYearEndExpenses = avgMonthlyExpenses * monthsRemaining;
        const predictedYearEndIncome = avgMonthlyIncome * monthsRemaining;
        const predictedYearEndNet = predictedYearEndIncome - predictedYearEndExpenses;
        
        // Risk analysis
        const risks = [];
        if (expenseGrowthRate > 10) {
            risks.push({
                type: 'warning',
                title: 'High Spending Growth',
                message: `Your expenses are growing at ${expenseGrowthRate.toFixed(1)}% per month. This trend could lead to budget overruns.`
            });
        }
        
        if (avgMonthlyExpenses > avgMonthlyIncome * 0.8) {
            risks.push({
                type: 'danger',
                title: 'High Expense Ratio',
                message: `You're spending ${((avgMonthlyExpenses / avgMonthlyIncome) * 100).toFixed(1)}% of your income on expenses. Consider increasing savings.`
            });
        }
        
        const topGrowingCategory = Object.entries(categoryForecasts)
            .sort(([,a], [,b]) => b.growthRate - a.growthRate)[0];
        
        if (topGrowingCategory && topGrowingCategory[1].growthRate > 15) {
            risks.push({
                type: 'info',
                title: 'Fast Growing Category',
                message: `${topGrowingCategory[0]} expenses are growing at ${topGrowingCategory[1].growthRate.toFixed(1)}% per month. Monitor this category closely.`
            });
        }
        
        return {
            last6Months,
            avgMonthlyExpenses,
            avgMonthlyIncome,
            expenseGrowthRate,
            categoryForecasts,
            next3Months,
            predictedYearEndExpenses,
            predictedYearEndIncome,
            predictedYearEndNet,
            risks,
            monthsRemaining
        };
    }

    createForecastingHTML(forecast) {
        const growthIcon = forecast.expenseGrowthRate > 0 ? '📈' : 
                          forecast.expenseGrowthRate < 0 ? '📉' : '➡️';
        const growthColor = forecast.expenseGrowthRate > 0 ? 'text-danger' : 
                           forecast.expenseGrowthRate < 0 ? 'text-success' : 'text-info';

        return `
            <div class="row">
                <!-- Current Trends -->
                <div class="col-md-6 mb-4">
                    <div class="card border-primary">
                        <div class="card-header bg-primary text-white">
                            <h6 class="mb-0">📊 Current Trends (6 Months)</h6>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-primary">₹${forecast.avgMonthlyExpenses.toFixed(2)}</h4>
                                    <small class="text-muted">Avg Monthly Expenses</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-success">₹${forecast.avgMonthlyIncome.toFixed(2)}</h4>
                                    <small class="text-muted">Avg Monthly Income</small>
                                </div>
                            </div>
                            <hr>
                            <div class="text-center">
                                <h5 class="${growthColor}">${growthIcon} ${Math.abs(forecast.expenseGrowthRate).toFixed(1)}%</h5>
                                <small class="text-muted">Monthly Growth Rate</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Year-End Predictions -->
                <div class="col-md-6 mb-4">
                    <div class="card border-warning">
                        <div class="card-header bg-warning text-dark">
                            <h6 class="mb-0">🎯 Year-End Predictions</h6>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-6">
                                    <h4 class="text-warning">₹${forecast.predictedYearEndExpenses.toFixed(2)}</h4>
                                    <small class="text-muted">Predicted Expenses</small>
                                </div>
                                <div class="col-6">
                                    <h4 class="text-info">₹${forecast.predictedYearEndIncome.toFixed(2)}</h4>
                                    <small class="text-muted">Predicted Income</small>
                                </div>
                            </div>
                            <hr>
                            <div class="text-center">
                                <h5 class="${forecast.predictedYearEndNet >= 0 ? 'text-success' : 'text-danger'}">
                                    ₹${forecast.predictedYearEndNet.toFixed(2)}
                                </h5>
                                <small class="text-muted">Predicted Net (${forecast.monthsRemaining} months left)</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Next 3 Months Forecast -->
                <div class="col-12 mb-4">
                    <div class="card border-info">
                        <div class="card-header bg-info text-white">
                            <h6 class="mb-0">🔮 Next 3 Months Forecast</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                ${forecast.next3Months.map(month => `
                                    <div class="col-md-4 mb-3">
                                        <div class="card border-light">
                                            <div class="card-body text-center">
                                                <h6 class="card-title text-primary">${month.monthName} ${month.year}</h6>
                                                <div class="mb-2">
                                                    <small class="text-muted">Expenses:</small>
                                                    <h6 class="text-danger">₹${month.predictedExpenses.toFixed(2)}</h6>
                                                </div>
                                                <div class="mb-2">
                                                    <small class="text-muted">Income:</small>
                                                    <h6 class="text-success">₹${month.predictedIncome.toFixed(2)}</h6>
                                                </div>
                                                <div>
                                                    <small class="text-muted">Net:</small>
                                                    <h6 class="${month.predictedNet >= 0 ? 'text-success' : 'text-danger'}">
                                                        ₹${month.predictedNet.toFixed(2)}
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Category Forecasts -->
                <div class="col-md-6 mb-4">
                    <div class="card border-success">
                        <div class="card-header bg-success text-white">
                            <h6 class="mb-0">📈 Category Growth Forecasts</h6>
                        </div>
                        <div class="card-body">
                            ${Object.entries(forecast.categoryForecasts)
                                .sort(([,a], [,b]) => b.growthRate - a.growthRate)
                                .slice(0, 5)
                                .map(([category, data]) => `
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span><strong>${category}</strong></span>
                                        <div class="text-end">
                                            <small class="text-muted">Next Month: ₹${data.predictedNextMonth.toFixed(2)}</small><br>
                                            <span class="badge ${data.growthRate > 0 ? 'bg-danger' : data.growthRate < 0 ? 'bg-success' : 'bg-secondary'}">
                                                ${data.growthRate > 0 ? '+' : ''}${data.growthRate.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Risk Analysis -->
                <div class="col-md-6 mb-4">
                    <div class="card border-danger">
                        <div class="card-header bg-danger text-white">
                            <h6 class="mb-0">⚠️ Risk Analysis</h6>
                        </div>
                        <div class="card-body">
                            ${forecast.risks.length > 0 ? 
                                forecast.risks.map(risk => `
                                    <div class="alert alert-${risk.type} alert-sm mb-2">
                                        <strong>${risk.title}</strong><br>
                                        <small>${risk.message}</small>
                                    </div>
                                `).join('') :
                                '<div class="alert alert-success alert-sm">No significant risks detected. Your spending patterns look healthy!</div>'
                            }
                        </div>
                    </div>
                </div>

                <!-- Historical Data Chart -->
                <div class="col-12 mb-4">
                    <div class="card border-secondary">
                        <div class="card-header bg-secondary text-white">
                            <h6 class="mb-0">📊 6-Month Historical Data</h6>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Month</th>
                                            <th class="text-end">Expenses</th>
                                            <th class="text-end">Income</th>
                                            <th class="text-end">Net</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${forecast.last6Months.reverse().map(month => `
                                            <tr>
                                                <td>${month.monthName} ${month.year}</td>
                                                <td class="text-end text-danger">₹${month.totalExpenses.toFixed(2)}</td>
                                                <td class="text-end text-success">₹${month.totalIncome.toFixed(2)}</td>
                                                <td class="text-end ${month.netIncome >= 0 ? 'text-success' : 'text-danger'}">
                                                    ₹${month.netIncome.toFixed(2)}
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    refreshAIForecasting() {
        const forecastingContent = document.getElementById('ai-forecasting-content');
        forecastingContent.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Refreshing...</span>
                </div>
                <p class="mt-2">Refreshing AI forecast...</p>
            </div>
        `;
        
        setTimeout(() => {
            this.generateAIForecasting();
        }, 1000);
    }

    // AI Feature 4: Natural Language Queries
    showAIChat() {
        console.log('AI Chat clicked!');
        const modalElement = document.getElementById('aiChatModal');
        if (!modalElement) {
            console.error('AI Chat modal not found!');
            return;
        }
        
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('ai-chat-input').focus();
        }, 500);
    }

    sendAIChatMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Clear input
        input.value = '';
        
        // Add user message to chat
        this.addChatMessage(message, 'user');
        
        // Show typing indicator
        this.addTypingIndicator();
        
        // Process the query
        setTimeout(() => {
            this.processAIQuery(message);
        }, 1000);
    }

    askQuickQuestion(question) {
        document.getElementById('ai-chat-input').value = question;
        this.sendAIChatMessage();
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('ai-chat-messages');
        
        // Remove welcome message if it exists
        const welcomeMessage = chatMessages.querySelector('.text-center.text-muted');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `mb-3 ${sender === 'user' ? 'text-end' : 'text-start'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = `d-inline-block p-3 rounded ${sender === 'user' ? 'bg-primary text-white' : 'bg-light border'}`;
        messageContent.style.maxWidth = '80%';
        
        if (sender === 'ai') {
            messageContent.innerHTML = `
                <div class="d-flex align-items-start">
                    <i class="bi bi-robot me-2"></i>
                    <div>${message}</div>
                </div>
            `;
        } else {
            messageContent.innerHTML = `
                <div class="d-flex align-items-start">
                    <i class="bi bi-person me-2"></i>
                    <div>${message}</div>
                </div>
            `;
        }
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    addTypingIndicator() {
        const chatMessages = document.getElementById('ai-chat-messages');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'mb-3 text-start';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="d-inline-block p-3 rounded bg-light border">
                <div class="d-flex align-items-center">
                    <i class="bi bi-robot me-2"></i>
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    processAIQuery(query) {
        console.log('Processing AI query:', query);
        
        // Remove typing indicator
        this.removeTypingIndicator();
        
        // Analyze the query and generate response
        const response = this.analyzeQuery(query);
        
        // Add AI response to chat
        this.addChatMessage(response, 'ai');
    }

    analyzeQuery(query) {
        const lowerQuery = query.toLowerCase();
        
        // Get current month data
        const currentMonth = this.currentMonth;
        const currentYear = this.currentYear;
        
        const currentMonthExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() + 1 === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
        });
        
        const currentMonthIncome = this.income.filter(income => {
            const incomeDate = new Date(income.date);
            return incomeDate.getMonth() + 1 === currentMonth && 
                   incomeDate.getFullYear() === currentYear;
        });
        
        const totalExpenses = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const totalIncome = currentMonthIncome.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
        const netIncome = totalIncome - totalExpenses;
        
        // Monthly spending queries
        if (lowerQuery.includes('how much') && lowerQuery.includes('spend') && lowerQuery.includes('month')) {
            return `You spent <strong>₹${totalExpenses.toFixed(2)}</strong> this month (${this.getMonthName(currentMonth)} ${currentYear}). Your net income is <strong>₹${netIncome.toFixed(2)}</strong> after ${totalExpenses.toFixed(2)} in expenses.`;
        }
        
        if (lowerQuery.includes('monthly spending') || lowerQuery.includes('spending this month')) {
            return `Your monthly spending for ${this.getMonthName(currentMonth)} ${currentYear} is <strong>₹${totalExpenses.toFixed(2)}</strong>. You made ${currentMonthExpenses.length} transactions this month.`;
        }
        
        // Category queries
        if (lowerQuery.includes('biggest') && (lowerQuery.includes('category') || lowerQuery.includes('expense'))) {
            const categorySpending = {};
            currentMonthExpenses.forEach(expense => {
                const category = expense.category || 'Other';
                categorySpending[category] = (categorySpending[category] || 0) + parseFloat(expense.amount);
            });
            
            const topCategory = Object.entries(categorySpending)
                .sort(([,a], [,b]) => b - a)[0];
            
            if (topCategory) {
                const percentage = (topCategory[1] / totalExpenses * 100).toFixed(1);
                return `Your biggest expense category is <strong>${topCategory[0]}</strong> with ₹${topCategory[1].toFixed(2)} (${percentage}% of total spending).`;
            }
            return "I don't have enough data to determine your biggest expense category yet.";
        }
        
        // Specific category queries
        const categoryKeywords = {
            'groceries': ['grocery', 'groceries', 'food', 'vegetables', 'milk', 'rice'],
            'transportation': ['transport', 'uber', 'taxi', 'fuel', 'gas', 'petrol'],
            'entertainment': ['entertainment', 'movie', 'cinema', 'netflix', 'game'],
            'healthcare': ['health', 'medical', 'doctor', 'medicine', 'hospital'],
            'kids': ['kids', 'children', 'school', 'project', 'toys'],
            'breakfast': ['breakfast', 'morning', 'idli', 'dosa', 'snacks']
        };
        
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => lowerQuery.includes(keyword))) {
                const categoryExpenses = currentMonthExpenses.filter(exp => 
                    (exp.category || '').toLowerCase().includes(category.toLowerCase())
                );
                const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
                
                if (categoryTotal > 0) {
                    const percentage = (categoryTotal / totalExpenses * 100).toFixed(1);
                    return `You spent <strong>₹${categoryTotal.toFixed(2)}</strong> on ${category} this month (${percentage}% of total spending). You made ${categoryExpenses.length} transactions in this category.`;
                } else {
                    return `You haven't spent anything on ${category} this month.`;
                }
            }
        }
        
        // Daily average queries
        if (lowerQuery.includes('daily') && lowerQuery.includes('average')) {
            const dailyAverage = totalExpenses / 30;
            return `Your average daily spending is <strong>₹${dailyAverage.toFixed(2)}</strong> this month. You make about ${(currentMonthExpenses.length / 30).toFixed(1)} transactions per day.`;
        }
        
        // Income queries
        if (lowerQuery.includes('income') || lowerQuery.includes('earn')) {
            return `Your total income this month is <strong>₹${totalIncome.toFixed(2)}</strong>. Your net income (after expenses) is <strong>₹${netIncome.toFixed(2)}</strong>.`;
        }
        
        // Transaction count queries
        if (lowerQuery.includes('how many') && lowerQuery.includes('transaction')) {
            return `You made <strong>${currentMonthExpenses.length}</strong> expense transactions this month, totaling ₹${totalExpenses.toFixed(2)}.`;
        }
        
        // Savings queries
        if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
            if (netIncome > 0) {
                return `You're saving <strong>₹${netIncome.toFixed(2)}</strong> this month! That's a savings rate of ${((netIncome / totalIncome) * 100).toFixed(1)}%. Great job!`;
            } else {
                return `You're spending more than you earn this month (₹${Math.abs(netIncome).toFixed(2)} over budget). Consider reducing expenses or increasing income.`;
            }
        }
        
        // Budget queries
        if (lowerQuery.includes('budget') || lowerQuery.includes('should i spend')) {
            const avgDaily = totalExpenses / 30;
            const remainingDays = 30 - new Date().getDate();
            const projectedMonthly = totalExpenses + (avgDaily * remainingDays);
            
            return `Based on your current spending pattern, you're on track to spend <strong>₹${projectedMonthly.toFixed(2)}</strong> this month. Your daily average is ₹${avgDaily.toFixed(2)}. ${remainingDays} days remaining in the month.`;
        }
        
        // Help queries
        if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
            return `I can help you with:<br>
            • <strong>Monthly spending</strong> - "How much did I spend this month?"<br>
            • <strong>Category analysis</strong> - "What's my biggest expense category?"<br>
            • <strong>Specific categories</strong> - "How much on groceries?"<br>
            • <strong>Daily averages</strong> - "What's my daily spending?"<br>
            • <strong>Income analysis</strong> - "How much did I earn?"<br>
            • <strong>Savings tracking</strong> - "Am I saving money?"<br>
            • <strong>Budget planning</strong> - "Should I spend more?"<br><br>
            Just ask me anything about your finances!`;
        }
        
        // Default response
        return `I understand you're asking about "${query}". I can help you analyze your spending patterns, income, categories, and more. Try asking specific questions like:<br>
        • "How much did I spend this month?"<br>
        • "What's my biggest expense category?"<br>
        • "How much on groceries?"<br>
        • "What's my daily average spending?"<br><br>
        What would you like to know about your finances?`;
    }

    getMonthName(monthNumber) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthNumber - 1];
    }

    clearAIChat() {
        const chatMessages = document.getElementById('ai-chat-messages');
        chatMessages.innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-robot fs-1"></i>
                <p class="mt-2">Hi! I'm your AI Financial Assistant. Ask me anything about your expenses, income, or financial patterns!</p>
                <small>Try asking: "How much did I spend on groceries this month?" or "What's my biggest expense category?"</small>
            </div>
        `;
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
