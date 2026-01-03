import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

interface GameStateProviderProps {
  children: React.ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
  const { gameState, actions } = useGameStore();

  // Initialize game simulation
  useEffect(() => {
    if (gameState.gameState === 'battle' && !gameState.isPaused) {
      // In a real implementation, we would start the simulation loop here
      // For now, we'll just log the state
      console.log('Starting simulation...');
    }
  }, [gameState.gameState, gameState.isPaused]);

  // Check for victory conditions
  useEffect(() => {
    if (gameState.gameState === 'battle') {
      // Check if any player has >75% of the grid
      const totalCells = gameState.grid.length * (gameState.grid[0]?.length || 0); // 50x100 = 5000 cells
      const playerWithMostTerritory = gameState.players.reduce((max, player) =>
        player.territoryCount > max.territoryCount ? player : max
      );

      if (playerWithMostTerritory.territoryCount > totalCells * 0.75) {
        // Add victory visual effects before setting game state to gameOver
        // Create a wave of the winning player's color across the grid
        const winningPlayer = playerWithMostTerritory;
        const rows = gameState.grid.length;
        const cols = gameState.grid[0]?.length || 0;

        // Add victory celebration effects at the winning player's starting position
        // (This is an approximation - in a real game, we'd track the actual starting position)
        actions.addVisualEffect({
          id: `victory-${Date.now()}`,
          type: 'victory' as any,
          position: { x: winningPlayer.id % 2 === 0 ? 2 : cols - 3, y: winningPlayer.id < 2 ? 2 : rows - 3 },
          duration: 5000, // 5 seconds
          intensity: 1,
          color: winningPlayer.color,
          startTime: Date.now()
        });

        // Set game state to gameOver after a delay to allow effects to show
        setTimeout(() => {
          actions.setGameState('gameOver');
        }, 3000); // 3 seconds delay for victory effects
      }
    }
  }, [gameState.players, gameState.gameState, actions]);

  return (
    <div>
      {children}
    </div>
  );
};