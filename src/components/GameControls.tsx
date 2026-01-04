/**
 * Game Controls Component
 *
 * Компонент управления игрой
 *
 * This component provides UI controls for managing game state during battle,
 * including pause/resume functionality, simulation speed adjustment, visual
 * quality settings, and player status display.
 *
 * Этот компонент предоставляет элементы управления для управления состоянием
 * игры во время битвы, включая функции паузы/возобновления, регулировку скорости
 * симуляции, настройки качества визуальных эффектов и отображение статуса игроков.
 */
import React from 'react';
import { useGameStore } from '../store/gameStore';

const GameControls: React.FC = () => {
  const { gameState, actions } = useGameStore();

  return (
    <div>

      {/* Game State Display */}
      <div className="mb-4 p-3 bg-gray-700 rounded">
        <h3 className="font-semibold mb-2">Game State</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Current State:</span>
            <span className="font-mono">{gameState.gameState.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Turn:</span>
            <span className="font-mono">{gameState.turn}</span>
          </div>
          <div className="flex justify-between">
            <span>Phase:</span>
            <span className="font-mono">{gameState.phase}</span>
          </div>
          <div className="flex justify-between">
            <span>Speed:</span>
            <span className="font-mono">{gameState.simulationSpeed}x</span>
          </div>
          <div className="flex justify-between">
            <span>Grid Size:</span>
            <span className="font-mono">{gameState.grid.length}x{gameState.grid[0]?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>FPS:</span>
            <span className="font-mono">{gameState.performance.fps}</span>
          </div>
        </div>
      </div>

      {/* Visual Effects Quality */}
      <div className="mb-4 p-3 bg-gray-700 rounded">
        <h3 className="font-semibold mb-2">Visual Settings</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Effect Quality:</span>
            <div className="flex space-x-1">
              {(['low', 'medium', 'high'] as const).map(quality => (
                <button
                  key={quality}
                  onClick={() => {
                    // Update settings in the store
                    actions.updateSettings({ visualEffectQuality: quality });
                  }}
                  className={`px-2 py-1 rounded text-xs ${
                    gameState.settings.visualEffectQuality === quality
                      ? 'bg-blue-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        {gameState.gameState === 'battle' && (
          <>
            <button
              onClick={actions.togglePause}
              className={`w-full py-2 px-4 rounded ${
                gameState.isPaused
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {gameState.isPaused ? 'RESUME' : 'PAUSE'}
            </button>

            <div className="flex space-x-2">
              <button
                onClick={() => actions.setSimulationSpeed(16)}
                className={`flex-1 py-1 px-2 rounded ${
                  gameState.simulationSpeed === 16
                    ? 'bg-blue-600'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                16x
              </button>
              <button
                onClick={() => actions.setSimulationSpeed(64)}
                className={`flex-1 py-1 px-2 rounded ${
                  gameState.simulationSpeed === 64
                    ? 'bg-blue-600'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                64x
              </button>
              <button
                onClick={() => actions.setSimulationSpeed(256)}
                className={`flex-1 py-1 px-2 rounded ${
                  gameState.simulationSpeed === 256
                    ? 'bg-blue-600'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                256x
              </button>
            </div>
          </>
        )}

      </div>

      {/* Player Status */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Player Status</h3>
        <div className="grid grid-cols-4 gap-1">
          {gameState.players.map(player => (
            <div
              key={player.id}
              className="p-1 bg-gray-700 rounded flex flex-col items-center"
            >
              <div
                className="w-3 h-3 rounded-full mb-1"
                style={{ backgroundColor: player.color }}
              ></div>
              <span className="text-[0.6rem]">{player.name}</span>
              <div className="text-xs mt-0.5">{player.territoryCount}</div>
              <div className={`text-[0.6rem] ${player.isReady ? 'text-green-400' : 'text-gray-400'}`}>
                {player.isReady ? 'R' : 'NR'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameControls;