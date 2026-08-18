import React, { useState } from 'react';
import { Download, X, Smartphone, Sparkles, ChevronRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallBannerProps {
  onInstallStateChange?: (installed: boolean) => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = () => {
  const {
    canInstall,
    isInstalled,
    isIOS,
    hasNativePrompt,
    isDismissed,
    promptInstall,
    dismissBanner
  } = usePWAInstall();

  const [showModal, setShowModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running standalone or dismissed for this session, hide banner
  if (isInstalled || isDismissed || !canInstall) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS || !hasNativePrompt) {
      // On iOS or browsers without direct beforeinstallprompt, open helpful guide
      setShowModal(true);
      return;
    }

    setIsInstalling(true);
    try {
      const outcome = await promptInstall();
      if (outcome === 'unsupported' || outcome === 'dismissed') {
        // Fallback to guide if needed
        if (outcome === 'unsupported') {
          setShowModal(true);
        }
      }
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      {/* Floating Bottom / Mobile Banner */}
      <aside 
        aria-label="App Installation"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slide-up"
      >
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-sky-500/30 flex items-center justify-between gap-3 relative overflow-hidden">
          {/* Subtle glowing background highlight */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center space-x-3 min-w-0">
            {/* App Icon */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 p-0.5 shadow-md flex items-center justify-center">
                <img src="/icon.svg" alt="JobSeeker Pro Icon" className="w-9 h-9 rounded-lg object-cover" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
            </div>

            {/* Texts */}
            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  Install JobSeeker Pro
                </h4>
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
                  App
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                {isIOS ? 'Add to Home Screen for fast mobile access' : '1-tap access, instant alerts & offline mode'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              id="pwa-install-banner-btn"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstalling ? 'Installing...' : 'Install'}</span>
            </button>

            <button
              onClick={dismissBanner}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dismiss"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Guide modal for iOS and manual installation */}
      <PWAInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isIOS={isIOS}
      />
    </>
  );
};
