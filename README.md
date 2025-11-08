# Age of Empires Online - Slow-Paced RTS

A web-based, slow-paced real-time strategy game inspired by Age of Empires II and Travian. Build your empire over days and weeks with a persistent world where actions take real-world time to complete.

## 🎮 Game Features

- **4 Resources**: Food, Wood, Gold, Stone
- **Graduated Time Progression**: From seconds in Dawn Age to hours in Gilded Age
- **Grid-Based City Building**: Strategic placement of buildings on a 50x50 grid
- **Real-Time Updates**: WebSocket integration for live game state changes
- **Dawn Age Content**: Town Center, Houses, Villagers, Barracks, and more!

## 🚀 Quick Start

### Prerequisites

- **Node.js 20.x** (LTS)
- **PostgreSQL 16** (via Docker or local install)
- **Git**

### Option 1: Automated Setup (Debian/Ubuntu)

```bash
# Clone the repository
git clone <your-repo-url> aoe-online
cd aoe-online

# Run setup script
chmod +x setup.sh
./setup.sh

# Edit environment variables
nano .env
# Change DB_PASSWORD and JWT_SECRET!

# Start database
docker compose up -d

# Install dependencies
npm install

# Start development servers
npm run dev
```

### Option 2: Manual Setup

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_super_secret_jwt_key_here
TIME_ACCELERATION=100  # For fast testing (100x speed)
```

#### 3. Start Database

```bash
docker compose up -d
```

Wait for PostgreSQL to initialize (check logs: `docker compose logs -f postgres`)

#### 4. Start Development Servers

```bash
# Start both client and server
npm run dev

# Or start individually:
npm run dev:server  # Backend on port 3000
npm run dev:client  # Frontend on port 5173
```

#### 5. Open Browser

Navigate to: **http://localhost:5173**

## 📁 Project Structure

```
aoe-online/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # CityGrid, ResourceDisplay, BuildingMenu
│   │   ├── contexts/    # AuthContext
│   │   ├── pages/       # Login, Register, Game
│   │   └── utils/       # API client
│   └── package.json
├── server/              # Node.js backend (Express + Socket.io)
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── game/        # Game loop, socket handlers
│   │   ├── middleware/  # Auth middleware
│   │   └── db/          # Database connection
│   └── package.json
├── shared/              # Shared TypeScript types
│   └── src/
│       ├── types.ts     # Game entities, API types
│       └── gameData.ts  # Building/unit definitions
├── docker-compose.yml   # PostgreSQL container
├── setup.sh            # Automated setup script
└── package.json        # Workspace root
```

## 🎯 How to Play

1. **Register** a new account
2. **Login** to your empire
3. **View your starting city**: Town Center + 3 Villagers
4. **Build structures**:
   - Houses (increase population)
   - Lumber Camps (improve wood gathering)
   - Barracks (train military units)
5. **Train units**:
   - Click Town Center → Train Villager
   - Click Barracks → Train Clubman
6. **Gather resources** from trees, sheep, ore deposits
7. **Wait** for constructions and training to complete!

## ⚡ Time Acceleration

For development/testing, adjust time scale in `.env`:

```env
TIME_ACCELERATION=1     # Real-time (1 hour = 1 hour)
TIME_ACCELERATION=10    # 10x speed (1 hour = 6 minutes)
TIME_ACCELERATION=100   # 100x speed (1 hour = 36 seconds)
```

**Default time scales (1x speed)**:
- Dawn Age: 30s - 5min
- Hearth Age: 5min - 30min
- Age of Expansion: 30min - 4hrs
- Gilded Age: 4hrs - 24hrs

## 🛠️ Development

### Run Tests

```bash
npm test
```

### Lint Code

```bash
npm run lint
```

### Build for Production

```bash
npm run build
```

### Database Management

```bash
# View logs
docker compose logs -f postgres

# Access PostgreSQL CLI
docker exec -it aoe_postgres psql -U aoe_user -d aoe_online

# Backup database
docker exec aoe_postgres pg_dump -U aoe_user aoe_online > backup.sql

# Restore database
cat backup.sql | docker exec -i aoe_postgres psql -U aoe_user aoe_online

# Reset database (WARNING: Deletes all data!)
docker compose down -v
docker compose up -d
```

## 🐛 Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5173
npx kill-port 5173
```

### Database connection failed

```bash
# Check if PostgreSQL is running
docker compose ps

# Restart database
docker compose restart postgres

# View database logs
docker compose logs postgres
```

### Module not found errors

```bash
# Clean install
rm -rf node_modules client/node_modules server/node_modules shared/node_modules
npm install
```

## 📊 Game Data Reference

### Buildings (Dawn Age)

| Building | Cost | Build Time | Function |
|----------|------|------------|----------|
| Town Center | Free | 0s | Train villagers |
| House | 30 Wood | 1min | +5 population |
| Lumber Camp | 100 Wood | 1.5min | Improve wood gathering |
| Mining Camp | 100 Wood | 1.5min | Improve gold/stone gathering |
| Mill | 100 Wood | 1.5min | Improve food gathering |

### Units (Dawn Age)

| Unit | Cost | Train Time | Population |
|------|------|------------|------------|
| Villager | 50 Food | 1min | 1 |

### Buildings (Hearth Age)

| Building | Cost | Build Time | Function |
|----------|------|------------|----------|
| Barracks | 175 Wood | 5min | Train infantry |
| Archery Range | 150 Wood | 5min | Train archers |
| Stable | 150 Wood | 5min | Train cavalry |

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions including:
- Nginx reverse proxy setup
- SSL certificates with Let's Encrypt
- Docker Compose production configuration
- Database backups and monitoring

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📝 License

MIT License - See LICENSE file for details

## 🎨 Credits

Inspired by:
- Age of Empires II (Ensemble Studios)
- Travian (Travian Games)

---

**Enjoy building your empire!** 🏛️👑
