#!/bin/bash

# Expense Manager Service Script
# Usage: ./service.sh [start|stop|restart|status]

APP_NAME="expense-manager"
SERVER_PID_FILE="server.pid"
PORT=5000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to get PID using port
get_pid_by_port() {
    local port=$1
    lsof -ti:$port 2>/dev/null
}

# Function to start the service
start_service() {
    print_status "Starting $APP_NAME service..."
    
    # Check if already running
    if [ -f "$SERVER_PID_FILE" ]; then
        local pid=$(cat "$SERVER_PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            print_warning "$APP_NAME is already running (PID: $pid)"
            return 0
        else
            print_warning "Stale PID file found, removing..."
            rm -f "$SERVER_PID_FILE"
        fi
    fi
    
    # Check if port is already in use
    if check_port $PORT; then
        local existing_pid=$(get_pid_by_port $PORT)
        print_error "Port $PORT is already in use by process $existing_pid"
        print_error "Please stop the existing process or change the port"
        return 1
    fi
    
    # Start the server
    print_status "Starting server on port $PORT..."
    nohup node server.js > server.log 2>&1 &
    local server_pid=$!
    
    # Save PID
    echo $server_pid > "$SERVER_PID_FILE"
    
    # Wait a moment and check if it started successfully
    sleep 2
    if ps -p $server_pid > /dev/null 2>&1; then
        print_success "$APP_NAME started successfully (PID: $server_pid)"
        print_success "Server is running on http://localhost:$PORT"
        print_status "Logs are being written to server.log"
    else
        print_error "Failed to start $APP_NAME"
        rm -f "$SERVER_PID_FILE"
        return 1
    fi
}

# Function to stop the service
stop_service() {
    print_status "Stopping $APP_NAME service..."
    
    local stopped=false
    
    # Try to stop using PID file
    if [ -f "$SERVER_PID_FILE" ]; then
        local pid=$(cat "$SERVER_PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            print_status "Stopping server (PID: $pid)..."
            kill $pid
            
            # Wait for graceful shutdown
            local count=0
            while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            if ps -p $pid > /dev/null 2>&1; then
                print_warning "Graceful shutdown failed, force killing..."
                kill -9 $pid
            fi
            
            stopped=true
        else
            print_warning "Process not found for PID $pid"
        fi
        rm -f "$SERVER_PID_FILE"
    fi
    
    # Also try to stop by port
    if check_port $PORT; then
        local pid=$(get_pid_by_port $PORT)
        if [ ! -z "$pid" ]; then
            print_status "Stopping process using port $PORT (PID: $pid)..."
            kill $pid
            sleep 2
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid
            fi
            stopped=true
        fi
    fi
    
    if [ "$stopped" = true ]; then
        print_success "$APP_NAME stopped successfully"
    else
        print_warning "$APP_NAME was not running"
    fi
}

# Function to restart the service
restart_service() {
    print_status "Restarting $APP_NAME service..."
    stop_service
    sleep 2
    start_service
}

# Function to check service status
check_status() {
    print_status "Checking $APP_NAME service status..."
    
    local running=false
    local pid=""
    
    # Check using PID file
    if [ -f "$SERVER_PID_FILE" ]; then
        pid=$(cat "$SERVER_PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            running=true
        fi
    fi
    
    # Check using port
    if check_port $PORT; then
        local port_pid=$(get_pid_by_port $PORT)
        if [ ! -z "$port_pid" ]; then
            if [ -z "$pid" ]; then
                pid=$port_pid
            fi
            running=true
        fi
    fi
    
    if [ "$running" = true ]; then
        print_success "$APP_NAME is running (PID: $pid)"
        print_success "Server is accessible at http://localhost:$PORT"
        
        # Check if server is responding
        if curl -s http://localhost:$PORT > /dev/null 2>&1; then
            print_success "Server is responding to requests"
        else
            print_warning "Server is running but not responding to requests"
        fi
    else
        print_error "$APP_NAME is not running"
        return 1
    fi
}

# Function to show logs
show_logs() {
    if [ -f "server.log" ]; then
        print_status "Showing recent logs (last 50 lines):"
        echo "----------------------------------------"
        tail -50 server.log
    else
        print_warning "No log file found"
    fi
}

# Function to show help
show_help() {
    echo "Expense Manager Service Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start the expense manager service"
    echo "  stop      Stop the expense manager service"
    echo "  restart   Restart the expense manager service"
    echo "  status    Check the service status"
    echo "  logs      Show recent logs"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 status"
    echo "  $0 logs"
}

# Main script logic
case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Invalid command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

exit $?
