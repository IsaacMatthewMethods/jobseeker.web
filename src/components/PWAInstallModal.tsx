import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle, Sparkles } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 p-0.5 shadow-lg flex items-center justify-center">
              <img src="/icon.svg" alt="JobSeeker Pro" className="w-10 h-10 rounded-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                Install JobSeeker Pro
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              </h3>
              <p className="text-xs text-sky-200">Native mobile experience on your device</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Install JobSeeker Pro on your home screen for full-screen mode, faster loading, and instant job application tracking.
          </p>

          {isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-500" />
                iOS Safari Instructions
              </h4>
              
              <div className="flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                  1
                </div>
                <div className="flex-1">
                  Tap the <strong className="text-sky-600 dark:text-sky-400 inline-flex items-center gap-1"><Share className="w-3.5 h-3.5" /> Share</strong> button in Safari's bottom toolbar.
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                  2
                </div>
                <div className="flex-1">
                  Scroll down the share sheet and tap <strong className="text-slate-900 dark:text-white inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-sky-500" /> Add to Home Screen</strong>.
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                  3
                </div>
                <div className="flex-1">
                  Tap <strong className="text-slate-900 dark:text-white font-bold">Add</strong> in the top-right corner to finish.
                </div>
              </div>
            </div>
          ) : (
            /* General Browser Instructions */
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Launch instantly without browser address bars</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Works offline and saves cached job postings</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>High-performance mobile UI optimized for touch</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
