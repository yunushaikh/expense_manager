import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';

const ExpenseList = ({ expenses, loading, onUpdateExpense, onDeleteExpense, categories, currencyCode, formatCurrency }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date
    });
  };

  const handleSave = async (id) => {
    try {
      await onUpdateExpense(id, editForm);
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await onDeleteExpense(id);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const getCategoryColor = (category) => {
    const categoryObj = categories.find(cat => cat.name === category);
    return categoryObj ? categoryObj.color : '#95a5a6';
  };

  const getCategoryClass = (category) => {
    const categoryMap = {
      'Groceries': 'category-groceries',
      'Kids': 'category-kids',
      'Daily Items': 'category-daily',
      'Transportation': 'category-transportation',
      'Entertainment': 'category-entertainment',
      'Healthcare': 'category-healthcare',
      'Other': 'category-other'
    };
    return categoryMap[category] || 'category-other';
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Recent Expenses</h2>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading expenses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-3">Recent Expenses</h2>
      
      {expenses.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No expenses found for this month</div>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map(expense => (
            <div key={expense.id} className="bg-gray-50 rounded-lg p-4">
              {editingId === expense.id ? (
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
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="form-select"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
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
                      onClick={() => handleSave(expense.id)}
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
                      <span className="font-semibold">{formatCurrency(parseFloat(expense.amount).toFixed(2))}</span>
                      <span className={`category-badge ${getCategoryClass(expense.category)}`}>
                        {expense.category}
                      </span>
                    </div>
                    {expense.description && (
                      <div className="text-sm text-gray-600 mb-1">{expense.description}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      {format(parseISO(expense.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="flex">
                    <button 
                      onClick={() => handleEdit(expense)}
                      className="btn btn-secondary mr-2"
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(expense.id)}
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

export default ExpenseList;
