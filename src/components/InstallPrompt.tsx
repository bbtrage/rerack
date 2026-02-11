import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

// Configuration constants
const DISMISSAL_DURATION_DAYS = 3;
const PROMPT_DELAY_MS = 3000; // 3 seconds

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if prompt was dismissed recently
    const dismissedAt = localStorage.getItem('installPromptDismissed');
    const dismissalThreshold = Date.now() - (DISMISSAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
    const shouldShow = !dismissedAt || parseInt(dismissedAt) < dismissalThreshold;

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      if (shouldShow && !standalone) {
        // Show prompt after a short delay to not be intrusive
        setTimeout(() => setShowPrompt(true), PROMPT_DELAY_MS);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS prompt if on iOS and not installed
    if (ios && !standalone && shouldShow) {
      setTimeout(() => setShowPrompt(true), PROMPT_DELAY_MS);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  // Don't show if dismissed
  if (!showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50"
      >
        <div className="glass-dark rounded-2xl p-6 border border-white/10 shadow-2xl">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Icon */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-accent-blue" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1 pr-6">Install ReRack</h3>
              <p className="text-sm text-gray-400 mb-4">
                Add to home screen for the best experience — works offline!
              </p>

              {isIOS ? (
                // iOS Instructions
                <div className="text-sm text-gray-300 space-y-2">
                  <p className="flex items-center gap-2">
                    Tap
                    <svg className="w-5 h-5 text-accent-blue" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-2V4.83L9.42 6.42 8 5l4-4zm4 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .9 2 2z" />
                    </svg>
                    then "Add to Home Screen"
                  </p>
                </div>
              ) : (
                // Android/Chrome Install Button
                <div className="flex gap-3">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Install
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
