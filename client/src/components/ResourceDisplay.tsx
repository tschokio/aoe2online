import { Resources } from 'shared';
import './ResourceDisplay.css';

interface ResourceDisplayProps {
  resources: Resources;
}

export default function ResourceDisplay({ resources }: ResourceDisplayProps) {
  return (
    <div className="resource-display">
      <div className="resource-item">
        <span className="resource-icon">🍖</span>
        <span className="resource-amount">{resources.food}</span>
      </div>
      <div className="resource-item">
        <span className="resource-icon">🪵</span>
        <span className="resource-amount">{resources.wood}</span>
      </div>
      <div className="resource-item">
        <span className="resource-icon">🪙</span>
        <span className="resource-amount">{resources.gold}</span>
      </div>
      <div className="resource-item">
        <span className="resource-icon">🪨</span>
        <span className="resource-amount">{resources.stone}</span>
      </div>
    </div>
  );
}
