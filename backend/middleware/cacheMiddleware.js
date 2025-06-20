const appCache = require("../config/cache");

// Middleware to cache GET responses
const cacheResponse = (req, res, next) => {
  // Only process GET requests for caching
  if (req.method !== "GET") {
    return next();
  }

  const key = req.originalUrl; // Use the full request URL as the cache key

  // Check if the response is already in the cache
  const cachedBody = appCache.get(key);
  if (cachedBody) {
    console.log(`Cache hit for key: ${key}`);
    // If found, send the cached response
    return res.status(200).send(cachedBody);
  } else {
    console.log(`Cache miss for key: ${key}`);
    // If not in cache, intercept the `res.send` method
    res.sendResponse = res.send; // Store the original `res.send`
    res.send = (body) => {
      appCache.set(key, body); // Cache the response body before sending
      res.sendResponse(body); // Call the original `res.send` to send the response to the client
    };
    next(); // Proceed to the actual route handler
  }
};

// Function to invalidate specific cache keys
const invalidateCache = (keys = []) => {
  if (!Array.isArray(keys)) {
    keys = [keys]; // Ensure keys is an array
  }
  keys.forEach((key) => {
    if (appCache.has(key)) {
      appCache.del(key); // Delete the key from cache
      console.log(`Cache invalidated for key: ${key}`);
    }
  });
};

// Function to invalidate all cache keys that start with a specific prefix
const invalidateCacheByPrefix = (prefix) => {
  const keys = appCache.keys(); // Get all current cache keys
  keys.forEach((key) => {
    if (key.startsWith(prefix)) {
      appCache.del(key); // Delete keys matching the prefix
      console.log(`Cache invalidated for prefix: ${key}`);
    }
  });
};

module.exports = { cacheResponse, invalidateCache, invalidateCacheByPrefix };
