import { create } from 'zustand';
import {
  GameState,
  Player,
  VirusParameters,
  VisualEffect,
  PerformanceMetrics,
  GameSettings
} from '../types/game';

// Initialize default game state
const initialPlayers: Player[] = Array(4).fill(null).map((_, i) => ({
  id: i,
  name: `Player ${i + 1}`,
  color: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'][i], // Red, Blue, Green, Yellow
  isReady: false,
  virus: {
    aggression: 0,
    mutation: 0,
    speed: 0,
    defense: 0,
    reproduction: 0,
    resistance: 0,
    stealth: 0,
    adaptability: 0,
    virulence: 0,
    endurance: 0,
    mobility: 0,
    intelligence: 0,
    resilience: 0,
    infectivity: 0,
    lethality: 0,
    stability: 0,
  },
  territoryCount: 0,
  preferredDirection: null,
  lastMutationTurn: 0,
  skin: undefined, // No skin applied by default
}));

const initialSettings: GameSettings = {
  simulationInterval: 400,
  maxEffects: 0, // Все визуальные эффекты отключены для улучшения производительности
  enableVisualEffects: false, // Все визуальные эффекты отключены для улучшения производительности
  enableSound: true,
  gridSize: { rows: 35, cols: 70 },
  visualEffectQuality: 'low', // 'low', 'medium', 'high' - все равно не используется
};

const initialGameState: GameState = {
  gameState: 'setup',
  grid: Array(35).fill(null).map(() => Array(70).fill(null)), // 70x35 grid (35 rows, 70 columns)
  players: initialPlayers,
  visualEffects: [], // Визуальные эффекты отключены для улучшения производительности
  cellAge: [], // Cell age system has been removed for performance optimization
  performance: {
    fps: 0,
    memoryUsage: 0,
    activeCells: 0,
    lastUpdate: Date.now(),
    frameCount: 0,
  },
  settings: initialSettings,
  turn: 0,
  phase: 0,
  simulationSpeed: 1,
  isPaused: false,
  showHelpOnStart: false,
};

interface GameStore {
  gameState: GameState;
  actions: {
    setGameState: (state: 'setup' | 'battle' | 'gameOver') => void;
    setPlayerParameter: (playerId: number, param: keyof VirusParameters, value: number) => void;
    setPlayerReady: (playerId: number) => void;
    updateGrid: (newGrid: (number | null)[][]) => void;
    updateTurn: (turn: number) => void;
    addAttackEffect: (from: { row: number; col: number }, to: { row: number; col: number }, attacker: number) => void;
    addExpansionEffect: (from: { row: number; col: number }, to: { row: number; col: number }, player: number) => void;
    addParameterEffect: (position: { row: number; col: number }, type: string, player: number) => void;
    addInteractionEffect: (position: { row: number; col: number }, type: 'attack' | 'defense' | 'capture', player: number) => void;
    removeOldVisualEffects: () => void;
    addVisualEffect: (effect: VisualEffect) => void;
    removeVisualEffect: (id: string) => void;
    setSimulationSpeed: (speed: number) => void;
    togglePause: () => void;
    resetGame: () => void;
    updatePerformance: (metrics: Partial<PerformanceMetrics>) => void;
    setTerritoryCount: (playerId: number, count: number) => void;
    updatePlayers: (players: Player[]) => void;
    addExpansionSourceEffect: (position: { row: number; col: number }, player: number) => void;
    addExpansionPathEffect: (from: { row: number; col: number }, to: { row: number; col: number }, player: number) => void;
    addExpansionTargetEffect: (position: { row: number; col: number }, player: number) => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    calculateFPS: () => void;
    testBattle: () => void;
    setShowHelpOnStart: (show: boolean) => void;
  };
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: initialGameState,
  actions: {
    setGameState: (state) => set((store) => ({
      gameState: { ...store.gameState, gameState: state }
    })),

    setPlayerParameter: (playerId, param, value) => set((store) => {
      const players = [...store.gameState.players];
      players[playerId].virus[param] = value;
      return { gameState: { ...store.gameState, players } };
    }),

    setPlayerReady: (playerId) => set((store) => {
      const players = [...store.gameState.players];
      players[playerId].isReady = true;
      players[playerId].preferredDirection = null;
      players[playerId].lastMutationTurn = 0;
      return { gameState: { ...store.gameState, players } };
    }),

    updateGrid: (newGrid: (number | null)[][]) => set((store) => ({
      gameState: {
        ...store.gameState,
        grid: newGrid
      }
    })),

    updateTurn: (turn: number) => set((store) => ({
      gameState: { ...store.gameState, turn }
    })),

    addAttackEffect: (from: { row: number; col: number }, to: { row: number; col: number }, attacker: number) => set((store) => {
      // Все визуальные эффекты отключены для улучшения производительности
      return {
        gameState: {
          ...store.gameState
        }
      };
    }),

    addExpansionEffect: (from: { row: number; col: number }, to: { row: number; col: number }, player: number) => set((store) => {
      // Все визуальные эффекты отключены для улучшения производительности
      return {
        gameState: {
          ...store.gameState
        }
      };
    }),

    addExpansionSourceEffect: (position: { row: number; col: number }, player: number) => set((store) => {
      // Все визуальные эффекты отключены для улучшения производительности
      return {
        gameState: {
          ...store.gameState
        }
      };
    }),

    addExpansionPathEffect: (from: { row: number; col: number }, to: { row: number; col: number }, player: number) => set((store) => {
      // Все визуальные эффекты отключены для улучшения производительности
      return {
        gameState: {
          ...store.gameState
        }
      };
    }),

    addExpansionTargetEffect: (position: { row: number; col: number }, player: number) => set((store) => {
      // Все визуальные эффекты отключены для улучшения производительности
      return {
        gameState: {
          ...store.gameState
        }
      };
    }),

    addParameterEffect: (position: { row: number; col: number }, type: string, player: number) => set((store) => {
      // Все визуальные эффекты отключены для улучшения производительности
      return {
        gameState: {
          ...store.gameState
        }
      };
    }),

    addInteractionEffect: (position: { row: number; col: number }, type: 'attack' | 'defense' | 'capture', player: number) => set((store) => {
      // Все визуальные эффекты отключены для улучшения производительности
      return {
        gameState: {
          ...store.gameState
        }
      };
    }),

    removeOldVisualEffects: () => set((store) => {
      // Все визуальные эффекты отключены для улучшения производительности
      return {
        gameState: {
          ...store.gameState,
          visualEffects: [] // Очищаем все визуальные эффекты
        }
      };
    }),

    addVisualEffect: (effect) => set((store) => ({
      gameState: {
        ...store.gameState
        // Не добавляем визуальные эффекты для улучшения производительности
      }
    })),

    removeVisualEffect: (id) => set((store) => ({
      gameState: {
        ...store.gameState,
        visualEffects: store.gameState.visualEffects.filter(e => e.id !== id)
      }
    })),

    setSimulationSpeed: (speed) => set((store) => ({
      gameState: { ...store.gameState, simulationSpeed: speed }
    })),

    togglePause: () => set((store) => ({
      gameState: { ...store.gameState, isPaused: !store.gameState.isPaused }
    })),

    resetGame: () => {
      // Create fresh initial players to ensure proper reset
      const freshInitialPlayers = Array(4).fill(null).map((_, i) => ({
        id: i,
        name: `Player ${i + 1}`,
        color: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'][i], // Red, Blue, Green, Yellow
        isReady: false,
        virus: {
          aggression: 0,
          mutation: 0,
          speed: 0,
          defense: 0,
          reproduction: 0,
          resistance: 0,
          stealth: 0,
          adaptability: 0,
          virulence: 0,
          endurance: 0,
          mobility: 0,
          intelligence: 0,
          resilience: 0,
          infectivity: 0,
          lethality: 0,
          stability: 0,
        },
        territoryCount: 0,
        preferredDirection: null,
        lastMutationTurn: 0,
        skin: undefined, // No skin applied by default
      }));

      set(() => ({
        gameState: {
          ...initialGameState,
          gameState: 'setup', // Explicitly set to setup state
          isPaused: false, // Explicitly set to not paused
          simulationSpeed: 1, // Explicitly set to 1x speed
          players: freshInitialPlayers,
          cellAge: [], // Cell age system has been removed for performance optimization
          showHelpOnStart: false, // Explicitly set to false
        }
      }));
    },

    updatePerformance: (metrics) => set((store) => ({
      gameState: {
        ...store.gameState,
        performance: { ...store.gameState.performance, ...metrics }
      }
    })),

    calculateFPS: () => set((store) => {
      const now = Date.now();
      const timeElapsed = now - store.gameState.performance.lastUpdate;
      const frameCount = store.gameState.performance.frameCount + 1;

      // Update FPS every 500ms
      if (timeElapsed > 500) {
        const fps = Math.round((frameCount * 1000) / timeElapsed);
        return {
          gameState: {
            ...store.gameState,
            performance: {
              ...store.gameState.performance,
              fps,
              lastUpdate: now,
              frameCount: 0
            }
          }
        };
      } else {
        return {
          gameState: {
            ...store.gameState,
            performance: {
              ...store.gameState.performance,
              frameCount
            }
          }
        };
      }
    }),

    setTerritoryCount: (playerId, count) => set((store) => {
      const players = [...store.gameState.players];
      players[playerId].territoryCount = count;
      return { gameState: { ...store.gameState, players } };
    }),


    updatePlayers: (players: Player[]) => set((store) => ({
      gameState: { ...store.gameState, players }
    })),

    updateSettings: (settings) => set((store) => ({
      gameState: {
        ...store.gameState,
        settings: { ...store.gameState.settings, ...settings }
      }
    })),

    testBattle: () => set((store) => {
      // For each player, randomly distribute 16 points among all 16 parameters
      const updatedPlayers = store.gameState.players.map((player, playerId) => {
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

        const newVirus = { ...player.virus };
        paramNames.forEach((paramName, index) => {
          newVirus[paramName as keyof VirusParameters] = params[index];
        });

        // Return updated player with random parameters and marked as ready
        return {
          ...player,
          virus: newVirus,
          isReady: true,
          preferredDirection: null,
          lastMutationTurn: 0
        };
      });

      // Create a new grid with starting positions
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

      // Cell age system has been removed for performance optimization
      // Initialize cell age grid as empty
      const initialCellAge = [];

      return {
        gameState: {
          ...store.gameState,
          gameState: 'battle',
          players: updatedPlayers.map((player, index) => ({
            ...player,
            skin: store.gameState.players[index]?.skin // Preserve skins during test battle
          })),
          grid,
          cellAge: initialCellAge,
          turn: 0,
          phase: 0,
          isPaused: false,
          showHelpOnStart: false // Explicitly set to false for test battle
        }
      };
    }),

    setShowHelpOnStart: (show) => set((store) => ({
      gameState: { ...store.gameState, showHelpOnStart: show }
    }))
  }
}));