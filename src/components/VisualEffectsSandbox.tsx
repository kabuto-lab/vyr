import React, { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '../store/languageStore';

const VisualEffectsSandbox: React.FC = () => {
  const { t } = useLanguageStore();
  const canvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
  const animationFrameRefs = useRef<Array<number | null>>([]);

  // Visual effect names
  const visualEffects = [
    "Attack Effect",
    "Expansion Effect",
    "Parameter Effect",
    "Interaction Effect",
    "Wave Effect",
    "Expansion Source Effect",
    "Expansion Path Effect",
    "Expansion Target Effect",
    "Mutation Effect",
    "Defense Effect"
  ];

  // Set up canvas references
  useEffect(() => {
    canvasRefs.current = canvasRefs.current.slice(0, visualEffects.length);
    animationFrameRefs.current = Array(visualEffects.length).fill(null);
  }, []);

  // Attack Effect Animation
  const drawAttackEffect = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.3;
    
    // Draw attack vectors
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.002;
      const distance = radius * (0.5 + 0.5 * Math.sin(time * 0.005 + i));
      
      const x1 = centerX;
      const y1 = centerY;
      const x2 = centerX + Math.cos(angle) * distance;
      const y2 = centerY + Math.sin(angle) * distance;
      
      // Draw attack line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsl(${(time * 0.3 + index * 50) % 360}, 100%, 60%)`;
      ctx.lineWidth = 2 + Math.sin(time * 0.01 + i) * 1.5;
      ctx.stroke();
      
      // Draw attack head
      ctx.beginPath();
      ctx.arc(x2, y2, 5, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(time * 0.3 + index * 50 + 120) % 360}, 100%, 70%)`;
      ctx.fill();
    }
  };

  // Expansion Effect Animation
  const drawExpansionEffect = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const maxRadius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4;
    
    // Draw expanding rings
    for (let i = 0; i < 5; i++) {
      const progress = (time * 0.002 + i * 0.2) % 1;
      const radius = progress * maxRadius;
      const alpha = 1 - progress;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${(time * 0.2 + index * 40 + i * 72) % 360}, 100%, 60%, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw central expanding cell
    const cellSize = 10 + Math.sin(time * 0.005) * 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, cellSize, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(time * 0.2 + index * 40) % 360}, 100%, 60%)`;
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Parameter Effect Animation
  const drawParameterEffect = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.35;
    
    // Draw parameter indicators
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Draw parameter node
      const size = 8 + Math.sin(time * 0.005 + i) * 4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(time * 0.3 + index * 45 + i * 45) % 360}, 100%, 60%)`;
      ctx.fill();
      
      // Draw connection to center
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `hsla(${(time * 0.3 + index * 45 + i * 45) % 360}, 100%, 60%, 0.5)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw central hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(time * 0.3 + index * 45) % 360}, 100%, 40%)`;
    ctx.fill();
  };

  // Interaction Effect Animation
  const drawInteractionEffect = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.3;
    
    // Draw interacting cells
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + time * 0.001;
      const distance = radius * 0.7;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Draw cell
      const size = 10 + Math.sin(time * 0.008 + i) * 3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(time * 0.2 + index * 60 + i * 120) % 360}, 100%, 60%)`;
      ctx.fill();
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw interaction lines between cells
      if (i > 0) {
        const prevAngle = ((i-1) / 3) * Math.PI * 2 + time * 0.001;
        const prevX = centerX + Math.cos(prevAngle) * distance;
        const prevY = centerY + Math.sin(prevAngle) * distance;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(prevX, prevY);
        ctx.strokeStyle = `hsla(${(time * 0.2 + index * 60 + i * 120) % 360}, 100%, 60%, 0.5)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    
    // Draw central interaction point
    const pulseSize = 5 + Math.sin(time * 0.007) * 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(time * 0.2 + index * 60) % 360}, 100%, 70%)`;
    ctx.fill();
  };

  // Wave Effect Animation
  const drawWaveEffect = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const maxRadius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4;
    
    // Draw concentric waves
    for (let i = 0; i < 8; i++) {
      const progress = (time * 0.0015 + i * 0.1) % 1;
      const radius = progress * maxRadius;
      const alpha = 0.7 * (1 - progress);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${(time * 0.2 + index * 45 + i * 45) % 360}, 100%, 60%, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Draw ripple effect
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = maxRadius * 0.3;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const size = 3 + Math.sin(time * 0.008 + i) * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(time * 0.2 + index * 45 + i * 30) % 360}, 100%, 70%, 0.8)`;
      ctx.fill();
    }
  };

  // Expansion Source Effect Animation
  const drawExpansionSourceEffect = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.3;
    
    // Draw pulsing source
    const pulse = 1 + Math.sin(time * 0.008) * 0.3;
    const size = radius * 0.3 * pulse;
    
    // Draw gradient for pulsing effect
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, size
    );
    gradient.addColorStop(0, `hsla(${(time * 0.3 + index * 50) % 360}, 100%, 80%, 1)`);
    gradient.addColorStop(1, `hsla(${(time * 0.3 + index * 50) % 360}, 100%, 60%, 0)`);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw core
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(time * 0.3 + index * 50) % 360}, 100%, 60%)`;
    ctx.fill();
    
    // Draw emanating particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.003;
      const distance = size * (1.5 + Math.sin(time * 0.005 + i) * 0.5);
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const particleSize = 2 + Math.sin(time * 0.01 + i) * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, particleSize, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(time * 0.3 + index * 50 + i * 30) % 360}, 100%, 70%, 0.8)`;
      ctx.fill();
    }
  };

  // Expansion Path Effect Animation
  const drawExpansionPathEffect = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4;
    
    // Draw path from center to edge
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const endX = centerX + Math.cos(angle) * radius;
      const endY = centerY + Math.sin(angle) * radius;
      
      // Draw path with dashes
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = `hsla(${(time * 0.2 + index * 60 + i * 60) % 360}, 100%, 60%, 0.7)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw moving particles along the path
      const progress = (time * 0.003 + i * 0.2) % 1;
      const particleX = centerX + (endX - centerX) * progress;
      const particleY = centerY + (endY - centerY) * progress;
      
      const size = 4 + Math.sin(time * 0.01 + i) * 2;
      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(time * 0.2 + index * 60 + i * 60) % 360}, 100%, 70%)`;
      ctx.fill();
    }
  };

  // Expansion Target Effect Animation
  const drawExpansionTargetEffect = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.3;
    
    // Draw target zones
    for (let i = 0; i < 4; i++) {
      const currentRadius = radius * (0.3 + 0.2 * i);
      const alpha = 0.3 + 0.2 * Math.sin(time * 0.005 + i);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${(time * 0.2 + index * 45 + i * 90) % 360}, 100%, 60%, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw pulsing center
    const pulse = 0.8 + 0.2 * Math.sin(time * 0.01);
    const size = radius * 0.2 * pulse;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(time * 0.2 + index * 45) % 360}, 100%, 60%)`;
    ctx.fill();
    
    // Draw incoming particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = radius * (0.7 + 0.3 * Math.sin(time * 0.004 + i));
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const size = 3 + Math.sin(time * 0.01 + i) * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(time * 0.2 + index * 45 + i * 45) % 360}, 100%, 70%, 0.9)`;
      ctx.fill();
    }
  };

  // Mutation Effect Animation
  const drawMutationEffect = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.35;
    
    // Draw mutating cell
    const cellSize = 15 + Math.sin(time * 0.008) * 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, cellSize, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${(time * 0.3 + index * 50) % 360}, 100%, 60%, 0.7)`;
    ctx.fill();
    ctx.strokeStyle = `hsl(${(time * 0.3 + index * 50 + 120) % 360}, 100%, 50%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw mutation blobs
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * 0.002;
      const distance = cellSize * (1.2 + 0.3 * Math.sin(time * 0.007 + i));
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const size = 5 + Math.sin(time * 0.01 + i * 2) * 3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(time * 0.3 + index * 50 + i * 60) % 360}, 100%, 70%)`;
      ctx.fill();
    }
    
    // Draw internal structure
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const distance = cellSize * 0.6;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `hsla(${(time * 0.3 + index * 50 + i * 72) % 360}, 100%, 80%, 0.6)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  // Defense Effect Animation
  const drawDefenseEffect = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4;
    
    // Draw defensive barriers
    for (let i = 0; i < 8; i++) {
      const barrierRadius = radius * (0.4 + 0.1 * i);
      const alpha = 0.3 + 0.2 * Math.sin(time * 0.005 + i);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, barrierRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${(time * 0.2 + index * 45 + i * 45) % 360}, 100%, 60%, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw central protected core
    const coreSize = radius * 0.2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(time * 0.2 + index * 45) % 360}, 100%, 40%)`;
    ctx.fill();
    
    // Draw defensive spikes
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const innerRadius = coreSize * 1.5;
      const outerRadius = coreSize * 2.5;
      
      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * outerRadius;
      const y2 = centerY + Math.sin(angle) * outerRadius;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsl(${(time * 0.2 + index * 45 + i * 30) % 360}, 100%, 60%)`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  // Animation loop for each canvas
  useEffect(() => {
    const animate = () => {
      const time = Date.now();
      
      visualEffects.forEach((_, index) => {
        const canvas = canvasRefs.current[index];
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            switch(index) {
              case 0: drawAttackEffect(ctx, time, index); break;
              case 1: drawExpansionEffect(ctx, time, index); break;
              case 2: drawParameterEffect(ctx, time, index); break;
              case 3: drawInteractionEffect(ctx, time, index); break;
              case 4: drawWaveEffect(ctx, time, index); break;
              case 5: drawExpansionSourceEffect(ctx, time, index); break;
              case 6: drawExpansionPathEffect(ctx, time, index); break;
              case 7: drawExpansionTargetEffect(ctx, time, index); break;
              case 8: drawMutationEffect(ctx, time, index); break;
              case 9: drawDefenseEffect(ctx, time, index); break;
              default: break;
            }
          }
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white overflow-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-pixy text-center mb-2">VYRUS Visual Effects Sandbox</h1>
        <p className="text-gray-400 text-center">Preview of visual effects used in the VYRUS game</p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
        {visualEffects.map((effect, index) => (
          <div 
            key={index}
            className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700 hover:border-gray-600 transition-all duration-300"
          >
            <h3 className="text-lg font-bold font-pixy mb-3 text-center">{effect}</h3>
            <div className="aspect-square w-full flex items-center justify-center">
              <canvas
                ref={el => canvasRefs.current[index] = el}
                width={200}
                height={200}
                className="w-full h-full rounded-lg bg-gray-900"
              />
            </div>
            <p className="text-sm text-gray-400 mt-2 text-center">
              Visual effect simulation
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-xl max-w-4xl mx-auto">
        <h3 className="text-xl font-bold font-pixy mb-2">Visual Effects Description</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li><span className="font-bold">Attack Effect:</span> Visual representation of virus attacks</li>
          <li><span className="font-bold">Expansion Effect:</span> Animation for virus expansion to new areas</li>
          <li><span className="font-bold">Parameter Effect:</span> Visual feedback for high parameter values</li>
          <li><span className="font-bold">Interaction Effect:</span> Representation of virus interactions</li>
          <li><span className="font-bold">Wave Effect:</span> Circular wave animations for captures and attacks</li>
          <li><span className="font-bold">Expansion Source Effect:</span> Origin point of expansion</li>
          <li><span className="font-bold">Expansion Path Effect:</span> Path of expansion movement</li>
          <li><span className="font-bold">Expansion Target Effect:</span> Destination of expansion</li>
          <li><span className="font-bold">Mutation Effect:</span> Visual effect for mutation parameter</li>
          <li><span className="font-bold">Defense Effect:</span> Visual effect for defense parameter</li>
        </ul>
      </div>
    </div>
  );
};

export default VisualEffectsSandbox;