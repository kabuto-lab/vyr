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
    lab: 'LABORATORY',
    menu: 'MENU',
    test: 'TEST',
    sandbox: 'SANDBOX',
    sandboxDescription: 'Test different cell forms and visualize premium features',
    cellForms: 'Cell Forms',
    circle: 'Circle',
    square: 'Square',
    star: 'Star',
    currentForm: 'Current Form',
    currentFormDescription: 'Preview of the currently selected cell form',
    preview: 'Preview',
    visualEnhancements: 'Visual Enhancements',
    ultraVisualEffects: 'Ultra Visual Effects',
    ultraVisualEffectsDesc: 'Enable maximum visual effect quality with enhanced particle systems, dynamic lighting, and fluid animations.',
    cinematicCamera: 'Cinematic Camera',
    cinematicCameraDesc: 'Smooth camera movements with zoom, pan, and rotation controls for better battlefield observation.',
    dynamicColorSchemes: 'Dynamic Color Schemes',
    dynamicColorSchemesDesc: 'Access exclusive color palettes and themes to customize the appearance of your viruses and UI.',
    enhancedVisibility: 'Enhanced Visibility',
    enhancedVisibilityDesc: 'Improved contrast and highlighting options to better distinguish between different virus types.',
    strategyTools: 'Strategy Tools',
    battleAnalytics: 'Battle Analytics',
    battleAnalyticsDesc: 'Real-time statistics on expansion rates, combat effectiveness, and territory control.',
    aiAdvisor: 'AI Strategy Advisor',
    aiAdvisorDesc: 'Get intelligent suggestions on parameter allocation and tactical decisions during battles.',
    scenarioBuilder: 'Scenario Builder',
    scenarioBuilderDesc: 'Create custom battle scenarios with specific starting conditions and challenges.',
    advancedReplay: 'Advanced Replay System',
    advancedReplayDesc: 'Record, save, and replay battles with frame-by-frame controls and multiple viewing angles.',
    analytics: 'Analytics',
    performanceTracking: 'Performance Tracking',
    performanceTrackingDesc: 'Track your win rates, average territory control, and parameter effectiveness over time.',
    parameterOptimization: 'Parameter Optimization',
    parameterOptimizationDesc: 'Get recommendations on parameter combinations based on your playstyle and results.',
    matchHistory: 'Match History',
    matchHistoryDesc: 'Comprehensive records of all your battles with detailed statistics and outcomes.',
    achievementSystem: 'Achievement System',
    achievementSystemDesc: 'Unlock achievements for various milestones and special accomplishments in the game.',
    customVirusSkins: 'Custom Virus Skins',
    neonSkin: 'Neon Skin',
    neonSkinDesc: 'Apply a glowing neon effect to your virus cells.',
    holographicSkin: 'Holographic Skin',
    holographicSkinDesc: 'Give your virus cells a futuristic holographic appearance.',
    fireSkin: 'Fire Skin',
    fireSkinDesc: 'Add a fiery aura to your virus cells.',
    iceSkin: 'Ice Skin',
    iceSkinDesc: 'Apply a frosty, icy texture to your virus cells.',
    demoArea: 'Demo Area',
    selectFeatureTab: 'Select a feature tab to view premium options',

    // Game instructions
    gameInstructions: 'Distribute 16 points among 16 virus parameters',
    pointsLeft: 'Points Left:',

    // Victory messages
    victory: 'Victory!',
    defeated: 'Defected!',

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
    statsComingSoon: 'Statistics coming soon!',
    welcomeTitle: 'VYRUS',
    welcomeSubtitle: 'Strategic Virus Warfare Simulation',
    madeBy: 'Made by Lorem Totem',
    gameTitle: 'VYRUS',
    helpTitle: 'How to Play',
    helpContent: `VYRUS is a strategic virus warfare simulation game where 4 different viruses compete for territory on a grid.

1. Configure your virus by distributing 16 points among 16 different parameters
2. Each parameter affects how your virus behaves during the battle
3. Once all players are ready, click START BATTLE to begin
4. Watch as your virus competes against others in real-time
5. The virus that controls the most territory wins!

Click anywhere to close this help.`,
    close: 'CLOSE'
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
    lab: 'ЛАБОРАТОРИЯ',
    menu: 'МЕНЮ',
    test: 'ТЕСТ',
    sandbox: 'ПЕСОЧНИЦА',
    sandboxDescription: 'Протестируйте различные формы клеток и визуализируйте премиум-функции',
    cellForms: 'Формы клеток',
    circle: 'Круг',
    square: 'Квадрат',
    star: 'Звезда',
    currentForm: 'Текущая форма',
    currentFormDescription: 'Предварительный просмотр выбранной формы клетки',
    preview: 'Предварительный просмотр',
    visualEnhancements: 'Визуальные улучшения',
    ultraVisualEffects: 'Ультра визуальные эффекты',
    ultraVisualEffectsDesc: 'Включите максимальное качество визуальных эффектов с улучшенными системами частиц, динамическим освещением и плавными анимациями.',
    cinematicCamera: 'Кинематографическая камера',
    cinematicCameraDesc: 'Плавные движения камеры с возможностью масштабирования, панорамирования и вращения для лучшего наблюдения за полем боя.',
    dynamicColorSchemes: 'Динамические цветовые схемы',
    dynamicColorSchemesDesc: 'Получите доступ к эксклюзивным цветовым палитрам и темам для настройки внешнего вида ваших вирусов и интерфейса.',
    enhancedVisibility: 'Улучшенная видимость',
    enhancedVisibilityDesc: 'Улучшенные параметры контраста и подсветки для лучшего различения между разными типами вирусов.',
    strategyTools: 'Инструменты стратегии',
    battleAnalytics: 'Аналитика битвы',
    battleAnalyticsDesc: 'Статистика в реальном времени по темпам расширения, эффективности боя и контролю территории.',
    aiAdvisor: 'Советник по стратегии ИИ',
    aiAdvisorDesc: 'Получайте интеллектуальные предложения по распределению параметров и тактическим решениям во время битв.',
    scenarioBuilder: 'Конструктор сценариев',
    scenarioBuilderDesc: 'Создавайте настраиваемые сценарии битвы с конкретными условиями начала и задачами.',
    advancedReplay: 'Расширенная система повтора',
    advancedReplayDesc: 'Записывайте, сохраняйте и воспроизводите битвы с пошаговым управлением и несколькими углами обзора.',
    analytics: 'Аналитика',
    performanceTracking: 'Отслеживание производительности',
    performanceTrackingDesc: 'Отслеживайте свои победы, средний контроль территории и эффективность параметров с течением времени.',
    parameterOptimization: 'Оптимизация параметров',
    parameterOptimizationDesc: 'Получайте рекомендации по комбинациям параметров на основе вашего стиля игры и результатов.',
    matchHistory: 'История матчей',
    matchHistoryDesc: 'Исчерпывающие записи всех ваших битв с подробной статистикой и результатами.',
    achievementSystem: 'Система достижений',
    achievementSystemDesc: 'Разблокируйте достижения за различные вехи и особые успехи в игре.',
    customVirusSkins: 'Пользовательские скины вирусов',
    neonSkin: 'Неоновый скин',
    neonSkinDesc: 'Примените светящийся неоновый эффект к вашим вирусным клеткам.',
    holographicSkin: 'Голографический скин',
    holographicSkinDesc: 'Добавьте футуристический голографический вид к вашим вирусным клеткам.',
    fireSkin: 'Огненный скин',
    fireSkinDesc: 'Добавьте огненную ауру к вашим вирусным клеткам.',
    iceSkin: 'Ледяной скин',
    iceSkinDesc: 'Примените морозную, ледяную текстуру к вашим вирусным клеткам.',
    demoArea: 'Демонстрационная область',
    selectFeatureTab: 'Выберите вкладку функций для просмотра премиум-опций',

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
    statsComingSoon: 'Статистика скоро появится!',
    welcomeTitle: 'VYRUS',
    welcomeSubtitle: 'Стратегическая вирусная война',
    madeBy: 'Сделано Lorem Totem',
    gameTitle: 'VYRUS',
    helpTitle: 'Как играть',
    helpContent: `VYRUS - это стратегическая симуляция вирусной войны, в которой 4 разных вируса соревнуются за территорию на сетке.

1. Настройте свой вирус, распределив 16 очков между 16 различными параметрами
2. Каждый параметр влияет на поведение вашего вируса во время боя
3. Как только все игроки будут готовы, нажмите НАЧАТЬ БОЙ, чтобы начать
4. Наблюдайте, как ваш вирус сражается с другими в реальном времени
5. Вирус, который контролирует больше всего территории, побеждает!

Нажмите где угодно, чтобы закрыть это руководство.`,
    close: 'ЗАКРЫТЬ'
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