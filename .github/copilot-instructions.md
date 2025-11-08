# AI Agent Instructions - Age of Empires Online Clone

## Project Overview

This is a web-based, slow-paced RTS game inspired by Age of Empires II and Travian. The core concept is a **persistent world** where actions take hours/days, not minutes - players check in a few times daily rather than playing intensively.

Key differentiator: **Asynchronous gameplay** with extremely slow pacing (buildings take hours/days, travel is slow, resources trickle in).

## Project Status

**Implemented**: Full-stack application with authentication, database, and basic game structure deployed on Ubuntu VM with Docker.

## Architecture Decisions (from spec)

- **Monorepo structure**: Single repo with `client/` and `server/` folders using npm workspaces
- **Frontend**: React SPA with Vite (port 5173), TypeScript, modern responsive UI
- **Backend**: Node.js with Express (port 3000), TypeScript with ESM modules
- **Database**: PostgreSQL 16 (Docker container), schema in `server/db/init.sql`
- **Real-time**: WebSockets via Socket.io (bi-directional, automatic reconnection, room support)
- **Authentication**: JWT tokens + HTTP-only cookies (secure, stateless, works with WebSockets)
- **Game State**: Server-authoritative real-time strategy with persistent world state
- **Core Feature**: 2D grid-based map for player city building placement
- **Deployment**: Docker Compose for PostgreSQL, Node apps run directly on host for development
- **Dev execution**: tsx with tsconfig-paths for TypeScript module resolution

## Implementation Priorities

When building features, follow the Age progression system:

1. **Dawn Age (MVP)**: Town Center, Villagers, Houses, basic resource gathering (Food/Wood/Gold/Stone)
2. **Hearth Age**: Barracks, Archery Range, Stable, Walls, basic military units
3. **Age of Expansion**: Advanced military, trade systems
4. **Gilded Age**: End-game content, Wonders

## Key Gameplay Mechanics

- **4 Resources**: Food, Wood, Gold, Stone (see `project.md` for usage)
- **Time-based progression**: All actions use real-world time with **graduated scaling**:
  - Dawn Age: 30 seconds - 5 minutes (active engagement)
  - Hearth Age: 5 - 30 minutes (checking in regularly)
  - Age of Expansion: 30 minutes - 4 hours (strategic planning)
  - Gilded Age: 4 - 24 hours (epic constructions)
- **Time implementation**: Server-side timestamps with completion times, never client-side timers
- **Building placement**: Grid-based 2D city map with strategic layout options
- **Single civilization initially**: Add unique civs only after core gameplay is solid
- **Development mode**: Add time acceleration (10x-100x) for testing via environment variable

## Development Guidelines

- **Performance first**: Optimize for fast load times - players check in briefly
- **Mobile-friendly**: UI must work well on phones/tablets for casual check-ins
- **Code quality**: Use linters, formatters, maintain modular structure
- **Real-time sync**: Design for multiple clients viewing same world state (consider WebSockets)
- **Time calculations**: All time-based mechanics should be server-side with timestamps, never client-side timers

## When Implementing New Features

1. Reference the building/unit tables in `project.md` for stats and requirements
2. Ensure Age gating is enforced (can't build Barracks in Dawn Age)
3. Consider the slow-paced gameplay - default to longer durations, can adjust later
4. Visual progression should reflect the Age (rustic → ornate as described in spec)
5. Each building/unit should have clear resource costs and time requirements

## File Organization (to be created)

```
client/
  src/
    components/    # React components (CityGrid, BuildingMenu, ResourceDisplay)
    hooks/         # Custom hooks for game state management
    services/      # API communication layer
server/
  src/
    models/        # Game entities (Building, Unit, Player, Resource)
    routes/        # API endpoints
    game/          # Game logic (construction queue, resource generation)
    db/            # Database schemas and migrations
shared/
  types/           # TypeScript types shared between client/server
```

## Testing Considerations

- Mock time acceleration for development (1 minute = 1 hour)
- Test edge cases: concurrent building construction, resource cap overflow
- Validate Age progression gates work correctly

## Critical Database Schema Reference

**IMPORTANT**: Always use the correct column names from `server/db/init.sql`:

### Players Table
- `population_current` / `population_max` (NOT `population` / `max_population`)

### Buildings Table
- `building_type` (NOT `type`)
- `is_complete` (NOT `is_constructing`)
- `construction_complete_at` (NOT `construction_completes_at`)
- `health_current` / `health_max` (always required)

### Units Table
- `unit_type` (NOT `type`)
- `is_trained` (NOT `is_training`)
- `training_complete_at` (NOT `training_completes_at`)
- `health_current` / `health_max` / `attack` (always required)
- `current_task` (NOT `task_type`)
- `task_target_id` (single column for targets)

## Common Pitfalls & Solutions

1. **Environment Variables**:
   - `dotenv.config()` loads from current working directory
   - Server must run from project root, not `server/` folder
   - Use explicit path: `dotenv.config({ path: path.resolve(__dirname, '../../.env') })`

2. **Database Connection**:
   - `DB_HOST=localhost` when running server on host machine
   - `DB_HOST=postgres` only works inside Docker network
   - After changing `.env`, run `docker compose down -v` to reset database

3. **TypeScript Module Resolution**:
   - Use `tsx` with `tsconfig-paths` for path aliases
   - Dev script: `tsx watch -r tsconfig-paths/register src/index.ts`
   - Shared package imports need proper tsconfig paths configuration

4. **Vite Configuration**:
   - Set `host: '0.0.0.0'` to allow external connections
   - Add domains to `allowedHosts` array for production domains
   - Proxy API calls to backend via `/api` route

5. **Docker Volume Issues**:
   - Old passwords persist in volumes
   - Always use `docker compose down -v` to fully reset
   - Check `init.sql` is a file, not a directory

## Self-Hosting Setup

- **Initial deployment**: Docker Compose on Ubuntu/Debian VM (see `DEPLOYMENT.md`)
- **Database**: PostgreSQL container with volume persistence
- **Environment**: `.env` files for configuration (never commit secrets)
- **Scripts**: `setup.sh` for automated VM provisioning (supports Ubuntu 24.04 and Debian)
- **Future scaling**: Architecture supports migration to cloud providers (AWS, DigitalOcean, Hetzner)
