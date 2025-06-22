// src/utils/StrategyCache.js
import { BaseCache } from "./BaseCache";

class StrategyCache extends BaseCache {
  constructor() {
    super(10 * 60 * 1000); // 10 minute cache duration
  }
}

// Export a singleton instance
export const strategyCache = new StrategyCache();