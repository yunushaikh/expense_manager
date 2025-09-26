#!/bin/bash

# Expense Manager Service Script
# Usage: ./service.sh {start|stop|restart|status}

SERVICE_NAME="expense-manager"
PROJECT_DIR="/Users/yunushaikh/expense-manager"
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"
LOG_FILE="$PROJECT_DIR/service.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

check_dependencies() {
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm first."
        exit 1
    fi
}

install_dependencies() {
    log "Checking dependencies..."
    
    if [ ! -d "$PROJECT_DIR/node_modules" ]; then
        log "Installing backend dependencies..."
        cd "$PROJECT_DIR" && npm install
    fi

    if [ ! -d "$PROJECT_DIR/client/node_modules" ]; then
        log "Installing frontend dependencies..."
        cd "$PROJECT_DIR/client" && npm install
    fi
}

start_backend() {
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 $(cat "$BACKEND_PID_FILE") 2>/dev/null; then
        warning "Backend server is already running (PID: $(cat $BACKEND_PID_FILE))"
        return 0
    fi

    log "Starting backend server..."
    cd "$PROJECT_DIR"
    nohup node server/index.js > "$PROJECT_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$BACKEND_PID_FILE"
    
    # Wait a moment to check if it started successfully
    sleep 2
    if kill -0 $BACKEND_PID 2>/dev/null; then
        success "Backend server started (PID: $BACKEND_PID)"
        return 0
    else
        error "Failed to start backend server"
        rm -f "$BACKEND_PID_FILE"
        return 1
    fi
}

start_frontend() {
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 $(cat "$FRONTEND_PID_FILE") 2>/dev/null; then
        warning "Frontend server is already running (PID: $(cat $FRONTEND_PID_FILE))"
        return 0
    fi

    log "Starting frontend server..."
    cd "$PROJECT_DIR/client"
    nohup npm start > "$PROJECT_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$FRONTEND_PID_FILE"
    
    # Wait a moment to check if it started successfully
    sleep 3
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        success "Frontend server started (PID: $FRONTEND_PID)"
        return 0
    else
        error "Failed to start frontend server"
        rm -f "$FRONTEND_PID_FILE"
        return 1
    fi
}

stop_backend() {
  if [ ! -f "$BACKEND_PID_FILE" ]; then
    warning "Backend server PID file not found"
  else
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if kill -0 $BACKEND_PID 2>/dev/null; then
      log "Stopping backend server (PID: $BACKEND_PID)..."
      kill $BACKEND_PID
      sleep 2
      
      if kill -0 $BACKEND_PID 2>/dev/null; then
        warning "Backend server didn't stop gracefully, force killing..."
        kill -9 $BACKEND_PID
      fi
      
      success "Backend server stopped"
    else
      warning "Backend server was not running"
    fi
  fi
  
  # Force kill any process using port 5000
  local port5000_pids=$(lsof -ti :5000 2>/dev/null)
  if [ ! -z "$port5000_pids" ]; then
    log "Force killing processes using port 5000: $port5000_pids"
    echo "$port5000_pids" | xargs kill -9 2>/dev/null
    success "Port 5000 cleared"
  fi
  
  rm -f "$BACKEND_PID_FILE"
}

stop_frontend() {
  if [ ! -f "$FRONTEND_PID_FILE" ]; then
    warning "Frontend server PID file not found"
  else
    FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
    if kill -0 $FRONTEND_PID 2>/dev/null; then
      log "Stopping frontend server (PID: $FRONTEND_PID)..."
      kill $FRONTEND_PID
      sleep 2
      
      if kill -0 $FRONTEND_PID 2>/dev/null; then
        warning "Frontend server didn't stop gracefully, force killing..."
        kill -9 $FRONTEND_PID
      fi
      
      success "Frontend server stopped"
    else
      warning "Frontend server was not running"
    fi
  fi
  
  # Force kill any process using port 3000
  local port3000_pids=$(lsof -ti :3000 2>/dev/null)
  if [ ! -z "$port3000_pids" ]; then
    log "Force killing processes using port 3000: $port3000_pids"
    echo "$port3000_pids" | xargs kill -9 2>/dev/null
    success "Port 3000 cleared"
  fi
  
  rm -f "$FRONTEND_PID_FILE"
}

start_service() {
    log "Starting $SERVICE_NAME service..."
    
    check_dependencies
    install_dependencies
    
    if start_backend && start_frontend; then
        success "$SERVICE_NAME service started successfully!"
        echo ""
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔧 Backend API: http://localhost:5000"
        echo "📝 Logs: $LOG_FILE"
        echo "🛑 Stop with: ./service.sh stop"
    else
        error "Failed to start $SERVICE_NAME service"
        exit 1
    fi
}

stop_service() {
  log "Stopping $SERVICE_NAME service..."
  
  stop_frontend
  stop_backend
  
  success "$SERVICE_NAME service stopped"
}

force_stop_service() {
  log "Force stopping $SERVICE_NAME service..."
  
  # Kill all processes using our ports
  local port3000_pids=$(lsof -ti :3000 2>/dev/null)
  local port5000_pids=$(lsof -ti :5000 2>/dev/null)
  
  if [ ! -z "$port3000_pids" ]; then
    log "Force killing processes using port 3000: $port3000_pids"
    echo "$port3000_pids" | xargs kill -9 2>/dev/null
    success "Port 3000 cleared"
  fi
  
  if [ ! -z "$port5000_pids" ]; then
    log "Force killing processes using port 5000: $port5000_pids"
    echo "$port5000_pids" | xargs kill -9 2>/dev/null
    success "Port 5000 cleared"
  fi
  
  # Clean up PID files
  rm -f "$BACKEND_PID_FILE" "$FRONTEND_PID_FILE"
  
  success "$SERVICE_NAME service force stopped"
}

restart_service() {
    log "Restarting $SERVICE_NAME service..."
    stop_service
    sleep 2
    start_service
}

status_service() {
    echo "=== $SERVICE_NAME Service Status ==="
    echo ""
    
    # Check backend
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 $(cat "$BACKEND_PID_FILE") 2>/dev/null; then
        echo -e "Backend:  ${GREEN}Running${NC} (PID: $(cat $BACKEND_PID_FILE))"
    else
        echo -e "Backend:  ${RED}Stopped${NC}"
    fi
    
    # Check frontend
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 $(cat "$FRONTEND_PID_FILE") 2>/dev/null; then
        echo -e "Frontend: ${GREEN}Running${NC} (PID: $(cat $FRONTEND_PID_FILE))"
    else
        echo -e "Frontend: ${RED}Stopped${NC}"
    fi
    
    echo ""
    
    # Check if ports are in use
    if lsof -ti :5000 >/dev/null 2>&1; then
        echo -e "Port 5000: ${GREEN}In Use${NC}"
    else
        echo -e "Port 5000: ${RED}Free${NC}"
    fi
    
    if lsof -ti :3000 >/dev/null 2>&1; then
        echo -e "Port 3000: ${GREEN}In Use${NC}"
    else
        echo -e "Port 3000: ${RED}Free${NC}"
    fi
    
    echo ""
    echo "Logs: $LOG_FILE"
    echo "Backend logs: $PROJECT_DIR/backend.log"
    echo "Frontend logs: $PROJECT_DIR/frontend.log"
}

cleanup() {
    log "Cleaning up..."
    stop_service
    exit 0
}

# Handle script termination
trap cleanup SIGINT SIGTERM

# Main script logic
case "${1:-}" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    force-stop)
        force_stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        status_service
        ;;
    *)
        echo "Usage: $0 {start|stop|force-stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start      - Start the expense manager service"
        echo "  stop       - Stop the expense manager service"
        echo "  force-stop - Force stop all processes using ports 3000 and 5000"
        echo "  restart    - Restart the expense manager service"
        echo "  status     - Show service status"
        echo ""
        echo "Examples:"
        echo "  ./service.sh start       # Start the service"
        echo "  ./service.sh stop        # Stop the service"
        echo "  ./service.sh force-stop  # Emergency stop (kills all port processes)"
        echo "  ./service.sh status      # Check if running"
        exit 1
        ;;
esac
