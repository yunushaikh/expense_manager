import React, { useState } from 'react';
import { format } from 'date-fns';

const IncomeForm = ({ incomeSources, onAddIncome, selectedMonth, selectedYear, currencyCode, formatCurrency }) => {
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onAddIncome(formData);
      setFormData({
        amount: '',
        source: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      setError('Failed to add income. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-3">Add New Income</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Amount ({currencyCode})</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="form-input"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Income Source</label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select income source</option>
            {incomeSources.map(source => (
              <option key={source.id} value={source.name}>
                {source.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Salary, freelance work, etc."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-success w-full"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Income'}
        </button>
      </form>
    </div>
  );
};

export default IncomeForm;
