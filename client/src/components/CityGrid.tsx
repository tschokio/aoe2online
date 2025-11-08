import { Building, Unit, MapResource } from 'shared';
import { useState, useEffect } from 'react';
import './CityGrid.css';

interface CityGridProps {
  buildings: Building[];
  units: Unit[];
  mapResources: MapResource[];
  onBuildingClick: (building: Building) => void;
  onGridClick?: (gridX: number, gridY: number) => void;
}

const GRID_SIZE = 50;
const CELL_SIZE = 20; // pixels

// Generate terrain features (run once on mount)
const generateTerrain = () => {
  const terrain: Array<{ x: number; y: number; type: 'water' | 'forest' | 'gold' | 'stone' }> = [];
  
  // Add water patches (2-3 small lakes)
  for (let i = 0; i < 2; i++) {
    const centerX = Math.floor(Math.random() * (GRID_SIZE - 10)) + 5;
    const centerY = Math.floor(Math.random() * (GRID_SIZE - 10)) + 5;
    const size = Math.floor(Math.random() * 3) + 3;
    
    for (let dx = -size; dx <= size; dx++) {
      for (let dy = -size; dy <= size; dy++) {
        if (dx * dx + dy * dy <= size * size) {
          terrain.push({ x: centerX + dx, y: centerY + dy, type: 'water' });
        }
      }
    }
  }
  
  // Add forest patches (5-7 patches)
  for (let i = 0; i < 6; i++) {
    const centerX = Math.floor(Math.random() * GRID_SIZE);
    const centerY = Math.floor(Math.random() * GRID_SIZE);
    const trees = Math.floor(Math.random() * 8) + 5;
    
    for (let j = 0; j < trees; j++) {
      const offsetX = Math.floor(Math.random() * 6) - 3;
      const offsetY = Math.floor(Math.random() * 6) - 3;
      terrain.push({ x: centerX + offsetX, y: centerY + offsetY, type: 'forest' });
    }
  }
  
  // Add gold ore patches (2-3 patches)
  for (let i = 0; i < 3; i++) {
    const centerX = Math.floor(Math.random() * GRID_SIZE);
    const centerY = Math.floor(Math.random() * GRID_SIZE);
    const ores = Math.floor(Math.random() * 4) + 3;
    
    for (let j = 0; j < ores; j++) {
      const offsetX = Math.floor(Math.random() * 4) - 2;
      const offsetY = Math.floor(Math.random() * 4) - 2;
      terrain.push({ x: centerX + offsetX, y: centerY + offsetY, type: 'gold' });
    }
  }
  
  // Add stone ore patches (2-3 patches)
  for (let i = 0; i < 3; i++) {
    const centerX = Math.floor(Math.random() * GRID_SIZE);
    const centerY = Math.floor(Math.random() * GRID_SIZE);
    const ores = Math.floor(Math.random() * 4) + 3;
    
    for (let j = 0; j < ores; j++) {
      const offsetX = Math.floor(Math.random() * 4) - 2;
      const offsetY = Math.floor(Math.random() * 4) - 2;
      terrain.push({ x: centerX + offsetX, y: centerY + offsetY, type: 'stone' });
    }
  }
  
  return terrain;
};

export default function CityGrid({ buildings, units, mapResources, onBuildingClick, onGridClick }: CityGridProps) {
  const [terrain, setTerrain] = useState<ReturnType<typeof generateTerrain>>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    setTerrain(generateTerrain());
    
    // Update timer every second for construction countdowns
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  console.log('[CityGrid] Rendering with:', { 
    buildingCount: buildings.length, 
    buildings: buildings.map(b => ({ type: b.type, x: b.gridX, y: b.gridY })),
    unitCount: units.length 
  });

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onGridClick) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);
    
    onGridClick(gridX, gridY);
  };

  const getBuildingColor = (type: string, isComplete: boolean) => {
    if (!isComplete) return '#7a7a7a'; // Gray for under construction
    
    const colors: Record<string, string> = {
      TOWN_CENTER: '#e94560',
      HOUSE: '#8b4513',
      BARRACKS: '#dc143c',
      LUMBER_CAMP: '#654321',
      MINING_CAMP: '#708090',
      MILL: '#daa520',
      STORAGE_PIT: '#696969',
      ARCHERY_RANGE: '#8b008b',
      STABLE: '#cd853f',
      BLACKSMITH: '#2f4f4f',
      WALL: '#696969',
    };
    
    return colors[type] || '#4a4a4a';
  };

  const getResourceColor = (type: string) => {
    const colors: Record<string, string> = {
      TREE: '#228b22',
      SHEEP: '#f5f5dc',
      GOLD_ORE: '#ffd700',
      STONE_ORE: '#808080',
    };
    
    return colors[type] || '#666';
  };
  
  const getTerrainColor = (type: string) => {
    const colors: Record<string, string> = {
      water: '#4682b4',
      forest: '#2d5016',
      gold: '#daa520',
      stone: '#708090',
    };
    return colors[type] || '#2d5016';
  };
  
  const formatTimeRemaining = (completeAt: string) => {
    const remaining = new Date(completeAt).getTime() - currentTime;
    if (remaining <= 0) return 'Completing...';
    
    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="city-grid-container">
      <svg
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="city-grid"
        onClick={handleSvgClick}
        style={{ cursor: onGridClick ? 'crosshair' : 'default' }}
      >
        {/* Grass background */}
        <rect width="100%" height="100%" fill="#3a5a2a" />
        
        {/* Terrain features (water, forests, ores) */}
        {terrain.map((t, i) => (
          <rect
            key={`terrain-${i}`}
            x={t.x * CELL_SIZE}
            y={t.y * CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={getTerrainColor(t.type)}
            opacity={t.type === 'water' ? 0.7 : 0.9}
          />
        ))}
        
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width={CELL_SIZE} height={CELL_SIZE} patternUnits="userSpaceOnUse">
            <path
              d={`M ${CELL_SIZE} 0 L 0 0 0 ${CELL_SIZE}`}
              fill="none"
              stroke="#1a2a1a"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Map resources */}
        {mapResources.map((resource) => (
          <circle
            key={resource.id}
            cx={resource.gridX * CELL_SIZE + CELL_SIZE / 2}
            cy={resource.gridY * CELL_SIZE + CELL_SIZE / 2}
            r={CELL_SIZE / 3}
            fill={getResourceColor(resource.type)}
            opacity={0.8}
          />
        ))}

        {/* Units */}
        {units.filter(u => u.gridX !== undefined && u.gridY !== undefined).map((unit) => (
          <circle
            key={unit.id}
            cx={unit.gridX! * CELL_SIZE + CELL_SIZE / 2}
            cy={unit.gridY! * CELL_SIZE + CELL_SIZE / 2}
            r={CELL_SIZE / 4}
            fill={unit.isTraining ? '#7a7a7a' : '#4169e1'}
            stroke="#fff"
            strokeWidth="1"
          />
        ))}

        {/* Buildings */}
        {buildings.map((building) => {
          const width = building.type === 'TOWN_CENTER' ? 3 : building.type === 'WALL' ? 1 : 2;
          const height = building.type === 'TOWN_CENTER' ? 3 : building.type === 'WALL' ? 1 : 2;
          
          return (
            <g key={building.id}>
              <rect
                x={building.gridX * CELL_SIZE}
                y={building.gridY * CELL_SIZE}
                width={CELL_SIZE * width}
                height={CELL_SIZE * height}
                fill={getBuildingColor(building.type, building.isComplete)}
                stroke="#fff"
                strokeWidth="2"
                className="building"
                onClick={() => onBuildingClick(building)}
                style={{ cursor: 'pointer' }}
              />
              
              {/* Construction timer */}
              {!building.isComplete && building.constructionCompleteAt && (
                <text
                  x={building.gridX * CELL_SIZE + (CELL_SIZE * width) / 2}
                  y={building.gridY * CELL_SIZE - 5}
                  fontSize="10"
                  fill="#fff"
                  textAnchor="middle"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  🔨 {formatTimeRemaining(building.constructionCompleteAt)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
