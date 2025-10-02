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

## Prerequisites

Before running this application, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (Version 16.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Or install via package manager:
     ```bash
     # macOS (using Homebrew)
     brew install node
     
     # Ubuntu/Debian
     sudo apt update
     sudo apt install nodejs npm
     
     # Windows (using Chocolatey)
     choco install nodejs
     ```

2. **npm** (Node Package Manager)
   - Usually comes bundled with Node.js
   - Verify installation: `npm --version`

3. **Git** (for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/)
   - Or install via package manager:
     ```bash
     # macOS
     brew install git
     
     # Ubuntu/Debian
     sudo apt install git
     
     # Windows
     choco install git
     ```

### System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 500MB free space
- **Browser**: Modern browser with JavaScript enabled (Chrome, Firefox, Safari, Edge)

### Port Requirements

The application uses the following ports (ensure they're available):
- **Port 3000**: Frontend React application
- **Port 5000**: Backend API server

### Verification Commands

Run these commands to verify your setup:

```bash
# Check Node.js version (should be 16.0+)
node --version

# Check npm version
npm --version

# Check Git version
git --version

# Check if ports are available
# macOS/Linux
lsof -i :3000 -i :5000

# Windows
netstat -an | findstr ":3000 :5000"
```

## Installation & Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd expense-manager

# Or if you have the project folder, navigate to it
cd /path/to/expense-manager
```

### Step 2: Install Dependencies

The application has two sets of dependencies - backend and frontend:

```bash
# Install backend dependencies (from project root)
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

**Alternative (if you have the install-all script):**
```bash
npm run install-all
```

### Step 3: Verify Installation

```bash
# Check if all dependencies are installed
ls node_modules          # Should show backend dependencies
ls client/node_modules   # Should show frontend dependencies

# Verify package.json files exist
ls package.json
ls client/package.json
```

### Step 4: Start the Application

Choose one of the methods below:

#### Method 1: Service Script (Recommended)
```bash
# Start both servers in background
./service.sh start

# Check status
./service.sh status

# Stop when done
./service.sh stop
```

#### Method 2: Manual Start
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend  
cd client
npm start
```

### Step 5: Access the Application

- **Frontend**: Open your browser and go to `http://localhost:3000`
- **Backend API**: Available at `http://localhost:5000`
- **Database**: SQLite database (`expenses.db`) will be created automatically

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

## Troubleshooting

### Common Installation Issues

#### 1. Node.js Not Found
```bash
# Error: node: command not found
# Solution: Install Node.js
# macOS
brew install node

# Ubuntu/Debian
sudo apt update && sudo apt install nodejs npm

# Windows
# Download from https://nodejs.org/
```

#### 2. Permission Denied Errors
```bash
# Error: EACCES: permission denied
# Solution: Fix npm permissions
sudo chown -R $(whoami) ~/.npm
# Or use a Node version manager like nvm
```

#### 3. Port Already in Use
```bash
# Error: EADDRINUSE: address already in use :::5000
# Solution: Kill processes using the ports
./service.sh force-stop

# Or manually kill processes
# macOS/Linux
lsof -ti :3000 | xargs kill -9
lsof -ti :5000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

#### 4. Module Not Found Errors
```bash
# Error: Cannot find module 'express'
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

#### 5. Database Connection Issues
```bash
# Error: SQLITE_CANTOPEN
# Solution: Check file permissions
chmod 755 expenses.db
# Or delete and recreate
rm expenses.db
# The database will be recreated on next startup
```

### Service Script Issues

#### 1. Service Script Not Executable
```bash
# Error: Permission denied: ./service.sh
# Solution: Make script executable
chmod +x service.sh
```

#### 2. Service Won't Start
```bash
# Check logs for errors
cat service.log
cat backend.log
cat frontend.log

# Try force stop and restart
./service.sh force-stop
./service.sh start
```

#### 3. PID Files Issues
```bash
# Error: PID file exists but process not running
# Solution: Clean up PID files
rm -f .backend.pid .frontend.pid
./service.sh start
```

### Development Issues

#### 1. React App Won't Start
```bash
# Error: Could not read package.json
# Solution: Ensure you're in the right directory
pwd  # Should show /path/to/expense-manager
cd client
npm start
```

#### 2. Backend API Not Responding
```bash
# Check if backend is running
./service.sh status

# Check backend logs
tail -f backend.log

# Restart backend
./service.sh stop
./service.sh start
```

#### 3. Frontend Build Errors
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm start
```

### System-Specific Issues

#### macOS Issues
```bash
# If you get "command not found" errors
export PATH="/usr/local/bin:$PATH"

# If npm permissions are denied
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Windows Issues
```bash
# If PowerShell execution is blocked
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# If ports are blocked by Windows Firewall
# Allow Node.js through Windows Firewall
```

#### Linux Issues
```bash
# If you get EACCES errors
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# If ports are blocked
sudo ufw allow 3000
sudo ufw allow 5000
```

### Getting Help

If you're still experiencing issues:

1. **Check the logs**:
   ```bash
   cat service.log
   cat backend.log  
   cat frontend.log
   ```

2. **Verify your setup**:
   ```bash
   node --version  # Should be 16.0+
   npm --version
   ./service.sh status
   ```

3. **Try a clean restart**:
   ```bash
   ./service.sh force-stop
   rm -rf node_modules client/node_modules
   npm install
   cd client && npm install && cd ..
   ./service.sh start
   ```

4. **Check system resources**:
   - Ensure you have at least 4GB RAM available
   - Check that ports 3000 and 5000 are not blocked
   - Verify you have write permissions in the project directory

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

## Quick Reference

### Essential Commands
```bash
# Start the application
./service.sh start

# Stop the application  
./service.sh stop

# Check status
./service.sh status

# Force stop (emergency)
./service.sh force-stop

# Restart
./service.sh restart
```

### URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Key Files
- **Service Script**: `service.sh`
- **Backend**: `server/index.js`
- **Frontend**: `client/src/`
- **Database**: `expenses.db`
- **Logs**: `service.log`, `backend.log`, `frontend.log`

### Common Issues Quick Fix
```bash
# Port conflicts
./service.sh force-stop

# Module errors
rm -rf node_modules client/node_modules
npm install && cd client && npm install

# Permission errors
chmod +x service.sh
```

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Happy Expense Tracking! 💰📊**
