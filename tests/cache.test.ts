import { describe, expect, it } from "vitest";
import {
  clearLeaderboardCache,
  getLeaderboardCache,
  setLeaderboardCache
} from "../src/lib/leaderboard/cache";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("leaderboard cache", () => {
  it("stores and retrieves entries", () => {
    setLeaderboardCache("test:key", { ok: true }, 1000);
    expect(getLeaderboardCache("test:key")).toEqual({ ok: true });
  });

  it("expires entries after ttl", async () => {
    setLeaderboardCache("test:ttl", { ok: true }, 10);
    await delay(20);
    expect(getLeaderboardCache("test:ttl")).toBeNull();
  });

  it("clears all entries", () => {
    setLeaderboardCache("test:clear", { ok: true }, 1000);
    clearLeaderboardCache();
    expect(getLeaderboardCache("test:clear")).toBeNull();
  });
});
