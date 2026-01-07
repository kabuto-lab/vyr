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

  return (
    <Router>
      <GameStateProvider>
        <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden">
          <FullscreenButton />
          {/* Show welcome screen if game hasn't started yet */}
          {!gameStarted ? (
            <WelcomeScreen onStart={startGame} />
          ) : isMobile && !isLandscape ? (
            // Show landscape orientation prompt for mobile devices
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-900 text-white text-center p-4">
              <div className="text-2xl font-bold mb-4">{t('rotateDevice')}</div>
              <div className="text-lg mb-6">{t('rotateForBestExperience')}</div>
              <div className="text-sm opacity-75">{t('designedForLandscape')}</div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <div className="h-full">
                  <Game />
                </div>
              } />
            </Routes>
          )}
        </div>
      </GameStateProvider>
    </Router>
  );
}

export default App;