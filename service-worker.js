self.addEventListener('install', () => {
    // 強制立刻接管，不等待舊版關閉
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        // 1. 清空所有舊的離線快取
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => {
            // 2. 自動取消註冊自己 (Unregister)
            return self.registration.unregister();
        }).then(() => {
            // 3. 讓開著網頁的分頁自動重整為最新版
            return self.clients.matchAll();
        }).then((clients) => {
            clients.forEach((client) => client.navigate(client.url));
        })
    );
});