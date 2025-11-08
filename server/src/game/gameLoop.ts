import pool from '../db.js';
import { io } from '../app.js';
import { BUILDINGS } from 'shared';

const GAME_LOOP_INTERVAL = 1000; // 1 second for fast updates

export function startGameLoop() {
  setInterval(async () => {
    try {
      await processCompletedBuildings();
      await processCompletedUnits();
      await generateResources();
    } catch (error) {
      console.error('Game loop error:', error);
    }
  }, GAME_LOOP_INTERVAL);

  console.log('✓ Game loop started (1 second ticks)');
}

// Process completed buildings
async function processCompletedBuildings() {
  const result = await pool.query(
    `SELECT * FROM buildings 
     WHERE is_complete = false 
     AND construction_complete_at <= NOW()`
  );

  for (const building of result.rows) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Mark building as completed
      await client.query(
        `UPDATE buildings 
         SET is_complete = true
         WHERE id = $1`,
        [building.id]
      );

      // Update player max population if building provides it
      const buildingDef = BUILDINGS[building.building_type as keyof typeof BUILDINGS];
      if (buildingDef && buildingDef.populationProvided > 0) {
        await client.query(
          `UPDATE players 
           SET population_max = population_max + $1
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
        type: updatedBuilding.rows[0].building_type,
        gridX: updatedBuilding.rows[0].grid_x,
        gridY: updatedBuilding.rows[0].grid_y,
        level: updatedBuilding.rows[0].level,
        isComplete: updatedBuilding.rows[0].is_complete,
        constructionStartedAt: updatedBuilding.rows[0].construction_started_at,
        constructionCompleteAt: updatedBuilding.rows[0].construction_complete_at,
        healthCurrent: updatedBuilding.rows[0].health_current,
        healthMax: updatedBuilding.rows[0].health_max
      });

      console.log(`Building ${building.building_type} completed for player ${building.player_id}`);
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
     WHERE is_trained = false 
     AND training_complete_at <= NOW()`
  );

  for (const unit of result.rows) {
    try {
      // Mark unit as completed
      await pool.query(
        `UPDATE units 
         SET is_trained = true
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
        type: updatedUnit.rows[0].unit_type,
        isTrained: updatedUnit.rows[0].is_trained,
        trainingStartedAt: updatedUnit.rows[0].training_started_at,
        trainingCompleteAt: updatedUnit.rows[0].training_complete_at,
        healthCurrent: updatedUnit.rows[0].health_current,
        healthMax: updatedUnit.rows[0].health_max,
        attack: updatedUnit.rows[0].attack,
        currentTask: updatedUnit.rows[0].current_task,
        taskTargetId: updatedUnit.rows[0].task_target_id
      });

      console.log(`Unit ${unit.unit_type} completed for player ${unit.player_id}`);
    } catch (error) {
      console.error('Error processing completed unit:', error);
    }
  }
}

// Generate resources from villagers based on their assigned tasks
async function generateResources() {
  // Get all players and their villagers by task
  const players = await pool.query(`
    SELECT 
      p.id,
      COUNT(CASE WHEN u.current_task = 'GATHER_FOOD' AND u.is_trained = true THEN 1 END) as food_villagers,
      COUNT(CASE WHEN u.current_task = 'GATHER_WOOD' AND u.is_trained = true THEN 1 END) as wood_villagers,
      COUNT(CASE WHEN u.current_task = 'GATHER_GOLD' AND u.is_trained = true THEN 1 END) as gold_villagers,
      COUNT(CASE WHEN u.current_task = 'GATHER_STONE' AND u.is_trained = true THEN 1 END) as stone_villagers
    FROM players p
    LEFT JOIN units u ON u.player_id = p.id AND u.unit_type = 'VILLAGER'
    GROUP BY p.id
  `);

  for (const player of players.rows) {
    const foodVillagers = parseInt(player.food_villagers) || 0;
    const woodVillagers = parseInt(player.wood_villagers) || 0;
    const goldVillagers = parseInt(player.gold_villagers) || 0;
    const stoneVillagers = parseInt(player.stone_villagers) || 0;
    
    const totalWorking = foodVillagers + woodVillagers + goldVillagers + stoneVillagers;
    if (totalWorking === 0) continue;

    // Each villager generates 1 resource per second (tick is now 1 second)
    const foodPerTick = foodVillagers * 1;
    const woodPerTick = woodVillagers * 1;
    const goldPerTick = goldVillagers * 1;
    const stonePerTick = stoneVillagers * 1;

    try {
      await pool.query(
        `UPDATE players 
         SET food = food + $1,
             wood = wood + $2,
             gold = gold + $3,
             stone = stone + $4
         WHERE id = $5`,
        [foodPerTick, woodPerTick, goldPerTick, stonePerTick, player.id]
      );

      // Emit resource update via Socket.io
      const updatedPlayer = await pool.query(
        'SELECT food, wood, gold, stone FROM players WHERE id = $1',
        [player.id]
      );
      
      io.to(`player:${player.id}`).emit('resource-update', {
        food: updatedPlayer.rows[0].food,
        wood: updatedPlayer.rows[0].wood,
        gold: updatedPlayer.rows[0].gold,
        stone: updatedPlayer.rows[0].stone
      });

      if (totalWorking > 0) {
        console.log(`Resources for player ${player.id}: +${foodPerTick}🍖 +${woodPerTick}🪵 +${goldPerTick}💰 +${stonePerTick}🪨 (${foodVillagers}/${woodVillagers}/${goldVillagers}/${stoneVillagers} workers)`);
      }
    } catch (error) {
      console.error('Error generating resources:', error);
    }
  }
}
