import React from 'react';

const Header = ({ 
  totalExpenses, 
  totalIncome,
  netIncome,
  selectedMonth, 
  selectedYear, 
  onMonthChange, 
  onYearChange, 
  activeTab, 
  onTabChange,
  currencyCode,
  onCurrencyChange,
  formatCurrency,
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <header className="card mb-4">
      <div className="flex-between mb-3">
        <h1 className="text-2xl font-bold text-gray-700">💰 Expense Manager</h1>
        <div className="text-right">
          <div className="text-sm text-gray-500">Financial Summary for {monthNames[selectedMonth - 1]} {selectedYear}</div>
          <div className="flex justify-end space-x-4 text-sm">
            <div>
              <span className="text-gray-500">Income: </span>
              <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
            </div>
            <div>
              <span className="text-gray-500">Expenses: </span>
              <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>
            </div>
            <div>
              <span className="text-gray-500">Net: </span>
              <span className={`font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netIncome)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-between mb-3">
        <div className="flex">
          <select 
            value={selectedMonth} 
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            className="form-select mr-2"
            style={{ width: 'auto' }}
          >
            {monthNames.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="form-select"
            style={{ width: 'auto' }}
          >
            {Array.from({ length: 15 }, (_, i) => {
              const year = new Date().getFullYear() - 5 + i; // dynamic wider range
              return (
                <option key={year} value={year}>{year}</option>
              );
            })}
          </select>
        </div>

        <div className="flex" style={{ gap: 8 }}>
          <select
            value={currencyCode}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="form-select mr-2"
            style={{ width: 'auto' }}
          >
            {[
              'INR','USD','EUR','GBP','AUD','CAD','JPY','CNY','SGD','AED','CHF','SEK','NOK','DKK','ZAR','NZD','HKD','SAR','KWD','QAR','BDT','PKR','LKR','THB','MYR','IDR','PHP','VND','TRY','RUB','PLN','CZK','HUF','ILS','BRL','MXN','ARS','CLP','COP','PEN'
            ].map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>

          <button 
            className={`btn mr-2 ${activeTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onTabChange('expenses')}
          >
            📝 Expenses
          </button>
          <button 
            className={`btn mr-2 ${activeTab === 'income' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onTabChange('income')}
          >
            💰 Income
          </button>
          <button 
            className={`btn mr-2 ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onTabChange('analytics')}
          >
            📊 Analytics
          </button>
          <button 
            className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onTabChange('reports')}
          >
            📈 Reports
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
