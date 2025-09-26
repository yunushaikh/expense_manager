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

const MonthlyAnalytics = ({ selectedMonth, selectedYear, expensesByCategory, totalExpenses, currencyCode, formatCurrency }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [monthlyResponse, trendsResponse] = await Promise.all([
        axios.get(`/api/analytics/monthly?month=${selectedMonth}&year=${selectedYear}`),
        axios.get('/api/analytics/trends?months=6')
      ]);
      setMonthlyData(monthlyResponse.data);
      setTrendsData(trendsResponse.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const doughnutData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: Object.keys(expensesByCategory).map(category => getCategoryColor(category)),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const trendsChartData = {
    labels: trendsData.map(item => {
      const [year, month] = item.month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }),
    datasets: [
      {
        label: 'Monthly Spending',
        data: trendsData.map(item => item.total),
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        borderRadius: 4
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
        text: 'Spending by Category'
      }
    }
  };

  const trendsOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Spending Trends (Last 6 Months)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Monthly Analytics</h2>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-3">
        <div className="card text-center">
          <h3 className="text-sm text-gray-500 mb-1">Total Spent</h3>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalExpenses)}</div>
        </div>
        <div className="card text-center">
          <h3 className="text-sm text-gray-500 mb-1">Categories</h3>
          <div className="text-2xl font-bold text-blue-600">{Object.keys(expensesByCategory).length}</div>
        </div>
        <div className="card text-center">
          <h3 className="text-sm text-gray-500 mb-1">Avg per Day</h3>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(totalExpenses / new Date(selectedYear, selectedMonth, 0).getDate())}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-2">
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Category Breakdown</h3>
          {Object.keys(expensesByCategory).length > 0 ? (
            <Doughnut data={doughnutData} options={chartOptions} />
          ) : (
            <div className="text-center py-8 text-gray-500">No data available</div>
          )}
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Spending Trends</h3>
          {trendsData.length > 0 ? (
            <Bar data={trendsChartData} options={trendsOptions} />
          ) : (
            <div className="text-center py-8 text-gray-500">No trend data available</div>
          )}
        </div>
      </div>

      {/* Category Details */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-3">Category Details</h3>
        {monthlyData.length > 0 ? (
          <div className="space-y-3">
            {monthlyData.map(item => (
              <div key={item.category} className="flex-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: getCategoryColor(item.category) }}
                  ></div>
                  <span className="font-medium">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(parseFloat(item.total).toFixed(2))}</div>
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
  );
};

export default MonthlyAnalytics;
