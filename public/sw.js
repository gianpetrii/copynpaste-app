const CACHE_NAME = 'copynpaste-v1.0.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;

// Archivos estáticos a cachear inmediatamente
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/maskable-icon-512x512.svg',
  '/apple-touch-icon.svg',
  // Next.js genera estos archivos automáticamente
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
  // Fuentes de Google Fonts si las usas
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// URLs que no deben cachearse
const EXCLUDED_URLS = [
  '/api/auth',
  'https://identitytoolkit.googleapis.com',
  'https://securetoken.googleapis.com',
  'https://firestore.googleapis.com',
  'https://firebase.googleapis.com'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files');
        // Intentar cachear archivos estáticos, pero no fallar si algunos no existen
        return Promise.allSettled(
          STATIC_FILES.map(url => 
            cache.add(url).catch(err => {
              console.warn(`⚠️ Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Reclamar control de todas las pestañas
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: Activation complete');
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Solo manejar requests GET
  if (method !== 'GET') return;

  // No cachear URLs excluidas
  if (EXCLUDED_URLS.some(excludedUrl => url.includes(excludedUrl))) {
    return;
  }

  // Estrategia de cache
  if (url.includes('/_next/static/') || url.includes('/icons/') || url.includes('/manifest.json')) {
    // Cache First para archivos estáticos
    event.respondWith(cacheFirst(request));
  } else if (url.includes('firebasestorage.googleapis.com')) {
    // Cache First para archivos de Firebase Storage
    event.respondWith(cacheFirst(request));
  } else {
    // Network First para contenido dinámico
    event.respondWith(networkFirst(request));
  }
});

// Estrategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Página offline de fallback
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/') || 
        new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>CopyNPaste - Offline</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; }
              .offline { color: #666; }
            </style>
          </head>
          <body>
            <h1>📋 CopyNPaste</h1>
            <p class="offline">Sin conexión a internet</p>
            <p>Por favor, verifica tu conexión e intenta de nuevo.</p>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
      return offlineResponse;
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Limpiar caches periódicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.includes('copynpaste')) {
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
}); 