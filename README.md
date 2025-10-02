# 💰 Modern Expense Manager Dashboard

A beautiful, modern expense management application built with Bootstrap 5 and Node.js. Features a professional dashboard interface with comprehensive financial tracking, reporting, and analytics.

![Expense Manager Dashboard](https://img.shields.io/badge/Status-Live-brightgreen)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Database](https://img.shields.io/badge/Database-SQLite-orange)

## ✨ Features

### 🏠 **Modern Dashboard**
- **Financial Overview**: Real-time income, expenses, and net income tracking
- **Interactive Charts**: Beautiful visualizations with Chart.js
- **Recent Transactions**: Quick view of latest financial activities
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 💳 **Expense Management**
- **Add/Edit/Delete** expenses with full CRUD operations
- **Category System**: Color-coded categories for easy organization
- **Date Tracking**: Full date range support with month/year filtering
- **Form Validation**: Comprehensive input validation and error handling

### 💰 **Income Tracking**
- **Income Sources**: Track income from multiple sources
- **Detailed Records**: Description and date tracking for all income
- **Quick Entry**: Streamlined forms for fast data entry

### 📊 **Reports & Analytics**
- **Financial Reports**: Income vs expenses comparison charts
- **Trend Analysis**: Monthly spending pattern visualization
- **Category Breakdown**: Detailed spending analysis by category
- **Interactive Charts**: Hover effects and responsive design

### 🎨 **Modern UI/UX**
- **Bootstrap 5**: Latest Bootstrap framework with custom styling
- **Professional Design**: Clean, modern interface inspired by admin dashboards
- **Dark/Light Theme**: Automatic theme detection and switching
- **Smooth Animations**: Hover effects and transitions throughout

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/expense-manager.git
   cd expense-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   # Using the service script (recommended)
   ./service.sh start
   
   # Or directly with npm
   npm start
   ```

4. **Access the application**
   Open your browser and navigate to: `http://localhost:5000`

### Service Management

The application includes a comprehensive service script for easy management:

```bash
# Start the service
./service.sh start

# Stop the service
./service.sh stop

# Restart the service
./service.sh restart

# Check status
./service.sh status

# View logs
./service.sh logs

# Show help
./service.sh help
```

## 🏗️ Architecture

### Backend (Node.js/Express)
- **RESTful API**: Clean API endpoints for all operations
- **SQLite Database**: Lightweight, file-based database
- **Data Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error handling and logging

### Frontend (Bootstrap 5/JavaScript)
- **Modern JavaScript**: ES6+ classes and async/await
- **Bootstrap 5**: Responsive grid system and components
- **Chart.js**: Beautiful, interactive charts and graphs
- **Modular Design**: Clean, maintainable code structure

### Database Schema
- **Expenses Table**: Amount, category, description, date
- **Income Table**: Amount, source, description, date
- **Categories Table**: Name and color for expense categories

## 📱 Screenshots

### Dashboard View
- Financial summary cards with key metrics
- Interactive charts showing spending patterns
- Recent transactions list
- Month/year navigation

### Expense Management
- Clean table layout with all expense data
- Color-coded category badges
- Quick action buttons for edit/delete
- Add new expense modal

### Reports & Analytics
- Income vs expenses comparison
- Monthly trend analysis
- Category breakdown charts
- Interactive data visualization

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=production
```

### Database
The application uses SQLite for data storage. The database file (`expenses.db`) is created automatically on first run.

### Customization
- **Categories**: Modify categories in the database or API
- **Styling**: Customize CSS in `client/build/css/style.css`
- **Charts**: Configure Chart.js options in `client/build/js/app.js`

## 📊 API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses (with optional filtering)
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Income
- `GET /api/income` - Get all income (with optional filtering)
- `POST /api/income` - Create new income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### Categories
- `GET /api/categories` - Get all categories

### Summary
- `GET /api/summary` - Get financial summary for selected period

## 🛠️ Development

### Project Structure
```
expense-manager/
├── client/
│   └── build/
│       ├── index.html          # Main HTML file
│       ├── css/
│       │   └── style.css       # Custom styles
│       └── js/
│           └── app.js          # Frontend JavaScript
├── server.js                   # Express server
├── service.sh                  # Service management script
├── package.json               # Dependencies
├── expenses.db                # SQLite database
└── README.md                  # This file
```

### Adding New Features
1. **Backend**: Add new API endpoints in `server.js`
2. **Frontend**: Update JavaScript in `client/build/js/app.js`
3. **Styling**: Modify CSS in `client/build/css/style.css`
4. **Database**: Update schema as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bootstrap 5** for the responsive framework
- **Chart.js** for beautiful data visualization
- **Express.js** for the robust backend framework
- **SQLite** for lightweight database storage

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/expense-manager/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer

---

**Built with ❤️ using modern web technologies**