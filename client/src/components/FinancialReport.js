import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const FinancialReport = ({ selectedMonth, selectedYear, currencyCode, formatCurrency }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFinancialReport();
  }, [selectedMonth, selectedYear]);

  const fetchFinancialReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/reports/financial?month=${selectedMonth}&year=${selectedYear}`);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching financial report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Groceries': '#e74c3c',
      'Kids': '#f39c12',
      'Daily Items': '#2ecc71',
      'Transportation': '#9b59b6',
      'Entertainment': '#1abc9c',
      'Healthcare': '#e67e22',
      'Other': '#95a5a6'
    };
    return colorMap[category] || '#95a5a6';
  };

  const getSourceColor = (source) => {
    const colorMap = {
      'Salary': '#27ae60',
      'Freelance': '#3498db',
      'Business': '#e67e22',
      'Investment': '#9b59b6',
      'Rental': '#1abc9c',
      'Bonus': '#f39c12',
      'Other': '#95a5a6'
    };
    return colorMap[source] || '#27ae60';
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Financial Report</h2>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading financial report...</div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Financial Report</h2>
        <div className="text-center py-8">
          <div className="text-gray-500">No data available</div>
        </div>
      </div>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const incomeVsExpenseData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [report.totalIncome, report.totalExpenses],
        backgroundColor: ['#27ae60', '#e74c3c'],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const incomeBySourceData = {
    labels: report.incomeBySource.map(item => item.source),
    datasets: [
      {
        data: report.incomeBySource.map(item => item.total),
        backgroundColor: report.incomeBySource.map(item => getSourceColor(item.source)),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const expensesByCategoryData = {
    labels: report.expensesByCategory.map(item => item.category),
    datasets: [
      {
        data: report.expensesByCategory.map(item => item.total),
        backgroundColor: report.expensesByCategory.map(item => getCategoryColor(item.category)),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Income vs Expenses'
      }
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📊';
    }
  };

  const getInsightClass = (type) => {
    switch (type) {
      case 'positive': return 'bg-green-100 border-green-400 text-green-700';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'info': return 'bg-blue-100 border-blue-400 text-blue-700';
      default: return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">
          Financial Report - {monthNames[report.month - 1]} {report.year}
        </h2>
        
        <div className="grid grid-3 mb-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">Total Income</h3>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(report.totalIncome)}</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">Total Expenses</h3>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(report.totalExpenses)}</div>
          </div>
          <div className={`text-center p-4 rounded-lg ${report.netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 className="text-sm text-gray-500 mb-1">Net Income</h3>
            <div className={`text-2xl font-bold ${report.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(report.netIncome)}
            </div>
          </div>
        </div>

        {/* Insights */}
        {report.insights && report.insights.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Key Insights</h3>
            {report.insights.map((insight, index) => (
              <div key={index} className={`border px-4 py-3 rounded ${getInsightClass(insight.type)}`}>
                <div className="flex items-center">
                  <span className="mr-2">{getInsightIcon(insight.type)}</span>
                  <span className="font-medium">{insight.message}</span>
                  {insight.percentage && insight.percentage > 0 && (
                    <span className="ml-2 text-sm">({insight.percentage}%)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-2">
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Income vs Expenses</h3>
          {report.totalIncome > 0 || report.totalExpenses > 0 ? (
            <Doughnut data={incomeVsExpenseData} options={chartOptions} />
          ) : (
            <div className="text-center py-8 text-gray-500">No data available</div>
          )}
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Income by Source</h3>
          {report.incomeBySource.length > 0 ? (
            <Doughnut data={incomeBySourceData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {display: true, text: 'Income by Source'}}}} />
          ) : (
            <div className="text-center py-8 text-gray-500">No income data available</div>
          )}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-2">
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Income Sources</h3>
          {report.incomeBySource.length > 0 ? (
            <div className="space-y-3">
              {report.incomeBySource.map(item => (
                <div key={item.source} className="flex-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: getSourceColor(item.source) }}
                    ></div>
                    <span className="font-medium">{item.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{formatCurrency(item.total)}</div>
                    <div className="text-sm text-gray-500">{item.count} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No income found for this month</div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Expense Categories</h3>
          {report.expensesByCategory.length > 0 ? (
            <div className="space-y-3">
              {report.expensesByCategory.map(item => (
                <div key={item.category} className="flex-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: getCategoryColor(item.category) }}
                    ></div>
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">{formatCurrency(item.total)}</div>
                    <div className="text-sm text-gray-500">{item.count} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No expenses found for this month</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;
