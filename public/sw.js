self.addEventListener('fetch', (event) => {
  // Only handle requests with http or https schemes
  if (!(event.request.url.indexOf('http') === 0)) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(error => {
        if (event.request.mode === 'navigate') {
          console.error('Fetch failed; returning offline page instead.', error);
          return caches.match('/offline.html'); // Fallback to a cached asset
        }
        throw error;
      });
    })
  );
});
