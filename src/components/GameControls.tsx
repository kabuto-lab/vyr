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
import { useLanguageStore } from '../store/languageStore';

const GameControls: React.FC = () => {
  const { gameState, actions } = useGameStore();
  const { t } = useLanguageStore();

  return (
    <div>

      {/* Game State Display */}
      <div className="mb-4 p-3 bg-gray-700 rounded">
        <h3 className="font-semibold mb-2">{t('gameState')}</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{t('currentState')}</span>
            <span className="font-mono">{t(`gameState${gameState.gameState.charAt(0).toUpperCase() + gameState.gameState.slice(1)}`)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('turn')}</span>
            <span className="font-mono">{gameState.turn}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('phase')}</span>
            <span className="font-mono">{gameState.phase}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('speedLabel')}</span>
            <span className="font-mono">{gameState.simulationSpeed}x</span>
          </div>
          <div className="flex justify-between">
            <span>{t('gridSize')}</span>
            <span className="font-mono">35x70</span>
          </div>
          <div className="flex justify-between">
            <span>{t('fps')}</span>
            <span className="font-mono">{gameState.performance.fps}</span>
          </div>
        </div>
      </div>

      {/* Visual Effects Quality */}
      <div className="mb-4 p-3 bg-gray-700 rounded">
        <h3 className="font-semibold mb-2">{t('effectQuality')}</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>{t('effectQuality')}</span>
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
                  {t(quality)}
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
            <div className="flex space-x-2">
              <button
                onClick={actions.togglePause}
                className={`flex-1 py-2 px-4 rounded ${
                  gameState.isPaused
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {gameState.isPaused ? t('resume') : t('pause')}
              </button>
            </div>

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

            <div className="flex space-x-2">
              <button
                onClick={actions.testBattle}
                className="flex-1 py-2 px-4 rounded bg-purple-600 hover:bg-purple-700"
              >
                {t('test')}
              </button>
              <button
                onClick={actions.resetGame}
                className="flex-1 py-2 px-4 rounded bg-red-600 hover:bg-red-700"
              >
                {t('reset')}
              </button>
            </div>
          </>
        )}

      </div>

      {/* Player Status */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">{t('playerStatus')}</h3>
        <div className="grid grid-cols-4 gap-2">
          {gameState.players.map(player => (
            <div
              key={player.id}
              className="bg-gray-800 bg-opacity-50 rounded-xl p-2 border border-gray-600 relative overflow-hidden"
              style={{
                borderLeftColor: player.color,
                borderLeftWidth: '4px',
                height: '120px' // Set a fixed height for consistent sizing
              }}
            >
              {/* Territory count as background that grows from bottom to top */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: `${Math.min(100, (player.territoryCount / 2450) * 100)}%`,
                  backgroundColor: player.color,
                  opacity: 0.3
                }}
              ></div>

              {/* Player indicator with number */}
              <div className="flex items-center justify-center mb-1 relative z-10">
                <span className="text-xs font-bold">{player.id + 1}</span>
              </div>

              <div className="text-[0.6rem] text-center truncate w-full relative z-10">{player.name}</div>
              <div className="text-xs mt-0.5 font-mono relative z-10">{player.territoryCount}</div>
              <div className={`text-[0.6rem] mt-1 px-1.5 py-0.5 rounded-full relative z-10 ${player.isReady ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                {player.isReady ? t('ready') : t('notReady')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameControls;