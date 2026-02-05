import React, { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '../store/languageStore';

const AnimationSandbox: React.FC = () => {
  const { t } = useLanguageStore(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [activeAnimation, setActiveAnimation] = useState<number | null>(null);
  const canvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);

  // Animation names
  const animations = [
    "Viral Spread",
    "DNA Helix Formation", 
    "Cell Division",
    "Viral Particle Assembly",
    "Infection Trail",
    "Microscopic View",
    "Binary Code Transition",
    "Electron Microscope Scan",
    "Viral Capsid Explosion/Implosion",
    "Bioluminescent Glow"
  ];

  // Set up canvas references
  useEffect(() => {
    canvasRefs.current = canvasRefs.current.slice(0, animations.length);
  }, []);

  // Viral Spread Animation
  const drawViralSpread = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4 * (0.5 + 0.5 * Math.sin(time * 0.005 + index));
    
    // Draw spreading particles
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + time * 0.001 * (i + 1);
      const distance = radius * Math.sin(time * 0.002 + i) * 0.7;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const size = 3 + Math.sin(time * 0.01 + i) * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(time * 0.1 + i * 20) % 360}, 80%, 60%)`;
      ctx.fill();
    }
  };

  // DNA Helix Formation Animation
  const drawDNAHelix = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const width = ctx.canvas.width * 0.8;
    const height = ctx.canvas.height * 0.8;
    
    ctx.beginPath();
    
    // Draw double helix
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 8 + time * 0.002;
      const x1 = centerX - width/4 + (t * width/2);
      const y1 = centerY - height/2 + (t * height);
      const x2 = centerX + width/4 + (t * width/2);
      const y2 = centerY - height/2 + (t * height);
      
      const offsetX1 = Math.cos(angle) * 20;
      const offsetY1 = Math.sin(angle * 2) * 10;
      const offsetX2 = Math.cos(angle + Math.PI) * 20;
      const offsetY2 = Math.sin(angle * 2 + Math.PI) * 10;
      
      if (i === 0) {
        ctx.moveTo(x1 + offsetX1, y1 + offsetY1);
      } else {
        ctx.lineTo(x1 + offsetX1, y1 + offsetY1);
      }
      
      if (i === 0) {
        ctx.moveTo(x2 + offsetX2, y2 + offsetY2);
      } else {
        ctx.lineTo(x2 + offsetX2, y2 + offsetY2);
      }
    }
    
    ctx.strokeStyle = `hsl(${(time * 0.5 + index * 30) % 360}, 80%, 60%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw connecting bars
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      const angle = t * Math.PI * 8 + time * 0.002;
      const x1 = centerX - width/4 + (t * width/2) + Math.cos(angle) * 20;
      const y1 = centerY - height/2 + (t * height) + Math.sin(angle * 2) * 10;
      const x2 = centerX + width/4 + (t * width/2) + Math.cos(angle + Math.PI) * 20;
      const y2 = centerY - height/2 + (t * height) + Math.sin(angle * 2 + Math.PI) * 10;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsl(${(time * 0.5 + index * 30 + 180) % 360}, 80%, 60%)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  // Cell Division Animation
  const drawCellDivision = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const baseRadius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.3;
    
    // Draw parent cell
    const parentRadius = baseRadius * (0.8 + 0.2 * Math.sin(time * 0.003));
    ctx.beginPath();
    ctx.arc(centerX, centerY, parentRadius, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${(time * 0.2 + index * 40) % 360}, 80%, 60%, 0.7)`;
    ctx.fill();
    ctx.strokeStyle = `hsl(${(time * 0.2 + index * 40) % 360}, 80%, 40%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw division effect
    const divisionProgress = (Math.sin(time * 0.005) + 1) / 2;
    const separation = divisionProgress * baseRadius;
    
    // Draw daughter cells
    ctx.beginPath();
    ctx.arc(centerX - separation, centerY, baseRadius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${(time * 0.2 + index * 40 + 120) % 360}, 80%, 60%, 0.7)`;
    ctx.fill();
    ctx.strokeStyle = `hsl(${(time * 0.2 + index * 40 + 120) % 360}, 80%, 40%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX + separation, centerY, baseRadius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${(time * 0.2 + index * 40 + 240) % 360}, 80%, 60%, 0.7)`;
    ctx.fill();
    ctx.strokeStyle = `hsl(${(time * 0.2 + index * 40 + 240) % 360}, 80%, 40%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Viral Particle Assembly Animation
  const drawViralAssembly = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.3;
    
    // Draw central core
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(time * 0.3 + index * 50) % 360}, 80%, 60%)`;
    ctx.fill();
    
    // Draw capsomers orbiting and attaching
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.002;
      const distance = radius * (0.7 + 0.3 * Math.sin(time * 0.005 + i));
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Draw orbiting capsomer
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(time * 0.3 + index * 50 + i * 30) % 360}, 80%, 70%)`;
      ctx.fill();
      
      // Draw attached capsomer (when close to final position)
      const attachProgress = Math.min(1, Math.max(0, Math.sin(time * 0.003 + i) * 0.5 + 0.5));
      const attachX = centerX + Math.cos(angle) * radius * 0.6 * attachProgress;
      const attachY = centerY + Math.sin(angle) * radius * 0.6 * attachProgress;
      
      ctx.beginPath();
      ctx.arc(attachX, attachY, radius * 0.1 * (0.5 + 0.5 * attachProgress), 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(time * 0.3 + index * 50 + i * 30) % 360}, 80%, 60%)`;
      ctx.fill();
    }
  };

  // Infection Trail Animation
  const drawInfectionTrail = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4;
    
    // Draw infection trail
    for (let i = 0; i < 30; i++) {
      const progress = (time * 0.001 + i * 0.1) % 1;
      const angle = progress * Math.PI * 2;
      const distance = radius * progress;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const size = 3 + Math.sin(time * 0.01 + i) * 2;
      const alpha = 1 - progress;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(time * 0.2 + index * 60 + i * 10) % 360}, 80%, 60%, ${alpha})`;
      ctx.fill();
    }
    
    // Draw central infected area
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.2, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius * 0.2
    );
    gradient.addColorStop(0, `hsla(${(time * 0.2 + index * 60) % 360}, 80%, 60%, 1)`);
    gradient.addColorStop(1, `hsla(${(time * 0.2 + index * 60) % 360}, 80%, 60%, 0)`);
    ctx.fillStyle = gradient;
    ctx.fill();
  };

  // Microscopic View Animation
  const drawMicroscopicView = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4;
    
    // Draw "microscope" circular area
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();
    
    // Draw floating particles
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2 + time * 0.001 * (i + 1);
      const distance = radius * 0.7 * (0.5 + 0.5 * Math.sin(time * 0.002 + i));
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const size = 2 + Math.sin(time * 0.02 + i) * 1.5;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(time * 0.3 + index * 40 + i * 24) % 360}, 80%, 70%, 0.8)`;
      ctx.fill();
      
      // Draw connections between particles
      if (i > 0) {
        const prevAngle = ((i-1) / 15) * Math.PI * 2 + time * 0.001 * i;
        const prevDistance = radius * 0.7 * (0.5 + 0.5 * Math.sin(time * 0.002 + i - 1));
        
        const prevX = centerX + Math.cos(prevAngle) * prevDistance;
        const prevY = centerY + Math.sin(prevAngle) * prevDistance;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(prevX, prevY);
        ctx.strokeStyle = `hsla(${(time * 0.3 + index * 40 + i * 24) % 360}, 80%, 70%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    
    // Draw focus ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${(time * 0.5 + index * 60) % 360}, 80%, 60%, 0.5)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore(); // Restore clipping region
  };

  // Binary Code Transition Animation
  const drawBinaryCode = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const fontSize = Math.max(10, ctx.canvas.width / 10);
    
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw binary stream
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 10; j++) {
        const x = (j / 10) * ctx.canvas.width;
        const y = (i / 20) * ctx.canvas.height;
        
        const char = Math.random() > 0.5 ? '1' : '0';
        const alpha = Math.abs(Math.sin(time * 0.005 + i + j)) * 0.8;
        
        ctx.fillStyle = `hsla(${(time * 0.2 + index * 30 + i * 10) % 360}, 80%, 60%, ${alpha})`;
        ctx.fillText(char, x, y);
      }
    }
    
    // Draw "VYRUS" emerging from binary
    const emergeProgress = Math.abs(Math.sin(time * 0.002)) * 0.5 + 0.5;
    ctx.globalAlpha = emergeProgress;
    ctx.fillStyle = `hsl(${(time * 0.3 + index * 50) % 360}, 80%, 60%)`;
    ctx.font = `${fontSize * 1.5}px PIXY, monospace`;
    ctx.fillText("VYRUS", centerX, centerY);
    ctx.globalAlpha = 1.0;
  };

  // Electron Microscope Scan Animation
  const drawElectronScan = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4;
    
    // Draw background grid
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 20; i++) {
      const x = (i / 19) * ctx.canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }
    
    for (let i = 0; i < 20; i++) {
      const y = (i / 19) * ctx.canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
    
    // Draw scanning line
    const scanPos = (Math.sin(time * 0.003) + 1) / 2;
    const scanY = scanPos * ctx.canvas.height;
    
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(ctx.canvas.width, scanY);
    ctx.strokeStyle = `hsl(${(time * 0.4 + index * 70) % 360}, 100%, 60%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw glow effect
    const gradient = ctx.createLinearGradient(0, scanY - 10, 0, scanY + 10);
    gradient.addColorStop(0, `hsla(${(time * 0.4 + index * 70) % 360}, 100%, 60%, 0)`);
    gradient.addColorStop(0.5, `hsla(${(time * 0.4 + index * 70) % 360}, 100%, 60%, 0.5)`);
    gradient.addColorStop(1, `hsla(${(time * 0.4 + index * 70) % 360}, 100%, 60%, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, scanY - 10, ctx.canvas.width, 20);
    
    // Draw "VYRUS" appearing where scanned
    ctx.font = `${Math.max(10, ctx.canvas.height / 8)}px PIXY, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textY = scanY;
    ctx.fillStyle = `hsl(${(time * 0.4 + index * 70) % 360}, 100%, 60%)`;
    ctx.fillText("VYRUS", centerX, textY);
  };

  // Viral Capsid Explosion/Implosion Animation
  const drawCapsidExplosion = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.3;
    
    // Determine explosion vs implosion based on time
    const cycle = Math.floor(time * 0.0005) % 2;
    const progress = cycle === 0 
      ? (Math.sin(time * 0.005) + 1) / 2  // Explosion
      : 1 - (Math.sin(time * 0.005) + 1) / 2;  // Implosion
    
    // Draw capsomers
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      
      // Starting position (center for implosion, spread for explosion)
      const startX = cycle === 1 ? centerX + Math.cos(angle) * radius * progress : centerX;
      const startY = cycle === 1 ? centerY + Math.sin(angle) * radius * progress : centerY;
      
      // Ending position (spread for explosion, center for implosion)
      const endX = cycle === 0 ? centerX + Math.cos(angle) * radius * progress : centerX + Math.cos(angle) * radius;
      const endY = cycle === 0 ? centerY + Math.sin(angle) * radius * progress : centerY + Math.sin(angle) * radius;
      
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      
      const size = 5 + Math.sin(time * 0.01 + i) * 3;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(time * 0.3 + index * 40 + i * 18) % 360}, 80%, 60%)`;
      ctx.fill();
      
      // Draw connecting lines for structure
      if (i > 0) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        const prevAngle = ((i-1) / 20) * Math.PI * 2;
        const prevX = cycle === 0 
          ? centerX + Math.cos(prevAngle) * radius * progress 
          : centerX + Math.cos(prevAngle) * radius;
        const prevY = cycle === 0 
          ? centerY + Math.sin(prevAngle) * radius * progress 
          : centerY + Math.sin(prevAngle) * radius;
        ctx.lineTo(prevX, prevY);
        ctx.strokeStyle = `hsla(${(time * 0.3 + index * 40 + i * 18) % 360}, 80%, 60%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  };

  // Bioluminescent Glow Animation
  const drawBioluminescent = (ctx: CanvasRenderingContext2D, time: number, index: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4;
    
    // Draw central glowing core
    const coreSize = radius * 0.2;
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, coreSize
    );
    gradient.addColorStop(0, `hsla(${(time * 0.2 + index * 50) % 360}, 100%, 80%, 1)`);
    gradient.addColorStop(1, `hsla(${(time * 0.2 + index * 50) % 360}, 100%, 60%, 0)`);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw orbiting particles with glow
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.002 * (i + 1);
      const distance = radius * (0.5 + 0.3 * Math.sin(time * 0.003 + i));
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const size = 4 + Math.sin(time * 0.01 + i * 2) * 2;
      
      // Draw glow
      const particleGradient = ctx.createRadialGradient(
        x, y, 0,
        x, y, size * 3
      );
      particleGradient.addColorStop(0, `hsla(${(time * 0.2 + index * 50 + i * 45) % 360}, 100%, 80%, 0.8)`);
      particleGradient.addColorStop(0.5, `hsla(${(time * 0.2 + index * 50 + i * 45) % 360}, 100%, 60%, 0.3)`);
      particleGradient.addColorStop(1, `hsla(${(time * 0.2 + index * 50 + i * 45) % 360}, 100%, 40%, 0)`);
      
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fillStyle = particleGradient;
      ctx.fill();
      
      // Draw core particle
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(time * 0.2 + index * 50 + i * 45) % 360}, 100%, 70%)`;
      ctx.fill();
    }
    
    // Draw text with glow effect
    ctx.font = `${Math.max(10, ctx.canvas.height / 8)}px PIXY, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Outer glow
    ctx.shadowColor = `hsl(${(time * 0.2 + index * 50) % 360}, 100%, 60%)`;
    ctx.shadowBlur = 15;
    ctx.fillStyle = `hsl(${(time * 0.2 + index * 50) % 360}, 100%, 80%)`;
    ctx.fillText("VYRUS", centerX, centerY);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  };

  // Animation loop for each canvas
  useEffect(() => {
    const animate = () => {
      const time = Date.now();
      
      animations.forEach((_, index) => {
        const canvas = canvasRefs.current[index];
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            switch(index) {
              case 0: drawViralSpread(ctx, time, index); break;
              case 1: drawDNAHelix(ctx, time, index); break;
              case 2: drawCellDivision(ctx, time, index); break;
              case 3: drawViralAssembly(ctx, time, index); break;
              case 4: drawInfectionTrail(ctx, time, index); break;
              case 5: drawMicroscopicView(ctx, time, index); break;
              case 6: drawBinaryCode(ctx, time, index); break;
              case 7: drawElectronScan(ctx, time, index); break;
              case 8: drawCapsidExplosion(ctx, time, index); break;
              case 9: drawBioluminescent(ctx, time, index); break;
              default: break;
            }
          }
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white overflow-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-pixy text-center mb-2">VYRUS Animation Sandbox</h1>
        <p className="text-gray-400 text-center">Preview of 10 creative animations for the VYRUS title</p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
        {animations.map((animation, index) => (
          <div 
            key={index}
            className={`bg-gray-800 rounded-xl p-4 border-2 transition-all duration-300 ${
              activeAnimation === index 
                ? 'border-blue-500 bg-gray-750 shadow-lg shadow-blue-500/20' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => setActiveAnimation(activeAnimation === index ? null : index)}
          >
            <h3 className="text-lg font-bold font-pixy mb-3 text-center">{animation}</h3>
            <div className="aspect-square w-full flex items-center justify-center">
              <canvas
                ref={el => canvasRefs.current[index] = el}
                width={200}
                height={200}
                className="w-full h-full rounded-lg bg-gray-900"
              />
            </div>
            <p className="text-sm text-gray-400 mt-2 text-center">
              Click to {activeAnimation === index ? 'deactivate' : 'activate'} preview
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-xl max-w-4xl mx-auto">
        <h3 className="text-xl font-bold font-pixy mb-2">Animation Descriptions</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li><span className="font-bold">Viral Spread:</span> Particles emanate from center like a spreading virus</li>
          <li><span className="font-bold">DNA Helix Formation:</span> Double helix structure forms the letters</li>
          <li><span className="font-bold">Cell Division:</span> Single cell splits to form the word</li>
          <li><span className="font-bold">Viral Particle Assembly:</span> Capsomers assemble into viral structure</li>
          <li><span className="font-bold">Infection Trail:</span> Particles trace a path like infection spreading</li>
          <li><span className="font-bold">Microscopic View:</span> Floating particles in microscope-like view</li>
          <li><span className="font-bold">Binary Code Transition:</span> Word emerges from binary code stream</li>
          <li><span className="font-bold">Electron Microscope Scan:</span> Scanning line reveals the word</li>
          <li><span className="font-bold">Viral Capsid Explosion/Implosion:</span> Capsomers explode or implode in sequence</li>
          <li><span className="font-bold">Bioluminescent Glow:</span> Soft glowing particles with luminescent effect</li>
        </ul>
      </div>
    </div>
  );
};

export default AnimationSandbox;