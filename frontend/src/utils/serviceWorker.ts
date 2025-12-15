// Service Worker registration and management utilities

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export function registerServiceWorker(config?: ServiceWorkerConfig) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[App] Service Worker registered:', registration);

          // Check for updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  console.log('[App] New content available, please refresh.');
                  config?.onUpdate?.(registration);
                } else {
                  // Content cached for offline use
                  console.log('[App] Content cached for offline use.');
                  config?.onSuccess?.(registration);
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('[App] Service Worker registration failed:', error);
        });
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('[App] Back online');
      config?.onOnline?.();
    });

    window.addEventListener('offline', () => {
      console.log('[App] Gone offline');
      config?.onOffline?.();
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('[App] Service Worker unregistration failed:', error);
      });
  }
}

export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
    });
  }
}

export function skipWaiting() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
}

export function clearCache() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}
