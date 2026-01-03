export interface GameState {
  gameState: 'setup' | 'battle' | 'gameOver';
  grid: (number | null)[][]; // 2D grid representation [row][col]
  players: Player[];
  visualEffects: VisualEffect[];
  tentacles: Tentacle[];
  cellAge: number[][];
  performance: PerformanceMetrics;
  settings: GameSettings;
  turn: number;
  phase: number;
  simulationSpeed: number;
  isPaused: boolean;
}

export interface Player {
  id: number;
  name: string;
  color: string;
  isReady: boolean;
  virus: VirusParameters;
  territoryCount: number;
  preferredDirection?: [number, number] | null; // For mobility-based directional growth
  lastMutationTurn?: number; // For tracking mutation effects
}

export interface VirusParameters {
  aggression: number;
  mutation: number;
  speed: number; // Replacing energy
  defense: number;
  reproduction: number; // Replacing burstSize
  resistance: number; // Replacing hostRange
  stealth: number;
  adaptability: number; // Replacing hijackEfficiency
  virulence: number; // Replacing toxinPayload
  endurance: number; // Replacing resilience
  mobility: number; // Replacing adaptationSpeed
  intelligence: number; // Replacing resourceEfficiency
  resilience: number; // Replacing transmissionRange
  infectivity: number; // Replacing colonyCoordination
  lethality: number; // Replacing metabolicFlexibility
  stability: number; // Replacing latency
}

export interface Tentacle {
  id: string;
  from: { row: number; col: number };
  to: { row: number; col: number };
  owner: number;
  progress: number;
  type: 'invasion';
}

export interface VisualEffect {
  id: string;
  type: VisualEffectType;
  position: { x: number; y: number };
  duration: number;
  intensity: number;
  color: string;
  startTime?: number;
  from?: { row: number; col: number };
  to?: { row: number; col: number };
  player?: number;
}

export type VisualEffectType =
  | 'mutation' | 'aggression' | 'defense' | 'speed'
  | 'stealth' | 'resistance' | 'virulence' | 'reproduction'
  | 'adaptability' | 'endurance' | 'mobility' | 'intelligence'
  | 'resilience' | 'infectivity' | 'lethality' | 'stability'
  | 'attack' | 'expansion' | 'victory'
  | 'capture'
  | 'expansionSource' | 'expansionPath' | 'expansionTarget';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  activeCells: number;
}

export interface GameSettings {
  simulationInterval: number;
  maxEffects: number;
  enableVisualEffects: boolean;
  enableSound: boolean;
  gridSize: { rows: number; cols: number };
}

export interface Cell {
  owner: number | null;
  growth: number;
  latency: boolean;
  burstCooldown: number;
}

export interface GridPosition {
  x: number;
  y: number;
}