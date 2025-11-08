# AI Agent Instructions - Age of Empires Online Clone

## Project Overview

This is a web-based, slow-paced RTS game inspired by Age of Empires II and Travian. The core concept is a **persistent world** where actions take hours/days, not minutes - players check in a few times daily rather than playing intensively.

Key differentiator: **Asynchronous gameplay** with extremely slow pacing (buildings take hours/days, travel is slow, resources trickle in).

## Project Status

**Early stage**: Currently only contains `project.md` specification. No code implementation exists yet.

## Architecture Decisions (from spec)

- **Monorepo structure**: Single repo with `client/` and `server/` folders using npm/yarn workspaces
- **Frontend**: React SPA with Vite, focus on modern, responsive UI/UX
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (reliable, great for relational game data, JSONB for flexible state)
- **Real-time**: WebSockets via Socket.io (bi-directional, automatic reconnection, room support)
- **Authentication**: JWT tokens + HTTP-only cookies (secure, stateless, works with WebSockets)
- **Game State**: Server-authoritative real-time strategy with persistent world state
- **Core Feature**: 2D grid-based map for player city building placement
- **Deployment**: Docker Compose for easy self-hosting, scalable to cloud later

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

## Self-Hosting Setup

- **Initial deployment**: Docker Compose on Debian VM (see `DEPLOYMENT.md`)
- **Database**: PostgreSQL container with volume persistence
- **Environment**: `.env` files for configuration (never commit secrets)
- **Scripts**: `setup.sh` for automated VM provisioning
- **Future scaling**: Architecture supports migration to cloud providers (AWS, DigitalOcean, Hetzner)
