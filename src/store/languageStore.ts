/**
 * Language Store
 *
 * Хранилище языка
 *
 * This store manages the application's language state using Zustand.
 * It provides functions to set and get the current language, as well as
 * translation functions for different parts of the application.
 *
 * Это хранилище управляет состоянием языка приложения с помощью Zustand.
 * Оно предоставляет функции для установки и получения текущего языка,
 * а также функции перевода для разных частей приложения.
 */
import { create } from 'zustand';

// Define available languages
export type Language = 'en' | 'ru';

// Define the structure of our language store
interface LanguageStore {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Translations for different parts of the application
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Game state messages
    gameStateSetup: 'Setup',
    gameStateBattle: 'Battle',
    gameStateGameOver: 'Game Over',
    
    // Parameter names
    aggression: 'Aggression',
    mutation: 'Mutation',
    speed: 'Speed',
    defense: 'Defense',
    reproduction: 'Reproduction',
    resistance: 'Resistance',
    stealth: 'Stealth',
    adaptability: 'Adaptability',
    virulence: 'Virulence',
    endurance: 'Endurance',
    mobility: 'Mobility',
    intelligence: 'Intelligence',
    resilience: 'Resilience',
    infectivity: 'Infectivity',
    lethality: 'Lethality',
    stability: 'Stability',
    
    // UI elements
    configure: 'Configure:',
    virus: 'VIRUS',
    startBattle: 'START BATTLE',
    ready: 'READY ✓',
    markReady: 'MARK READY',
    controls: 'Controls',
    test: 'TEST',
    reset: 'RESET',
    pause: 'PAUSE',
    resume: 'RESUME',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    effectQuality: 'Effect Quality:',
    gameState: 'Game State',
    currentState: 'Current State:',
    turn: 'Turn:',
    phase: 'Phase:',
    speedLabel: 'Speed:',
    gridSize: 'Grid Size:',
    fps: 'FPS:',
    playerStatus: 'Player Status',
    notReady: 'NOT READY',
    territoryCount: 'Territory Count',
    lab: 'LAB',
    menu: 'MENU',
    
    // Game instructions
    gameInstructions: 'Distribute 16 points among 16 virus parameters',
    pointsLeft: 'Points Left:',
    
    // Victory messages
    victory: 'Victory!',
    defeated: 'Defeated!',
    
    // Other
    loading: 'Loading...',
    selectLanguage: 'Select Language',
    rotateDevice: 'Rotate Your Device',
    rotateForBestExperience: 'Please rotate your device to landscape mode for the best experience',
    designedForLandscape: 'This game is designed for landscape orientation',
    start: 'Start',
    save: 'Save',
    load: 'Load',
    settings: 'Settings',
    premium: 'Premium',
    stats: 'Stats',
    closeMenu: 'Close Menu',
    gameSaved: 'Game saved successfully!',
    gameLoaded: 'Game loaded successfully!',
    noSavedGame: 'No saved game found!',
    settingsComingSoon: 'Settings coming soon!',
    premiumComingSoon: 'Premium features coming soon!',
    statsComingSoon: 'Statistics coming soon!'
  },
  ru: {
    // Game state messages
    gameStateSetup: 'Настройка',
    gameStateBattle: 'Битва',
    gameStateGameOver: 'Игра окончена',

    // Parameter names
    aggression: 'Агрессия',
    mutation: 'Мутация',
    speed: 'Скорость',
    defense: 'Защита',
    reproduction: 'Репродукция',
    resistance: 'Сопротивление',
    stealth: 'Скрытность',
    adaptability: 'Адаптивность',
    virulence: 'Вирулентность',
    endurance: 'Выносливость',
    mobility: 'Мобильность',
    intelligence: 'Интеллект',
    resilience: 'Устойчивость',
    infectivity: 'Заразность',
    lethality: 'Летальность',
    stability: 'Стабильность',

    // UI elements
    configure: 'Настроить:',
    virus: 'ВИРУС',
    startBattle: 'НАЧАТЬ БИТВУ',
    ready: 'ГОТОВ ✓',
    markReady: 'ОТМЕТИТЬ ГОТОВНОСТЬ',
    controls: 'Управление',
    test: 'ТЕСТ',
    reset: 'СБРОС',
    pause: 'ПАУЗА',
    resume: 'ПРОДОЛЖИТЬ',
    low: 'Низкое',
    medium: 'Среднее',
    high: 'Высокое',
    effectQuality: 'Качество эффектов:',
    gameState: 'Состояние игры',
    currentState: 'Текущее состояние:',
    turn: 'Ход:',
    phase: 'Фаза:',
    speedLabel: 'Скорость:',
    gridSize: 'Размер сетки:',
    fps: 'FPS:',
    playerStatus: 'Статус игрока',
    notReady: 'НЕ ГОТОВ',
    territoryCount: 'Количество территории',
    lab: 'ЛАБ',
    menu: 'МЕНЮ',

    // Game instructions
    gameInstructions: 'Распределите 16 очков между 16 параметрами вируса',
    pointsLeft: 'Осталось очков:',

    // Victory messages
    victory: 'Победа!',
    defeated: 'Поражение!',

    // Other
    loading: 'Загрузка...',
    selectLanguage: 'Выберите язык',
    rotateDevice: 'Переверните экран горизонтально',
    rotateForBestExperience: 'Пожалуйста, переверните устройство в альбомную ориентацию для лучшего опыта',
    designedForLandscape: 'Эта игра разработана для альбомной ориентации',
    start: 'Старт',
    save: 'Сохранить',
    load: 'Загрузить',
    settings: 'Настройки',
    premium: 'Премиум',
    stats: 'Статистика',
    closeMenu: 'Закрыть меню',
    gameSaved: 'Игра сохранена успешно!',
    gameLoaded: 'Игра загружена успешно!',
    noSavedGame: 'Сохраненная игра не найдена!',
    settingsComingSoon: 'Настройки скоро появятся!',
    premiumComingSoon: 'Премиум-функции скоро появятся!',
    statsComingSoon: 'Статистика скоро появится!'
  }
};

// Create the language store
export const useLanguageStore = create<LanguageStore>((set, get) => ({
  // Default language is English
  currentLanguage: 'en',
  
  // Function to set the current language
  setLanguage: (lang: Language) => {
    // Update the language in the store
    set({ currentLanguage: lang });
    
    // Save the language preference to localStorage for persistence
    localStorage.setItem('vyrus-language', lang);
  },
  
  // Translation function that returns the appropriate text based on the current language
  t: (key: string): string => {
    const { currentLanguage } = get();
    
    // Return the translation if it exists, otherwise return the key
    return translations[currentLanguage][key] || key;
  }
}));

// Initialize the language store with the saved language preference
const savedLanguage = localStorage.getItem('vyrus-language') as Language | null;
if (savedLanguage && ['en', 'ru'].includes(savedLanguage)) {
  useLanguageStore.getState().setLanguage(savedLanguage);
}