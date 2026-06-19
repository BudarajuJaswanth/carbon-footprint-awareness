const CACHE_NAME = "ecotrace-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./src/index.css",
  "./src/app.js",
  "./src/utils/dom.js",
  "./src/utils/formatters.js",
  "./src/models/Schema.js",
  "./src/validators/InputValidator.js",
  "./src/constants/EmissionFactors.js",
  "./src/services/Store.js",
  "./src/services/CalculatorService.js",
  "./src/services/RecommendationService.js",
  "./src/services/GoalService.js",
  "./src/components/Card.js",
  "./src/components/Chart.js",
  "./src/components/GoalItem.js",
  "./src/components/Modal.js",
  "./src/pages/Dashboard.js",
  "./src/pages/Calculator.js",
  "./src/pages/Recommendations.js",
  "./src/pages/Goals.js",
  "./src/pages/Insights.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
