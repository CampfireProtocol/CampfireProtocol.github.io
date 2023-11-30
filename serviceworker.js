// service-worker.js

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
  
    // Check if the request is to the local domain
    if (url.origin === location.origin) {
      event.respondWith(fetchWithProxy(event.request));
    } else {
      event.respondWith(fetch(event.request));
    }
  });
  
  async function fetchWithProxy(request) {
    try {
      // Modify the request to use the proxy
      const proxyURL = 'https://corsproxy.io/?'; // Replace with your actual proxy URL
      const proxiedRequest = new Request(proxyURL, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' ? request.body : null,
        mode: 'cors',
        credentials: 'same-origin',
        redirect: 'follow',
      });
  
      const response = await fetch(proxiedRequest);
      return response;
    } catch (error) {
      // Handle fetch errors
      console.error('Fetch failed:', error);
      return new Response(null, { status: 500, statusText: 'Fetch failed' });
    }
  }