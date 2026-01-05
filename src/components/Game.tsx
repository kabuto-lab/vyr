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
      <div className="absolute top-4 left-4 z-[100] bg-black bg-opacity-50 text-white px-2 py-1 rounded font-mono text-sm">
        FPS: {gameState.performance.fps.toFixed(2)}
      </div>

      <div className={`grid-container-adjusted ${leftMenuOpen && menuOpen ? 'ml-[4%] mr-[50%] md:ml-[25%] md:mr-[25%]' : leftMenuOpen ? 'ml-[92%] md:ml-[50%]' : menuOpen ? 'mr-[50%]' : ''}`}>

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
      <div className={`fixed top-[0.5%] left-0 h-[calc(97.5vh-70px)] w-[92%] md:w-[50%] bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 z-50 transform transition-transform duration-300 ease-in-out ${leftMenuOpen ? 'translate-x-0' : '-translate-x-full'} z-[60] rounded-br-3xl left-sidebar`}>
        <div className="p-4 border-b border-white border-opacity-20">
          <div className="flex justify-between items-center mb-2">
            {/* Player Selection Tabs - floating left */}
            <div className="flex flex-wrap">
              {gameState.players.map((player, idx) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(idx)}
                  className={`px-2 py-1 text-sm font-bold font-pixy relative ${
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
          </div>
          {/* Test and Reset buttons */}
          <div className="flex space-x-2 mb-2">
            <button
              onClick={actions.testBattle}
              className="py-1 px-2 rounded bg-purple-600 hover:bg-purple-700 text-xs"
            >
              {t('test')}
            </button>
            <button
              onClick={actions.resetGame}
              className="py-1 px-2 rounded bg-red-600 hover:bg-red-700 text-xs"
            >
              {t('reset')}
            </button>
          </div>
          {/* Speed buttons */}
          <div className="flex space-x-2 mb-2">
            <button
              onClick={() => actions.setSimulationSpeed(16)}
              className={`py-1 px-2 rounded ${
                gameState.simulationSpeed === 16
                  ? 'bg-blue-600'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              16x
            </button>
            <button
              onClick={() => actions.setSimulationSpeed(64)}
              className={`py-1 px-2 rounded ${
                gameState.simulationSpeed === 64
                  ? 'bg-blue-600'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              64x
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow flex flex-col h-[calc(97.5vh-182px)] left-sidebar">
          <ParameterPanel
            player={gameState.players[selectedPlayer]}
            pointsLeft={pointsLeft}
            onParameterChange={handleParameterChange}
            onPlayerReady={handlePlayerReady}
            gameState={gameState.gameState}
          />

          {gameState.gameState === 'setup' && (
            <div className="mt-4 flex space-x-2"> {/* Buttons in one row */}
              <button
                onClick={handlePlayerReady}
                className={`flex-1 py-2 px-4 font-pixy border-2 rounded-lg ${
                  validateParameterAllocation(gameState.players[selectedPlayer].virus).isValid
                    ? 'bg-blue-600 bg-opacity-70 border-blue-800 text-white hover:bg-blue-700'
                    : 'bg-gray-600 bg-opacity-70 border-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                {gameState.players[selectedPlayer].isReady ? t('ready') : t('markReady')}
              </button>
              <button
                onClick={startBattle}
                disabled={!gameState.players.every(p => p.isReady)}
                className={`flex-1 py-2 px-4 font-pixy border-2 rounded-lg ${
                  gameState.players.every(p => p.isReady)
                    ? 'bg-green-600 bg-opacity-70 border-green-800 text-white hover:bg-green-700'
                    : 'bg-gray-600 bg-opacity-70 border-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                {t('startBattle')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Off-canvas menu - Game Controls */}
      <div className={`fixed top-[0.5%] right-0 h-[calc(97.5vh-70px)] w-[50%] bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 z-50 transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'} z-[60] rounded-bl-3xl right-sidebar`}>
        <div className="p-4 border-b border-white border-opacity-20 flex justify-between items-center">
          <h2 className="text-xl font-bold font-pixy text-white">{t('controls')}</h2>
          <div className="flex space-x-2">
            <button
              onClick={actions.testBattle}
              className="py-1 px-2 rounded bg-purple-600 hover:bg-purple-700 text-xs"
            >
              {t('test')}
            </button>
            <button
              onClick={actions.resetGame}
              className="py-1 px-2 rounded bg-red-600 hover:bg-red-700 text-xs"
            >
              {t('reset')}
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow flex flex-col h-[calc(97.5vh-182px)] right-sidebar">
          <GameControls />
        </div>
      </div>

      {/* LAB button at the top right corner */}
      <button
        onClick={() => {
          setLeftMenuOpen(!leftMenuOpen);
          if (!leftMenuOpen && menuOpen) setMenuOpen(false); // Close right menu if opening left menu
        }}
        className="fixed top-4 right-4 py-2 px-5 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-lg border border-white/30 rounded-xl font-pixy text-lg transition-all duration-200 relative overflow-hidden z-[70]"
        style={{
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 2px 10px rgba(255, 255, 255, 0.3)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent"></div>
        <span className="relative z-10">{t('lab')}</span>
      </button>

      {/* MENU button at the bottom center */}
      <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-4 z-[70]">
        <button
          onClick={() => {
            setMenuOpen(!menuOpen);
            if (!menuOpen && leftMenuOpen) setLeftMenuOpen(false); // Close left menu if opening right menu
          }}
          className="py-2 px-5 bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-lg border border-white/30 rounded-xl font-pixy text-lg transition-all duration-200 relative overflow-hidden"
          style={{
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 2px 10px rgba(255, 255, 255, 0.3)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent"></div>
          <span className="relative z-10">{t('menu')}</span>
        </button>
      </div>

      {/* Player Territory Indicators at the very bottom of the screen */}
      <div className="fixed bottom-0 left-0 right-0 flex px-4 space-x-2 z-[65]">
        {gameState.players.map(player => (
          <div
            key={player.id}
            className="flex-1"
          >
            <div className="w-full bg-gray-700 bg-opacity-50 rounded-full h-1">
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