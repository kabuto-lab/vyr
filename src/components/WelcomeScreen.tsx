/**
 * Welcome Screen Component
 *
 * Компонент приветственного экрана
 *
 * This component displays a welcome screen where users can select their preferred language
 * (Russian or English) and start the game. It provides a clean, responsive interface
 * that works on both mobile and desktop devices.
 *
 * Этот компонент отображает приветственный экран, где пользователи могут выбрать
 * предпочитаемый язык (русский или английский) и начать игру. Он обеспечивает
 * чистый, адаптивный интерфейс, который работает как на мобильных устройствах,
 * так и на настольных компьютерах.
 */
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';

// Define language type
type Language = 'en' | 'ru';

const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  // State to manage loading state when starting the game
  const [isLoading, setIsLoading] = useState(false);
  // State for help modal
  const [showHelp, setShowHelp] = useState(false);

  // Get the translation function and setLanguage from the language store
  const { currentLanguage, setLanguage, t } = useLanguageStore();

  // Get actions from the game store
  const { actions } = useGameStore();

  // Initialize language based on game state or default to English
  useEffect(() => {
    // In a real implementation, we might load the language preference from localStorage
    // or user settings. For now, we'll use the default.
    const savedLanguage = localStorage.getItem('vyrus-language') as Language | null;
    if (savedLanguage && ['en', 'ru'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, [setLanguage]);

  // Handle language selection
  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
  };

  // Handle starting the game
  const handleStartGame = () => {
    setIsLoading(true);
    // Set showHelpOnStart to true before starting the game
    actions.setShowHelpOnStart(true);
    // Simulate a brief loading period before starting the game
    setTimeout(() => {
      onStart();
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated background elements for visual interest */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              backgroundColor: i % 3 === 0 ? '#EF4444' : i % 3 === 1 ? '#3B82F6' : '#10B981',
              animation: `pulse ${Math.random() * 10 + 10}s infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-8 max-w-2xl w-full">
        {/* Logo/title area */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-normal mb-2 font-buse retro-title leading-[1.3] pt-2 pb-2" data-text="VYRUS">
            VYRUS
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-4 font-pixy">
            {t('welcomeSubtitle')}
          </p>
          <div className="mt-4">
            <a
              href="https://loremtotem.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors font-pixy underline"
            >
              Made by Lorem Totem
            </a>
          </div>
        </div>

        {/* Central Help button */}
        <button
          onClick={() => setShowHelp(true)}
          className="mb-8 px-8 py-4 rounded-full text-xl font-bold font-pixy transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
        >
          {t('helpTitle')}
        </button>

        {/* Language selection */}
        <div className="mb-10 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 font-pixy">{t('selectLanguage')}</h2>
          <div className="flex justify-center space-x-4">
            {/* English language button */}
            <button
              onClick={() => handleLanguageSelect('en')}
              className={`px-6 py-3 rounded-lg font-bold font-pixy transition-all duration-300 ${
                currentLanguage === 'en'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              English
            </button>
            {/* Russian language button */}
            <button
              onClick={() => handleLanguageSelect('ru')}
              className={`px-6 py-3 rounded-lg font-bold font-pixy transition-all duration-300 ${
                currentLanguage === 'ru'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Русский
            </button>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStartGame}
          disabled={isLoading}
          className={`px-8 py-4 rounded-full text-xl font-bold font-pixy transition-all duration-300 transform hover:scale-105 ${
            isLoading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-500 text-white shadow-lg shadow-green-500/30'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('loading')}
            </span>
          ) : (
            t('start')
          )}
        </button>

        {/* Additional information */}
        <div className="mt-12 text-sm text-gray-400 max-w-md">
          <p className="font-pixy">
            {currentLanguage === 'en'
              ? 'A strategic game where 4 viruses compete for territory using 16 different parameters'
              : 'Стратегическая игра, в которой 4 вируса соревнуются за территорию, используя 16 различных параметров'}
          </p>
        </div>

        {/* Help Modal */}
        {showHelp && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-lg z-[100] flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <div
              className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold font-pixy text-center mb-4">{t('helpTitle')}</h2>
                <div className="text-gray-300 mb-6 whitespace-pre-line font-pixy">
                  {t('helpContent')}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowHelp(false)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-pixy hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.1; }
          100% { transform: scale(1.2); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;