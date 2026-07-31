const CACHE_PREFIX = "habitsense-";
const CACHE_NAME = `${CACHE_PREFIX}v3`;

const APP_SHELL = [
  "/",
  "/habits",
  "/sleep",
  "/analytics",
  "/settings",
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        await Promise.allSettled(
          APP_SHELL.map((url) =>
            fetch(url).then((response) => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(() => undefined)
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests from same origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Handle navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // If offline, check cache for the specific URL, then root, then offline page
          const cache = await caches.open(CACHE_NAME);
          const cachedMatch = await cache.match(request);
          if (cachedMatch) return cachedMatch;

          const rootMatch = await cache.match("/");
          if (rootMatch) return rootMatch;

          const offlineFallback = await cache.match("/offline.html");
          if (offlineFallback) return offlineFallback;

          return Response.error();
        }
      })()
    );
    return;
  }

  // Handle static assets (_next/static, icons, images, manifest)
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/manifest.webmanifest";

  if (!isStaticAsset) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);

      if (cached) {
        // Revalidate in background
        event.waitUntil(
          fetch(request)
            .then((response) => {
              if (response.ok) return cache.put(request, response.clone());
            })
            .catch(() => undefined)
        );
        return cached;
      }

      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return Response.error();
      }
    })()
  );
});
