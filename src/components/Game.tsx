/**
 * Main Game Component
 *
 * Основной компонент игры
 *
 * This is the main game component that manages the overall game state, controls
 * the simulation loop, handles Web Worker communication for grid calculations,
 * and orchestrates the different game phases (setup, battle, game over).
 *
 * Это основной компонент игры, который управляет общим состоянием игры, контролирует
 * цикл симуляции, обрабатывает связь с веб-воркером для расчетов сетки и координирует
 * различные фазы игры (настройка, битва, конец игры).
 */
import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
import { validateParameterAllocation } from '../utils/parameterValidation';
import CanvasGridOptimized from './CanvasGridOptimized';
import ParameterPanel from './ParameterPanel';
import GameControls from './GameControls';
import { VirusParameters } from '../types/game';

const Game: React.FC = () => {
  const { gameState, actions } = useGameStore();
  const { t } = useLanguageStore();
  const [selectedPlayer, setSelectedPlayer] = useState(0);
  const [pointsLeft, setPointsLeft] = useState(16);
  const [menuOpen, setMenuOpen] = useState(false);
  const [labMenuOpen, setLabMenuOpen] = useState(false);
  const workerRef = useRef<Worker | null>(null);


  // Update pointsLeft when selectedPlayer changes or when player parameters change
  useEffect(() => {
    if (gameState.gameState === 'setup') {
      const playerParams = gameState.players[selectedPlayer]?.virus || {};
      const totalPoints = Object.values(playerParams).reduce((sum, val) => sum + val, 0);
      setPointsLeft(16 - totalPoints);
    }
  }, [selectedPlayer, gameState.gameState, gameState.players[selectedPlayer]?.virus]);

  // Initialize Web Worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker(new URL('../workers/gridCalculationWorker.ts', import.meta.url));

      workerRef.current.onmessage = (e: MessageEvent) => {
        const { type, newGrid, turn, territoryCounts, attackEvents, expansionEvents, parameterEvents, tentacles, cellAge } = e.data;

        if (type === 'calculationComplete') {
          actions.updateGrid(newGrid, cellAge);
          actions.setTerritoryCount(0, territoryCounts[0]);
          actions.setTerritoryCount(1, territoryCounts[1]);
          actions.setTerritoryCount(2, territoryCounts[2]);
          actions.setTerritoryCount(3, territoryCounts[3]);

          // Update turn in the store
          actions.updateTurn(turn);

          // Update tentacles in the store
          if (tentacles) {
            actions.updateTentacles(tentacles);
          }

          // Add visual effects based on events
          // Removed attack events to reduce visual clutter
          // if (attackEvents) {
          //   attackEvents.forEach((event: any) => {
          //     actions.addAttackEffect(event.from, event.to, event.attacker);
          //   });
          // }

          // Removed expansion events to reduce visual clutter
          // if (expansionEvents) {
          //   expansionEvents.forEach((event: any) => {
          //     // Dispatch three separate effects for coordinated animation
          //     actions.addExpansionSourceEffect(event.from, event.player);
          //     actions.addExpansionPathEffect(event.from, event.to, event.player);
          //     actions.addExpansionTargetEffect(event.to, event.player);
          //   });
          // }

          // Removed parameter events to reduce visual clutter
          // if (parameterEvents) {
          //   parameterEvents.forEach((event: any) => {
          //     actions.addParameterEffect(event.position, event.type, event.player);
          //   });
          // }

          if (e.data.interactionEvents) {
            e.data.interactionEvents.forEach((event: any) => {
              actions.addInteractionEffect(event.position, event.type, event.player);
            });
          }

          // Handle wave effects from the worker
          if (e.data.waveEffects) {
            e.data.waveEffects.forEach((waveEffect: any) => {
              // Add the wave effect to the store
              actions.addVisualEffect({
                id: waveEffect.id,
                type: waveEffect.type,
                position: { x: waveEffect.position.x, y: waveEffect.position.y },
                duration: waveEffect.duration,
                intensity: waveEffect.intensity,
                color: waveEffect.color,
                player: waveEffect.player,
                startTime: waveEffect.startTime
              });
            });
          }
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [actions]);

  // Simulation loop
  useEffect(() => {
    let intervalId: number;

    if (gameState.gameState === 'battle' && !gameState.isPaused) {
      intervalId = window.setInterval(() => {
        // Send current state to worker for processing
        if (workerRef.current) {
          workerRef.current.postMessage({
            type: 'calculateNextState',
            grid: gameState.grid,
            players: gameState.players,
            turn: gameState.turn,
            settings: gameState.settings,
            tentacles: gameState.tentacles
          });
        }

        // Update performance metrics
        actions.calculateFPS();
      }, Math.max(10, 400 / gameState.simulationSpeed)); // Adjust interval based on speed, minimum 10ms
    } else {
      // Still update performance metrics when paused
      intervalId = window.setInterval(() => {
        actions.calculateFPS();
      }, 500);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [gameState.gameState, gameState.isPaused, gameState.simulationSpeed, gameState.grid, gameState.players, gameState.turn, gameState.settings, actions]);

  // Handle parameter changes
  const handleParameterChange = (param: keyof VirusParameters, value: number) => {
    if (gameState.gameState !== 'setup') return;

    const currentParams = { ...gameState.players[selectedPlayer].virus };
    const newParams = { ...currentParams, [param]: value };

    const validation = validateParameterAllocation(newParams);

    if (validation.isValid) {
      // Update the store first
      actions.setPlayerParameter(selectedPlayer, param, value);
    }
  };

  // Handle player ready toggle
  const handlePlayerReady = () => {
    if (gameState.gameState !== 'setup') return;

    const validation = validateParameterAllocation(gameState.players[selectedPlayer].virus);

    if (validation.isValid) {
      actions.setPlayerReady(selectedPlayer);
    }
  };

  // Randomize player parameters
  const randomizePlayerParameters = () => {
    if (gameState.gameState !== 'setup') return;

    // Create a copy of the current player's virus parameters
    const currentParams = { ...gameState.players[selectedPlayer].virus };

    // Reset all parameters to 0
    Object.keys(currentParams).forEach(param => {
      currentParams[param as keyof typeof currentParams] = 0;
    });

    // Distribute 16 points randomly among the parameters
    let pointsLeft = 16;
    while (pointsLeft > 0) {
      const paramKeys = Object.keys(currentParams) as (keyof typeof currentParams)[];
      const randomParam = paramKeys[Math.floor(Math.random() * paramKeys.length)];

      // Only add a point if it doesn't exceed the maximum (16) and we have points left
      if (currentParams[randomParam] < 16) {
        currentParams[randomParam]++;
        pointsLeft--;
      }
    }

    // Update each parameter individually
    Object.entries(currentParams).forEach(([param, value]) => {
      handleParameterChange(param as keyof typeof currentParams, value);
    });
  };

  // Start battle
  const startBattle = () => {
    if (gameState.players.every(player => player.isReady)) {
      // Reset player-specific fields before starting battle
      const updatedPlayers = gameState.players.map(player => ({
        ...player,
        preferredDirection: null,
        lastMutationTurn: 0
      }));

      actions.setGameState('battle');

      // Initialize grid with starting positions (70x35)
      const grid = Array(35).fill(null).map(() => Array(70).fill(null));

      // Place starting colonies in corners
      const placeStartingColony = (playerId: number, x: number, y: number) => {
        grid[y][x] = playerId; // Set owner in 2D format
      };

      // Place starting colonies in 4 corners with padding
      placeStartingColony(0, 2, 2);      // Top-left
      placeStartingColony(1, 67, 2);     // Top-right (70-3 for padding)
      placeStartingColony(2, 2, 32);     // Bottom-left (35-3 for padding)
      placeStartingColony(3, 67, 32);    // Bottom-right (70-3, 35-3 for padding)

      // Initialize cell age grid when starting battle
      const initialCellAge = Array(35).fill(null).map(() => Array(70).fill(-1));
      // Set birth age for starting colonies (age 0, will become 1 after first turn)
      initialCellAge[2][2] = 0;   // Player 0 starting position
      initialCellAge[2][67] = 0;  // Player 1 starting position
      initialCellAge[32][2] = 0;  // Player 2 starting position
      initialCellAge[32][67] = 0; // Player 3 starting position

      actions.updateGrid(grid, initialCellAge);
      actions.updatePlayers(updatedPlayers);
    }
  };


  return (
    <div className="relative w-full h-full">
      {/* FPS Counter */}

      <div className="grid-container-adjusted">

        {/* Center - Game Grid */}
        <div className="center-panel relative z-0 flex-1">
          <div className="grid-display h-full">
            <div className="grid-canvas-container h-full">
              <CanvasGridOptimized />
            </div>
          </div>
        </div>

      </div>



      {/* Right sidebar menu - appears when menu button is clicked */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-black bg-opacity-30 backdrop-blur-lg z-[70] transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'} rounded-bl-3xl`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-furore">{t('menu')}</h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white hover:text-gray-300 text-2xl font-furore"
            >
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              <li>
                <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center font-furore"
                  onClick={() => {
                    // Go back to welcome screen
                    window.location.reload();
                  }}
                >
                  <span className="mr-3 font-furore">🏠</span> {t('start')}
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center font-furore"
                  onClick={() => {
                    // Open laboratory menu
                    setLabMenuOpen(true);
                    setMenuOpen(false); // Close the main menu
                  }}
                >
                  <span className="mr-3 font-furore">🔬</span> {t('lab')}
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center font-furore"
                  onClick={() => {
                    // Save game state to localStorage
                    localStorage.setItem('vyrusGameState', JSON.stringify(gameState));
                    alert(t('gameSaved'));
                  }}
                >
                  <span className="mr-3 font-furore">💾</span> {t('save')}
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center font-furore"
                  onClick={() => {
                    // Load game state from localStorage
                    const savedState = localStorage.getItem('vyrusGameState');
                    if (savedState) {
                      try {
                        const parsedState = JSON.parse(savedState);

                        // Update the game state using the store actions
                        actions.setGameState(parsedState.gameState);
                        actions.updateGrid(parsedState.grid, parsedState.cellAge);
                        actions.updatePlayers(parsedState.players);
                        actions.updateTentacles(parsedState.tentacles);
                        actions.updateSettings(parsedState.settings);

                        // Update turn and phase
                        actions.updateTurn(parsedState.turn);

                        // Update simulation speed and pause state
                        actions.setSimulationSpeed(parsedState.simulationSpeed);
                        if (parsedState.isPaused !== gameState.isPaused) {
                          actions.togglePause();
                        }

                        alert(t('gameLoaded'));
                      } catch (error) {
                        console.error('Error loading game state:', error);
                        alert(t('noSavedGame'));
                      }
                    } else {
                      alert(t('noSavedGame'));
                    }
                  }}
                >
                  <span className="mr-3 font-furore">💾</span> {t('load')}
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center font-furore"
                  onClick={() => {
                    // Settings would go here
                    alert(t('settingsComingSoon'));
                  }}
                >
                  <span className="mr-3 font-furore">⚙️</span> {t('settings')}
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center font-furore"
                  onClick={() => {
                    // Premium features would go here
                    alert(t('premiumComingSoon'));
                  }}
                >
                  <span className="mr-3 font-furore">🎁</span> {t('premium')}
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center font-furore"
                  onClick={() => {
                    // Statistics would go here
                    alert(t('statsComingSoon'));
                  }}
                >
                  <span className="mr-3 font-furore">📊</span> {t('stats')}
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center font-furore"
                  onClick={() => {
                    // Test battle - randomize all virus parameters, mark all as ready, and start battle at 64x speed
                    for (let i = 0; i < gameState.players.length; i++) {
                      // Randomize parameters for each player
                      const currentParams = { ...gameState.players[i].virus };

                      // Reset all parameters to 0
                      Object.keys(currentParams).forEach(param => {
                        currentParams[param as keyof typeof currentParams] = 0;
                      });

                      // Distribute 16 points randomly among the parameters
                      let pointsLeft = 16;
                      while (pointsLeft > 0) {
                        const paramKeys = Object.keys(currentParams) as (keyof typeof currentParams)[];
                        const randomParam = paramKeys[Math.floor(Math.random() * paramKeys.length)];

                        // Only add a point if it doesn't exceed the maximum (16) and we have points left
                        if (currentParams[randomParam] < 16) {
                          currentParams[randomParam]++;
                          pointsLeft--;
                        }
                      }

                      // Update each parameter individually
                      Object.entries(currentParams).forEach(([param, value]) => {
                        actions.setPlayerParameter(i, param as keyof typeof currentParams, value);
                      });

                      // Mark player as ready
                      actions.setPlayerReady(i);
                    }

                    // Start battle with proper initialization
                    actions.testBattle();

                    // Set speed to 64x
                    actions.setSimulationSpeed(64);

                    // Ensure game is not paused
                    if (gameState.isPaused) {
                      actions.togglePause();
                    }

                    // Close menu
                    setMenuOpen(false);
                  }}
                >
                  <span className="mr-3 font-furore">🧪</span> {t('test')}
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center font-furore"
                  onClick={() => {
                    // Close menu
                    setMenuOpen(false);
                  }}
                >
                  <span className="mr-3 font-furore">❌</span> {t('closeMenu')}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Laboratory menu - appears when lab button is clicked */}
      <div className={`fixed top-0 left-0 h-full w-full md:w-1/2 bg-black bg-opacity-30 backdrop-blur-lg z-[80] transform transition-transform duration-300 ease-in-out ${labMenuOpen ? 'translate-x-0' : '-translate-x-full'} rounded-br-3xl`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-furore">{t('lab')}</h2>
            <button
              onClick={() => setLabMenuOpen(false)}
              className="text-white hover:text-gray-300 text-2xl font-furore"
            >
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Row 1: Player tabs - full width */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {gameState.players.map((player, idx) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(idx)}
                  className={`px-3 py-2 text-sm font-bold font-furore whitespace-nowrap relative ${
                    selectedPlayer === idx
                      ? 'border-t-2 border-white text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  style={{
                    borderColor: selectedPlayer === idx ? player.color : 'transparent',
                    color: selectedPlayer === idx ? player.color : undefined
                  }}
                >
                  <span className="font-furore">{t('virus')} {idx + 1}</span>
                  {selectedPlayer === idx && (
                    <span className={`absolute -bottom-4 left-0 right-0 text-center text-xs font-furore ${
                      pointsLeft === 0 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {pointsLeft}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Row 2: Parameter configuration panel */}
            <div className="mb-4">
              <ParameterPanel
                player={gameState.players[selectedPlayer]}
                pointsLeft={pointsLeft}
                onParameterChange={handleParameterChange}
                onPlayerReady={handlePlayerReady}
                gameState={gameState.gameState}
              />
            </div>

            {/* Row 3: Action buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={handlePlayerReady}
                className={`py-2 px-4 font-furore border-2 rounded-lg ${
                  validateParameterAllocation(gameState.players[selectedPlayer].virus).isValid
                    ? 'bg-blue-600 bg-opacity-70 border-blue-800 text-white hover:bg-blue-700'
                    : 'bg-gray-600 bg-opacity-70 border-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="font-furore">{gameState.players[selectedPlayer].isReady ? t('ready') : t('markReady')}</span>
              </button>
              <button
                onClick={randomizePlayerParameters}
                className="py-2 px-4 font-furore border-2 rounded-lg bg-purple-600 bg-opacity-70 border-purple-800 text-white hover:bg-purple-700"
              >
                <span className="font-furore">{t('randomize')}</span>
              </button>
              <button
                onClick={startBattle}
                disabled={!gameState.players.every(p => p.isReady)}
                className={`py-2 px-4 font-furore border-2 rounded-lg ${
                  gameState.players.every(p => p.isReady)
                    ? 'bg-green-600 bg-opacity-70 border-green-800 text-white hover:bg-green-700'
                    : 'bg-gray-600 bg-opacity-70 border-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="font-furore">{t('startBattle')}</span>
              </button>
              <button
                onClick={actions.resetGame}
                className="py-2 px-4 font-furore border-2 rounded-lg bg-red-600 bg-opacity-70 border-red-800 text-white hover:bg-red-700"
              >
                <span className="font-furore">{t('reset')}</span>
              </button>
            </div>

            {/* Row 4: Control buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={actions.togglePause}
                className={`py-2 px-4 font-furore border-2 rounded-lg ${
                  gameState.isPaused
                    ? 'bg-green-600 bg-opacity-70 border-green-800 text-white hover:bg-green-700'
                    : 'bg-yellow-600 bg-opacity-70 border-yellow-800 text-white hover:bg-yellow-700'
                }`}
              >
                <span className="font-furore">{gameState.isPaused ? t('resume') : t('pause')}</span>
              </button>
              <button
                onClick={() => actions.setSimulationSpeed(16)}
                className={`py-2 px-4 font-furore border-2 rounded-lg ${
                  gameState.simulationSpeed === 16
                    ? 'bg-blue-600 bg-opacity-70 border-blue-800 text-white'
                    : 'bg-gray-600 bg-opacity-70 border-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <span className="font-furore">16x</span>
              </button>
              <button
                onClick={() => actions.setSimulationSpeed(64)}
                className={`py-2 px-4 font-furore border-2 rounded-lg ${
                  gameState.simulationSpeed === 64
                    ? 'bg-blue-600 bg-opacity-70 border-blue-800 text-white'
                    : 'bg-gray-600 bg-opacity-70 border-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <span className="font-furore">64x</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu button in the right sidebar */}
      <div className="fixed top-4 right-4 z-[60]">
        <button
          onClick={() => setMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-lg border border-white/30 rounded-lg font-furore text-sm transition-all duration-200"
        >
          <div className="flex flex-col items-center">
            <div className="w-4 h-0.5 bg-white mb-1"></div>
            <div className="w-4 h-0.5 bg-white mb-1"></div>
            <div className="w-4 h-0.5 bg-white"></div>
          </div>
        </button>
      </div>

      {/* Player Territory Indicators at the very bottom of the screen - twice as high */}
      <div className="fixed bottom-0 left-0 right-0 flex px-4 space-x-2 z-[65]">
        {gameState.players.map(player => (
          <div
            key={player.id}
            className="flex-1"
          >
            <div className="w-full bg-gray-700 bg-opacity-50 rounded-full h-2"> {/* Changed h-1 to h-2 */}
              <div
                className="h-full rounded-full flex items-center justify-end pr-1 text-[0.6rem] font-bold font-furore"
                style={{
                  width: `${Math.min(100, (player.territoryCount / 2450) * 100)}%`,
                  backgroundColor: player.color,
                  color: 'white',
                  textShadow: '0 0 2px black'
                }}
              >
                {player.territoryCount > 50 ? player.territoryCount : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;