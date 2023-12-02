// service-worker.js

async function fetchWithProxy(url) {
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const data = await response.json();
      return data.contents;
    } else {
      throw new Error('Network response was not ok.');
    }
  } catch (error) {
    if (url.startsWith(window.x_proxy_backup)) {
      console.log("Fetching:" + window.x_proxy_backup);
      return fetch(url);
    } else {
      console.log("fetching:" + window.x_proxy_backup + url);
      return fetch(window.x_proxy_backup + url);
    }
  }
}


self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Check if the requested resource is in the cache
      if (cachedResponse) {
        // If found in cache, respond with the cached resource
        return cachedResponse;
      } else {
        // If not found in cache, fetch from the network
        return fetchWithProxy(event.request).then(networkResponse => {
          // Cache the fetched response for future use
          caches.open('browser').then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
          // Return the fetched response
          return networkResponse;
        }).catch(error => {
          // Handle fetch errors
          console.error('Fetch error:', error);
        });
      }
    })
  );
});
