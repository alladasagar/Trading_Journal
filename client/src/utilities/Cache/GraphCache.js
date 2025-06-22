import { BaseCache } from "./BaseCache";

class GraphCache extends BaseCache {
  constructor() {
    super(15 * 60 * 1000); // 15 minute cache duration
  }
}

export const graphCache = new GraphCache();