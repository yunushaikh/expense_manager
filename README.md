# 💰 Modern Expense Manager Dashboard

A beautiful, modern expense management application built with Bootstrap 5 and Node.js. Features a professional dashboard interface with comprehensive financial tracking, reporting, and analytics.

![Expense Manager Dashboard](https://img.shields.io/badge/Status-Live-brightgreen)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Database](https://img.shields.io/badge/Database-SQLite-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

Before running this application, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v14.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`
- **Git** (for cloning the repository)
  - Download from [git-scm.com](https://git-scm.com/)

### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: At least 100MB free space
- **Browser**: Modern web browser (Chrome, Firefox, Safari, Edge)

### Optional (for development)
- **Code Editor**: VS Code, Sublime Text, or any preferred editor
- **Database Tool**: SQLite Browser (for database management)

## ✨ Features

### 🏠 **Modern Dashboard**
- **Financial Overview**: Real-time income, expenses, and net income tracking
- **Monthly & Yearly Summary**: Comprehensive financial summaries with balance tracking
- **Interactive Charts**: Beautiful visualizations with Chart.js
- **Recent Transactions**: Quick view of latest financial activities
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 💳 **Expense Management**
- **Add/Edit/Delete** expenses with full CRUD operations
- **Category System**: Color-coded categories for easy organization
- **Date Tracking**: Full date range support with month/year filtering
- **Form Validation**: Comprehensive input validation and error handling
- **Dynamic Updates**: Real-time data refresh without page reload

### 💰 **Income Tracking**
- **Income Sources**: Track income from multiple sources
- **Detailed Records**: Description and date tracking for all income
- **Quick Entry**: Streamlined forms for fast data entry
- **Monthly Filtering**: Easy month-by-month income analysis

### 📊 **Reports & Analytics**
- **Financial Reports**: Income vs expenses comparison charts
- **Trend Analysis**: Monthly spending pattern visualization
- **Category Breakdown**: Detailed spending analysis by category
- **Interactive Charts**: Hover effects and responsive design
- **Real Data Visualization**: Charts based on actual database data

### 🎨 **Modern UI/UX**
- **Bootstrap 5**: Latest Bootstrap framework with custom styling
- **Professional Design**: Clean, modern interface inspired by admin dashboards
- **Indian Currency**: Proper INR (₹) formatting throughout
- **Smooth Animations**: Hover effects and transitions
- **Mobile Responsive**: Optimized for all device sizes

### 🔄 **Advanced Features**
- **Dynamic Month Selection**: Automatic data updates when changing months
- **Yearly Balance Tracking**: Complete yearly financial overview
- **Service Management**: Easy start/stop with service scripts
- **Data Persistence**: SQLite database for reliable data storage
- **RESTful API**: Clean API endpoints for all operations

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/expense-manager.git
cd expense-manager
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
```bash
# Using the service script (recommended)
./service.sh start

# Or directly with npm
npm start
```

### 4. Access the Application
Open your browser and navigate to: `http://localhost:5000`

## 💻 Usage

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

### Basic Workflow
1. **Dashboard**: View your financial overview and recent transactions
2. **Add Expenses**: Click "Add Expense" to record new expenses
3. **Add Income**: Click "Add Income" to record new income
4. **View Reports**: Analyze your spending patterns and trends
5. **Change Months**: Use the month dropdown to view different periods
6. **Analytics**: Deep dive into category-wise spending analysis

### Data Management
- **Automatic Updates**: Data refreshes automatically when you change months
- **Real-time Charts**: All charts update with actual data from your database
- **Data Persistence**: All data is stored in SQLite database
- **Backup**: Database file (`expenses.db`) can be easily backed up

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Expenses
- `GET /api/expenses` - Get all expenses (with optional filtering)
  - Query params: `month`, `year`, `category`, `date`
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

#### Income
- `GET /api/income` - Get all income (with optional filtering)
  - Query params: `month`, `year`, `source`, `date`
- `POST /api/income` - Create new income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

#### Categories
- `GET /api/categories` - Get all categories

#### Summary
- `GET /api/summary` - Get financial summary for selected period
  - Query params: `month`, `year`

### Example API Calls
```bash
# Get expenses for October 2025
curl "http://localhost:5000/api/expenses?month=10&year=2025"

# Get yearly summary for 2025
curl "http://localhost:5000/api/summary?year=2025"

# Add new expense
curl -X POST "http://localhost:5000/api/expenses" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "category": "Groceries", "description": "Weekly shopping", "date": "2025-10-02"}'
```

## 🏗️ Project Structure

```
expense-manager/
├── client/
│   └── build/                    # Frontend files
│       ├── index.html           # Main HTML file
│       ├── css/
│       │   └── style.css        # Custom styles
│       └── js/
│           └── app.js           # Frontend JavaScript
├── server.js                    # Express server
├── service.sh                   # Service management script
├── package.json                 # Dependencies
├── expenses.db                  # SQLite database
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory (optional):
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
- **Currency**: Change currency formatting in the `formatCurrency` function

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex functions
- Test your changes thoroughly
- Update documentation if needed

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

#### Database Issues
```bash
# Check if database exists
ls -la expenses.db

# If corrupted, restore from backup
cp expenses_backup.db expenses.db
```

#### Service Script Issues
```bash
# Make script executable
chmod +x service.sh

# Check script syntax
bash -n service.sh
```

### Getting Help
1. Check the [Issues](https://github.com/yourusername/expense-manager/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bootstrap 5** for the responsive framework
- **Chart.js** for beautiful data visualization
- **Express.js** for the robust backend framework
- **SQLite** for lightweight database storage
- **Bootstrap Icons** for the icon set

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/expense-manager/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer

---

**Built with ❤️ using modern web technologies**

*Last updated: October 2025*