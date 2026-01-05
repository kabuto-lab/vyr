import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameStateProvider } from './components/GameStateProvider';
import Game from './components/Game';
import DeviceDetection from './components/DeviceDetection';
import FullscreenButton from './components/FullscreenButton';
import WelcomeScreen from './components/WelcomeScreen';
import { useState } from 'react';

function App() {
  // State to track if the game has started (welcome screen is dismissed)
  const [gameStarted, setGameStarted] = useState(false);

  // Function to start the game after the welcome screen
  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <Router>
      <GameStateProvider>
        <DeviceDetection>
          <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden">
            <FullscreenButton />
            {/* Show welcome screen if game hasn't started yet */}
            {!gameStarted ? (
              <WelcomeScreen onStart={startGame} />
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
        </DeviceDetection>
      </GameStateProvider>
    </Router>
  );
}

export default App;