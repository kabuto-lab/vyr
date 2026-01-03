import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { validateParameterAllocation } from '../utils/parameterValidation';
import CanvasGrid from './CanvasGrid';
import ParameterPanel from './ParameterPanel';
import GameControls from './GameControls';
import { VirusParameters } from '../types/game';

const Game: React.FC = () => {
  const { gameState, actions } = useGameStore();
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
          if (attackEvents) {
            attackEvents.forEach((event: any) => {
              actions.addAttackEffect(event.from, event.to, event.attacker);
            });
          }

          if (expansionEvents) {
            expansionEvents.forEach((event: any) => {
              // Dispatch three separate effects for coordinated animation
              actions.addExpansionSourceEffect(event.from, event.player);
              actions.addExpansionPathEffect(event.from, event.to, event.player);
              actions.addExpansionTargetEffect(event.to, event.player);
            });
          }

          if (parameterEvents) {
            parameterEvents.forEach((event: any) => {
              actions.addParameterEffect(event.position, event.type, event.player);
            });
          }

          if (e.data.interactionEvents) {
            e.data.interactionEvents.forEach((event: any) => {
              actions.addInteractionEffect(event.position, event.type, event.player);
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

      // Initialize grid with starting positions (100x50)
      const grid = Array(50).fill(null).map(() => Array(100).fill(null));

      // Place starting colonies in corners
      const placeStartingColony = (playerId: number, x: number, y: number) => {
        grid[y][x] = playerId; // Set owner in 2D format
      };

      // Place starting colonies in 4 corners with padding
      placeStartingColony(0, 2, 2);      // Top-left
      placeStartingColony(1, 97, 2);     // Top-right (100-3 for padding)
      placeStartingColony(2, 2, 47);     // Bottom-left
      placeStartingColony(3, 97, 47);    // Bottom-right (100-3 for padding)

      // Initialize cell age grid when starting battle
      const initialCellAge = Array(50).fill(null).map(() => Array(100).fill(-1));
      // Set birth turn for starting colonies
      initialCellAge[2][2] = 0;   // Player 0 starting position
      initialCellAge[2][97] = 0;  // Player 1 starting position
      initialCellAge[47][2] = 0;  // Player 2 starting position
      initialCellAge[47][97] = 0; // Player 3 starting position

      actions.updateGrid(grid, initialCellAge);
      actions.updatePlayers(updatedPlayers);
    }
  };

  // Test battle - randomly set all parameters and start battle
  const testBattle = () => {
    // For each player, randomly distribute 16 points among all 16 parameters
    gameState.players.forEach((_player, playerId) => {
      // Create an array of 16 parameters, each starting at 0
      const params = Array(16).fill(0);

      // Randomly distribute 16 points
      let pointsToDistribute = 16;
      while (pointsToDistribute > 0) {
        // Pick a random parameter
        const randomIndex = Math.floor(Math.random() * 16);
        // Add a point to that parameter (but don't exceed 16 for any single parameter)
        if (params[randomIndex] < 16) {
          params[randomIndex]++;
          pointsToDistribute--;
        }
      }

      // Map the random parameters to the actual virus parameter names
      const paramNames = [
        'aggression', 'mutation', 'speed', 'defense',
        'reproduction', 'resistance', 'stealth', 'adaptability',
        'virulence', 'endurance', 'mobility', 'intelligence',
        'resilience', 'infectivity', 'lethality', 'stability'
      ];

      paramNames.forEach((paramName, index) => {
        actions.setPlayerParameter(playerId, paramName as any, params[index]);
      });

      // Mark player as ready
      const updatedPlayer = { ...gameState.players[playerId] };
      updatedPlayer.isReady = true;
      updatedPlayer.preferredDirection = null;
      updatedPlayer.lastMutationTurn = 0;
      const players = [...gameState.players];
      players[playerId] = updatedPlayer;
      actions.setPlayerReady(playerId);
    });

    // Start the battle after setting all parameters
    setTimeout(() => {
      startBattle();
    }, 100); // Small delay to ensure all parameters are set before starting
  };

  return (
    <>
      {/* FPS Counter */}
      <div className="absolute top-4 left-4 z-[100] bg-black bg-opacity-50 text-white px-2 py-1 rounded font-mono text-sm">
        FPS: {gameState.performance.fps.toFixed(2)}
      </div>

      <div className="grid-container">

        {/* Center - Game Grid */}
        <div className="center-panel relative z-0 flex-1">
          <div className="grid-display h-full">
            <div className="grid-canvas-container h-full">
              <CanvasGrid />
            </div>
          </div>
        </div>

      </div>

      {/* Left Off-canvas menu - Virus Configuration */}
      <div className={`fixed top-[0.5%] left-0 h-[calc(97.5vh-70px)] w-33p bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${leftMenuOpen ? 'translate-x-0' : '-translate-x-full'} z-[60]`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold font-pixy">Configure:</h2>
            {/* Player Selection Tabs */}
            <div className="flex">
              {gameState.players.map((player, idx) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(idx)}
                  className={`px-3 py-2 text-xl font-bold font-pixy relative ${
                    selectedPlayer === idx
                      ? 'border-t-2 border-white text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    borderColor: selectedPlayer === idx ? player.color : 'transparent',
                    color: selectedPlayer === idx ? player.color : undefined
                  }}
                >
                  VIRUS {idx + 1}
                  {selectedPlayer === idx && (
                    <span className={`absolute -bottom-4 left-0 right-0 text-center text-sm ${
                      pointsLeft === 0 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {pointsLeft}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow flex flex-col h-[calc(97.5vh-182px)]">
          <ParameterPanel
            player={gameState.players[selectedPlayer]}
            pointsLeft={pointsLeft}
            onParameterChange={handleParameterChange}
            onPlayerReady={handlePlayerReady}
            gameState={gameState.gameState}
          />

          {gameState.gameState === 'setup' && (
            <div className="mt-4 space-y-2">
              <button
                onClick={startBattle}
                disabled={!gameState.players.every(p => p.isReady)}
                className={`w-full py-2 px-4 font-pixy border-2 rounded-lg ${
                  gameState.players.every(p => p.isReady)
                    ? 'bg-green-600 border-green-800 text-white hover:bg-green-700'
                    : 'bg-gray-600 border-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                START BATTLE
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Off-canvas menu - Game Controls */}
      <div className={`fixed top-[0.5%] right-0 h-[calc(97.5vh-70px)] w-33p bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'} z-[60]`}>
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Game Controls</h2>
        </div>
        <div className="p-4 overflow-y-auto flex-grow flex flex-col h-[calc(97.5vh-294px)]">
          <GameControls />
        </div>
        <div className="p-4 border-t border-gray-700 bg-gray-900">
          <div className="flex justify-between mb-2">
            <span>Turn:</span>
            <span className="font-mono">{gameState.turn}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Phase:</span>
            <span className="font-mono">{gameState.phase}</span>
          </div>
          <div className="flex justify-between">
            <span>State:</span>
            <span className="font-mono">{gameState.gameState.toUpperCase()}</span>
          </div>
        </div>
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={actions.resetGame}
            className="w-full py-2 px-4 font-pixy border-2 rounded-lg bg-red-600 border-red-800 text-white hover:bg-red-700"
          >
            RESET GAME
          </button>
          <button
            onClick={testBattle}
            className="w-full py-2 px-4 font-pixy border-2 rounded-lg bg-purple-600 border-purple-800 text-white hover:bg-purple-700"
          >
            TEST BATTLE
          </button>
        </div>
      </div>

      {/* LAB and MENU buttons below the main content area */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-4 z-[70]">
        <button
          onClick={() => setLeftMenuOpen(!leftMenuOpen)}
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-pixy"
        >
          LAB
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-pixy"
        >
          MENU
        </button>
      </div>
    </>
  );
};

export default Game;