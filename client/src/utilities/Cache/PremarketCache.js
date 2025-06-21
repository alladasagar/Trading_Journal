// src/utilities/Cache/PremarketCache.js
import { BaseCache } from "./BaseCache";

export class PremarketCache extends BaseCache {
  constructor() {
    super(5 * 60 * 1000); // 5 minutes cache duration
  }
}

export const premarketCache = new PremarketCache();