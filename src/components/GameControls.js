import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
const GameControls = () => {
    const { gameState, actions } = useGameStore();
    const { t } = useLanguageStore();
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-4 p-3 bg-gray-700 rounded", children: [_jsx("h3", { className: "font-semibold mb-2", children: t('gameState') }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: t('currentState') }), _jsx("span", { className: "font-mono", children: t(`gameState${gameState.gameState.charAt(0).toUpperCase() + gameState.gameState.slice(1)}`) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: t('turn') }), _jsx("span", { className: "font-mono", children: gameState.turn })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: t('phase') }), _jsx("span", { className: "font-mono", children: gameState.phase })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: t('speedLabel') }), _jsxs("span", { className: "font-mono", children: [gameState.simulationSpeed, "x"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: t('gridSize') }), _jsx("span", { className: "font-mono", children: "35x70" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: t('fps') }), _jsx("span", { className: "font-mono", children: gameState.performance.fps })] })] })] }), _jsxs("div", { className: "mb-4 p-3 bg-gray-700 rounded", children: [_jsx("h3", { className: "font-semibold mb-2", children: t('effectQuality') }), _jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: t('effectQuality') }), _jsx("div", { className: "flex space-x-1", children: ['low', 'medium', 'high'].map(quality => (_jsx("button", { onClick: () => {
                                            // Update settings in the store
                                            actions.updateSettings({ visualEffectQuality: quality });
                                        }, className: `px-2 py-1 rounded text-xs ${gameState.settings.visualEffectQuality === quality
                                            ? 'bg-blue-600'
                                            : 'bg-gray-600 hover:bg-gray-500'}`, children: t(quality) }, quality))) })] }) })] }), _jsx("div", { className: "space-y-3", children: gameState.gameState === 'battle' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex space-x-2", children: _jsx("button", { onClick: actions.togglePause, className: `flex-1 py-2 px-4 rounded ${gameState.isPaused
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-yellow-600 hover:bg-yellow-700'}`, children: gameState.isPaused ? t('resume') : t('pause') }) }), _jsx("div", { className: "flex space-x-2", children: _jsx("button", { onClick: () => actions.setSimulationSpeed(256), className: `flex-1 py-1 px-2 rounded ${gameState.simulationSpeed === 256
                                    ? 'bg-blue-600'
                                    : 'bg-gray-600 hover:bg-gray-500'}`, children: "256x" }) })] })) }), _jsxs("div", { className: "mt-6", children: [_jsx("h3", { className: "font-semibold mb-2", children: t('playerStatus') }), _jsx("div", { className: "grid grid-cols-4 gap-2", children: gameState.players.map(player => (_jsxs("div", { className: "bg-gray-800 bg-opacity-50 rounded-xl p-2 border border-gray-600 relative overflow-hidden", style: {
                                borderLeftColor: player.color,
                                borderLeftWidth: '4px',
                                height: '120px' // Set a fixed height for consistent sizing
                            }, children: [_jsx("div", { className: "absolute bottom-0 left-0 right-0", style: {
                                        height: `${Math.min(100, (player.territoryCount / 2450) * 100)}%`,
                                        backgroundColor: player.color,
                                        opacity: 0.3
                                    } }), _jsx("div", { className: "flex items-center justify-center mb-1 relative z-10", children: _jsx("span", { className: "text-xs font-bold", children: player.id + 1 }) }), _jsx("div", { className: "text-[0.6rem] text-center truncate w-full relative z-10", children: player.name }), _jsx("div", { className: "text-xs mt-0.5 font-mono relative z-10", children: player.territoryCount }), _jsx("div", { className: `text-[0.6rem] mt-1 px-1.5 py-0.5 rounded-full relative z-10 ${player.isReady ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`, children: player.isReady ? t('ready') : t('notReady') })] }, player.id))) })] })] }));
};
export default GameControls;
