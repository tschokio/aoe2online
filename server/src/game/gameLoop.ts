import pool from '../db.js';
import { io } from '../app.js';
import { BUILDINGS } from 'shared';

const GAME_LOOP_INTERVAL = 5000; // 5 seconds

export function startGameLoop() {
  setInterval(async () => {
    try {
      await processCompletedBuildings();
      await processCompletedUnits();
    } catch (error) {
      console.error('Game loop error:', error);
    }
  }, GAME_LOOP_INTERVAL);

  console.log('✓ Game loop started');
}

// Process completed buildings
async function processCompletedBuildings() {
  const result = await pool.query(
    `SELECT * FROM buildings 
     WHERE is_constructing = true 
     AND construction_completes_at <= NOW()`
  );

  for (const building of result.rows) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Mark building as completed
      await client.query(
        `UPDATE buildings 
         SET is_constructing = false, construction_started_at = NULL, construction_completes_at = NULL
         WHERE id = $1`,
        [building.id]
      );

      // Update player max population if building provides it
      const buildingDef = BUILDINGS[building.type];
      if (buildingDef && buildingDef.populationProvided > 0) {
        await client.query(
          `UPDATE players 
           SET max_population = max_population + $1
           WHERE id = $2`,
          [buildingDef.populationProvided, building.player_id]
        );
      }

      await client.query('COMMIT');

      // Notify player via Socket.io
      const updatedBuilding = await pool.query(
        'SELECT * FROM buildings WHERE id = $1',
        [building.id]
      );
      
      io.to(`player:${building.player_id}`).emit('building-completed', {
        id: updatedBuilding.rows[0].id,
        playerId: updatedBuilding.rows[0].player_id,
        type: updatedBuilding.rows[0].type,
        gridX: updatedBuilding.rows[0].grid_x,
        gridY: updatedBuilding.rows[0].grid_y,
        level: updatedBuilding.rows[0].level,
        isConstructing: updatedBuilding.rows[0].is_constructing,
        constructionStartedAt: updatedBuilding.rows[0].construction_started_at,
        constructionCompletesAt: updatedBuilding.rows[0].construction_completes_at,
        createdAt: updatedBuilding.rows[0].created_at,
        updatedAt: updatedBuilding.rows[0].updated_at
      });

      console.log(`Building ${building.type} completed for player ${building.player_id}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing completed building:', error);
    } finally {
      client.release();
    }
  }
}

// Process completed units
async function processCompletedUnits() {
  const result = await pool.query(
    `SELECT * FROM units 
     WHERE is_training = true 
     AND training_completes_at <= NOW()`
  );

  for (const unit of result.rows) {
    try {
      // Mark unit as completed
      await pool.query(
        `UPDATE units 
         SET is_training = false, training_started_at = NULL, training_completes_at = NULL
         WHERE id = $1`,
        [unit.id]
      );

      // Notify player via Socket.io
      const updatedUnit = await pool.query(
        'SELECT * FROM units WHERE id = $1',
        [unit.id]
      );
      
      io.to(`player:${unit.player_id}`).emit('unit-completed', {
        id: updatedUnit.rows[0].id,
        playerId: updatedUnit.rows[0].player_id,
        type: updatedUnit.rows[0].type,
        gridX: updatedUnit.rows[0].grid_x,
        gridY: updatedUnit.rows[0].grid_y,
        isTraining: updatedUnit.rows[0].is_training,
        trainingStartedAt: updatedUnit.rows[0].training_started_at,
        trainingCompletesAt: updatedUnit.rows[0].training_completes_at,
        task: updatedUnit.rows[0].task_type ? {
          type: updatedUnit.rows[0].task_type,
          targetResourceId: updatedUnit.rows[0].task_target_resource_id,
          targetBuildingId: updatedUnit.rows[0].task_target_building_id
        } : undefined,
        createdAt: updatedUnit.rows[0].created_at,
        updatedAt: updatedUnit.rows[0].updated_at
      });

      console.log(`Unit ${unit.type} completed for player ${unit.player_id}`);
    } catch (error) {
      console.error('Error processing completed unit:', error);
    }
  }
}
