import { jsx as _jsx } from "react/jsx-runtime";
/**
 * FullscreenButton Component
 *
 * This component provides a fullscreen button for mobile devices,
 * specifically designed to work around iOS Safari limitations.
 * It helps hide the address bar and navigation panels on mobile devices.
 */
import { useEffect, useState } from 'react';
const FullscreenButton = () => {
    const [showButton, setShowButton] = useState(false);
    useEffect(() => {
        // Detect if the device is mobile and specifically iOS Safari
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        // Only show the button on mobile devices
        if (isMobile) {
            setShowButton(true);
        }
    }, []);
    const handleFullscreen = () => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isMobile && isSafari) {
            // For iOS Safari - scroll to top to hide address bar
            window.scrollTo(0, 0);
            // Fix body height to 100vh to maintain consistent viewport
            document.body.style.height = "100vh";
            document.body.style.overflow = "hidden";
            // Reset canvas after a delay to adjust to new viewport size
            setTimeout(() => {
                // Dispatch a custom event to notify other components to reset canvas
                window.dispatchEvent(new CustomEvent('resetCanvas'));
            }, 300);
        }
        else if (document.documentElement.requestFullscreen) {
            // For other browsers that support fullscreen API
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn(`Fullscreen request failed: ${err.message}`);
                // Show fallback message
                alert("To get the best experience, add this app to your home screen: tap the share button and select 'Add to Home Screen'");
            });
        }
        else {
            // Show fallback message for browsers that don't support fullscreen
            alert("To get the best experience, add this app to your home screen: tap the share button and select 'Add to Home Screen'");
        }
    };
    // Only render the button if on a mobile device
    if (!showButton) {
        return null;
    }
    return (_jsx("button", { id: "fullscreen-btn", onClick: handleFullscreen, style: {
            position: 'fixed',
            top: 'env(safe-area-inset-top, 0)',
            right: '10px',
            zIndex: 1000,
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
        }, className: "hidden md:hidden" // Hide on desktop using Tailwind classes
        , children: "\u26F6 Fullscreen" }));
};
export default FullscreenButton;
