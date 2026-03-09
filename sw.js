const CACHE_NAME = 'life-in-numbers-v1';
const ASSETS = [
  '/life-in-numbers/',
  '/life-in-numbers/index.html',
  '/life-in-numbers/css/style.css',
  '/life-in-numbers/js/app.js',
  '/life-in-numbers/js/i18n.js',
  '/life-in-numbers/js/locales/ko.json',
  '/life-in-numbers/js/locales/en.json',
  '/life-in-numbers/js/locales/ja.json',
  '/life-in-numbers/js/locales/zh.json',
  '/life-in-numbers/js/locales/hi.json',
  '/life-in-numbers/js/locales/ru.json',
  '/life-in-numbers/js/locales/es.json',
  '/life-in-numbers/js/locales/pt.json',
  '/life-in-numbers/js/locales/id.json',
  '/life-in-numbers/js/locales/tr.json',
  '/life-in-numbers/js/locales/de.json',
  '/life-in-numbers/js/locales/fr.json',
  '/life-in-numbers/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
