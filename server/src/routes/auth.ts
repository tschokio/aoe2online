import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';
import { RegisterRequest, LoginRequest, Age } from 'shared';
import { STARTING_RESOURCES, GAME_CONFIG, MapResourceType, BUILDINGS } from 'shared';

const router = Router();

// Register
router.post('/register', async (req, res: Response) => {
  try {
    const { username, email, password } = req.body as RegisterRequest;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM players WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create player
    const result = await pool.query(
      `INSERT INTO players (username, email, password_hash, current_age, food, wood, gold, stone, population_current, population_max)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, username, email, current_age, food, wood, gold, stone, population_current, population_max, created_at`,
      [
        username,
        email,
        passwordHash,
        Age.DAWN,
        STARTING_RESOURCES.food,
        STARTING_RESOURCES.wood,
        STARTING_RESOURCES.gold,
        STARTING_RESOURCES.stone,
        GAME_CONFIG.STARTING_POPULATION,
        GAME_CONFIG.STARTING_MAX_POPULATION
      ]
    );

    const player = result.rows[0];

    // Create starting buildings and units
    await initializePlayerGame(player.id);

    // Generate token
    const token = generateToken(player.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      token,
      player: {
        id: player.id,
        username: player.username,
        email: player.email,
        currentAge: player.current_age,
        resources: {
          food: player.food,
          wood: player.wood,
          gold: player.gold,
          stone: player.stone
        },
        population: player.population_current,
        maxPopulation: player.population_max,
        createdAt: player.created_at,
        updatedAt: player.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM players WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const player = result.rows[0];

    // Check password
    const isValid = await bcrypt.compare(password, player.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(player.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      token,
      player: {
        id: player.id,
        username: player.username,
        email: player.email,
        currentAge: player.current_age,
        resources: {
          food: player.food,
          wood: player.wood,
          gold: player.gold,
          stone: player.stone
        },
        population: player.population_current,
        maxPopulation: player.population_max,
        createdAt: player.created_at,
        updatedAt: player.updated_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await pool.query(
      'SELECT id, username, email, current_age, food, wood, gold, stone, population_current, population_max, created_at, updated_at FROM players WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const player = result.rows[0];

    res.json({
      id: player.id,
      username: player.username,
      email: player.email,
      currentAge: player.current_age,
      resources: {
        food: player.food,
        wood: player.wood,
        gold: player.gold,
        stone: player.stone
      },
      population: player.population_current,
      maxPopulation: player.population_max,
      createdAt: player.created_at,
      updatedAt: player.updated_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Logout
router.post('/logout', (_req, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Initialize player's starting game state
async function initializePlayerGame(playerId: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create Town Center at center of grid
    const centerX = Math.floor(GAME_CONFIG.GRID_SIZE / 2);
    const centerY = Math.floor(GAME_CONFIG.GRID_SIZE / 2);

    const townCenterHealth = 2400; // Town Center HP
    await client.query(
      `INSERT INTO buildings (player_id, building_type, grid_x, grid_y, level, is_complete, health_current, health_max, construction_started_at, construction_complete_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [playerId, 'TOWN_CENTER', centerX, centerY, 1, true, townCenterHealth, townCenterHealth]
    );

    // Create starting villagers
    for (let i = 0; i < GAME_CONFIG.STARTING_POPULATION; i++) {
      const villagerHealth = 25;
      const villagerAttack = 3;
      await client.query(
        `INSERT INTO units (player_id, unit_type, is_trained, health_current, health_max, attack, training_started_at, training_complete_at, current_task)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)`,
        [playerId, 'VILLAGER', true, villagerHealth, villagerHealth, villagerAttack, 'IDLE']
      );
    }

    // TODO: Generate initial map resources (map_resources table not implemented yet)
    // const resourcePlacements = [
    //   { type: MapResourceType.TREE, count: 20, amount: 100 },
    //   { type: MapResourceType.SHEEP, count: 8, amount: 50 },
    //   { type: MapResourceType.GOLD_ORE, count: 5, amount: 200 },
    //   { type: MapResourceType.STONE_ORE, count: 5, amount: 200 }
    // ];

    await client.query('COMMIT');
    console.log(`✓ Initialized game for player ${playerId}: Town Center + ${GAME_CONFIG.STARTING_POPULATION} villagers`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default router;
