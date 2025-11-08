# Deployment Guide - Age of Empires Online

This guide will help you deploy the game on a Debian VM for testing and development.

## Prerequisites

- A Debian 11 or 12 VM (or Ubuntu 20.04+)
- SSH access with sudo privileges
- At least 2GB RAM, 20GB disk space
- Public IP or domain name (optional for remote access)

## Quick Start (Automated Setup)

1. **Clone the repository to your Debian VM:**
   ```bash
   git clone <your-repo-url> aoe-online
   cd aoe-online
   ```

2. **Run the setup script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configure environment variables:**
   ```bash
   nano .env
   ```
   
   **Important**: Change these values:
   - `DB_PASSWORD` - Set a strong database password
   - `JWT_SECRET` - Generate a random secret (use `openssl rand -base64 32`)
   - `TIME_ACCELERATION` - Set to `100` for fast testing, `1` for real gameplay

4. **If Docker group was just added, log out and back in:**
   ```bash
   exit
   # SSH back into your VM
   ```

5. **Start the database:**
   ```bash
   docker compose up -d
   ```

6. **Install project dependencies (once code is created):**
   ```bash
   npm install
   ```

7. **Start development server:**
   ```bash
   npm run dev
   ```

## Manual Setup (If Automated Script Fails)

### 1. Install Docker

```bash
# Update packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker dependencies
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install Git

```bash
sudo apt-get install -y git
```

### 4. Clone and Configure

```bash
git clone <your-repo-url> aoe-online
cd aoe-online

# Create .env file
cp .env.example .env
nano .env  # Edit with your values
```

## Development Workflow

### Starting the Application

```bash
# Start database
docker compose up -d

# Start development server (with hot reload)
npm run dev
```

### Viewing Logs

```bash
# Database logs
docker compose logs -f postgres

# Application logs
# Will be shown in the terminal where you run npm run dev
```

### Stopping Services

```bash
# Stop database
docker compose down

# Stop dev server
# Press Ctrl+C in the terminal
```

## Testing with Time Acceleration

For faster testing, modify `.env`:

```bash
TIME_ACCELERATION=100
```

This makes:
- 30 seconds → 0.3 seconds
- 5 minutes → 3 seconds
- 1 hour → 36 seconds
- 24 hours → 14.4 minutes

Perfect for testing building chains and resource gathering!

## Production Deployment

### 1. Build for Production

```bash
# Build client and server
npm run build

# Start with production settings
NODE_ENV=production npm start
```

### 2. Use Docker Compose for Full Stack

Uncomment the `server` and `client` services in `docker-compose.yml`, then:

```bash
docker compose up -d --build
```

### 3. Set Up Reverse Proxy (Nginx)

```bash
sudo apt-get install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/aoe-online
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;  # Client dev server
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;  # API server
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/aoe-online /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Set Up SSL with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Database Management

### Backup Database

```bash
docker exec aoe_postgres pg_dump -U aoe_user aoe_online > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
cat backup_20240101.sql | docker exec -i aoe_postgres psql -U aoe_user aoe_online
```

### Access Database CLI

```bash
docker exec -it aoe_postgres psql -U aoe_user -d aoe_online
```

## Troubleshooting

### Docker Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker compose ps

# Check logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### Out of Memory

Increase swap space:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Monitoring

### System Resources

```bash
# Check memory
free -h

# Check disk space
df -h

# Check Docker resource usage
docker stats
```

### Application Health

```bash
# Check if services are running
docker compose ps

# Test API endpoint
curl http://localhost:3000/api/health

# Test database connection
docker exec aoe_postgres pg_isready -U aoe_user
```

## Updating the Application

```bash
# Pull latest changes
git pull

# Update dependencies
npm install

# Rebuild containers (if using Docker)
docker compose up -d --build

# Restart services
docker compose restart
```

## Security Checklist

- [ ] Changed default database password
- [ ] Generated secure JWT secret
- [ ] Configured firewall (ufw)
- [ ] Set up SSL certificate
- [ ] Disabled root SSH login
- [ ] Regular backups enabled
- [ ] Log rotation configured
- [ ] Rate limiting configured

## Support

For issues or questions:
- Check the logs: `docker compose logs -f`
- Review the `.env` configuration
- Ensure all dependencies are installed
- Check system resources (memory, disk space)
