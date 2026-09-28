/* V18.2 · versioned offline cache, network-first for pages, JS, CSS and prices. */
const CACHE = "caseirinhos-v18-f346999820e5";
const CORE = [
  "./", "index.html", "offline.html", "assets/css/style.css",
  "assets/css/vfx.css", "assets/css/upgrade.css", "assets/css/v12.css", "assets/css/v13.css", "assets/css/v14.css", "assets/css/v15.css", "assets/css/v16.css", "assets/css/v18.css", "assets/css/v18-2.css", "assets/js/catalog-data.js",
  "assets/js/availability.js", "assets/js/app.js", "assets/js/product-page.js",
  "assets/js/vfx.js", "assets/js/v14-ui.js", "assets/js/v15-ui.js", "assets/js/v16-ui.js", "assets/images/logo.webp", "assets/icons/whatsapp-verde.png", "assets/icons/seta-topo.png", "manifest.webmanifest"
];
self.addEventListener("install", (event) => event.waitUntil(
  caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
));
self.addEventListener("activate", (event) => event.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("caseirinhos-") && key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim())
));
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const fresh = request.mode === "navigate" || /\.(?:js|css|html|json)$/.test(url.pathname) || url.pathname.endsWith("/");
  if (fresh) {
    event.respondWith(fetch(request, { cache: "no-cache" }).then((response) => {
      if (response.ok) {
        const clone = response.clone();
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, clone)));
      }
      return response;
    }).catch(async () => await caches.match(request) || (request.mode === "navigate" ? caches.match("offline.html") : Response.error())));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok && response.type === "basic") {
      const clone = response.clone();
      event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, clone)));
    }
    return response;
  })));
});
