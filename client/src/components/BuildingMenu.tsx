import { Age, BuildingType, BUILDINGS, Resources } from 'shared';
import './BuildingMenu.css';

interface BuildingMenuProps {
  currentAge: Age;
  resources: Resources;
  onBuildingSelect: (type: BuildingType) => void;
}

export default function BuildingMenu({ currentAge, resources, onBuildingSelect }: BuildingMenuProps) {
  const ageOrder = ['DAWN', 'HEARTH', 'EXPANSION', 'GILDED'];
  const currentAgeIndex = ageOrder.indexOf(currentAge);

  const canAfford = (cost: Resources) => {
    return (
      resources.food >= cost.food &&
      resources.wood >= cost.wood &&
      resources.gold >= cost.gold &&
      resources.stone >= cost.stone
    );
  };

  const canBuild = (buildingType: BuildingType) => {
    const building = BUILDINGS[buildingType];
    const requiredAgeIndex = ageOrder.indexOf(building.requiredAge);
    return currentAgeIndex >= requiredAgeIndex && canAfford(building.cost);
  };

  return (
    <div className="building-menu">
      <h2>Buildings</h2>
      <div className="building-list">
        {Object.values(BUILDINGS).map((building) => (
          <button
            key={building.type}
            className={`building-item ${!canBuild(building.type) ? 'disabled' : ''}`}
            onClick={() => onBuildingSelect(building.type)}
            disabled={!canBuild(building.type)}
          >
            <div className="building-name">{building.name}</div>
            <div className="building-cost">
              {building.cost.food > 0 && <span>🍖 {building.cost.food}</span>}
              {building.cost.wood > 0 && <span>🪵 {building.cost.wood}</span>}
              {building.cost.gold > 0 && <span>🪙 {building.cost.gold}</span>}
              {building.cost.stone > 0 && <span>🪨 {building.cost.stone}</span>}
            </div>
            {building.requiredAge !== Age.DAWN && (
              <div className="building-age">{building.requiredAge}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
