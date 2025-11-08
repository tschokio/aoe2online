#!/bin/bash
set -e

echo "=========================================="
echo "Age of Empires Online - VM Setup Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run as root. Use a regular user with sudo privileges.${NC}"
    exit 1
fi

echo -e "${YELLOW}This script will install:${NC}"
echo "- Docker & Docker Compose"
echo "- Node.js 20.x (LTS)"
echo "- Git"
echo "- Project dependencies"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo -e "${GREEN}[1/7] Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

echo ""
echo -e "${GREEN}[2/7] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    # Install Docker
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    echo -e "${YELLOW}Note: You may need to log out and back in for Docker group permissions to take effect${NC}"
else
    echo "Docker already installed"
fi

echo ""
echo -e "${GREEN}[3/7] Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

echo ""
echo -e "${GREEN}[4/7] Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
else
    echo "Git already installed: $(git --version)"
fi

echo ""
echo -e "${GREEN}[5/7] Creating project environment file...${NC}"
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Environment Configuration
NODE_ENV=development

# Server
PORT=3000
HOST=0.0.0.0

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=aoe_online
DB_USER=aoe_user
DB_PASSWORD=change_this_password_in_production

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Game Configuration
TIME_ACCELERATION=1
# Set to 10 or 100 for faster testing

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
EOF
    echo -e "${YELLOW}Created .env file - IMPORTANT: Change passwords and secrets before production!${NC}"
else
    echo ".env file already exists, skipping..."
fi

echo ""
echo -e "${GREEN}[6/7] Creating Docker Compose configuration...${NC}"
if [ ! -f docker-compose.yml ]; then
    echo "docker-compose.yml will be created in the next step"
else
    echo "docker-compose.yml already exists"
fi

echo ""
echo -e "${GREEN}[7/7] Installing project dependencies...${NC}"
if [ -f package.json ]; then
    npm install
    echo "Dependencies installed"
else
    echo -e "${YELLOW}No package.json found - run this after initializing the project${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env and change all passwords and secrets"
echo "2. If Docker group was just added, log out and back in"
echo "3. Run: docker compose up -d (to start database)"
echo "4. Run: npm run dev (to start development server)"
echo ""
echo -e "${YELLOW}For development mode with fast timers:${NC}"
echo "  Set TIME_ACCELERATION=100 in .env"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo "  docker compose logs -f"
echo ""
echo -e "${YELLOW}Stop services:${NC}"
echo "  docker compose down"
echo ""
