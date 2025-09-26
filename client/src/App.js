import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import IncomeForm from './components/IncomeForm';
import IncomeList from './components/IncomeList';
import MonthlyAnalytics from './components/MonthlyAnalytics';
import FinancialReport from './components/FinancialReport';
import Header from './components/Header';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [categories, setCategories] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');
  const [currencyCode, setCurrencyCode] = useState('INR');

  useEffect(() => {
    fetchExpenses();
    fetchIncome();
    fetchCategories();
    fetchIncomeSources();
  }, [selectedMonth, selectedYear]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/expenses?month=${selectedMonth}&year=${selectedYear}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/income?month=${selectedMonth}&year=${selectedYear}`);
      setIncome(response.data);
    } catch (error) {
      console.error('Error fetching income:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchIncomeSources = async () => {
    try {
      const response = await axios.get('/api/income-sources');
      setIncomeSources(response.data);
    } catch (error) {
      console.error('Error fetching income sources:', error);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      await axios.post('/api/expenses', expenseData);
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const addIncome = async (incomeData) => {
    try {
      await axios.post('/api/income', incomeData);
      fetchIncome();
    } catch (error) {
      console.error('Error adding income:', error);
      throw error;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      await axios.put(`/api/expenses/${id}`, expenseData);
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  const updateIncome = async (id, incomeData) => {
    try {
      await axios.put(`/api/income/${id}`, incomeData);
      fetchIncome();
    } catch (error) {
      console.error('Error updating income:', error);
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  const deleteIncome = async (id) => {
    try {
      await axios.delete(`/api/income/${id}`);
      fetchIncome();
    } catch (error) {
      console.error('Error deleting income:', error);
      throw error;
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };

  const getTotalIncome = () => {
    return income.reduce((total, incomeItem) => total + parseFloat(incomeItem.amount), 0);
  };

  const getNetIncome = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getExpensesByCategory = () => {
    const categoryTotals = {};
    expenses.forEach(expense => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += parseFloat(expense.amount);
      } else {
        categoryTotals[expense.category] = parseFloat(expense.amount);
      }
    });
    return categoryTotals;
  };

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(Number(amount) || 0);
    } catch (e) {
      // Fallback if currency not supported in environment
      return `${currencyCode} ${Number(amount || 0).toFixed(2)}`;
    }
  };

  return (
    <div className="App">
      <Header 
        totalExpenses={getTotalExpenses()}
        totalIncome={getTotalIncome()}
        netIncome={getNetIncome()}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currencyCode={currencyCode}
        onCurrencyChange={setCurrencyCode}
        formatCurrency={formatCurrency}
      />
      
      <div className="container">
        {activeTab === 'expenses' && (
          <div className="grid grid-2">
            <div>
              <ExpenseForm 
                categories={categories}
                onAddExpense={addExpense}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                currencyCode={currencyCode}
                formatCurrency={formatCurrency}
              />
            </div>
            <div>
              <ExpenseList 
                expenses={expenses}
                loading={loading}
                onUpdateExpense={updateExpense}
                onDeleteExpense={deleteExpense}
                categories={categories}
                currencyCode={currencyCode}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'income' && (
          <div className="grid grid-2">
            <div>
              <IncomeForm 
                incomeSources={incomeSources}
                onAddIncome={addIncome}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                currencyCode={currencyCode}
                formatCurrency={formatCurrency}
              />
            </div>
            <div>
              <IncomeList 
                income={income}
                loading={loading}
                onUpdateIncome={updateIncome}
                onDeleteIncome={deleteIncome}
                incomeSources={incomeSources}
                currencyCode={currencyCode}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <MonthlyAnalytics 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            expensesByCategory={getExpensesByCategory()}
            totalExpenses={getTotalExpenses()}
            currencyCode={currencyCode}
            formatCurrency={formatCurrency}
          />
        )}
        
        {activeTab === 'reports' && (
          <FinancialReport 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            currencyCode={currencyCode}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}

export default App;
