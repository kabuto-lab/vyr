import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameStateProvider } from './components/GameStateProvider';
import Game from './components/Game';
import DeviceDetection from './components/DeviceDetection';

function App() {
  return (
    <Router>
      <GameStateProvider>
        <DeviceDetection>
          <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden">
            <Routes>
              <Route path="/" element={
                <div className="h-full">
                  <Game />
                </div>
              } />
            </Routes>
          </div>
        </DeviceDetection>
      </GameStateProvider>
    </Router>
  );
}

export default App;