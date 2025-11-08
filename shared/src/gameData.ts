import {
  Age,
  ResourceType,
  BuildingType,
  UnitType,
  MapResourceType,
  BuildingDefinition,
  UnitDefinition,
  Resources
} from './types.js';

// Building Definitions
export const BUILDINGS: Record<BuildingType, BuildingDefinition> = {
  [BuildingType.TOWN_CENTER]: {
    type: BuildingType.TOWN_CENTER,
    name: 'Town Center',
    requiredAge: Age.DAWN,
    cost: { food: 0, wood: 0, gold: 0, stone: 0 }, // Starting building
    buildTime: 0,
    populationProvided: 0,
    gridSize: { width: 3, height: 3 },
    description: 'Produces Villagers and acts as a resource drop-off point.'
  },
  [BuildingType.HOUSE]: {
    type: BuildingType.HOUSE,
    name: 'House',
    requiredAge: Age.DAWN,
    cost: { food: 0, wood: 30, gold: 0, stone: 0 },
    buildTime: 60, // 1 minute
    populationProvided: 5,
    gridSize: { width: 2, height: 2 },
    description: 'Increases population capacity by 5.'
  },
  [BuildingType.LUMBER_CAMP]: {
    type: BuildingType.LUMBER_CAMP,
    name: 'Lumber Camp',
    requiredAge: Age.DAWN,
    cost: { food: 0, wood: 100, gold: 0, stone: 0 },
    buildTime: 90, // 1.5 minutes
    populationProvided: 0,
    gridSize: { width: 2, height: 2 },
    description: 'Improves wood gathering efficiency.'
  },
  [BuildingType.MINING_CAMP]: {
    type: BuildingType.MINING_CAMP,
    name: 'Mining Camp',
    requiredAge: Age.DAWN,
    cost: { food: 0, wood: 100, gold: 0, stone: 0 },
    buildTime: 90,
    populationProvided: 0,
    gridSize: { width: 2, height: 2 },
    description: 'Improves gold and stone gathering efficiency.'
  },
  [BuildingType.MILL]: {
    type: BuildingType.MILL,
    name: 'Mill',
    requiredAge: Age.DAWN,
    cost: { food: 0, wood: 100, gold: 0, stone: 0 },
    buildTime: 90,
    populationProvided: 0,
    gridSize: { width: 2, height: 2 },
    description: 'Improves food gathering efficiency.'
  },
  [BuildingType.STORAGE_PIT]: {
    type: BuildingType.STORAGE_PIT,
    name: 'Storage Pit',
    requiredAge: Age.DAWN,
    cost: { food: 0, wood: 120, gold: 0, stone: 0 },
    buildTime: 120, // 2 minutes
    populationProvided: 0,
    gridSize: { width: 2, height: 2 },
    description: 'Increases maximum resource capacity.'
  },
  [BuildingType.BARRACKS]: {
    type: BuildingType.BARRACKS,
    name: 'Barracks',
    requiredAge: Age.HEARTH,
    cost: { food: 0, wood: 175, gold: 0, stone: 0 },
    buildTime: 300, // 5 minutes
    populationProvided: 0,
    gridSize: { width: 3, height: 2 },
    description: 'Trains basic infantry units.'
  },
  [BuildingType.ARCHERY_RANGE]: {
    type: BuildingType.ARCHERY_RANGE,
    name: 'Archery Range',
    requiredAge: Age.HEARTH,
    cost: { food: 0, wood: 150, gold: 0, stone: 0 },
    buildTime: 300,
    populationProvided: 0,
    gridSize: { width: 3, height: 2 },
    description: 'Trains basic ranged units.'
  },
  [BuildingType.STABLE]: {
    type: BuildingType.STABLE,
    name: 'Stable',
    requiredAge: Age.HEARTH,
    cost: { food: 0, wood: 150, gold: 0, stone: 0 },
    buildTime: 300,
    populationProvided: 0,
    gridSize: { width: 3, height: 2 },
    description: 'Trains basic cavalry units.'
  },
  [BuildingType.BLACKSMITH]: {
    type: BuildingType.BLACKSMITH,
    name: 'Blacksmith',
    requiredAge: Age.HEARTH,
    cost: { food: 0, wood: 150, gold: 100, stone: 0 },
    buildTime: 300,
    populationProvided: 0,
    gridSize: { width: 2, height: 2 },
    description: 'Researches military unit upgrades.'
  },
  [BuildingType.WALL]: {
    type: BuildingType.WALL,
    name: 'Wall',
    requiredAge: Age.HEARTH,
    cost: { food: 0, wood: 0, gold: 0, stone: 5 },
    buildTime: 30,
    populationProvided: 0,
    gridSize: { width: 1, height: 1 },
    description: 'Provides basic defense for your town.'
  }
};

// Unit Definitions
export const UNITS: Record<UnitType, UnitDefinition> = {
  [UnitType.VILLAGER]: {
    type: UnitType.VILLAGER,
    name: 'Villager',
    requiredAge: Age.DAWN,
    requiredBuilding: BuildingType.TOWN_CENTER,
    cost: { food: 50, wood: 0, gold: 0, stone: 0 },
    trainingTime: 60, // 1 minute
    populationCost: 1,
    description: 'Gathers resources and constructs buildings.'
  },
  [UnitType.CLUBMAN]: {
    type: UnitType.CLUBMAN,
    name: 'Clubman',
    requiredAge: Age.HEARTH,
    requiredBuilding: BuildingType.BARRACKS,
    cost: { food: 50, wood: 0, gold: 0, stone: 0 },
    trainingTime: 120, // 2 minutes
    populationCost: 1,
    description: 'Basic, cheap infantry unit.'
  },
  [UnitType.SLINGER]: {
    type: UnitType.SLINGER,
    name: 'Slinger',
    requiredAge: Age.HEARTH,
    requiredBuilding: BuildingType.ARCHERY_RANGE,
    cost: { food: 30, wood: 30, gold: 0, stone: 0 },
    trainingTime: 120,
    populationCost: 1,
    description: 'Basic ranged unit. Weak in melee.'
  },
  [UnitType.SCOUT]: {
    type: UnitType.SCOUT,
    name: 'Scout',
    requiredAge: Age.HEARTH,
    requiredBuilding: BuildingType.STABLE,
    cost: { food: 80, wood: 0, gold: 0, stone: 0 },
    trainingTime: 90,
    populationCost: 1,
    description: 'Fast-moving unit for exploration. Weak in combat.'
  }
};

// Map Resource yields
export const MAP_RESOURCE_YIELDS: Record<MapResourceType, { resourceType: ResourceType; gatherRate: number; maxAmount: number }> = {
  [MapResourceType.TREE]: {
    resourceType: ResourceType.WOOD,
    gatherRate: 5, // per villager per tick
    maxAmount: 100
  },
  [MapResourceType.SHEEP]: {
    resourceType: ResourceType.FOOD,
    gatherRate: 3,
    maxAmount: 50
  },
  [MapResourceType.GOLD_ORE]: {
    resourceType: ResourceType.GOLD,
    gatherRate: 2,
    maxAmount: 200
  },
  [MapResourceType.STONE_ORE]: {
    resourceType: ResourceType.STONE,
    gatherRate: 2,
    maxAmount: 200
  }
};

// Starting resources
export const STARTING_RESOURCES: Resources = {
  food: 200,
  wood: 200,
  gold: 100,
  stone: 100
};

// Game constants
export const GAME_CONFIG = {
  GRID_SIZE: 50, // 50x50 grid
  RESOURCE_TICK_INTERVAL: 10000, // 10 seconds
  MAX_RESOURCE_CAPACITY: 1000,
  STARTING_POPULATION: 3,
  STARTING_MAX_POPULATION: 5
};
