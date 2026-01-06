/**
 * Parameter Panel Component
 *
 * Компонент панели параметров
 *
 * This component allows players to configure their virus parameters during the setup phase.
 * It provides visual feedback on parameter allocation, validates constraints (total points),
 * and handles the ready state for each player.
 *
 * Этот компонент позволяет игрокам настраивать параметры своего вируса во время фазы настройки.
 * Он предоставляет визуальную обратную связь по распределению параметров, проверяет ограничения
 * (общее количество очков) и обрабатывает состояние готовности для каждого игрока.
 */
import React from 'react';
import { Player, VirusParameters } from '../types/game';
import { useLanguageStore } from '../store/languageStore';

interface ParameterPanelProps {
  player: Player;
  pointsLeft: number;
  onParameterChange: (param: keyof VirusParameters, value: number) => void;
  onPlayerReady: () => void;
  gameState: string;
}

const PARAMETER_NAMES = [
  'aggression', 'mutation', 'speed', 'defense',
  'reproduction', 'resistance', 'stealth', 'adaptability',
  'virulence', 'endurance', 'mobility', 'intelligence',
  'resilience', 'infectivity', 'lethality', 'stability'
];

const PARAMETER_EMOJIS = [
  '⚔️', '🧬', '⚡', '🛡️',
  '🦠', '🧬', '🕵️', '🔄',
  '☣️', '💪', '🏃', '🧠',
  '🛡️', '🌐', '💀', '⚖️'
];

const ParameterPanel: React.FC<ParameterPanelProps> = ({
  player,
  pointsLeft,
  onParameterChange,
  onPlayerReady,
  gameState
}) => {
  const { t } = useLanguageStore();

  const handleTubeClick = (paramIndex: number) => {
    if (gameState !== 'setup' || pointsLeft <= 0) return;
    const paramName = PARAMETER_NAMES[paramIndex] as keyof VirusParameters;
    const currentValue = player.virus[paramName];
    if (currentValue < 16) {
      onParameterChange(paramName, currentValue + 1);
    }
  };

  const handleDecreaseClick = (paramIndex: number) => {
    if (gameState !== 'setup') return;
    const paramName = PARAMETER_NAMES[paramIndex] as keyof VirusParameters;
    const currentValue = player.virus[paramName];
    if (currentValue > 0) {
      onParameterChange(paramName, currentValue - 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 gap-2 mb-4">
          {PARAMETER_NAMES.slice(0, 8).map((_, index) => {
            const paramName = PARAMETER_NAMES[index] as keyof VirusParameters;
            const value = player.virus[paramName];
            return (
              <ParameterTube
                key={index}
                paramIndex={index}
                value={value}
                emoji={PARAMETER_EMOJIS[index]}
                label={t(paramName)}
                onIncrease={() => handleTubeClick(index)}
                onDecrease={() => handleDecreaseClick(index)}
                gameState={gameState}
                pointsLeft={pointsLeft}
              />
            );
          })}
        </div>
        <div className="grid grid-cols-8 gap-2">
          {PARAMETER_NAMES.slice(8, 16).map((_, index) => {
            const realIndex = index + 8;
            const paramName = PARAMETER_NAMES[realIndex] as keyof VirusParameters;
            const value = player.virus[paramName];
            return (
              <ParameterTube
                key={realIndex}
                paramIndex={realIndex}
                value={value}
                emoji={PARAMETER_EMOJIS[realIndex]}
                label={t(paramName)}
                onIncrease={() => handleTubeClick(realIndex)}
                onDecrease={() => handleDecreaseClick(realIndex)}
                gameState={gameState}
                pointsLeft={pointsLeft}
              />
            );
          })}
        </div>
      </div>

    </div>
  );
};

interface ParameterTubeProps {
  paramIndex: number;
  value: number;
  emoji: string;
  label: string;
  onIncrease: () => void;
  onDecrease: () => void;
  gameState: string;
  pointsLeft: number;
}

const ParameterTube: React.FC<ParameterTubeProps> = ({
  value,
  emoji,
  label,
  onIncrease,
  onDecrease,
  gameState,
  pointsLeft
}) => {
  const heightPercentage = Math.min(100, (value / 16) * 100);

  const getLiquidColor = () => {
    if (emoji === '⚔️') return 'bg-gradient-to-t from-red-600 to-red-400';
    if (emoji === '🧬') return 'bg-gradient-to-t from-green-600 to-green-400';
    if (emoji === '⚡') return 'bg-gradient-to-t from-yellow-500 to-yellow-300';
    if (emoji === '🛡️') return 'bg-gradient-to-t from-blue-600 to-blue-400';
    if (emoji === '🦠') return 'bg-gradient-to-t from-emerald-500 to-emerald-300';
    if (emoji === '🕵️') return 'bg-gradient-to-t from-purple-600 to-purple-400';
    if (emoji === '🔄') return 'bg-gradient-to-t from-indigo-600 to-indigo-400';
    if (emoji === '☣️') return 'bg-gradient-to-t from-red-500 to-red-300';
    if (emoji === '💪') return 'bg-gradient-to-t from-orange-500 to-orange-300';
    if (emoji === '🏃') return 'bg-gradient-to-t from-cyan-500 to-cyan-300';
    if (emoji === '🧠') return 'bg-gradient-to-t from-violet-500 to-violet-300';
    if (emoji === '🌐') return 'bg-gradient-to-t from-sky-500 to-sky-300';
    if (emoji === '💀') return 'bg-gradient-to-t from-gray-600 to-gray-400';
    if (emoji === '⚖️') return 'bg-gradient-to-t from-stone-500 to-stone-300';
    if (label === 'Resilience') return 'bg-gradient-to-t from-teal-500 to-teal-300';
    if (label === 'Resistance') return 'bg-gradient-to-t from-lime-500 to-lime-300';
    return 'bg-gradient-to-t from-blue-500 to-blue-400';
  };

  const [showDroplet, setShowDroplet] = React.useState(false);

  const handleIncreaseClick = () => {
    if (gameState !== 'setup' || pointsLeft <= 0) return;
    onIncrease();
    setShowDroplet(true);
    setTimeout(() => setShowDroplet(false), 1000);
  };

  return (
    // ✅ MAIN FIX: onClick on outermost div for +1
    <div
      className="flex flex-col items-center cursor-pointer relative"
      onClick={handleIncreaseClick}
    >
      <div className="flex flex-col items-center w-full">
        {/* Convex glass test tube container with refraction effect */}
        <div className="relative w-12 h-32 rounded-b-[1.5rem] rounded-t-[0.5rem] overflow-hidden flex items-center justify-center glass-tube">
          {/* Background distortion effect */}
          <div className="absolute inset-0 glass-refraction" />

          {/* Inner glow effect */}
          <div className="absolute inset-0 glass-inner-glow" />

          {/* Liquid fill with parameter-specific color */}
          <div
            className={`absolute bottom-0 w-full ${getLiquidColor()} transition-all duration-300 z-10`}
            style={{ height: `${heightPercentage}%` }}
          />

          {/* Emoji: -1 on click with animation for specific emojis */}
          <div
            className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm z-20 ${
              emoji === '🔄' ? 'animate-spin' :
              emoji === '🕵️' ? 'animate-pulse' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent +1 trigger
              onDecrease();
            }}
          >
            {emoji}
          </div>

          {/* Droplet animation for +1 only */}
          {showDroplet && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-droplet-fall" />
            </div>
          )}
        </div>

        {/* Label: -1 on click */}
        <div
          className="text-xs font-normal mt-1 text-center w-full truncate cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Prevent +1 trigger
            onDecrease();
          }}
        >
          {label}
        </div>
        <div className="text-xs font-bold mt-1">{value}</div>
      </div>
    </div>
  );
};

export default ParameterPanel;