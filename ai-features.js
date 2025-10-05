// AI Features for Expense Manager
class AIFeatures {
    constructor() {
        this.openaiApiKey = null; // Will be set by user
        this.isAIConnected = false;
    }

    // Initialize AI features
    async init(apiKey = null) {
        if (apiKey) {
            this.openaiApiKey = apiKey;
            this.isAIConnected = true;
        }
        return this.isAIConnected;
    }

    // Smart categorization based on description
    async suggestCategory(description, amount = null) {
        if (!this.isAIConnected) {
            return this.fallbackCategorization(description);
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'system',
                        content: `You are an expense categorization expert. Categorize the following expense description into one of these categories: 
                        Food & Dining, Transportation, Shopping, Entertainment, Healthcare, Utilities, Education, Travel, 
                        Groceries, Gas, Insurance, Rent, Subscriptions, Other. 
                        Return only the category name, nothing else.`
                    }, {
                        role: 'user',
                        content: `Expense: "${description}"${amount ? ` Amount: ₹${amount}` : ''}`
                    }],
                    max_tokens: 20,
                    temperature: 0.3
                })
            });

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('AI categorization error:', error);
            return this.fallbackCategorization(description);
        }
    }

    // Fallback categorization using keyword matching
    fallbackCategorization(description) {
        const desc = description.toLowerCase();
        
        const categories = {
            'Food & Dining': ['restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'food', 'eat', 'dining'],
            'Transportation': ['uber', 'taxi', 'bus', 'train', 'metro', 'fuel', 'gas', 'parking', 'transport'],
            'Shopping': ['amazon', 'flipkart', 'mall', 'store', 'shop', 'purchase', 'buy'],
            'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment', 'fun'],
            'Healthcare': ['hospital', 'doctor', 'medicine', 'pharmacy', 'health', 'medical', 'clinic'],
            'Utilities': ['electricity', 'water', 'internet', 'phone', 'utility', 'bill'],
            'Education': ['school', 'college', 'course', 'book', 'education', 'learning', 'tuition'],
            'Travel': ['hotel', 'flight', 'vacation', 'trip', 'travel', 'booking'],
            'Groceries': ['grocery', 'supermarket', 'vegetables', 'fruits', 'milk', 'bread'],
            'Gas': ['petrol', 'diesel', 'fuel', 'gas station', 'pump'],
            'Insurance': ['insurance', 'premium', 'policy'],
            'Rent': ['rent', 'rental', 'apartment', 'house'],
            'Subscriptions': ['subscription', 'monthly', 'yearly', 'recurring']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => desc.includes(keyword))) {
                return category;
            }
        }

        return 'Other';
    }

    // Generate spending insights
    generateSpendingInsights(expenses, income, timeRange = 'month') {
        const insights = [];
        
        // Calculate total expenses
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const totalIncome = income.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
        
        // Category analysis
        const categoryTotals = {};
        expenses.forEach(exp => {
            categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
        });

        // Find top spending category
        const topCategory = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)[0];

        if (topCategory) {
            const percentage = ((topCategory[1] / totalExpenses) * 100).toFixed(1);
            insights.push({
                type: 'category',
                message: `Your top spending category is ${topCategory[0]} (${percentage}% of total expenses)`,
                suggestion: this.getCategorySuggestion(topCategory[0], percentage)
            });
        }

        // Spending vs Income analysis
        if (totalIncome > 0) {
            const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);
            
            if (savingsRate < 0) {
                insights.push({
                    type: 'budget',
                    message: `You're spending more than you earn this ${timeRange}. Consider reducing expenses.`,
                    suggestion: 'Review your spending patterns and identify areas to cut back.'
                });
            } else if (savingsRate < 10) {
                insights.push({
                    type: 'budget',
                    message: `Your savings rate is ${savingsRate}%. Consider increasing it to 20% for better financial health.`,
                    suggestion: 'Look for ways to reduce expenses or increase income.'
                });
            } else {
                insights.push({
                    type: 'budget',
                    message: `Great job! You're saving ${savingsRate}% of your income this ${timeRange}.`,
                    suggestion: 'Consider investing your savings for long-term growth.'
                });
            }
        }

        // Daily spending pattern
        const dailySpending = this.analyzeDailySpending(expenses);
        if (dailySpending.weekendSpending > dailySpending.weekdaySpending * 1.5) {
            insights.push({
                type: 'pattern',
                message: 'You spend significantly more on weekends. Consider planning weekend activities with a budget.',
                suggestion: 'Set a weekend spending limit to control expenses.'
            });
        }

        return insights;
    }

    // Get category-specific suggestions
    getCategorySuggestion(category, percentage) {
        const suggestions = {
            'Food & Dining': percentage > 30 ? 'Consider meal planning and cooking at home to reduce dining expenses.' : 'Good balance on food spending.',
            'Transportation': percentage > 20 ? 'Consider carpooling or public transport to reduce transportation costs.' : 'Transportation spending looks reasonable.',
            'Shopping': percentage > 25 ? 'Try the 24-hour rule: wait a day before making non-essential purchases.' : 'Shopping habits look controlled.',
            'Entertainment': percentage > 15 ? 'Look for free or low-cost entertainment options.' : 'Entertainment spending is well managed.',
            'Groceries': percentage > 20 ? 'Consider bulk buying and meal planning to optimize grocery spending.' : 'Grocery spending is efficient.'
        };
        
        return suggestions[category] || 'Consider if this spending aligns with your financial goals.';
    }

    // Analyze daily spending patterns
    analyzeDailySpending(expenses) {
        const weekdaySpending = [];
        const weekendSpending = [];
        
        expenses.forEach(exp => {
            const date = new Date(exp.date);
            const dayOfWeek = date.getDay();
            const amount = parseFloat(exp.amount);
            
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                weekendSpending.push(amount);
            } else {
                weekdaySpending.push(amount);
            }
        });

        return {
            weekdaySpending: weekdaySpending.reduce((sum, amount) => sum + amount, 0) / Math.max(weekdaySpending.length, 1),
            weekendSpending: weekendSpending.reduce((sum, amount) => sum + amount, 0) / Math.max(weekendSpending.length, 1)
        };
    }

    // Generate budget forecast
    generateBudgetForecast(expenses, months = 3) {
        const monthlyTotals = {};
        
        // Group expenses by month
        expenses.forEach(exp => {
            const date = new Date(exp.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + parseFloat(exp.amount);
        });

        // Calculate average monthly spending
        const monthlyValues = Object.values(monthlyTotals);
        const averageMonthly = monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;

        // Generate forecast
        const forecast = [];
        const currentDate = new Date();
        
        for (let i = 1; i <= months; i++) {
            const forecastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
            const monthKey = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;
            
            forecast.push({
                month: forecastDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                predictedAmount: Math.round(averageMonthly),
                confidence: Math.max(0.6, 1 - (i * 0.1)) // Decreasing confidence over time
            });
        }

        return forecast;
    }

    // Natural language query processing
    async processNaturalLanguageQuery(query, expenses, income) {
        if (!this.isAIConnected) {
            return this.fallbackQuery(query, expenses, income);
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'system',
                        content: `You are a financial assistant. Analyze the provided expense and income data to answer user queries. 
                        Be specific and provide actionable insights. Use Indian Rupee (₹) for currency.`
                    }, {
                        role: 'user',
                        content: `Query: "${query}"\n\nExpenses: ${JSON.stringify(expenses.slice(0, 10))}\nIncome: ${JSON.stringify(income.slice(0, 10))}`
                    }],
                    max_tokens: 300,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI query error:', error);
            return this.fallbackQuery(query, expenses, income);
        }
    }

    // Fallback query processing
    fallbackQuery(query, expenses, income) {
        const q = query.toLowerCase();
        
        if (q.includes('total') && q.includes('expense')) {
            const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
            return `Total expenses: ₹${total.toLocaleString()}`;
        }
        
        if (q.includes('total') && q.includes('income')) {
            const total = income.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
            return `Total income: ₹${total.toLocaleString()}`;
        }
        
        if (q.includes('category')) {
            const categories = [...new Set(expenses.map(exp => exp.category))];
            return `Expense categories: ${categories.join(', ')}`;
        }
        
        return "I can help you analyze your expenses. Try asking about totals, categories, or spending patterns.";
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIFeatures;
}
