/**
 * Grid Calculation Web Worker
 *
 * Веб-воркер для расчета сетки
 *
 * This Web Worker performs computationally intensive tasks for calculating the next game state,
 * including virus expansion, combat resolution, parameter-based behaviors, and tentacle movement.
 * It runs in a separate thread to prevent blocking the main UI thread during complex calculations.
 *
 * Этот веб-воркер выполняет вычислительно сложные задачи для расчета следующего состояния игры,
 * включая расширение вирусов, разрешение боевых действий, поведение на основе параметров и
 * движение щупалец. Он работает в отдельном потоке, чтобы не блокировать основной поток UI
 * во время сложных вычислений.
 */
import { Player, GameSettings } from '../types/game';

interface GridCalculationMessage {
  type: 'calculateNextState';
  grid: (number | null)[][];
  players: Player[];
  turn: number;
  settings: GameSettings;
  tentacles: Tentacle[];
  cellAge: number[][];
}

interface Tentacle {
  id: string;
  from: { row: number; col: number };
  to: { row: number; col: number };
  owner: number;
  progress: number;
  type: 'invasion';
}

interface GridCalculationResult {
  type: 'calculationComplete';
  newGrid: (number | null)[][];
  turn: number;
  territoryCounts: number[];
  attackEvents: { from: { row: number; col: number }; to: { row: number; col: number }; attacker: number }[];
  expansionEvents: { from: { row: number; col: number }; to: { row: number; col: number }; player: number }[];
  parameterEvents: { position: { row: number; col: number }; type: string; player: number }[];
  interactionEvents: { position: { row: number; col: number }; type: 'attack' | 'defense' | 'capture'; player: number }[];
  waveEffects: {
    id: string;
    type: 'wave';
    position: { x: number; y: number };
    duration: number;
    intensity: number;
    color: string;
    player: number;
    startTime: number;
  }[];
  tentacles: Tentacle[];
  cellAge: number[][];
}

// Cache for adjacent cells to avoid repeated calculations
const adjacentCellsCache = new Map<string, { row: number; col: number }[]>();

// Helper function to get adjacent cells
function getAdjacentCells(grid: (number | null)[][], row: number, col: number): { row: number; col: number }[] {
  const gridId = `${grid.length}x${grid[0]?.length || 0}`;
  const key = `${gridId}-${row}-${col}`;

  if (adjacentCellsCache.has(key)) {
    return adjacentCellsCache.get(key)!;
  }

  const adjacent: { row: number; col: number }[] = [];
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],  // up, down, left, right
    [-1, -1], [-1, 1], [1, -1], [1, 1]  // diagonals
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
      adjacent.push({ row: newRow, col: newCol });
    }
  }

  adjacentCellsCache.set(key, adjacent);
  return adjacent;
}


// Main simulation function
function calculateNextGameState(
  grid: (number | null)[][],
  players: Player[],
  turn: number,
  _settings: GameSettings,
  existingTentacles: Tentacle[] = [],
  currentCellAge: number[][] = []
): GridCalculationResult {
  // Create a copy of the grid for this turn
  const newGrid = grid.map(row => [...row]);
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // Initialize or copy cell age grid
  let cellAge: number[][] = [];
  if (currentCellAge.length === 0) {
    // Initialize age grid with -1 (empty cells) for new game
    cellAge = Array(rows).fill(null).map(() => Array(cols).fill(-1));
  } else {
    // Copy existing age grid
    cellAge = currentCellAge.map(row => [...row]);
  }

  // Track events for visual effects
  const attackEvents: { from: { row: number; col: number }; to: { row: number; col: number }; attacker: number }[] = [];
  const expansionEvents: { from: { row: number; col: number }; to: { row: number; col: number }; player: number }[] = [];
  const parameterEvents: { position: { row: number; col: number }; type: string; player: number }[] = [];
  const interactionEvents: { position: { row: number; col: number }; type: 'attack' | 'defense' | 'capture'; player: number }[] = [];
  const waveEffects: {
    id: string;
    type: 'wave';
    position: { x: number; y: number };
    duration: number;
    intensity: number;
    color: string;
    player: number;
    startTime: number;
  }[] = [];
  const tentacles: Tentacle[] = [];

  // Phase 0: Update existing tentacles
  for (const tentacle of existingTentacles) {
    // Check if the source cell still exists and belongs to the same owner
    const sourceOwner = newGrid[tentacle.from.row][tentacle.from.col];
    if (sourceOwner === tentacle.owner) {
      // Calculate progress based on attacker and defender parameters
      const attacker = players[tentacle.owner];
      const defenderOwner = newGrid[tentacle.to.row][tentacle.to.col];
      const defender = defenderOwner !== null ? players[defenderOwner] : null;

      // Calculate progress based on parameters
      let progressIncrease = 0;
      if (attacker) {
        // Attacker's parameters that help invasion
        const mobilityFactor = attacker.virus.mobility / 16;
        const infectivityFactor = attacker.virus.infectivity / 16;
        const aggressionFactor = attacker.virus.aggression / 16;

        progressIncrease = (mobilityFactor + infectivityFactor + aggressionFactor) / 3;

        // If there's a defender, reduce progress based on their defense
        if (defender) {
          const resistanceFactor = defender.virus.resistance / 16;
          const defenseFactor = defender.virus.defense / 16;

          // Reduce progress based on defender's parameters
          progressIncrease *= (1 - (resistanceFactor + defenseFactor) / 2);
        }
      }

      // Ensure progress doesn't go negative
      progressIncrease = Math.max(0, progressIncrease);

      // Create updated tentacle with new progress
      const updatedTentacle = {
        ...tentacle,
        progress: Math.min(1.0, tentacle.progress + progressIncrease * 0.1) // Slow progress rate
      };

      // If progress is complete, capture the cell
      if (updatedTentacle.progress >= 1.0) {
        newGrid[updatedTentacle.to.row][updatedTentacle.to.col] = updatedTentacle.owner;

        // Update cell age - new cell born this turn
        cellAge[updatedTentacle.to.row][updatedTentacle.to.col] = turn;

        // Add interaction events for the capture
        interactionEvents.push({
          position: updatedTentacle.to,
          type: 'capture',
          player: updatedTentacle.owner
        });

        // Add wave effect for capture event
        const playerColor = players[updatedTentacle.owner]?.color || '#FFFFFF';
        waveEffects.push({
          id: `wave-capture-${Date.now()}-${Math.random()}`,
          type: 'wave' as const,
          position: { x: updatedTentacle.to.col, y: updatedTentacle.to.row },
          duration: 1800, // 3x longer duration (1800ms = 3 * 600ms)
          intensity: 1,
          color: playerColor,
          player: updatedTentacle.owner,
          startTime: Date.now()
        });

        // Add interaction event for the defender's cell being attacked
        if (defenderOwner !== null) {
          interactionEvents.push({
            position: updatedTentacle.to,
            type: 'attack',
            player: defenderOwner
          });

          // Add wave effect for attack event
          const defenderColor = players[defenderOwner]?.color || '#FFFFFF';
          waveEffects.push({
            id: `wave-attack-${Date.now()}-${Math.random()}`,
            type: 'wave' as const,
            position: { x: updatedTentacle.to.col, y: updatedTentacle.to.row },
            duration: 1800, // 3x longer duration (1800ms = 3 * 600ms)
            intensity: 1,
            color: defenderColor,
            player: defenderOwner,
            startTime: Date.now()
          });
        }
      } else {
        // Only keep tentacles that haven't completed their invasion
        tentacles.push(updatedTentacle);
      }
    }
    // If the source cell no longer belongs to the tentacle owner, the tentacle disappears
    // (it's not added to the tents array)
  }

  // Phase 1: Growth - existing cells grow stronger based on parameters
  // Removed parameter effects to reduce visual clutter
  // for (let row = 0; row < rows; row++) {
  //   for (let col = 0; col < cols; col++) {
  //     const owner = newGrid[row][col];
  //     if (owner !== null) {
  //       const player = players[owner];
  //       if (player) {
  //         // Precompute parameter values to avoid repeated access
  //         const { aggression, defense, speed, stealth, resistance, virulence,
  //                 mutation, adaptability, endurance, mobility, intelligence,
  //                 resilience, infectivity, lethality, stability } = player.virus;

  //         // Add parameter effects based on high parameter values
  //         if (aggression > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'aggression', player: owner });
  //         }
  //         if (defense > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'defense', player: owner });
  //         }
  //         if (speed > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'speed', player: owner });
  //         }
  //         if (stealth > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'stealth', player: owner });
  //         }
  //         if (resistance > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'resistance', player: owner });
  //         }
  //         if (virulence > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'virulence', player: owner });
  //         }
  //         if (mutation > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'mutation', player: owner });
  //         }
  //         if (adaptability > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'adaptability', player: owner });
  //         }
  //         if (endurance > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'endurance', player: owner });
  //         }
  //         if (mobility > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'mobility', player: owner });
  //         }
  //         if (intelligence > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'intelligence', player: owner });
  //         }
  //         if (resilience > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'resilience', player: owner });
  //         }
  //         if (infectivity > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'infectivity', player: owner });
  //         }
  //         if (lethality > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'lethality', player: owner });
  //         }
  //         if (stability > 10) {
  //           parameterEvents.push({ position: { row, col }, type: 'stability', player: owner });
  //         }
  //       }
  //     }
  //   }
  // }

  // Phase 2: Expansion - cells attempt to spread to adjacent empty cells with parameter-based behavior
  const expansionAttempts: {
    from: { row: number; col: number };
    to: { row: number; col: number };
    player: number;
  }[] = [];

  // Limit for new tentacles per turn
  const MAX_NEW_TENTACLES_PER_TURN = 30;
  let newTentacleCount = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const owner = newGrid[row][col];
      if (owner !== null) {
        const player = players[owner];
        if (player) {
          // Precompute parameter values to avoid repeated access
          const { stability, mutation, stealth, mobility, aggression, reproduction, infectivity } = player.virus;

          // Check if this player has stability > 10, which overrides other behaviors
          const hasHighStability = stability > 10;

          // Removed mutation effects (chaotic borders) to reduce visual clutter and random behavior
          // if (mutation > 12 && turn % 8 === 0) {
          //   // Find all boundary cells of this player
          //   const boundaryCells = [];
          //   const adjacentCells = getAdjacentCells(grid, row, col);
          //   for (const adj of adjacentCells) {
          //     if (newGrid[adj.row][adj.col] === null) {
          //       boundaryCells.push(adj);
          //     }
          //   }

          //   // Randomly capture or lose a boundary cell
          //   if (boundaryCells.length > 0 && Math.random() < 0.5) { // 50% chance to do something
          //     const randomBoundary = boundaryCells[Math.floor(Math.random() * boundaryCells.length)];

          //     if (Math.random() < 0.5) {
          //       // Capture the boundary cell
          //       if (newGrid[randomBoundary.row][randomBoundary.col] === null) {
          //         newGrid[randomBoundary.row][randomBoundary.col] = owner;
          //       }
          //     } else {
          //       // Lose a random cell that belongs to this player (to create "bays")
          //       const ownedCells = [];
          //       for (let r = Math.max(0, randomBoundary.row - 2); r < Math.min(rows, randomBoundary.row + 3); r++) {
          //         for (let c = Math.max(0, randomBoundary.col - 2); c < Math.min(cols, randomBoundary.col + 3); c++) {
          //           if (newGrid[r][c] === owner) {
          //             ownedCells.push({row: r, col: c});
          //           }
          //         }
          //       }

          //       if (ownedCells.length > 0) {
          //         const randomOwned = ownedCells[Math.floor(Math.random() * ownedCells.length)];
          //         // Only lose the cell if it has at least 2 empty neighbors (to create bays)
          //         const neighbors = getAdjacentCells(grid, randomOwned.row, randomOwned.col);
          //         const emptyNeighbors = neighbors.filter(adj => newGrid[adj.row][adj.col] === null);
          //         if (emptyNeighbors.length >= 2) {
          //           newGrid[randomOwned.row][randomOwned.col] = null;
          //         }
          //       }
          //     }
          //   }
          // }

          // Combined expansion logic with early returns
          if (hasHighStability) {
            // Only expand to immediate adjacent empty cells
            const adjacentCells = getAdjacentCells(grid, row, col);
            const emptyCells = adjacentCells.filter(adj => newGrid[adj.row][adj.col] === null);

            if (emptyCells.length > 0) {
              // Select a random empty cell to expand to
              const targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

              // Calculate expansion success chance based on reproduction and infectivity (mobility ignored for stability)
              const reproductionFactor = reproduction / 16;
              const infectivityFactor = infectivity / 16;

              // Combined expansion chance
              const expansionChance = (reproductionFactor + infectivityFactor) / 2;

              if (Math.random() < expansionChance) {
                expansionAttempts.push({
                  from: { row, col },
                  to: targetCell,
                  player: owner
                });
                // Removed expansion event to reduce visual clutter
                // expansionEvents.push({
                //   from: { row, col },
                //   to: targetCell,
                //   player: owner
                // });
              }
            }
          } else {
            // Handle all expansion types in a single pass with early returns
            const adjacentCells = getAdjacentCells(grid, row, col);
            const emptyCells = adjacentCells.filter(adj => newGrid[adj.row][adj.col] === null);

            if (emptyCells.length > 0) {
              // Handle stealth expansion (skip immediate neighbors, look for distant cells)
              if (stealth > 10 && Math.random() < 0.3) { // 30% chance to try stealth expansion
                // Look for empty cells 2-3 steps away
                const distantEmptyCells = [];
                for (let dr = -3; dr <= 3; dr++) {
                  for (let dc = -3; dc <= 3; dc++) {
                    // Only consider cells that are 2-3 steps away
                    if (Math.abs(dr) + Math.abs(dc) >= 2 && Math.abs(dr) + Math.abs(dc) <= 3) {
                      const newRow = row + dr;
                      const newCol = col + dc;

                      // Check if within bounds
                      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                        // Check if cell is empty
                        if (newGrid[newRow][newCol] === null) {
                          // Check if there's a path to this cell (simplified: check if at least one intermediate cell is owned)
                          const pathCells = [];
                          const steps = Math.max(Math.abs(dr), Math.abs(dc));
                          for (let step = 1; step <= steps; step++) {
                            const pathRow = row + Math.round(dr * step / steps);
                            const pathCol = col + Math.round(dc * step / steps);

                            if (pathRow >= 0 && pathRow < rows && pathCol >= 0 && pathCol < cols) {
                              pathCells.push({row: pathRow, col: pathCol});
                            }
                          }

                          // If at least one path cell is owned by this player, consider it a valid target
                          const hasValidPath = pathCells.some(pathCell =>
                            newGrid[pathCell.row][pathCell.col] === owner
                          );

                          if (hasValidPath) {
                            distantEmptyCells.push({row: newRow, col: newCol});
                          }
                        }
                      }
                    }
                  }
                }

                if (distantEmptyCells.length > 0) {
                  const targetCell = distantEmptyCells[Math.floor(Math.random() * distantEmptyCells.length)];

                  // Calculate expansion success chance based on stealth and infectivity
                  const stealthFactor = stealth / 16;
                  const infectivityFactor = infectivity / 16;

                  const expansionChance = (stealthFactor + infectivityFactor) / 2;

                  if (Math.random() < expansionChance) {
                    expansionAttempts.push({
                      from: { row, col },
                      to: targetCell,
                      player: owner
                    });
                    expansionEvents.push({
                      from: { row, col },
                      to: targetCell,
                      player: owner
                    });
                  }
                }
              }
              // Handle mobility-based directional growth
              else if (mobility > 10) {
                // If no preferred direction is set, choose one randomly
                if (!player.preferredDirection) {
                  const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
                  player.preferredDirection = directions[Math.floor(Math.random() * directions.length)];
                }

                // Get adjacent cells with preference for the preferred direction
                const emptyCells = adjacentCells.filter(adj => newGrid[adj.row][adj.col] === null);

                if (emptyCells.length > 0) {
                  // Calculate expansion success chance based on reproduction, mobility and infectivity
                  const reproductionFactor = reproduction / 16;
                  const mobilityFactor = mobility / 16;
                  const infectivityFactor = infectivity / 16;

                  // Combined expansion chance
                  const expansionChance = (reproductionFactor + mobilityFactor + infectivityFactor) / 3;

                  if (Math.random() < expansionChance) {
                    // Prefer cells in the preferred direction
                    let targetCell;
                    if (player.preferredDirection) {
                      const preferredCells = emptyCells.filter(adj =>
                        adj.row === row + player.preferredDirection![0] &&
                        adj.col === col + player.preferredDirection![1]
                      );

                      if (preferredCells.length > 0 && Math.random() < 0.7) { // 70% chance to follow preferred direction
                        targetCell = preferredCells[Math.floor(Math.random() * preferredCells.length)];
                      } else {
                        targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                      }
                    } else {
                      targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                    }

                    expansionAttempts.push({
                      from: { row, col },
                      to: targetCell,
                      player: owner
                    });
                    // Removed expansion event to reduce visual clutter
                    // expansionEvents.push({
                    //   from: { row, col },
                    //   to: targetCell,
                    //   player: owner
                    // });
                  }
                }
              }
              // Handle aggression-based explosive growth
              else if (aggression > 12 && Math.random() < 0.2) { // 20% chance for explosive growth
                // Try to capture 2-3 adjacent empty cells in one direction
                if (emptyCells.length >= 2) {
                  // Pick a random direction
                  const directions: { [key: string]: { row: number; col: number }[] } = {};
                  for (const cell of emptyCells) {
                    const dr = cell.row - row;
                    const dc = cell.col - col;
                    const dirKey = `${dr},${dc}`;

                    if (!directions[dirKey]) {
                      directions[dirKey] = [];
                    }
                    directions[dirKey].push(cell);
                  }

                  const dirKeys = Object.keys(directions);
                  if (dirKeys.length > 0) {
                    const randomDirKey = dirKeys[Math.floor(Math.random() * dirKeys.length)];
                    const cellsInDirection = directions[randomDirKey];

                    // Try to capture up to 3 cells in this direction
                    const maxCellsToCapture = Math.min(3, cellsInDirection.length);
                    const cellsToCapture = cellsInDirection.slice(0, maxCellsToCapture);

                    for (const cell of cellsToCapture) {
                      if (newGrid[cell.row][cell.col] === null && Math.random() < 0.7) { // 70% success rate
                        newGrid[cell.row][cell.col] = owner;

                        // Update cell age - new cell born this turn
                        cellAge[cell.row][cell.col] = turn;

                        // Removed expansion event to reduce visual clutter
                        // expansionEvents.push({
                        //   from: { row, col },
                        //   to: cell,
                        //   player: owner
                        // });
                      }
                    }
                  }
                }
              }
              // Standard expansion for other viruses
              else {
                // Calculate expansion success chance based on reproduction and mobility parameters
                const reproductionFactor = reproduction / 16;
                const mobilityFactor = mobility / 16;
                const infectivityFactor = infectivity / 16;

                // Combined expansion chance
                const expansionChance = (reproductionFactor + mobilityFactor + infectivityFactor) / 3;

                if (Math.random() < expansionChance) {
                  // Select a random empty cell to expand to
                  const targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

                  expansionAttempts.push({
                    from: { row, col },
                    to: targetCell,
                    player: owner
                  });
                  // Removed expansion event to reduce visual clutter
                  // expansionEvents.push({
                  //   from: { row, col },
                  //   to: targetCell,
                  //   player: owner
                  // });
                }
              }
            }
          }
        }
      }
    }
  }

  // Execute standard expansion attempts (excluding those handled by special behaviors)
  for (const attempt of expansionAttempts) {
    // Only expand if the target cell is still empty
    if (newGrid[attempt.to.row][attempt.to.col] === null) {
      newGrid[attempt.to.row][attempt.to.col] = attempt.player;
      // Update cell age - new cell born this turn
      cellAge[attempt.to.row][attempt.to.col] = turn;
    }
  }

  // Phase 3: Combat - cells battle with adjacent opponent cells using tentacles
  // Use a Map for faster lookup of existing tentacles
  const existingTentacleMap = new Map<string, Tentacle>();
  for (const tentacle of existingTentacles) {
    const key = `${tentacle.from.row},${tentacle.from.col},${tentacle.to.row},${tentacle.to.col},${tentacle.owner}`;
    existingTentacleMap.set(key, tentacle);
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const owner = newGrid[row][col];
      if (owner !== null) {
        const player = players[owner];
        if (player) {
          // Get adjacent opponent cells
          const adjacentCells = getAdjacentCells(grid, row, col);
          const opponentCells = adjacentCells.filter(adj => {
            const cellOwner = newGrid[adj.row][adj.col];
            return cellOwner !== null && cellOwner !== owner;
          });

          // Attempt to attack opponent cells
          if (opponentCells.length > 0 && newTentacleCount < MAX_NEW_TENTACLES_PER_TURN) {
            // Select a random opponent cell to attack
            const targetCell = opponentCells[Math.floor(Math.random() * opponentCells.length)];
            const defender = newGrid[targetCell.row][targetCell.col]!;

            // Create a key for this potential tentacle
            const tentacleKey = `${row},${col},${targetCell.row},${targetCell.col},${owner}`;

            // Check if a tentacle already exists for this from->to pair
            if (!existingTentacleMap.has(tentacleKey) && newTentacleCount < MAX_NEW_TENTACLES_PER_TURN) {
              const newTentacle: Tentacle = {
                id: `tentacle-${Date.now()}-${Math.random()}`,
                from: { row, col },
                to: targetCell,
                owner: owner,
                progress: 0.05, // Start with a small progress
                type: 'invasion'
              };

              tentacles.push(newTentacle);
              newTentacleCount++;
            }
          }
        }
      }
    }
  }

  // Count territories for each player
  const territoryCounts = [0, 0, 0, 0];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const owner = newGrid[row][col];
      if (owner !== null && owner >= 0 && owner < 4) {
        territoryCounts[owner]++;
      }
    }
  }

  return {
    type: 'calculationComplete',
    newGrid,
    turn: turn + 1,
    territoryCounts,
    attackEvents,
    expansionEvents,
    parameterEvents,
    interactionEvents,
    waveEffects, // Add wave effects to the result
    tentacles,
    cellAge
  };
}

self.onmessage = function(e: MessageEvent<GridCalculationMessage>) {
  const { type, grid, players, turn, settings, tentacles, cellAge } = e.data;

  if (type === 'calculateNextState') {
    const result = calculateNextGameState(grid, players, turn, settings, tentacles, cellAge);
    self.postMessage(result);
  }
};