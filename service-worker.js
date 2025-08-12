const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/add-ons.html',
  '/buy-tickets.html',
  '/canopy-park.html',
  '/css/styles.css',
  '/css/navbar.css',
  '/css/add-ons.css',
  '/css/buy-tickets.css',
  '/css/canopy-park.css',
  '/js/script.js',

  // Cached components
  '/component/navbar.html',
  '/component/footer.html',

  // Images
  '/assets/images/jewel-logo.webp',
  '/assets/images/jewel-thumbnail.webp',
  '/assets/images/dine.webp',
  '/assets/images/play.webp',
  '/assets/images/shop.webp',
  '/assets/images/stay.webp',
  '/assets/images/plants.webp',
  '/assets/images/feature1.webp',
  '/assets/images/feature2.webp',
  '/assets/images/feature3.webp',
  '/assets/images/privileges-banner.webp',
  '/assets/images/promo-1.webp',
  '/assets/images/promo-2.webp',
  '/assets/images/promo-3.webp'
];


// Install and cache static files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch files from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
