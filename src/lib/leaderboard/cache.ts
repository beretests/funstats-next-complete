const cache = new Map<string, { value: unknown; expiresAt: number }>();
const DEFAULT_TTL_MS = 45_000;

export const getLeaderboardCache = (key: string) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

export const setLeaderboardCache = (
  key: string,
  value: unknown,
  ttlMs: number = DEFAULT_TTL_MS
) => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const clearLeaderboardCache = (key?: string) => {
  if (key) {
    cache.delete(key);
    return;
  }
  cache.clear();
};

export const LEADERBOARD_CACHE_TTL_MS = DEFAULT_TTL_MS;
