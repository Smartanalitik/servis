// Formun internet yokken de açılması için uygulama dosyalarını telefonda saklar.
// Dosyaları güncellediğinizde aşağıdaki sürüm numarasını artırın (v2 -> v3).
const CACHE = 'sa-servis-v2';
const FILES = ['./', './index.html', './anket-gonder.html', './config.js', './manifest.json', './icon-192.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Önce internetten dene (güncel sürüm), olmazsa telefondaki kopyayı kullan.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('anket.html')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
