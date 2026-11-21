// Service Worker MarketPoás - versión 2 (menos agresivo)
// En dev, solo cacheamos archivos estáticos, no páginas ni APIs
const CACHE_NAME = 'marketpoas-v2';
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // No interceptar APIs - siempre al network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // No interceptar peticiones a otros dominios (HMR, fuentes, etc.)
  if (url.origin !== self.location.origin) {
    return;
  }

  // En navegación (HTML): network-first, sin fallback offline (mejor en dev)
  if (request.mode === 'navigate') {
    return; // Let browser handle it
  }

  // Para assets estáticos (imágenes, manifest): cache-first
  if (
    url.pathname === '/manifest.json' ||
    url.pathname.startsWith('/icon-') ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});
