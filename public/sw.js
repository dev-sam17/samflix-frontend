const CACHE_NAME = "samflix-v1";
const STATIC_CACHE_NAME = "samflix-static-v1";
const DYNAMIC_CACHE_NAME = "samflix-dynamic-v1";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/apple-touch-icon.png",
  "/site.webmanifest",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
// self.addEventListener("fetch", (event) => {
//   const { request } = event;
//   const url = new URL(request.url);

//   // Skip non-GET requests
//   if (request.method !== "GET") {
//     return;
//   }

//   // Skip external requests (different origin)
//   if (url.origin !== location.origin) {
//     return;
//   }

//   // Handle different types of requests
//   if (request.destination === "document") {
//     // HTML pages - Network first, fallback to cache
//     event.respondWith(networkFirstStrategy(request));
//   } else if (request.destination === "image") {
//     // Images - Cache first, fallback to network
//     event.respondWith(cacheFirstStrategy(request));
//   } else if (request.url.includes("/_next/static/")) {
//     // Next.js static assets - Cache first (they have hashes)
//     event.respondWith(cacheFirstStrategy(request));
//   } else {
//     // Other requests - Network first
//     event.respondWith(networkFirstStrategy(request));
//   }
// });

// Network first strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.destination === "document") {
      return caches.match("/");
    }

    throw error;
  }
}

// Cache first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Failed to fetch:", request.url);
    throw error;
  }
}

// Handle background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement any background sync logic here
  console.log("Performing background sync...");
}

// Handle push notifications (for future use)
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  const options = {
    body: event.data ? event.data.text() : "New content available!",
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Open Samflix",
        icon: "/android-chrome-192x192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/android-chrome-192x192.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Samflix", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});
