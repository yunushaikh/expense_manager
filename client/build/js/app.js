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

    loadDashboardData() {
        this.updateSummaryCards();
        this.updateRecentTransactions();
        this.createMonthlyChart();
        this.createCategoryChart();
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
        document.getElementById('total-income').textContent = this.formatCurrency(this.summary.totalIncome);
        document.getElementById('total-expenses').textContent = this.formatCurrency(this.summary.totalExpenses);
        document.getElementById('net-income').textContent = this.formatCurrency(this.summary.netIncome);
        document.getElementById('total-transactions').textContent = this.expenses.length + this.income.length;
        
        // Update yearly summary cards
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

    async createMonthlyChart() {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
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
                console.error('Error fetching monthly data:', error);
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
