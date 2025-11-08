import { Router, Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { TrainUnitRequest, UNITS } from 'shared';
import { io } from '../app.js';

const router = Router();

const TIME_ACCELERATION = parseFloat(process.env.TIME_ACCELERATION || '1');

// Train a new unit
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { unitType, buildingId } = req.body as TrainUnitRequest;

    const unitDef = UNITS[unitType];
    if (!unitDef) {
      return res.status(400).json({ error: 'Invalid unit type' });
    }

    // Get player and building
    const [playerResult, buildingResult] = await Promise.all([
      pool.query('SELECT * FROM players WHERE id = $1', [req.userId]),
      pool.query('SELECT * FROM buildings WHERE id = $1 AND player_id = $2', [buildingId, req.userId])
    ]);

    if (buildingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }

    const player = playerResult.rows[0];
    const building = buildingResult.rows[0];

    // Check if building can train this unit
    if (building.building_type !== unitDef.requiredBuilding) {
      return res.status(400).json({ error: 'This building cannot train this unit' });
    }

    // Check age requirement
    const ageOrder = ['DAWN', 'HEARTH', 'EXPANSION', 'GILDED'];
    const playerAgeIndex = ageOrder.indexOf(player.current_age);
    const requiredAgeIndex = ageOrder.indexOf(unitDef.requiredAge);
    
    if (playerAgeIndex < requiredAgeIndex) {
      return res.status(400).json({ error: 'Age requirement not met' });
    }

    // Check resources
    if (
      player.food < unitDef.cost.food ||
      player.wood < unitDef.cost.wood ||
      player.gold < unitDef.cost.gold ||
      player.stone < unitDef.cost.stone
    ) {
      return res.status(400).json({ error: 'Insufficient resources' });
    }

    // Check population capacity
    if (player.population_current + unitDef.populationCost > player.population_max) {
      return res.status(400).json({ error: 'Population capacity reached' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Deduct resources and increase population
      await client.query(
        `UPDATE players 
         SET food = food - $1, wood = wood - $2, gold = gold - $3, stone = stone - $4, population_current = population_current + $5
         WHERE id = $6`,
        [unitDef.cost.food, unitDef.cost.wood, unitDef.cost.gold, unitDef.cost.stone, unitDef.populationCost, req.userId]
      );

      // Calculate completion time
      const now = new Date();
      const completionTime = new Date(now.getTime() + (unitDef.trainingTime * 1000) / TIME_ACCELERATION);
      const isTrained = unitDef.trainingTime === 0;

      // Create unit (health/attack would come from unitDef if it had them)
      const unitHealth = 25; // Default unit HP
      const unitAttack = 5; // Default attack
      const result = await client.query(
        `INSERT INTO units (player_id, unit_type, is_trained, health_current, health_max, attack, training_started_at, training_complete_at, current_task)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [req.userId, unitType, isTrained, unitHealth, unitHealth, unitAttack, now, completionTime, 'IDLE']
      );

      await client.query('COMMIT');

      const unit = result.rows[0];

      // Emit update via Socket.io
      io.to(`player:${req.userId}`).emit('game-state-update', {
        units: [unit]
      });

      res.status(201).json({
        id: unit.id,
        playerId: unit.player_id,
        type: unit.unit_type,
        isTrained: unit.is_trained,
        healthCurrent: unit.health_current,
        healthMax: unit.health_max,
        attack: unit.attack,
        trainingStartedAt: unit.training_started_at,
        trainingCompleteAt: unit.training_complete_at,
        currentTask: unit.current_task
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Train unit error:', error);
    res.status(500).json({ error: 'Failed to train unit' });
  }
});

// Get all units
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await pool.query(
      'SELECT * FROM units WHERE player_id = $1',
      [req.userId]
    );

    res.json(result.rows.map((u: any) => ({
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
    })));
  } catch (error) {
    console.error('Get units error:', error);
    res.status(500).json({ error: 'Failed to get units' });
  }
});

export default router;
