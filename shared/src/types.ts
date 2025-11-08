// Game Ages
export enum Age {
  DAWN = 'DAWN',
  HEARTH = 'HEARTH',
  EXPANSION = 'EXPANSION',
  GILDED = 'GILDED'
}

// Resource Types
export enum ResourceType {
  FOOD = 'FOOD',
  WOOD = 'WOOD',
  GOLD = 'GOLD',
  STONE = 'STONE'
}

// Building Types
export enum BuildingType {
  TOWN_CENTER = 'TOWN_CENTER',
  HOUSE = 'HOUSE',
  LUMBER_CAMP = 'LUMBER_CAMP',
  MINING_CAMP = 'MINING_CAMP',
  MILL = 'MILL',
  STORAGE_PIT = 'STORAGE_PIT',
  BARRACKS = 'BARRACKS',
  ARCHERY_RANGE = 'ARCHERY_RANGE',
  STABLE = 'STABLE',
  BLACKSMITH = 'BLACKSMITH',
  WALL = 'WALL'
}

// Unit Types
export enum UnitType {
  VILLAGER = 'VILLAGER',
  CLUBMAN = 'CLUBMAN',
  SLINGER = 'SLINGER',
  SCOUT = 'SCOUT'
}

// Map Resource Types (on the map itself)
export enum MapResourceType {
  TREE = 'TREE',
  SHEEP = 'SHEEP',
  GOLD_ORE = 'GOLD_ORE',
  STONE_ORE = 'STONE_ORE'
}

// Player
export interface Player {
  id: number;
  username: string;
  email: string;
  currentAge: Age;
  resources: Resources;
  population: number;
  maxPopulation: number;
  createdAt: Date;
  updatedAt: Date;
}

// Resources
export interface Resources {
  food: number;
  wood: number;
  gold: number;
  stone: number;
}

// Building
export interface Building {
  id: number;
  playerId: number;
  type: BuildingType;
  gridX: number;
  gridY: number;
  level: number;
  isConstructing: boolean;
  constructionStartedAt?: Date;
  constructionCompletesAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Unit
export interface Unit {
  id: number;
  playerId: number;
  type: UnitType;
  gridX: number;
  gridY: number;
  isTraining: boolean;
  trainingStartedAt?: Date;
  trainingCompletesAt?: Date;
  task?: UnitTask;
  createdAt: Date;
  updatedAt: Date;
}

// Unit Task
export interface UnitTask {
  type: 'GATHER' | 'BUILD' | 'IDLE';
  targetResourceId?: number;
  targetBuildingId?: number;
}

// Map Resource (trees, sheep, ore deposits)
export interface MapResource {
  id: number;
  playerId: number;
  type: MapResourceType;
  gridX: number;
  gridY: number;
  amount: number;
  maxAmount: number;
  createdAt: Date;
}

// Building Definition (game data)
export interface BuildingDefinition {
  type: BuildingType;
  name: string;
  requiredAge: Age;
  cost: Resources;
  buildTime: number; // seconds
  populationProvided: number;
  gridSize: { width: number; height: number };
  description: string;
}

// Unit Definition (game data)
export interface UnitDefinition {
  type: UnitType;
  name: string;
  requiredAge: Age;
  requiredBuilding: BuildingType;
  cost: Resources;
  trainingTime: number; // seconds
  populationCost: number;
  description: string;
}

// API Request/Response Types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  player: Omit<Player, 'password'>;
}

export interface GameState {
  player: Player;
  buildings: Building[];
  units: Unit[];
  mapResources: MapResource[];
}

export interface BuildBuildingRequest {
  buildingType: BuildingType;
  gridX: number;
  gridY: number;
}

export interface TrainUnitRequest {
  unitType: UnitType;
  buildingId: number;
}

export interface AssignTaskRequest {
  unitId: number;
  task: UnitTask;
}

// Socket.io Events
export interface ServerToClientEvents {
  'game-state-update': (gameState: Partial<GameState>) => void;
  'resource-update': (resources: Resources) => void;
  'building-completed': (building: Building) => void;
  'unit-completed': (unit: Unit) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'join-game': () => void;
  'build-building': (data: BuildBuildingRequest) => void;
  'train-unit': (data: TrainUnitRequest) => void;
  'assign-task': (data: AssignTaskRequest) => void;
}
