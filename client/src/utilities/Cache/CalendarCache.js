import { BaseCache } from "./BaseCache";

class CalendarCache extends BaseCache {
  constructor() {
    super(30 * 60 * 1000); // 30 minute cache duration
  }
}

export const calendarCache = new CalendarCache();