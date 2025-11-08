import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GameState, Building, Unit, MapResource, BuildingType, BUILDINGS, UNITS } from 'shared';
import { api } from '../utils/api';
import { io, Socket } from 'socket.io-client';
import CityGrid from '../components/CityGrid';
import ResourceDisplay from '../components/ResourceDisplay';
import BuildingMenu from '../components/BuildingMenu';
import './Game.css';

export default function Game() {
  const { player, logout } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGameState();
    connectWebSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const loadGameState = async () => {
    try {
      const state = await api.getGameState() as GameState;
      setGameState(state);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load game');
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Construct WebSocket URL based on current page location
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.hostname;
    const port = '3000'; // Backend always runs on port 3000
    const socketUrl = `${protocol}//${host}:${port}`;

    const newSocket = io(socketUrl, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected to', socketUrl);
      newSocket.emit('join-game');
    });

    newSocket.on('game-state-update', (update: Partial<GameState>) => {
      setGameState(prev => prev ? { ...prev, ...update } : null);
    });

    newSocket.on('resource-update', (resources) => {
      setGameState(prev => prev ? { ...prev, player: { ...prev.player, resources } } : null);
    });

    newSocket.on('building-completed', (building: Building) => {
      setGameState(prev => {
        if (!prev) return null;
        const buildings = prev.buildings.map(b => b.id === building.id ? building : b);
        return { ...prev, buildings };
      });
    });

    newSocket.on('unit-completed', (unit: Unit) => {
      setGameState(prev => {
        if (!prev) return null;
        const units = prev.units.map(u => u.id === unit.id ? unit : u);
        return { ...prev, units };
      });
    });

    newSocket.on('error', (message) => {
      setError(message);
    });

    setSocket(newSocket);
  };

  const handleBuildBuilding = async (buildingType: BuildingType, gridX: number, gridY: number) => {
    try {
      await api.buildBuilding({ buildingType, gridX, gridY });
      await loadGameState(); // Refresh
    } catch (err: any) {
      setError(err.message || 'Failed to build');
    }
  };

  const handleTrainUnit = async (buildingId: number, unitType: string) => {
    try {
      await api.trainUnit({ unitType, buildingId });
      await loadGameState(); // Refresh
      setSelectedBuilding(null);
    } catch (err: any) {
      setError(err.message || 'Failed to train unit');
    }
  };

  const handleAssignTask = async (unitId: number, task: string) => {
    try {
      const response = await fetch(`/api/units/${unitId}/task`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ task })
      });

      if (!response.ok) {
        throw new Error('Failed to assign task');
      }

      await loadGameState(); // Refresh to show updated task
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to assign task');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="game-container">
        <div className="loading">Loading game...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="game-container">
        <div className="error">{error || 'Failed to load game state'}</div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="header-left">
          <h1>Age of Empires Online</h1>
          <p>Welcome, {player?.username}!</p>
        </div>
        <ResourceDisplay resources={gameState.player.resources} />
        <div className="header-right">
          <div className="population">
            👥 {gameState.player.population}/{gameState.player.maxPopulation}
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {error && (
        <div className="game-error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="game-content">
        <aside className="sidebar">
          <BuildingMenu
            currentAge={gameState.player.currentAge}
            resources={gameState.player.resources}
            onBuildingSelect={(type) => {
              setSelectedBuildingType(type);
              setSelectedBuilding(null);
              setSelectedUnit(null);
              console.log('Select a grid position to build', type);
            }}
          />
          
          {/* Villager List */}
          <div className="villager-list">
            <h3>Villagers ({gameState.units.filter(u => u.type === 'VILLAGER' && u.isTrained).length})</h3>
            {gameState.units
              .filter(u => u.type === 'VILLAGER' && u.isTrained)
              .map(villager => (
                <div 
                  key={villager.id} 
                  className={`villager-item ${selectedUnit?.id === villager.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedUnit(villager);
                    setSelectedBuilding(null);
                    setSelectedBuildingType(null);
                  }}
                  style={{ 
                    cursor: 'pointer',
                    padding: '8px',
                    borderLeft: `4px solid ${villager.currentTask === 'IDLE' ? '#ffd700' : '#32cd32'}`,
                    marginBottom: '4px',
                    background: selectedUnit?.id === villager.id ? '#2a3f5f' : '#1a2332'
                  }}
                >
                  <div style={{ fontSize: '12px' }}>
                    👤 Villager #{villager.id}
                  </div>
                  <div style={{ fontSize: '10px', color: '#888' }}>
                    {villager.currentTask?.replace('GATHER_', '') || 'IDLE'}
                  </div>
                </div>
              ))
            }
            {gameState.units.filter(u => u.type === 'VILLAGER' && !u.isTrained).length > 0 && (
              <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
                Training: {gameState.units.filter(u => u.type === 'VILLAGER' && !u.isTrained).length}
              </div>
            )}
          </div>
        </aside>

        <main className="main-view">
          <CityGrid
            buildings={gameState.buildings}
            units={gameState.units}
            mapResources={gameState.mapResources}
            onBuildingClick={(building) => {
              // If we're in building mode, cancel it
              if (selectedBuildingType) {
                setSelectedBuildingType(null);
              } else {
                // Otherwise, select the building to view info
                setSelectedBuilding(building);
                setSelectedUnit(null); // Clear unit selection
              }
            }}
            onUnitClick={(unit) => {
              setSelectedUnit(unit);
              setSelectedBuilding(null); // Clear building selection
              setSelectedBuildingType(null);
            }}
            onGridClick={(gridX, gridY) => {
              if (selectedBuildingType) {
                handleBuildBuilding(selectedBuildingType, gridX, gridY);
                setSelectedBuildingType(null);
              }
            }}
          />
        </main>

        <aside className="info-panel">
          {selectedUnit ? (
            <div className="unit-info">
              <h3>Villager</h3>
              <p>Current Task: <strong>{selectedUnit.currentTask || 'IDLE'}</strong></p>
              
              <div className="task-buttons">
                <h4>Assign Task:</h4>
                <button onClick={() => handleAssignTask(selectedUnit.id, 'GATHER_FOOD')}>
                  🍖 Gather Food
                </button>
                <button onClick={() => handleAssignTask(selectedUnit.id, 'GATHER_WOOD')}>
                  🪵 Chop Wood
                </button>
                <button onClick={() => handleAssignTask(selectedUnit.id, 'GATHER_GOLD')}>
                  💰 Mine Gold
                </button>
                <button onClick={() => handleAssignTask(selectedUnit.id, 'GATHER_STONE')}>
                  🪨 Mine Stone
                </button>
                <button onClick={() => handleAssignTask(selectedUnit.id, 'IDLE')}>
                  ⏸️ Set Idle
                </button>
              </div>
              
              <button onClick={() => setSelectedUnit(null)} className="close-btn">
                Close
              </button>
            </div>
          ) : selectedBuilding ? (
            <div className="building-info">
              <h3>{BUILDINGS[selectedBuilding.type].name}</h3>
              <p>{BUILDINGS[selectedBuilding.type].description}</p>
              
              {!selectedBuilding.isComplete ? (
                <div className="constructing">
                  <p>🔨 Under construction...</p>
                  <p>Completes: {new Date(selectedBuilding.constructionCompleteAt!).toLocaleTimeString()}</p>
                </div>
              ) : (
                <>
                  <div className="building-actions">
                    {selectedBuilding.type === 'TOWN_CENTER' && (
                      <button onClick={() => handleTrainUnit(selectedBuilding.id, 'VILLAGER')}>
                        Train Villager ({UNITS.VILLAGER.cost.food} 🍖)
                      </button>
                    )}
                    {selectedBuilding.type === 'BARRACKS' && (
                      <button onClick={() => handleTrainUnit(selectedBuilding.id, 'CLUBMAN')}>
                        Train Clubman ({UNITS.CLUBMAN.cost.food} 🍖)
                      </button>
                    )}
                  </div>
                  
                  {/* Show units in training */}
                  {gameState.units.filter(u => !u.isTrained && u.currentTask === 'TRAINING').length > 0 && (
                    <div className="training-queue">
                      <h4>Training Queue</h4>
                      {gameState.units
                        .filter(u => !u.isTrained && u.currentTask === 'TRAINING')
                        .map(unit => (
                          <div key={unit.id} className="training-item">
                            <span>{unit.type}</span>
                            <span className="timer">
                              ⏱️ {unit.trainingCompleteAt ? 
                                new Date(unit.trainingCompleteAt).toLocaleTimeString() : 
                                'Soon'}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </>
              )}
              
              <button onClick={() => setSelectedBuilding(null)} className="close-btn">
                Close
              </button>
            </div>
          ) : (
            <div className="info-placeholder">
              <p>Click on a building to see details</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
