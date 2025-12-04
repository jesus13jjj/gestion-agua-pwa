// 📦 Nombre del caché (cámbialo si haces cambios grandes)
const CACHE = 'aquanet-v4';

// 🧱 Recursos base que se precachean (App Shell)
const APP_SHELL = [
  '/',
  '/index.html',
  '/panel.html',
  '/info.html',
  '/index.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline/offline.html'
];

// -----------------------------
// 🧩 INSTALL EVENT: precargar recursos con manejo de errores
// -----------------------------
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando y precacheando...');
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      for (const url of APP_SHELL) {
        try {
          await cache.add(url);
          console.log(`[SW] Cacheado: ${url}`);
        } catch (err) {
          console.warn(`[SW] No se pudo cachear ${url}:`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// -----------------------------
// ♻️ ACTIVATE EVENT: limpiar cachés viejos
// -----------------------------
self.addEventListener('activate', (event) => {
  console.log('[SW] Activado. Limpiando cachés antiguos...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// -----------------------------
// 🌐 FETCH EVENT: manejo inteligente de recursos
// -----------------------------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ❗ Evita interceptar autenticaciones o llamadas a backend real
  if (
    url.origin.includes('localhost:3001') && (
      url.pathname.startsWith('/auth') ||
      url.pathname.startsWith('/api')
    )
  ) {
    return; // deja pasar la solicitud directamente
  }

  // 🧭 Navegaciones HTML → network-first con fallback offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req.url, copy));
          return res;
        })
        .catch(async () => {
          const c = await caches.open(CACHE);
          return (
            (await c.match(req.url)) ||
            (await c.match('/index.html')) ||
            (await c.match('/offline/offline.html'))
          );
        })
    );
    return;
  }

  // 🧱 Archivos estáticos (CSS, JS, imágenes, fuentes) → cache-first
  if (['style', 'script', 'image', 'font'].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then(hit =>
        hit ||
        fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        }).catch(() => hit)
      )
    );
    return;
  }

  // 🌐 Por defecto: intentar red, luego caché
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
