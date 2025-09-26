import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';

const IncomeList = ({ income, loading, onUpdateIncome, onDeleteIncome, incomeSources, currencyCode, formatCurrency }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (incomeItem) => {
    setEditingId(incomeItem.id);
    setEditForm({
      amount: incomeItem.amount,
      source: incomeItem.source,
      description: incomeItem.description,
      date: incomeItem.date
    });
  };

  const handleSave = async (id) => {
    try {
      await onUpdateIncome(id, editForm);
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating income:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await onDeleteIncome(id);
      } catch (error) {
        console.error('Error deleting income:', error);
      }
    }
  };

  const getSourceColor = (source) => {
    const sourceObj = incomeSources.find(src => src.name === source);
    return sourceObj ? sourceObj.color : '#27ae60';
  };

  const getSourceClass = (source) => {
    const sourceMap = {
      'Salary': 'source-salary',
      'Freelance': 'source-freelance',
      'Business': 'source-business',
      'Investment': 'source-investment',
      'Rental': 'source-rental',
      'Bonus': 'source-bonus',
      'Other': 'source-other'
    };
    return sourceMap[source] || 'source-other';
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Recent Income</h2>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading income...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-3">Recent Income</h2>
      
      {income.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No income found for this month</div>
        </div>
      ) : (
        <div className="space-y-3">
          {income.map(incomeItem => (
            <div key={incomeItem.id} className="bg-green-50 rounded-lg p-4">
              {editingId === incomeItem.id ? (
                <div className="space-y-3">
                  <div className="grid grid-2 gap-3">
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="form-input"
                      step="0.01"
                      min="0"
                    />
                    <select
                      value={editForm.source}
                      onChange={(e) => setEditForm(prev => ({ ...prev, source: e.target.value }))}
                      className="form-select"
                    >
                      {incomeSources.map(source => (
                        <option key={source.id} value={source.name}>
                          {source.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="form-input"
                    placeholder="Description"
                  />
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                    className="form-input"
                  />
                  <div className="flex">
                    <button 
                      onClick={() => handleSave(incomeItem.id)}
                      className="btn btn-success mr-2"
                    >
                      Save
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-between">
                  <div className="flex-1">
                    <div className="flex-between mb-1">
                      <span className="font-semibold text-green-600">{formatCurrency(parseFloat(incomeItem.amount).toFixed(2))}</span>
                      <span className={`source-badge ${getSourceClass(incomeItem.source)}`}>
                        {incomeItem.source}
                      </span>
                    </div>
                    {incomeItem.description && (
                      <div className="text-sm text-gray-600 mb-1">{incomeItem.description}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      {format(parseISO(incomeItem.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="flex">
                    <button 
                      onClick={() => handleEdit(incomeItem)}
                      className="btn btn-secondary mr-2"
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(incomeItem.id)}
                      className="btn btn-danger"
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomeList;
