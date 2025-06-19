// src/utils/EventsCache.js
import { BaseCache } from "./BaseCache";

class EventsCache extends BaseCache {
  constructor() {
    super(5 * 60 * 1000); 
  }
}

// Export a singleton instance
export const eventsCache = new EventsCache();