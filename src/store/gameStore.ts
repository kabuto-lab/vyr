import { create } from 'zustand';
import {
  GameState,
  Player,
  VirusParameters,
  VisualEffect,
  PerformanceMetrics,
  GameSettings,
  Tentacle
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
  maxEffects: 1000,
  enableVisualEffects: true,
  enableSound: true,
  gridSize: { rows: 35, cols: 70 },
  visualEffectQuality: 'medium', // 'low', 'medium', 'high'
};

const initialGameState: GameState = {
  gameState: 'setup',
  grid: Array(35).fill(null).map(() => Array(70).fill(null)), // 70x35 grid (35 rows, 70 columns)
  players: initialPlayers,
  visualEffects: [],
  tentacles: [],
  cellAge: Array(35).fill(null).map(() => Array(70).fill(-1)), // Initialize with -1 (empty cells)
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
    updateGrid: (newGrid: (number | null)[][], newCellAge: number[][]) => void;
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
    updateTentacles: (tentacles: Tentacle[]) => void;
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

    updateGrid: (newGrid: (number | null)[][], newCellAge: number[][]) => set((store) => ({
      gameState: {
        ...store.gameState,
        grid: newGrid,
        cellAge: newCellAge
      }
    })),

    updateTurn: (turn: number) => set((store) => ({
      gameState: { ...store.gameState, turn }
    })),

    addAttackEffect: (from: { row: number; col: number }, to: { row: number; col: number }, attacker: number) => set((store) => {
      // Removed attack effect to reduce visual clutter
      // const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B']; // Player colors
      // const effect = {
      //   id: `attack-${Date.now()}-${Math.random()}`,
      //   type: 'attack' as const,
      //   position: { x: from.col, y: from.row },
      //   duration: 300,
      //   intensity: 1,
      //   color: colors[attacker],
      //   from: { row: from.row, col: from.col },
      //   to: { row: to.row, col: to.col },
      //   player: attacker,
      //   startTime: Date.now()
      // };
      return {
        gameState: {
          ...store.gameState,
          // visualEffects: [...store.gameState.visualEffects, effect]
        }
      };
    }),

    addExpansionEffect: (from: { row: number; col: number }, to: { row: number; col: number }, player: number) => set((store) => {
      const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B']; // Player colors
      const playerColor = colors[player];
      const startTime = Date.now();
      const duration = 400; // Default duration

      // Get the player's virus parameters to determine effect style
      const virusParams = store.gameState.players[player].virus;

      // Adjust duration based on stability
      const adjustedDuration = virusParams.stability > 10 ? 150 : duration;

      // Create three synchronized effects
      const effects = [];

      // Effect 1: Source pulsation
      if (!(virusParams.stability > 10)) { // Skip if stability > 10
        effects.push({
          id: `expansion-source-${Date.now()}-${Math.random()}`,
          type: 'expansionSource' as const,
          position: { x: from.col, y: from.row },
          duration: adjustedDuration,
          intensity: 1,
          color: playerColor,
          from: { row: from.row, col: from.col },
          to: { row: to.row, col: to.col },
          player,
          startTime
        });
      }

      // Effect 2: Expansion path
      if (!(virusParams.stability > 10)) { // Skip if stability > 10
        effects.push({
          id: `expansion-path-${Date.now()}-${Math.random()}`,
          type: 'expansionPath' as const,
          position: { x: from.col, y: from.row },
          duration: adjustedDuration,
          intensity: 1,
          color: playerColor,
          from: { row: from.row, col: from.col },
          to: { row: to.row, col: to.col },
          player,
          startTime
        });
      }

      // Effect 3: Target colony formation
      effects.push({
        id: `expansion-target-${Date.now()}-${Math.random()}`,
        type: 'expansionTarget' as const,
        position: { x: to.col, y: to.row },
        duration: adjustedDuration,
        intensity: 1,
        color: playerColor,
        from: { row: from.row, col: from.col },
        to: { row: to.row, col: to.col },
        player,
        startTime
      });

      return {
        gameState: {
          ...store.gameState,
          visualEffects: [...store.gameState.visualEffects, ...effects]
        }
      };
    }),

    addExpansionSourceEffect: (position: { row: number; col: number }, player: number) => set((store) => {
      const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B']; // Player colors
      const playerColor = colors[player];
      const startTime = Date.now();
      const duration = 400; // Default duration

      // Get the player's virus parameters to determine effect style
      const virusParams = store.gameState.players[player].virus;

      // Adjust duration based on stability
      const adjustedDuration = virusParams.stability > 10 ? 150 : duration;

      const effect = {
        id: `expansion-source-${Date.now()}-${Math.random()}`,
        type: 'expansionSource' as const,
        position: { x: position.col, y: position.row },
        duration: adjustedDuration,
        intensity: 1,
        color: playerColor,
        player,
        startTime
      };

      return {
        gameState: {
          ...store.gameState,
          visualEffects: [...store.gameState.visualEffects, effect]
        }
      };
    }),

    addExpansionPathEffect: (from: { row: number; col: number }, to: { row: number; col: number }, player: number) => set((store) => {
      const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B']; // Player colors
      const playerColor = colors[player];
      const startTime = Date.now();
      const duration = 400; // Default duration

      // Get the player's virus parameters to determine effect style
      const virusParams = store.gameState.players[player].virus;

      // Adjust duration based on stability
      const adjustedDuration = virusParams.stability > 10 ? 150 : duration;

      const effect = {
        id: `expansion-path-${Date.now()}-${Math.random()}`,
        type: 'expansionPath' as const,
        position: { x: from.col, y: from.row },
        duration: adjustedDuration,
        intensity: 1,
        color: playerColor,
        from: { row: from.row, col: from.col },
        to: { row: to.row, col: to.col },
        player,
        startTime
      };

      return {
        gameState: {
          ...store.gameState,
          visualEffects: [...store.gameState.visualEffects, effect]
        }
      };
    }),

    addExpansionTargetEffect: (position: { row: number; col: number }, player: number) => set((store) => {
      const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B']; // Player colors
      const playerColor = colors[player];
      const startTime = Date.now();
      const duration = 400; // Default duration

      // Get the player's virus parameters to determine effect style
      const virusParams = store.gameState.players[player].virus;

      // Adjust duration based on stability
      const adjustedDuration = virusParams.stability > 10 ? 150 : duration;

      const effect = {
        id: `expansion-target-${Date.now()}-${Math.random()}`,
        type: 'expansionTarget' as const,
        position: { x: position.col, y: position.row },
        duration: adjustedDuration,
        intensity: 1,
        color: playerColor,
        player,
        startTime
      };

      return {
        gameState: {
          ...store.gameState,
          visualEffects: [...store.gameState.visualEffects, effect]
        }
      };
    }),

    addParameterEffect: (position: { row: number; col: number }, type: string, player: number) => set((store) => {
      const colors: Record<string, string> = {
        aggression: '#EF4444',
        defense: '#60A5FA',
        speed: '#FBBF24',
        stealth: '#A78BFA',
        resistance: '#34D399',
        virulence: '#F87171'
      };
      const effect = {
        id: `param-${type}-${Date.now()}-${Math.random()}`,
        type: type as any,
        position: { x: position.col, y: position.row },
        duration: 800,
        intensity: 1,
        color: colors[type] || '#FFFFFF',
        player,
        startTime: Date.now()
      };
      return {
        gameState: {
          ...store.gameState,
          visualEffects: [...store.gameState.visualEffects, effect]
        }
      };
    }),

    addInteractionEffect: (position: { row: number; col: number }, type: 'attack' | 'defense' | 'capture', player: number) => set((store) => {
      // Get the player's color from the store
      const playerColor = store.gameState.players[player]?.color || '#FFFFFF';

      // Create the original interaction effect
      const effect = {
        id: `interaction-${type}-${Date.now()}-${Math.random()}`,
        type: type as any,
        position: { x: position.col, y: position.row },
        duration: 600, // 600ms duration - not indefinite
        intensity: 1,
        color: playerColor, // Use the player's virus color
        player,
        startTime: Date.now()
      };

      // Create a wave effect for capture and attack events
      let waveEffect = null;
      if (type === 'capture' || type === 'attack') {
        waveEffect = {
          id: `wave-${type}-${Date.now()}-${Math.random()}`,
          type: 'wave' as const,
          position: { x: position.col, y: position.row },
          duration: 1800, // 3x longer duration for the wave effect
          intensity: 1,
          color: playerColor, // Use the player's virus color
          player,
          startTime: Date.now()
        };
      }

      const newEffects = [...store.gameState.visualEffects, effect];
      if (waveEffect) {
        newEffects.push(waveEffect);
      }

      return {
        gameState: {
          ...store.gameState,
          visualEffects: newEffects
        }
      };
    }),

    removeOldVisualEffects: () => set((store) => {
      const now = Date.now();
      const newVisualEffects = store.gameState.visualEffects.filter(effect => {
        const startTime = (effect as any).startTime || now;
        return now - startTime < effect.duration;
      });

      return {
        gameState: {
          ...store.gameState,
          visualEffects: newVisualEffects
        }
      };
    }),

    addVisualEffect: (effect) => set((store) => ({
      gameState: {
        ...store.gameState,
        visualEffects: [...store.gameState.visualEffects, effect]
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
          cellAge: Array(35).fill(null).map(() => Array(70).fill(-1)), // Reset cell ages
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

    updateTentacles: (tentacles: Tentacle[]) => set((store) => ({
      gameState: { ...store.gameState, tentacles }
    })),

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

      // Initialize cell age grid
      const initialCellAge = Array(35).fill(null).map(() => Array(70).fill(-1));
      // Set birth age for starting colonies (age 0, will become 1 after first turn)
      initialCellAge[2][2] = 0;   // Player 0 starting position
      initialCellAge[2][67] = 0;  // Player 1 starting position
      initialCellAge[32][2] = 0;  // Player 2 starting position
      initialCellAge[32][67] = 0; // Player 3 starting position

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