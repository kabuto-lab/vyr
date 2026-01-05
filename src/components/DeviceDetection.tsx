/**
 * DeviceDetection Component
 *
 * This component handles device detection and responsive behavior for the VYRUS game.
 * It detects mobile devices, screen orientation, and adjusts the UI accordingly.
 * The implementation follows the logic described in the VYRUS v2 device detection plan.
 */

import React, { useState, useEffect } from 'react';

interface DeviceContextProps {
  isMobile: boolean;
  isPortrait: boolean;
  isSafari: boolean;
  dpr: number;
  width: number;
  height: number;
  mobileGridCols: number;
  mobileGridRows: number;
  maxTentaclesMobile: number;
}

const DeviceDetection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceState, setDeviceState] = useState<DeviceContextProps>({
    isMobile: false,
    isPortrait: false,
    isSafari: false,
    dpr: 1,
    width: window.innerWidth,
    height: window.innerHeight,
    mobileGridCols: 100,  // Default desktop grid
    mobileGridRows: 50,   // Default desktop grid
    maxTentaclesMobile: 30, // Default desktop tentacles
  });

  useEffect(() => {
    // Device detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;

    // Set mobile-specific grid dimensions and tentacle limits
    const mobileGridCols = isMobile ? 70 : 100;
    const mobileGridRows = isMobile ? 35 : 50;
    const maxTentaclesMobile = isMobile ? 10 : 30; // Reduced tentacles on mobile

    setDeviceState({
      isMobile,
      isPortrait,
      isSafari,
      dpr: isMobile ? (window.devicePixelRatio || 1) : 1,
      width: window.innerWidth,
      height: window.innerHeight,
      mobileGridCols,
      mobileGridRows,
      maxTentaclesMobile,
    });

    // Handle orientation changes
    const handleOrientationChange = () => {
      const newIsPortrait = window.matchMedia("(orientation: portrait)").matches;
      setDeviceState(prev => ({
        ...prev,
        isPortrait: newIsPortrait,
        width: window.innerWidth,
        height: window.innerHeight,
      }));
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // If mobile and in portrait, show a message to rotate the device
  if (deviceState.isMobile && deviceState.isPortrait) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white z-[1000]">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-4">Rotate Your Device</h1>
          <p className="text-lg">Please rotate your device to landscape mode to play VYRUS.</p>
          <div className="mt-6 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Return children with device context
  return <>{children}</>;
};

export default DeviceDetection;