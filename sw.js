// service-worker.js

async function fetchWithProxy(url) {
  try {
    const response = await fetch(`https://cdn.uartech.uk/${window.x_host}${encodeURIComponent(url)}`);
    if (response.ok) {
      return response
      /*
      const data = await response.json();
      console.log(data.contents);
      return data.contents;
      */
    } else {
      throw new Error(`Failed to fetch: ${url}, status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error during fetchWithProxy:', error);
    if (url.startsWith(window.x_proxy)) {
      console.log("Fetching:" + window.x_proxy);
      return fetch(url);
    } else {
      console.log("fetching:" + window.x_proxy + url);
      return fetch(window.x_proxy + url);
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
