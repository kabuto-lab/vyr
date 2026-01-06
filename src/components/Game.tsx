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
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
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
      // Set birth turn for starting colonies
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

      <div className={`grid-container-adjusted`}>

        {/* Center - Game Grid */}
        <div className="center-panel relative z-0 flex-1">
          <div className="grid-display h-full">
            <div className="grid-canvas-container h-full">
              <CanvasGridOptimized />
            </div>
          </div>
        </div>

      </div>

      {/* Left Off-canvas menu - Virus Configuration */}
      <div className={`fixed top-[0.5%] left-0 h-[98vh] w-[90%] md:w-[50%] bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 z-50 transform transition-transform duration-300 ease-in-out ${leftMenuOpen ? 'translate-x-0' : '-translate-x-full'} z-[60] rounded-br-3xl left-sidebar`}>
        <div className="h-full flex flex-col border-b border-white border-opacity-20">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Row 1: Player tabs - full width */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {gameState.players.map((player, idx) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(idx)}
                  className={`px-3 py-2 text-sm font-bold font-pixy whitespace-nowrap relative ${
                    selectedPlayer === idx
                      ? 'border-t-2 border-white text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  style={{
                    borderColor: selectedPlayer === idx ? player.color : 'transparent',
                    color: selectedPlayer === idx ? player.color : undefined
                  }}
                >
                  {t('virus')} {idx + 1}
                  {selectedPlayer === idx && (
                    <span className={`absolute -bottom-4 left-0 right-0 text-center text-xs ${
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
                className={`py-2 px-4 font-pixy border-2 rounded-lg ${
                  validateParameterAllocation(gameState.players[selectedPlayer].virus).isValid
                    ? 'bg-blue-600 bg-opacity-70 border-blue-800 text-white hover:bg-blue-700'
                    : 'bg-gray-600 bg-opacity-70 border-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                {gameState.players[selectedPlayer].isReady ? t('ready') : t('markReady')}
              </button>
              <button
                onClick={randomizePlayerParameters}
                className="py-2 px-4 font-pixy border-2 rounded-lg bg-purple-600 bg-opacity-70 border-purple-800 text-white hover:bg-purple-700"
              >
                {t('randomize')}
              </button>
              <button
                onClick={startBattle}
                disabled={!gameState.players.every(p => p.isReady)}
                className={`py-2 px-4 font-pixy border-2 rounded-lg ${
                  gameState.players.every(p => p.isReady)
                    ? 'bg-green-600 bg-opacity-70 border-green-800 text-white hover:bg-green-700'
                    : 'bg-gray-600 bg-opacity-70 border-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                {t('startBattle')}
              </button>
              <button
                onClick={actions.resetGame}
                className="py-2 px-4 font-pixy border-2 rounded-lg bg-red-600 bg-opacity-70 border-red-800 text-white hover:bg-red-700"
              >
                {t('reset')}
              </button>
            </div>

            {/* Row 4: Control buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={actions.togglePause}
                className={`py-2 px-4 font-pixy border-2 rounded-lg ${
                  gameState.isPaused
                    ? 'bg-green-600 bg-opacity-70 border-green-800 text-white hover:bg-green-700'
                    : 'bg-yellow-600 bg-opacity-70 border-yellow-800 text-white hover:bg-yellow-700'
                }`}
              >
                {gameState.isPaused ? t('resume') : t('pause')}
              </button>
              <button
                onClick={() => actions.setSimulationSpeed(16)}
                className={`py-2 px-4 font-pixy border-2 rounded-lg ${
                  gameState.simulationSpeed === 16
                    ? 'bg-blue-600 bg-opacity-70 border-blue-800 text-white'
                    : 'bg-gray-600 bg-opacity-70 border-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                16x
              </button>
              <button
                onClick={() => actions.setSimulationSpeed(64)}
                className={`py-2 px-4 font-pixy border-2 rounded-lg ${
                  gameState.simulationSpeed === 64
                    ? 'bg-blue-600 bg-opacity-70 border-blue-800 text-white'
                    : 'bg-gray-600 bg-opacity-70 border-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                64x
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LAB button - moves to top-left on mobile, stays on right on desktop */}
      <div className="fixed top-4 left-4 h-14 w-14 z-[60] md:right-4 md:left-auto">
        {/* LAB button - circular */}
        <button
          onClick={() => setLeftMenuOpen(!leftMenuOpen)}
          className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-lg border border-white/30 rounded-full font-pixy text-sm transition-all duration-200 relative overflow-hidden"
          style={{
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 2px 10px rgba(255, 255, 255, 0.3)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <span className="relative z-10 text-xs">{t('lab')}</span>
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
                className="h-full rounded-full flex items-center justify-end pr-1 text-[0.6rem] font-bold"
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