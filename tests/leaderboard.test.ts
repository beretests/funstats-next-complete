import { describe, expect, it } from "vitest";
import { computeStreak } from "../src/lib/leaderboard/compute";

describe("computeStreak", () => {
  it("returns minimum streak for no activity", () => {
    expect(computeStreak({})).toBe(1);
  });

  it("caps streak at 10 for high activity", () => {
    expect(
      computeStreak({
        gamesPlayed: 20,
        goals: 15,
        assists: 10,
        saves: 20,
        tackles: 20,
        interceptions: 20
      })
    ).toBe(10);
  });

  it("calculates a mid-range streak", () => {
    expect(
      computeStreak({
        gamesPlayed: 4,
        goals: 2,
        assists: 1,
        saves: 1,
        tackles: 1,
        interceptions: 0
      })
    ).toBeGreaterThan(1);
  });
});
