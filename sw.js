/* V23 · cache offline versionado. Rede primeiro para páginas, JS, CSS e preços. */
const CACHE = "caseirinhos-__CACHE_VERSION__";
const CORE = [
  "./",
  "index.html",
  "offline.html",
  "manifest.webmanifest",
  "assets/css/base.css",
  "assets/css/components.css",
  "assets/css/sections.css",
  "assets/css/product-page.css",
  "assets/css/v23.css",
  "assets/js/catalog-data.js",
  "assets/js/availability.js",
  "assets/js/app.js",
  "assets/js/ui.js",
  "assets/js/vfx.js",
  "assets/js/product-page.js",
  "assets/images/logo.webp",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/whatsapp-verde.png",
  "assets/icons/seta-topo.png"
];

self.addEventListener("install", (event) => event.waitUntil(
  caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
));

self.addEventListener("activate", (event) => event.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key.startsWith("caseirinhos-") && key !== CACHE).map((key) => caches.delete(key))))
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
