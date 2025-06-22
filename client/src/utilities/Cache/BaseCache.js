// src/utils/BaseCache.js
export class BaseCache {
  constructor(cacheDuration = 5 * 60 * 1000, autoInvalidateInterval = 4 * 60 * 1000) {
    this.cache = {
      data: null,
      timestamp: null
    };
    this.CACHE_DURATION = cacheDuration;
    this.autoInvalidateInterval = autoInvalidateInterval;
    this.intervalId = null;
    
    // Start auto invalidation when instance is created
    this.startAutoInvalidation();
  }

  get() {
    return this.cache;
  }

  set(data) {
    this.cache = {
      data,
      timestamp: Date.now()
    };
  }

  isValid() {
    return this.cache.data && 
           this.cache.timestamp && 
           (Date.now() - this.cache.timestamp) < this.CACHE_DURATION;
  }

  invalidate() {
    this.cache = {
      data: null,
      timestamp: null
    };
  }

  startAutoInvalidation() {
    // Clear any existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // Set up new interval
    this.intervalId = setInterval(() => {
      this.invalidate();
      console.log('Cache automatically invalidated after 4 minutes');
    }, this.autoInvalidateInterval);
  }

  stopAutoInvalidation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Optional: Clean up interval when instance is no longer needed
  destroy() {
    this.stopAutoInvalidation();
  }
}