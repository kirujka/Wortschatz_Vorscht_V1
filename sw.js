/* Wortschatz 1A — офлайн-кэш.
   При заливке новой версии приложения поменяй число в CACHE — старый кэш удалится сам. */
var CACHE = 'w1a-v1';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).catch(function(){}));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Отдаём из кэша сразу, параллельно тянем свежее из сети и кладём в кэш.
   Значит: работает без интернета, а новая версия приезжает при следующем открытии. */
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(function(c){
      return c.match(e.request).then(function(hit){
        var net = fetch(e.request).then(function(res){
          if(res && res.status === 200 && res.type === 'basic') c.put(e.request, res.clone());
          return res;
        }).catch(function(){ return hit; });
        return hit || net;
      });
    })
  );
});
