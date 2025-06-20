// src/utils/BaseCache.js
export class BaseCache {
  constructor(cacheDuration = 5 * 60 * 1000) { // Default 5 minutes
    this.cache = {
      data: null,
      timestamp: null
    };
    this.CACHE_DURATION = cacheDuration;
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
}