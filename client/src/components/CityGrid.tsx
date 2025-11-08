import { Building, Unit, MapResource } from 'shared';
import './CityGrid.css';

interface CityGridProps {
  buildings: Building[];
  units: Unit[];
  mapResources: MapResource[];
  onBuildingClick: (building: Building) => void;
}

const GRID_SIZE = 50;
const CELL_SIZE = 20; // pixels

export default function CityGrid({ buildings, units, mapResources, onBuildingClick }: CityGridProps) {
  const getBuildingColor = (type: string, isConstructing: boolean) => {
    if (isConstructing) return '#7a7a7a';
    
    const colors: Record<string, string> = {
      TOWN_CENTER: '#e94560',
      HOUSE: '#8b4513',
      BARRACKS: '#dc143c',
      LUMBER_CAMP: '#654321',
      MINING_CAMP: '#708090',
      MILL: '#daa520',
      STORAGE_PIT: '#696969',
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

  return (
    <div className="city-grid-container">
      <svg
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="city-grid"
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width={CELL_SIZE} height={CELL_SIZE} patternUnits="userSpaceOnUse">
            <path
              d={`M ${CELL_SIZE} 0 L 0 0 0 ${CELL_SIZE}`}
              fill="none"
              stroke="#1a2332"
              strokeWidth="0.5"
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
        {units.map((unit) => (
          <circle
            key={unit.id}
            cx={unit.gridX * CELL_SIZE + CELL_SIZE / 2}
            cy={unit.gridY * CELL_SIZE + CELL_SIZE / 2}
            r={CELL_SIZE / 4}
            fill={unit.isTraining ? '#7a7a7a' : '#4169e1'}
            stroke="#fff"
            strokeWidth="1"
          />
        ))}

        {/* Buildings */}
        {buildings.map((building) => (
          <rect
            key={building.id}
            x={building.gridX * CELL_SIZE}
            y={building.gridY * CELL_SIZE}
            width={CELL_SIZE * (building.type === 'TOWN_CENTER' ? 3 : 2)}
            height={CELL_SIZE * (building.type === 'TOWN_CENTER' ? 3 : 2)}
            fill={getBuildingColor(building.type, building.isConstructing)}
            stroke="#fff"
            strokeWidth="2"
            className="building"
            onClick={() => onBuildingClick(building)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </svg>
    </div>
  );
}
