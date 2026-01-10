import React, { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '../store/languageStore';

const Sandbox: React.FC = () => {
  const { t } = useLanguageStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState('cellForms');
  const [cellType, setCellType] = useState<'circle' | 'square' | 'star'>('circle');

  // Function to draw different cell types
  const drawCell = (ctx: CanvasRenderingContext2D, type: 'circle' | 'square' | 'star', x: number, y: number, size: number) => {
    ctx.save();

    switch (type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444'; // Red
        ctx.fill();
        ctx.strokeStyle = '#374151'; // Dark gray
        ctx.lineWidth = 1;
        ctx.stroke();
        break;

      case 'square':
        ctx.beginPath();
        ctx.rect(x - size, y - size, size * 2, size * 2);
        ctx.fillStyle = '#3B82F6'; // Blue
        ctx.fill();
        ctx.strokeStyle = '#374151'; // Dark gray
        ctx.lineWidth = 1;
        ctx.stroke();
        break;

      case 'star':
        drawStar(ctx, x, y, 5, size, size * 0.5);
        ctx.fillStyle = '#10B981'; // Green
        ctx.fill();
        ctx.strokeStyle = '#374151'; // Dark gray
        ctx.lineWidth = 1;
        ctx.stroke();
        break;
    }

    ctx.restore();
  };

  // Helper function to draw a star
  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  // Draw cells on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a grid of cells with the selected type
    const cellSize = 30;
    const spacing = 50;
    const cols = Math.floor(canvas.width / spacing);
    const rows = Math.floor(canvas.height / spacing);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;
        drawCell(ctx, cellType, x, y, cellSize);
      }
    }
  }, [cellType, activeTab]);

  // Render the active tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 'cellForms':
        return (
          <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
            <div className="md:w-1/4 bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-bold mb-4 font-furore">{t('cellForms')}</h2>

              <div className="space-y-3">
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center font-furore ${
                    cellType === 'circle' ? 'bg-blue-600 bg-opacity-70' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => setCellType('circle')}
                >
                  <span className="mr-3">⭕</span> {t('circle')}
                </button>

                <button
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center font-furore ${
                    cellType === 'square' ? 'bg-blue-600 bg-opacity-70' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => setCellType('square')}
                >
                  <span className="mr-3">⬜</span> {t('square')}
                </button>

                <button
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center font-furore ${
                    cellType === 'star' ? 'bg-blue-600 bg-opacity-70' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => setCellType('star')}
                >
                  <span className="mr-3">⭐</span> {t('star')}
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-bold mb-2 font-furore">{t('currentForm')}</h3>
                <div className="bg-gray-900 p-4 rounded-lg flex justify-center">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={100}
                      height={100}
                      className="border border-gray-700 rounded"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">{t('currentFormDescription')}</p>
              </div>
            </div>

            <div className="flex-1 bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-bold mb-4 font-furore">{t('preview')}</h2>
              <div className="bg-gray-900 h-full rounded-lg overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={500}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        );

      case 'visual':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 font-furore">{t('visualEnhancements')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('ultraVisualEffects')}</h3>
                <p className="text-gray-300">{t('ultraVisualEffectsDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🎬</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('cinematicCamera')}</h3>
                <p className="text-gray-300">{t('cinematicCameraDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🌈</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('dynamicColorSchemes')}</h3>
                <p className="text-gray-300">{t('dynamicColorSchemesDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">👁️</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('enhancedVisibility')}</h3>
                <p className="text-gray-300">{t('enhancedVisibilityDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'strategy':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 font-furore">{t('strategyTools')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('battleAnalytics')}</h3>
                <p className="text-gray-300">{t('battleAnalyticsDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('aiAdvisor')}</h3>
                <p className="text-gray-300">{t('aiAdvisorDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('scenarioBuilder')}</h3>
                <p className="text-gray-300">{t('scenarioBuilderDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('advancedReplay')}</h3>
                <p className="text-gray-300">{t('advancedReplayDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 font-furore">{t('analytics')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('performanceTracking')}</h3>
                <p className="text-gray-300">{t('performanceTrackingDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('parameterOptimization')}</h3>
                <p className="text-gray-300">{t('parameterOptimizationDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('matchHistory')}</h3>
                <p className="text-gray-300">{t('matchHistoryDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('achievementSystem')}</h3>
                <p className="text-gray-300">{t('achievementSystemDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded">
                  <p className="text-sm text-gray-400">{t('demoArea')}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'skins':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 font-furore">{t('customVirusSkins')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('neonSkin')}</h3>
                <p className="text-gray-300">{t('neonSkinDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🎭</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('holographicSkin')}</h3>
                <p className="text-gray-300">{t('holographicSkinDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-teal-400"></div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">🔥</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('fireSkin')}</h3>
                <p className="text-gray-300">{t('fireSkinDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="text-4xl mb-4">❄️</div>
                <h3 className="text-xl font-bold mb-2 font-furore">{t('iceSkin')}</h3>
                <p className="text-gray-300">{t('iceSkinDesc')}</p>
                <div className="mt-4 p-4 bg-gray-900 rounded flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-300 to-cyan-300"></div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6 text-center">
            <p className="text-gray-400">{t('selectFeatureTab')}</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold font-furore">{t('sandbox')}</h1>
        <p className="text-gray-400">{t('sandboxDescription')}</p>
      </div>

      <div className="border-b border-gray-700">
        <div className="flex overflow-x-auto">
          <button
            className={`px-6 py-3 font-bold transition-colors flex-shrink-0 ${
              activeTab === 'cellForms'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'
            } font-furore`}
            onClick={() => setActiveTab('cellForms')}
          >
            {t('cellForms')}
          </button>
          <button
            className={`px-6 py-3 font-bold transition-colors flex-shrink-0 ${
              activeTab === 'visual'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'
            } font-furore`}
            onClick={() => setActiveTab('visual')}
          >
            {t('visualEnhancements')}
          </button>
          <button
            className={`px-6 py-3 font-bold transition-colors flex-shrink-0 ${
              activeTab === 'strategy'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'
            } font-furore`}
            onClick={() => setActiveTab('strategy')}
          >
            {t('strategyTools')}
          </button>
          <button
            className={`px-6 py-3 font-bold transition-colors flex-shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'
            } font-furore`}
            onClick={() => setActiveTab('analytics')}
          >
            {t('analytics')}
          </button>
          <button
            className={`px-6 py-3 font-bold transition-colors flex-shrink-0 ${
              activeTab === 'skins'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'
            } font-furore`}
            onClick={() => setActiveTab('skins')}
          >
            {t('customVirusSkins')}
          </button>
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default Sandbox;