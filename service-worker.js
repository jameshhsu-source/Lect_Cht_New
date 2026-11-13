const CACHE_NAME = 'lectionary-cache-v4';
const urlsToCache = [
  './',
  './index.html',
  './engine.js',
  './data.js',
  './about_church_year.html',
  './favicon.png',
  './icon-192.png',
  './icon-512.png'
];

// 1. 安裝階段：強制立即接管並快取檔案
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 2. 啟動階段：自動清除舊版快取，避免佔用空間與干擾
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. 攔截請求：【網路優先 (Network First)】策略
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 如果有網路且抓到新檔案，就順手更新到快取裡
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // 如果沒網路 (斷網)，才從快取把之前的檔案拿出來用
        return caches.match(event.request);
      })
  );
});