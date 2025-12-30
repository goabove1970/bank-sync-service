#!/bin/ksh

# Service management script for Bank Sync Service
# Usage: ./start.ksh [check|stop|rebuild|start|restart|status]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=9300

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if service is running
check_service() {
    echo "Checking if service is running on port ${PORT}..."
    
    if lsof -i :${PORT} > /dev/null 2>&1; then
        PID=$(lsof -ti :${PORT})
        echo -e "${GREEN}✓ Service is running${NC}"
        echo "  Process ID: ${PID}"
        echo "  Port: ${PORT}"
        
        # Test if API is responding
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/bank-connections > /dev/null 2>&1; then
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/bank-connections)
            if [ "${HTTP_CODE}" = "200" ] || [ "${HTTP_CODE}" = "400" ]; then
                echo -e "${GREEN}✓ API is responding (HTTP ${HTTP_CODE})${NC}"
            else
                echo -e "${YELLOW}⚠ API returned HTTP ${HTTP_CODE}${NC}"
            fi
        else
            echo -e "${YELLOW}⚠ API is not responding${NC}"
        fi
        return 0
    else
        echo -e "${RED}✗ Service is not running${NC}"
        return 1
    fi
}

# Function to stop the service
stop_service() {
    echo "Stopping service on port ${PORT}..."
    
    if lsof -i :${PORT} > /dev/null 2>&1; then
        PID=$(lsof -ti :${PORT})
        echo "Found process ${PID} on port ${PORT}"
        
        # Kill the process
        kill ${PID} 2>/dev/null
        
        # Wait a bit for the process to stop
        sleep 2
        
        # Force kill if still running
        if lsof -i :${PORT} > /dev/null 2>&1; then
            echo "Force killing process..."
            kill -9 ${PID} 2>/dev/null
            sleep 1
        fi
        
        # Also kill any npm/node processes related to the service
        pkill -f "node.*dist/bin/www" 2>/dev/null
        pkill -f "npm.*start" 2>/dev/null
        
        if lsof -i :${PORT} > /dev/null 2>&1; then
            echo -e "${RED}✗ Failed to stop service${NC}"
            return 1
        else
            echo -e "${GREEN}✓ Service stopped successfully${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}⚠ Service is not running${NC}"
        return 0
    fi
}

# Function to rebuild the service
rebuild_service() {
    echo "Rebuilding service..."
    
    cd "${SCRIPT_DIR}" || return 1
    
    echo "Running npm install..."
    if ! npm install; then
        echo -e "${RED}✗ npm install failed${NC}"
        return 1
    fi
    
    echo "Building TypeScript..."
    if ! npm run build; then
        echo -e "${RED}✗ Build failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ Service rebuilt successfully${NC}"
    return 0
}

# Function to start the service
start_service() {
    echo "Starting service..."
    
    # Check if already running
    if lsof -i :${PORT} > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Service is already running on port ${PORT}${NC}"
        echo "Use './start.ksh stop' to stop it first, or './start.ksh restart' to restart"
        return 1
    fi
    
    cd "${SCRIPT_DIR}" || return 1
    
    # Check if build exists
    if [ ! -d "dist" ]; then
        echo -e "${YELLOW}⚠ Build directory not found. Running build first...${NC}"
        if ! rebuild_service; then
            return 1
        fi
    fi
    
    echo "Starting service in development mode..."
    NODE_ENV=development npm start > /dev/null 2>&1 &
    
    # Wait a bit for the service to start
    sleep 3
    
    # Check if service started successfully
    if check_service; then
        echo -e "${GREEN}✓ Service started successfully${NC}"
        echo "  Service is running in the background"
        echo "  API endpoint: http://localhost:${PORT}/bank-connections"
        return 0
    else
        echo -e "${RED}✗ Service failed to start${NC}"
        return 1
    fi
}

# Function to restart the service
restart_service() {
    echo "Restarting service..."
    stop_service
    sleep 1
    start_service
}

# Function to show status
show_status() {
    echo "=== Bank Sync Service Status ==="
    echo "Port: ${PORT}"
    echo "Service Directory: ${SCRIPT_DIR}"
    echo ""
    
    check_service
    echo ""
    
    if [ -d "${SCRIPT_DIR}/dist" ]; then
        echo -e "${GREEN}✓ Build directory exists${NC}"
    else
        echo -e "${YELLOW}⚠ Build directory not found${NC}"
    fi
    
    # Check database connection (basic check)
    echo ""
    echo "Database:"
    if [ -f "${SCRIPT_DIR}/app.config.ts" ]; then
        echo -e "${GREEN}✓ Configuration file exists${NC}"
    else
        echo -e "${YELLOW}⚠ Configuration file not found${NC}"
    fi
}

# Main script logic
case "${1:-status}" in
    check)
        check_service
        ;;
    stop)
        stop_service
        ;;
    rebuild)
        rebuild_service
        ;;
    start)
        start_service
        ;;
    restart)
        restart_service
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 [check|stop|rebuild|start|restart|status]"
        echo ""
        echo "Commands:"
        echo "  check    - Check if service is running"
        echo "  stop     - Stop the service"
        echo "  rebuild  - Rebuild the service (npm install + build)"
        echo "  start    - Start the service in development mode"
        echo "  restart  - Stop and start the service"
        echo "  status   - Show service status (default)"
        exit 1
        ;;
esac

exit $?

