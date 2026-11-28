self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Only handle GET requests with http/https scheme
  if (event.request.method !== 'GET') return;
  if (!url.startsWith('http')) return;

  // Skip cross-origin requests entirely — let them go through the network directly
  // This prevents SW errors for external URLs (mixkit.co, supabase.co, etc.)
  if (!url.startsWith(self.location.origin)) return;

  // Skip Next.js internal routes (_next/static, _next/image, api, RSC prefetch)
  if (
    url.includes('/_next/') ||
    url.includes('/api/') ||
    url.includes('_rsc=') ||
    event.request.headers.get('RSC') === '1'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(async () => {
        if (event.request.mode === 'navigate') {
          const cachedHome = await caches.match('/');
          if (cachedHome) return cachedHome;
          const cachedOffline = await caches.match('/offline.html');
          if (cachedOffline) return cachedOffline;
        }
        return Response.error();
      });
    })
  );
});
