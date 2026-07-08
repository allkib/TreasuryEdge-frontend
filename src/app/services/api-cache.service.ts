import { Injectable } from '@angular/core';

interface CacheEntry {
  data: unknown;
  fetchedAt: number;
  ttlMs: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiCacheService {
  private readonly store = new Map<string, CacheEntry>();

  static readonly TTL_24H = 24 * 60 * 60 * 1000;
  static readonly TTL_4H = 4 * 60 * 60 * 1000;

  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.fetchedAt > entry.ttlMs) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set(key: string, data: unknown, ttlMs = ApiCacheService.TTL_24H): void {
    this.store.set(key, { data, fetchedAt: Date.now(), ttlMs });
  }
}
