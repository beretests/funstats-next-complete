export type Totals = {
  gamesPlayed?: number;
  goals?: number;
  assists?: number;
  saves?: number;
  tackles?: number;
  interceptions?: number;
};

export const computeStreak = ({
  gamesPlayed = 0,
  goals = 0,
  assists = 0,
  saves = 0,
  tackles = 0,
  interceptions = 0
}: Totals) => {
  const activity =
    gamesPlayed * 1.2 +
    goals * 0.6 +
    assists * 0.4 +
    (saves + tackles + interceptions) * 0.25;
  const streak = Math.round(activity / 2);
  if (streak < 1) return 1;
  if (streak > 10) return 10;
  return streak;
};
