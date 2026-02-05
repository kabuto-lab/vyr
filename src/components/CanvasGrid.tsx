/**
 * CanvasGrid Component
 *
 * Компонент CanvasGrid
 *
 * This component renders the game grid using HTML5 Canvas for optimal performance.
 * It draws the virus cells, visual effects, tentacles, and handles all visual
 * representations of the game state during battles.
 *
 * Этот компонент отрисовывает сетку игры с использованием HTML5 Canvas для оптимальной
 * производительности. Он рисует клетки вирусов, визуальные эффекты, щупальца и обрабатывает
 * все визуальные представления состояния игры во время битв.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const CanvasGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, actions } = useGameStore();
  const animationFrameRef = useRef<number>(0);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  // Helper function to convert hex color to RGB
  // Precompute color conversions to avoid repeated calculations
  const colorCache = new Map<string, { r: number; g: number; b: number }>();
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    if (colorCache.has(hex)) {
      return colorCache.get(hex)!;
    }
    // Handle named colors by converting them to RGB
    const nameColors: Record<string, string> = {
      '#EF4444': 'rgb(239, 68, 68)', // Red
      '#3B82F6': 'rgb(59, 130, 246)', // Blue
      '#10B981': 'rgb(16, 185, 129)', // Green
      '#F59E0B': 'rgb(245, 158, 11)', // Yellow
    };
    if (nameColors[hex]) {
      const match = nameColors[hex].match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const result = {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10)
        };
        colorCache.set(hex, result);
        return result;
      }
    }
    // Handle hex colors
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const rgb = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      };
      colorCache.set(hex, rgb);
      return rgb;
    }
    return null;
  };

  // Helper function to draw rounded rectangles
  const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Use visual effects from the store instead of local state
  const visualEffects = gameState.visualEffects;

  // Clean up old effects
  useEffect(() => {
    const interval = setInterval(() => {
      actions.removeOldVisualEffects();
    }, 100);
    return () => clearInterval(interval);
  }, [actions]);

  /**
   * Основной эффект рендеринга игровой сетки и визуальных эффектов
   * Main rendering effect for the game grid and visual effects
   *
   * Этот эффект отвечает за:
   * - Настройку холста для дисплеев с высоким DPI
   * - Расчет размеров ячеек для заполнения доступного пространства
   * - Отрисовку каждой ячейки с визуальными эффектами на основе параметров
   * - Отображение щупалец для расширения и атак вирусов
   * - Обработку и отображение визуальных эффектов из хранилища игры
   *
   * This effect handles:
   * - Setting up the canvas for high-DPI displays
   * - Calculating cell dimensions to fit the available space
   * - Drawing each cell with parameter-based visual effects
   * - Rendering tentacles for virus expansion and attacks
   * - Processing and displaying visual effects from the game store
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Получаем соотношение пикселей устройства для дисплеев с высоким DPI
    // Get device pixel ratio for high DPI displays
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Устанавливаем размер холста в соответствии с его размером отображения с учетом соотношения пикселей устройства
    // Set canvas size to match its display size accounting for device pixel ratio
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const scaledWidth = displayWidth * devicePixelRatio;
    const scaledHeight = displayHeight * devicePixelRatio;

    if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      // Масштабируем контекст для обеспечения четкого рендеринга на дисплеях с высоким DPI
      // Scale the context to ensure sharp rendering on high DPI displays
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    // Очищаем холст
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);

    // Вычисляем размеры ячеек на основе размера сетки
    // Используем сетку 70x35 (70 столбцов, 35 строк)
    // Calculate cell dimensions based on grid size
    // Using 70x35 grid (70 columns, 35 rows)
    const cols = 70;
    const rows = 35;

    // Вычисляем размеры ячеек для заполнения доступного пространства
    // Используем разные размеры для ширины и высоты, чтобы устранить пустое пространство
    // Calculate cell dimensions to fill the available space
    // Use different sizes for width and height to eliminate empty space
    const maxCellSize = 32;
    const cellWidth = Math.min(maxCellSize, displayWidth / cols);
    const cellHeight = Math.min(maxCellSize, displayHeight / rows);

    // Вычисляем позицию для выравнивания сетки на холсте
    // Calculate position to align the grid in the canvas
    const totalGridWidth = cellWidth * cols;
    const totalGridHeight = cellHeight * rows;
    const offsetX = Math.max(0, (displayWidth - totalGridWidth) / 2);
    const offsetY = Math.max(0, (displayHeight - totalGridHeight) / 2);

    // Create a seed-based random function for consistent organic shapes
    const randomSeed = (row: number, col: number) => {
      const seed = row * 1000 + col; // Simple seed based on position
      // Using a simple hash function to get consistent pseudo-random values
      let hash = seed;
      hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
      hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
      hash = (hash >> 16) ^ hash;
      return (hash % 1000) / 1000; // Return value between 0 and 1
    };

    // Precompute time factor to avoid repeated Date.now() calls
    const timeFactor = Date.now() * 0.002; // Slow animation

    // Draw grid
    for (let row = 0; row < rows; row++) {
      // Precompute row-based values to avoid repeated calculations
      const centerY = offsetY + row * cellHeight + cellHeight / 2;
      const timeRowFactor = timeFactor + randomSeed(row * 100, 0) * 100;
      const timeRowFactor2 = timeFactor * 2 + randomSeed(row * 200, 0) * 100;

      for (let col = 0; col < cols; col++) {
        // Get cell owner from 2D grid
        const owner = gameState.grid[row]?.[col] ?? null;
        if (owner !== null) {
          // Get player data for parameter effects
          const player = gameState.players[owner];
          const virusParams = player?.virus || {};

          // Calculate cell lifetime
          const birthTurn = gameState.cellAge?.[row]?.[col] ?? -1;
          const lifetime = birthTurn >= 0 ? gameState.turn - birthTurn : 0;

          // Set color based on owner
          let color = 'rgba(239, 68, 68, 0.5)'; // Default to Player 1 - Red with 50% transparency
          if (owner === 0) color = 'rgba(239, 68, 68, 0.5)'; // Player 1 - Red with 50% transparency
          else if (owner === 1) color = '#3B82F6'; // Player 2 - Blue
          else if (owner === 2) color = '#10B981'; // Player 3 - Green
          else if (owner === 3) color = '#F59E0B'; // Player 4 - Yellow

          // Calculate position and dimensions
          const centerX = offsetX + col * cellWidth + cellWidth / 2;

          // Add subtle position randomness for organic look (consistent per cell)
          const positionRandomness = 0.1; // 10% variation
          const variationX = (randomSeed(row, col) - 0.5) * cellWidth * positionRandomness;
          const variationY = (randomSeed(row + 100, col + 100) - 0.5) * cellHeight * positionRandomness;

          // Add size randomness for organic look (consistent per cell)
          const sizeRandomness = 0.1; // 10% variation
          const sizeVariation = 1 + (randomSeed(row + 200, col + 200) - 0.5) * sizeRandomness;

          // Add breathing animation based on time
          // Use a position-based seed instead of row+col to avoid diagonal patterns
          const breathingFactor = 1 + 0.05 * Math.sin(timeRowFactor + randomSeed(row * 100, col * 100) * 100); // Unique phase per cell

          // Determine shape based on lifetime
          let width = (cellWidth * 0.4) * sizeVariation * breathingFactor;
          let height = (cellHeight * 0.4) * sizeVariation * breathingFactor;
          let cornerRadius = 0;

          if (lifetime < 10) {
            // Young cells: fully organic ellipses (current behavior)
            ctx.beginPath();
            ctx.ellipse(
              centerX + variationX,
              centerY + variationY,
              width, // width
              height, // height
              0, // rotation
              0, // start angle
              2 * Math.PI // end angle
            );
          } else if (lifetime < 50) {
            // Mature cells: smoothly transition to rounded rectangles
            const transitionFactor = (lifetime - 10) / 40; // 0 to 1
            cornerRadius = 5 + 10 * transitionFactor; // 5px to 15px
            // Draw rounded rectangle
            ctx.beginPath();
            roundedRect(ctx, centerX + variationX - width, centerY + variationY - height, width * 2, height * 2, cornerRadius);
          } else {
            // Old cells: near-perfect squares with minimal corner radius
            cornerRadius = 2; // 2px corner radius
            // Draw square
            ctx.beginPath();
            roundedRect(ctx, centerX + variationX - width, centerY + variationY - height, width * 2, height * 2, cornerRadius);
          }

          // Add subtle color pulsing for life effect
          const colorComponents = hexToRgb(color);
          if (colorComponents) {
            // Use the same position-based seed to maintain consistency
            const pulseFactor = 0.9 + 0.1 * Math.sin(timeRowFactor2 + randomSeed(row * 200, col * 200) * 100);
            const r = Math.min(255, Math.floor(colorComponents.r * pulseFactor));
            const g = Math.min(255, Math.floor(colorComponents.g * pulseFactor));
            const b = Math.min(255, Math.floor(colorComponents.b * pulseFactor));
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          } else {
            ctx.fillStyle = color;
          }
          ctx.fill();

          // Apply parameter-driven internal fill effects
          if (virusParams) {
            // Get player's color components for effects
            const playerColor = hexToRgb(color);
            if (playerColor) {
              // Precompute parameter values to avoid repeated access
              const { stability, mutation, intelligence, lethality } = virusParams;

              // Stability effect: radial gradient from solid color at center to semi-transparent at edges
              if (stability > 8) {
                const gradient = ctx.createRadialGradient(
                  centerX + variationX,
                  centerY + variationY,
                  0,
                  centerX + variationX,
                  centerY + variationY,
                  Math.max(width, height)
                );
                gradient.addColorStop(0, `rgba(${playerColor.r}, ${playerColor.g}, ${playerColor.b}, 1.0)`);
                gradient.addColorStop(1, `rgba(${playerColor.r}, ${playerColor.g}, ${playerColor.b}, 0.3)`);
                ctx.fillStyle = gradient;
                ctx.fill();
              }

              // Mutation effect: 3-5 small semi-transparent noise blobs inside the cell
              if (mutation > 8) {
                const blobCount = Math.min(5, 3 + Math.floor(mutation / 4)); // Cap at 5 blobs for performance
                for (let i = 0; i < blobCount; i++) {
                  const blobX = centerX + variationX + (Math.random() - 0.5) * width;
                  const blobY = centerY + variationY + (Math.random() - 0.5) * height;
                  const blobRadius = 2 + Math.random() * 3;
                  ctx.beginPath();
                  ctx.arc(blobX, blobY, blobRadius, 0, 2 * Math.PI);
                  ctx.fillStyle = `rgba(${playerColor.r}, ${playerColor.g}, ${playerColor.b}, 0.3)`; // 30% opacity
                  ctx.fill();
                }
              }

              // Intelligence effect: faint radial lines (like a neural web) from center to edge
              if (intelligence > 8) {
                const lineCount = Math.min(8, 5 + Math.floor(intelligence / 3)); // Cap at 8 lines for performance
                for (let i = 0; i < lineCount; i++) {
                  const angle = (i / lineCount) * Math.PI * 2;
                  const endX = centerX + variationX + Math.cos(angle) * width;
                  const endY = centerY + variationY + Math.sin(angle) * height;
                  ctx.beginPath();
                  ctx.moveTo(centerX + variationX, centerY + variationY);
                  ctx.lineTo(endX, endY);
                  ctx.strokeStyle = `rgba(${playerColor.r}, ${playerColor.g}, ${playerColor.b}, 0.5)`; // 50% opacity
                  ctx.lineWidth = 0.5;
                  ctx.stroke();
                }
              }

              // Lethality effect: bright white "toxic core" in the center, scaling with lethality / 16
              if (lethality > 8) {
                const coreSize = (lethality / 16) * 5; // Scale from 0 to 5px based on lethality
                ctx.beginPath();
                ctx.arc(centerX + variationX, centerY + variationY, coreSize, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(255, 255, 255, 0.7)`; // Bright white toxic core
                ctx.fill();
              }
            }
          }

          // Draw border
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 0.5;
          ctx.stroke();

        } else {
          // Empty cell - draw a very subtle dot to indicate grid positions
          ctx.beginPath();
          ctx.arc(
            offsetX + col * cellWidth + cellWidth / 2,
            centerY,
            1, 0, 2 * Math.PI
          );
          ctx.fillStyle = 'rgba(55, 65, 81, 0.1)'; // Very faint gray
          ctx.fill();
        }
      }
    }

    // Draw viral weather effects based on virus interactions
    const time = Date.now() * 0.001; // Time for animation
    const weatherIntensity = 0.3; // Adjust intensity of weather effects

    // Adjust visual effects based on quality setting
    const visualEffectQuality = gameState.settings.visualEffectQuality;
    let stormParticleCount = 1;
    let connectionStrength = 0.0001;
    let energyFlowFrequency = 0.001;

    if (visualEffectQuality === 'high') {
      stormParticleCount = 2;
      connectionStrength = 0.0004;
      energyFlowFrequency = 0.005;
    } else if (visualEffectQuality === 'medium') {
      stormParticleCount = 1;
      connectionStrength = 0.0002;
      energyFlowFrequency = 0.002;
    } else { // low
      stormParticleCount = 0; // No storm particles in low quality
      connectionStrength = 0.00005;
      energyFlowFrequency = 0.0005;
    }

    // Draw viral storms where different viruses meet
    for (let row = 1; row < rows - 1; row++) {
      for (let col = 1; col < cols - 1; col++) {
        const centerOwner = gameState.grid[row][col];
        if (centerOwner !== null) {
          // Check adjacent cells for different owners (potential conflict zones)
          const adjacentOwners = [
            gameState.grid[row - 1][col], // top
            gameState.grid[row + 1][col], // bottom
            gameState.grid[row][col - 1], // left
            gameState.grid[row][col + 1]  // right
          ];
          // If there's a different owner adjacent, create a "storm" effect
          const hasConflict = adjacentOwners.some(owner => owner !== null && owner !== centerOwner);
          if (hasConflict) {
            const centerX = offsetX + col * cellWidth + cellWidth / 2;
            const centerY = offsetY + row * cellHeight + cellHeight / 2;
            // Draw storm particles based on quality setting
            for (let i = 0; i < stormParticleCount; i++) {
              const angle = (i / stormParticleCount) * Math.PI * 2 + time;
              const avgCellSize = (cellWidth + cellHeight) / 2; // Use average for distance calculations
              const distance = avgCellSize * 0.7 * (0.8 + 0.2 * Math.sin(time * 2 + i));
              const px = centerX + Math.cos(angle) * distance;
              const py = centerY + Math.sin(angle) * distance;
              ctx.beginPath();
              ctx.arc(px, py, 1.5, 0, 2 * Math.PI);
              ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * weatherIntensity})`;
              ctx.fill();
            }
          }
        }
      }
    }

    // Draw tentacles if in battle state
    if (gameState.gameState === 'battle') {
      // Only draw tentacles that are visible in the current viewport
      const visibleTentacles = gameState.tentacles.filter(tentacle => {
        const startX = offsetX + tentacle.from.col * cellWidth + cellWidth / 2;
        const startY = offsetY + tentacle.from.row * cellHeight + cellHeight / 2;
        const endX = offsetX + tentacle.to.col * cellWidth + cellWidth / 2;
        const endY = offsetY + tentacle.to.row * cellHeight + cellHeight / 2;
        // Check if the tentacle is within the visible area (with some padding)
        const padding = 50; // pixels of padding around viewport
        return (
          (startX >= -padding && startX <= displayWidth + padding &&
            startY >= -padding && startY <= displayHeight + padding) ||
          (endX >= -padding && endX <= displayWidth + padding &&
            endY >= -padding && endY <= displayHeight + padding)
        );
      });

      // Limit the number of tentacles drawn based on quality setting
      const tentaclesToDraw = Math.min(visibleTentacles.length,
        visualEffectQuality === 'high' ? 100 :
          visualEffectQuality === 'medium' ? 50 : 20);

      for (let i = 0; i < tentaclesToDraw; i++) {
        const tentacle = visibleTentacles[i];
        const startX = offsetX + tentacle.from.col * cellWidth + cellWidth / 2;
        const startY = offsetY + tentacle.from.row * cellHeight + cellHeight / 2;
        const endX = offsetX + tentacle.to.col * cellWidth + cellWidth / 2;
        const endY = offsetY + tentacle.to.row * cellHeight + cellHeight / 2;

        // Draw the tentacle as a straight line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);

        // Get the player's color for the tentacle
        const playerColor = gameState.players[tentacle.owner]?.color || '#FFFFFF';
        const rgbColor = hexToRgb(playerColor);
        if (rgbColor) {
          // Set transparency based on progress
          const alpha = Math.min(1, 0.3 + tentacle.progress * 0.7);
          ctx.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${alpha})`;
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
        }
        // Set line width to a constant value (removing the variable thickness)
        ctx.lineWidth = 1.5; // Constant line width
        ctx.stroke();

        // Draw animated tip at target cell when progress is high
        if (tentacle.progress > 0.7) {
          const pulseFactor = Math.sin(Date.now() * 0.005) * 0.5 + 0.5; // Pulsing effect
          const tipRadius = 3 + 4 * pulseFactor; // Pulsing radius
          ctx.beginPath();
          ctx.arc(endX, endY, tipRadius, 0, 2 * Math.PI);
          ctx.fillStyle = playerColor;
          ctx.globalAlpha = 0.7;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }

    // Draw symbiotic relationships - connections between compatible virus types
    const viewStartRow = Math.max(0, Math.floor(-offsetY / cellHeight));
    const viewEndRow = Math.min(rows, Math.ceil((displayHeight - offsetY) / cellHeight));
    const viewStartCol = Math.max(0, Math.floor(-offsetX / cellWidth));
    const viewEndCol = Math.min(cols, Math.ceil((displayWidth - offsetX) / cellWidth));

    for (let row = viewStartRow; row < viewEndRow; row++) {
      for (let col = viewStartCol; col < viewEndCol; col++) {
        const owner = gameState.grid[row][col];
        if (owner !== null) {
          // Look for nearby cells of the same owner to connect
          for (let dRow = -2; dRow <= 2; dRow++) {
            for (let dCol = -2; dCol <= 2; dCol++) {
              if (dRow === 0 && dCol === 0) continue; // Skip self
              if (row + dRow < 0 || row + dRow >= rows) continue;
              if (col + dCol < 0 || col + dCol >= cols) continue;
              const otherOwner = gameState.grid[row + dRow][col + dCol];
              if (otherOwner === owner && Math.random() < connectionStrength) {
                const x1 = offsetX + col * cellWidth + cellWidth / 2;
                const y1 = offsetY + row * cellHeight + cellHeight / 2;
                const x2 = offsetX + (col + dCol) * cellWidth + cellWidth / 2;
                const y2 = offsetY + (row + dRow) * cellHeight + cellHeight / 2;
                // Only draw connection if it's within the visible area
                if (
                  (x1 >= 0 && x1 <= displayWidth && y1 >= 0 && y1 <= displayHeight) ||
                  (x2 >= 0 && x2 <= displayWidth && y2 >= 0 && y2 <= displayHeight)
                ) {
                  // Simplified drawing: just draw the line without glow effect
                  ctx.beginPath();
                  ctx.moveTo(x1, y1);
                  ctx.lineTo(x2, y2);
                  // Get the player's color for the connection
                  const playerColor = gameState.players[owner].color;
                  ctx.strokeStyle = `${playerColor}40`; // More transparent
                  ctx.lineWidth = 0.3; // Thinner line
                  ctx.stroke();
                }
              }
            }
          }
        }
      }
    }

    // Draw energy flow visualization
    const energyTime = Date.now() * 0.0005;
    for (let row = 0; row < rows - 1; row++) {
      for (let col = 0; col < cols - 1; col++) {
        const owner = gameState.grid[row][col];
        if (owner !== null && Math.random() < energyFlowFrequency) {
          const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
          const [dRow, dCol] = directions[Math.floor(Math.random() * directions.length)];
          const targetRow = row + dRow;
          const targetCol = col + dCol;
          if (targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < cols) {
            const startX = offsetX + col * cellWidth + cellWidth / 2;
            const startY = offsetY + row * cellHeight + cellHeight / 2;
            const endX = offsetX + targetCol * cellWidth + cellWidth / 2;
            const endY = offsetY + targetRow * cellHeight + cellHeight / 2;
            const progress = (energyTime % 1);
            const particleX = startX + (endX - startX) * progress;
            const particleY = startY + (endY - startY) * progress;
            ctx.beginPath();
            ctx.arc(particleX, particleY, 1, 0, 2 * Math.PI);
            ctx.fillStyle = gameState.players[owner].color;
            ctx.fill();
          }
        }
      }
    }

    // Draw visual effects from store only during battle state
    if (gameState.gameState === 'battle') {
      const now = Date.now();
      // Limit to 15 effects in battle for better performance
      const MAX_EFFECTS = 15;
      let maxEffectsToProcess = Math.min(15, 20);
      if (visualEffectQuality === 'high') maxEffectsToProcess = Math.min(15, 50);
      else if (visualEffectQuality === 'medium') maxEffectsToProcess = Math.min(15, 30);
      else maxEffectsToProcess = Math.min(15, 10);

      // Count wave effects separately to enforce limits
      let waveEffectsCount = 0;
      const MAX_WAVE_EFFECTS_LOW = 3;
      const MAX_WAVE_EFFECTS_HIGH = 5;

      // Filter visible effects only
      const visibleEffects = [];
      for (let i = 0; i < visualEffects.length && visibleEffects.length < maxEffectsToProcess; i++) {
        const effect = visualEffects[i];
        const startTime = (effect as any).startTime || now;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / effect.duration, 1);

        if (progress < 1) {
          // Check if effect is within visible area
          let isVisible = false;
          if (effect.type === 'attack' && effect.from && effect.to) {
            const startX = offsetX + effect.from.col * cellWidth + cellWidth / 2;
            const startY = offsetY + effect.from.row * cellHeight + cellHeight / 2;
            const endX = offsetX + effect.to.col * cellWidth + cellWidth / 2;
            const endY = offsetY + effect.to.row * cellHeight + cellHeight / 2;
            // Check if either start or end point is within canvas bounds
            isVisible = (
              (startX >= 0 && startX <= displayWidth && startY >= 0 && startY <= displayHeight) ||
              (endX >= 0 && endX <= displayWidth && endY >= 0 && endY <= displayHeight)
            );
          } else if (effect.type === 'expansionSource') {
            const sourceX = offsetX + effect.position.x * cellWidth + cellWidth / 2;
            const sourceY = offsetY + effect.position.y * cellHeight + cellHeight / 2;
            isVisible = (sourceX >= 0 && sourceX <= displayWidth && sourceY >= 0 && sourceY <= displayHeight);
          } else if (effect.type === 'expansionPath' && effect.from && effect.to) {
            const pathStartX = offsetX + effect.from.col * cellWidth + cellWidth / 2;
            const pathStartY = offsetY + effect.from.row * cellHeight + cellHeight / 2;
            const pathEndX = offsetX + effect.to.col * cellWidth + cellWidth / 2;
            const pathEndY = offsetY + effect.to.row * cellHeight + cellHeight / 2;
            isVisible = (
              (pathStartX >= 0 && pathStartX <= displayWidth && pathStartY >= 0 && pathStartY <= displayHeight) ||
              (pathEndX >= 0 && pathEndX <= displayWidth && pathEndY >= 0 && pathEndY <= displayHeight)
            );
          } else if (effect.type === 'expansionTarget') {
            const targetX = offsetX + effect.position.x * cellWidth + cellWidth / 2;
            const targetY = offsetY + effect.position.y * cellHeight + cellHeight / 2;
            isVisible = (targetX >= 0 && targetX <= displayWidth && targetY >= 0 && targetY <= displayHeight);
          } else {
            // For other effect types, check if position is visible
            if (effect.position) {
              const x = offsetX + effect.position.x * cellWidth + cellWidth / 2;
              const y = offsetY + effect.position.y * cellHeight + cellHeight / 2;
              isVisible = (x >= 0 && x <= displayWidth && y >= 0 && y <= displayHeight);
            }
          }

          // Additional check for wave effects to respect limits
          if (effect.type === 'wave') {
            if ((visualEffectQuality === 'low' && waveEffectsCount < MAX_WAVE_EFFECTS_LOW) ||
              (visualEffectQuality === 'high' && waveEffectsCount < MAX_WAVE_EFFECTS_HIGH)) {
              waveEffectsCount++;
              isVisible = isVisible && true; // Keep visible if within limits
            } else {
              isVisible = false; // Hide if over limit
            }
          }

          if (isVisible) {
            visibleEffects.push({ effect, progress });
          }
        }
      }

      // Process only visible effects
      for (let i = 0; i < visibleEffects.length; i++) {
        const { effect, progress } = visibleEffects[i];

        if (effect.type === 'attack' && effect.from && effect.to) {
          const startX = offsetX + effect.from.col * cellWidth + cellWidth / 2;
          const startY = offsetY + effect.from.row * cellHeight + cellHeight / 2;
          const endX = offsetX + effect.to.col * cellWidth + cellWidth / 2;
          const endY = offsetY + effect.to.row * cellHeight + cellHeight / 2;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + (endX - startX) * progress, startY + (endY - startY) * progress);
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          if (progress > 0.8) {
            const impactProgress = (progress - 0.8) / 0.2;
            ctx.beginPath();
            ctx.arc(endX, endY, 3 + 5 * impactProgress, 0, 2 * Math.PI);
            ctx.fillStyle = effect.color;
            ctx.globalAlpha = 1 - impactProgress;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
        else {
          // Skip all visual effects rendering
        }
      }
    }
  }, [gameState.grid, visualEffects, gameState.players, canvasDimensions]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const devicePixelRatio = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      const scaledWidth = displayWidth * devicePixelRatio;
      const scaledHeight = displayHeight * devicePixelRatio;

      if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(devicePixelRatio, devicePixelRatio);
        }
        setCanvasDimensions({ width: displayWidth, height: displayHeight });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('focus', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('focus', handleResize);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (gameState.gameState !== 'battle') return;

    const render = () => {
      actions.calculateFPS();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.gameState, canvasDimensions, actions]);

  return (
    <div className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="grid-canvas"
      />
    </div>
  );
};

export default CanvasGrid;