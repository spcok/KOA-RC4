import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useOrgSettings } from '../../features/settings/useOrgSettings';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PwaManager: React.FC = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { settings } = useOrgSettings();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).deferredPWAInstall) {
      // eslint-disable-next-line react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any
      setDeferredPrompt((window as any).deferredPWAInstall);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (settings?.logo_url) {
      // Update Favicon
      let linkIcon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!linkIcon) {
        linkIcon = document.createElement('link');
        linkIcon.rel = 'icon';
        document.head.appendChild(linkIcon);
      }
      linkIcon.href = settings.logo_url;

      // Update Apple Touch Icon
      let linkApple = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (!linkApple) {
        linkApple = document.createElement('link');
        linkApple.rel = 'apple-touch-icon';
        document.head.appendChild(linkApple);
      }
      linkApple.href = settings.logo_url;

      // Update Manifest
      const manifest = {
        name: settings.org_name || "App",
        short_name: "App",
        display: "standalone",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        icons: [
          { src: settings.logo_url, sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: settings.logo_url, sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      };

      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
      const manifestUrl = URL.createObjectURL(blob);

      let linkManifest = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
      if (!linkManifest) {
        linkManifest = document.createElement('link');
        linkManifest.rel = 'manifest';
        document.head.appendChild(linkManifest);
      }
      linkManifest.href = manifestUrl;

      return () => {
        URL.revokeObjectURL(manifestUrl);
      };
    }
  }, [settings?.logo_url, settings?.org_name]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    // Force reload to kill the loop
    setTimeout(() => window.location.reload(), 500);
  };

  if (!needRefresh && !deferredPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 flex justify-center pointer-events-none">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 flex items-center gap-4 pointer-events-auto max-w-md w-full">
        <div className="flex-1">
          {needRefresh ? (
            <p className="text-sm font-medium text-slate-800">A new version is available.</p>
          ) : (
            <p className="text-sm font-medium text-slate-800">Install app for offline use.</p>
          )}
        </div>
        <div>
          {needRefresh ? (
            <button
              onClick={handleUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Update Now
            </button>
          ) : deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Install App
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PwaManager;
