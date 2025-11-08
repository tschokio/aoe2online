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
  const [playerResult, buildingsResult, unitsResult] = await Promise.all([
    pool.query('SELECT * FROM players WHERE id = $1', [playerId]),
    pool.query('SELECT * FROM buildings WHERE player_id = $1', [playerId]),
    pool.query('SELECT * FROM units WHERE player_id = $1', [playerId])
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
      population: player.population_current,
      maxPopulation: player.population_max,
      createdAt: player.created_at,
      updatedAt: player.updated_at
    },
    buildings: buildingsResult.rows.map((b: any) => ({
      id: b.id,
      playerId: b.player_id,
      type: b.building_type,
      gridX: b.grid_x,
      gridY: b.grid_y,
      level: b.level,
      isComplete: b.is_complete,
      healthCurrent: b.health_current,
      healthMax: b.health_max,
      constructionStartedAt: b.construction_started_at,
      constructionCompleteAt: b.construction_complete_at
    })),
    units: unitsResult.rows.map((u: any) => ({
      id: u.id,
      playerId: u.player_id,
      type: u.unit_type,
      isTrained: u.is_trained,
      healthCurrent: u.health_current,
      healthMax: u.health_max,
      attack: u.attack,
      trainingStartedAt: u.training_started_at,
      trainingCompleteAt: u.training_complete_at,
      currentTask: u.current_task,
      taskTargetId: u.task_target_id
    })),
    mapResources: [] // Map resources not implemented yet
  };
}

export default router;
