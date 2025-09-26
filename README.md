# 💰 Expense Manager

A comprehensive expense tracking application built with React and Node.js that helps you manage your daily expenses, track spending by categories, and analyze your monthly spending patterns.

## Features

- 📝 **Add & Manage Expenses**: Easily add new expenses with amount, category, description, and date
- 💰 **Income Tracking**: Track income from multiple sources (salary, freelance, business, investment, etc.)
- 🏷️ **Category Tracking**: Pre-configured categories for groceries, kids' items, daily necessities, and more
- 💱 **Multi-Currency Support**: Choose from 40+ currencies (INR, USD, EUR, GBP, AED, etc.) with proper formatting
- 📊 **Monthly Analytics**: Visual charts showing spending breakdown by category and trends over time
- 📈 **Financial Reports**: Comprehensive income vs expense reports with insights and recommendations
- 📈 **Historical Data**: Store and retrieve all your expense and income history with dynamic year range (2020-2030+)
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface with beautiful charts and visualizations

## Categories Included

### Expense Categories
- 🛒 **Groceries**: Food and household items
- 👶 **Kids**: Children's clothing, toys, school supplies
- 🏠 **Daily Items**: Everyday necessities and household goods
- 🚗 **Transportation**: Gas, public transport, car maintenance
- 🎬 **Entertainment**: Movies, dining out, hobbies
- 🏥 **Healthcare**: Medical expenses, pharmacy, insurance
- 📦 **Other**: Miscellaneous expenses

### Income Sources
- 💼 **Salary**: Regular employment income
- 💻 **Freelance**: Freelance work and consulting
- 🏢 **Business**: Business income and profits
- 📈 **Investment**: Investment returns and dividends
- 🏠 **Rental**: Rental property income
- 🎁 **Bonus**: Bonuses and incentives
- 📦 **Other**: Other income sources

## Technology Stack

- **Frontend**: React 18, Chart.js, Axios
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Styling**: Custom CSS with modern design principles

## Installation & Setup

1. **Clone or download the project**
   ```bash
   cd expense-manager
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the application**
   ```bash
   # Start the backend server
   npm run dev
   
   # In a new terminal, start the frontend
   npm run client
   ```

4. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - The backend API runs on `http://localhost:5000`

## Quick Start (recommended)

### Option 1: Service Script (Background Process)
For systemd-style background service that doesn't keep terminal busy:

```bash
cd /Users/yunushaikh/expense-manager
./service.sh start    # Start service in background
./service.sh status    # Check if running
./service.sh stop      # Stop service
./service.sh restart   # Restart service
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:5000`
- Logs: `service.log`, `backend.log`, `frontend.log`
- Runs in background - terminal stays free!

### Option 2: Interactive Script
If you want to see logs in terminal:

```bash
cd /Users/yunushaikh/expense-manager
./start.sh
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:5000`
- Press `Ctrl+C` in the terminal to stop both.

## Start Servers Manually (alternative)

- Backend (Terminal tab 1):
  ```bash
  cd /Users/yunushaikh/expense-manager
  npm run dev   # or: node server/index.js
  ```
- Frontend (Terminal tab 2):
  ```bash
  cd /Users/yunushaikh/expense-manager/client
  npm start
  ```

## Stop the App

- **Normal Stop**: `./service.sh stop` - Gracefully stops both servers
- **Force Stop**: `./service.sh force-stop` - Emergency stop that kills ALL processes using ports 3000 and 5000
- **Status Check**: `./service.sh status` - Shows if servers are running and port usage

The improved stop functionality ensures:
- ✅ Always clears ports 3000 and 5000 completely
- ✅ Handles cases where PID files are missing or corrupted
- ✅ Force kills any stubborn processes
- ✅ Emergency `force-stop` command for stuck processes

## Common Issues

- "Could not read package.json": You are in the wrong directory. Run:
  ```bash
  cd /Users/yunushaikh/expense-manager
  ```
- "Cannot find module '/Users/yunushaikh/server/index.js'": Run commands from the project root (`/Users/yunushaikh/expense-manager`), not your home folder.
- `cd: no such file or directory: client`: Ensure you are inside the project folder before running `cd client`.
- Node not found: Install Node with Homebrew:
  ```bash
  brew install node
  ```

## Usage

### Adding Expenses
1. Click on the "Expenses" tab
2. Fill in the expense form with:
   - Amount (required)
   - Category (required)
   - Description (optional)
   - Date (required)
3. Click "Add Expense"

### Adding Income
1. Click on the "Income" tab
2. Fill in the income form with:
   - Amount (required)
   - Income Source (required)
   - Description (optional)
   - Date (required)
3. Click "Add Income"

### Viewing Analytics
1. Click on the "Analytics" tab
2. View your spending breakdown by category
3. See spending trends over the last 6 months
4. Check category details and transaction counts

### Financial Reports
1. Click on the "Reports" tab
2. View comprehensive income vs expense analysis
3. See key insights and recommendations
4. Check which side (income/expense) is higher and by how much
5. Identify top spending categories and income sources

### Managing Expenses & Income
- **Edit**: Click the "Edit" button on any expense or income entry to modify it
- **Delete**: Click the "Delete" button to remove an expense or income entry
- **Filter**: Use the month/year dropdowns to view expenses and income for specific periods

### Currency & Date Features
- **Currency Selection**: Choose from 40+ currencies in the header dropdown (default: INR)
- **Dynamic Year Range**: Year dropdown automatically includes future years (2020-2030+)
- **Proper Formatting**: All amounts display with correct currency symbols and formatting
- **Global Support**: Works with currencies from India, US, Europe, Middle East, Asia, and more

## Database

The application uses SQLite for data storage. The database file (`expenses.db`) is automatically created when you first run the application. It includes:

- `expenses` table: Stores all your expense records
- `categories` table: Manages expense categories with colors

## API Endpoints

- `GET /api/expenses` - Get all expenses (with optional month/year/category filters)
- `POST /api/expenses` - Add a new expense
- `PUT /api/expenses/:id` - Update an existing expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/analytics/monthly` - Get monthly spending by category
- `GET /api/analytics/trends` - Get spending trends over time
- `GET /api/categories` - Get all available categories

## Customization

You can easily customize the application by:

1. **Adding new categories**: Modify the default categories in `server/index.js`
2. **Changing colors**: Update the category colors in the CSS file
3. **Adding new features**: Extend the API endpoints and React components

## Production Deployment

For production deployment:

1. Build the React app: `npm run build`
2. Set the NODE_ENV to production
3. Use a production database (PostgreSQL, MySQL) instead of SQLite
4. Deploy to platforms like Heroku, Vercel, or AWS

## Contributing

Feel free to contribute to this project by:
- Adding new features
- Improving the UI/UX
- Fixing bugs
- Adding tests

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Happy Expense Tracking! 💰📊**
