import { Router, Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { BuildBuildingRequest, BUILDINGS } from 'shared';
import { io } from '../app.js';
import { getGameState } from './game.js';

const router = Router();

const TIME_ACCELERATION = parseFloat(process.env.TIME_ACCELERATION || '1');

// Build a new building
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { buildingType, gridX, gridY } = req.body as BuildBuildingRequest;

    const buildingDef = BUILDINGS[buildingType];
    if (!buildingDef) {
      return res.status(400).json({ error: 'Invalid building type' });
    }

    // Get player
    const playerResult = await pool.query(
      'SELECT * FROM players WHERE id = $1',
      [req.userId]
    );
    const player = playerResult.rows[0];

    // Check age requirement
    const ageOrder = ['DAWN', 'HEARTH', 'EXPANSION', 'GILDED'];
    const playerAgeIndex = ageOrder.indexOf(player.current_age);
    const requiredAgeIndex = ageOrder.indexOf(buildingDef.requiredAge);
    
    if (playerAgeIndex < requiredAgeIndex) {
      return res.status(400).json({ error: 'Age requirement not met' });
    }

    // Check resources
    if (
      player.food < buildingDef.cost.food ||
      player.wood < buildingDef.cost.wood ||
      player.gold < buildingDef.cost.gold ||
      player.stone < buildingDef.cost.stone
    ) {
      return res.status(400).json({ error: 'Insufficient resources' });
    }

    // Check grid availability (simple check for now)
    const existingBuilding = await pool.query(
      'SELECT id FROM buildings WHERE player_id = $1 AND grid_x = $2 AND grid_y = $3',
      [req.userId, gridX, gridY]
    );

    if (existingBuilding.rows.length > 0) {
      return res.status(400).json({ error: 'Location occupied' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Deduct resources
      await client.query(
        `UPDATE players 
         SET food = food - $1, wood = wood - $2, gold = gold - $3, stone = stone - $4
         WHERE id = $5`,
        [buildingDef.cost.food, buildingDef.cost.wood, buildingDef.cost.gold, buildingDef.cost.stone, req.userId]
      );

      // Calculate completion time
      const now = new Date();
      const completionTime = new Date(now.getTime() + (buildingDef.buildTime * 1000) / TIME_ACCELERATION);

      // Create building
      const result = await client.query(
        `INSERT INTO buildings (player_id, type, grid_x, grid_y, level, is_constructing, construction_started_at, construction_completes_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [req.userId, buildingType, gridX, gridY, 1, buildingDef.buildTime > 0, now, completionTime]
      );

      await client.query('COMMIT');

      const building = result.rows[0];

      // Emit update via Socket.io
      io.to(`player:${req.userId}`).emit('game-state-update', {
        buildings: [building]
      });

      res.status(201).json({
        id: building.id,
        playerId: building.player_id,
        type: building.type,
        gridX: building.grid_x,
        gridY: building.grid_y,
        level: building.level,
        isConstructing: building.is_constructing,
        constructionStartedAt: building.construction_started_at,
        constructionCompletesAt: building.construction_completes_at,
        createdAt: building.created_at,
        updatedAt: building.updated_at
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Build building error:', error);
    res.status(500).json({ error: 'Failed to build building' });
  }
});

// Get all buildings
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await pool.query(
      'SELECT * FROM buildings WHERE player_id = $1',
      [req.userId]
    );

    res.json(result.rows.map(b => ({
      id: b.id,
      playerId: b.player_id,
      type: b.type,
      gridX: b.grid_x,
      gridY: b.grid_y,
      level: b.level,
      isConstructing: b.is_constructing,
      constructionStartedAt: b.construction_started_at,
      constructionCompletesAt: b.construction_completes_at,
      createdAt: b.created_at,
      updatedAt: b.updated_at
    })));
  } catch (error) {
    console.error('Get buildings error:', error);
    res.status(500).json({ error: 'Failed to get buildings' });
  }
});

export default router;
