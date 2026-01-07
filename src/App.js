import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameStateProvider } from './components/GameStateProvider';
import Game from './components/Game';
import FullscreenButton from './components/FullscreenButton';
import WelcomeScreen from './components/WelcomeScreen';
import { useState, useEffect } from 'react';
import { useLanguageStore } from './store/languageStore';
function App() {
    // State to track if the game has started (welcome screen is dismissed)
    const [gameStarted, setGameStarted] = useState(false);
    // State to track if device is in landscape orientation
    const [isLandscape, setIsLandscape] = useState(true);
    // State to track if device is mobile
    const [isMobile, setIsMobile] = useState(false);
    // Get the translation function from the language store
    const { t } = useLanguageStore();
    // Function to start the game after the welcome screen
    const startGame = () => {
        setGameStarted(true);
    };
    // Check if device is mobile and set orientation
    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
            setIsLandscape(window.innerWidth > window.innerHeight);
        };
        // Initial check
        checkDevice();
        // Add event listener for orientation change
        const handleResize = () => {
            checkDevice();
        };
        window.addEventListener('resize', handleResize);
        // Clean up event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    return (_jsx(Router, { children: _jsx(GameStateProvider, { children: _jsxs("div", { className: "h-screen w-screen bg-gray-900 text-white overflow-hidden", children: [_jsx(FullscreenButton, {}), !gameStarted ? (_jsx(WelcomeScreen, { onStart: startGame })) : isMobile && !isLandscape ? (
                    // Show landscape orientation prompt for mobile devices
                    _jsxs("div", { className: "flex flex-col items-center justify-center h-full w-full bg-gray-900 text-white text-center p-4", children: [_jsx("div", { className: "text-2xl font-bold mb-4", children: t('rotateDevice') }), _jsx("div", { className: "text-lg mb-6", children: t('rotateForBestExperience') }), _jsx("div", { className: "text-sm opacity-75", children: t('designedForLandscape') })] })) : (_jsx(Routes, { children: _jsx(Route, { path: "/", element: _jsx("div", { className: "h-full", children: _jsx(Game, {}) }) }) }))] }) }) }));
}
export default App;
