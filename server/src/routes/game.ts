import { Router, Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { GameState } from 'shared';

const router = Router();

// Get full game state
router.get('/state', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const gameState = await getGameState(req.userId);
    res.json(gameState);
  } catch (error) {
    console.error('Get game state error:', error);
    res.status(500).json({ error: 'Failed to get game state' });
  }
});

// Helper to get full game state
export async function getGameState(playerId: number): Promise<GameState> {
  const [playerResult, buildingsResult, unitsResult, resourcesResult] = await Promise.all([
    pool.query('SELECT * FROM players WHERE id = $1', [playerId]),
    pool.query('SELECT * FROM buildings WHERE player_id = $1', [playerId]),
    pool.query('SELECT * FROM units WHERE player_id = $1', [playerId]),
    pool.query('SELECT * FROM map_resources WHERE player_id = $1', [playerId])
  ]);

  const player = playerResult.rows[0];

  return {
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
      population: player.population,
      maxPopulation: player.max_population,
      createdAt: player.created_at,
      updatedAt: player.updated_at
    },
    buildings: buildingsResult.rows.map(b => ({
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
    })),
    units: unitsResult.rows.map(u => ({
      id: u.id,
      playerId: u.player_id,
      type: u.type,
      gridX: u.grid_x,
      gridY: u.grid_y,
      isTraining: u.is_training,
      trainingStartedAt: u.training_started_at,
      trainingCompletesAt: u.training_completes_at,
      task: u.task_type ? {
        type: u.task_type,
        targetResourceId: u.task_target_resource_id,
        targetBuildingId: u.task_target_building_id
      } : undefined,
      createdAt: u.created_at,
      updatedAt: u.updated_at
    })),
    mapResources: resourcesResult.rows.map(r => ({
      id: r.id,
      playerId: r.player_id,
      type: r.type,
      gridX: r.grid_x,
      gridY: r.grid_y,
      amount: r.amount,
      maxAmount: r.max_amount,
      createdAt: r.created_at
    }))
  };
}

export default router;
