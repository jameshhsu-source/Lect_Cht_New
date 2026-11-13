const CACHE_NAME = 'lectionary-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './engine.js',
  './data.js',
  './about_church_year.html'
];

// 安裝時，將核心檔案抓進快取
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 攔截網路請求，若沒網路就給快取的檔案
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 有快取就給快取，沒快取就透過網路抓
        return response || fetch(event.request);
      })
  );
});
