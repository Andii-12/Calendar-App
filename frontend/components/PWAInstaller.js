import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);
    
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if already installed by checking if app is in standalone mode
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  // Don't render during server-side rendering
  if (!isClient) {
    return null;
  }

  // Don't show if already installed or dismissed this session
  if (isInstalled || isStandalone || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  // iOS installation instructions
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Smartphone className="h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">Install Calendar App</h3>
              <p className="text-xs opacity-90 mt-1">
                Tap the share button <span className="inline-block">⎋</span> and select "Add to Home Screen"
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Android/Desktop installation prompt
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Download className="h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">Install Calendar App</h3>
              <p className="text-xs opacity-90 mt-1">
                Get quick access and work offline
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstaller;
