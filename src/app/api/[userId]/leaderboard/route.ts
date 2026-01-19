import { NextRequest, NextResponse } from "next/server";
import knex from "../../../../lib/db/knex";
import { verifyRequestToken } from "../../../../lib/auth/verifyToken";
import {
  getLeaderboardCache,
  setLeaderboardCache,
  LEADERBOARD_CACHE_TTL_MS
} from "../../../../lib/leaderboard/cache";
import { computeStreak } from "../../../../lib/leaderboard/compute";

const POINTS_FORMULA = `
  (COALESCE(agg.total_goals, 0) * 4) +
  (COALESCE(agg.total_assists, 0) * 3) +
  (COALESCE(agg.total_saves, 0) * 2) +
  (COALESCE(agg.total_tackles, 0) * 1) +
  (COALESCE(agg.total_interceptions, 0) * 1) +
  (COALESCE(agg.total_headers_won, 0) * 1) -
  (COALESCE(agg.total_yellow_cards, 0) * 1) -
  (COALESCE(agg.total_red_cards, 0) * 3)
`;

export async function GET(
  request: NextRequest,
  {
    params
  }: { params: Promise<Record<string, string | string[] | undefined>> }
) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  const userIdParam = (await params)?.userId;
  const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
  if (!userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }
  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get("seasonId");

  if (!seasonId) {
    return NextResponse.json({ error: "seasonId is required" }, { status: 400 });
  }

  const cacheKey = `${userId}:${seasonId}`;
  const cached = getLeaderboardCache(cacheKey);
  if (cached) {
    return NextResponse.json({
      cached: true,
      ttlMs: LEADERBOARD_CACHE_TTL_MS,
      data: cached
    });
  }

  try {
    const friendRows = await knex("player_friends as pf")
      .select(
        knex.raw(
          "CASE WHEN pf.player_id = ? THEN pf.friend_id ELSE pf.player_id END as friend_id",
          [userId]
        )
      )
      .where((qb) =>
        qb.where("pf.player_id", userId).orWhere("pf.friend_id", userId)
      );

    const friendIds = friendRows.map((row) => row.friend_id);
    const playerIds = Array.from(new Set([userId, ...friendIds]));

    if (playerIds.length === 0) {
      return NextResponse.json({
        cached: false,
        ttlMs: LEADERBOARD_CACHE_TTL_MS,
        data: []
      });
    }

    const statsAgg = knex("player_stats as ps")
      .select(
        "ps.player_id",
        knex.raw("SUM(ps.goals_scored) as total_goals"),
        knex.raw("SUM(ps.assists) as total_assists"),
        knex.raw("SUM(ps.saves) as total_saves"),
        knex.raw("SUM(ps.tackles) as total_tackles"),
        knex.raw("SUM(ps.interceptions) as total_interceptions"),
        knex.raw("SUM(ps.headers_won) as total_headers_won"),
        knex.raw("SUM(ps.yellow_cards) as total_yellow_cards"),
        knex.raw("SUM(ps.red_cards) as total_red_cards"),
        knex.raw("SUM(ps.fouls) as total_fouls"),
        knex.raw("SUM(ps.shots_on_target) as total_shots_on_target"),
        knex.raw("SUM(ps.offsides) as total_offsides"),
        knex.raw("COUNT(DISTINCT ps.game_id) as games_played"),
        knex.raw("COUNT(ps.id) as stat_rows")
      )
      .leftJoin("player_teams_seasons as pts", "ps.player_team_season_id", "pts.id")
      .whereIn("ps.player_id", playerIds)
      .andWhere("pts.season_id", seasonId)
      .groupBy("ps.player_id");

    const leaderboardRows = await knex("profiles as p")
      .select(
        "p.id",
        "p.username",
        "p.full_name",
        "p.avatar_url",
        "p.position",
        "agg.total_goals",
        "agg.total_assists",
        "agg.total_saves",
        "agg.total_tackles",
        "agg.total_interceptions",
        "agg.total_headers_won",
        "agg.total_yellow_cards",
        "agg.total_red_cards",
        "agg.total_fouls",
        "agg.total_shots_on_target",
        "agg.total_offsides",
        "agg.games_played",
        knex.raw(`${POINTS_FORMULA} as points`),
        knex.raw("COALESCE(agg.total_goals, 0) >= 3 as badge_hat_trick_hero"),
        knex.raw("COALESCE(agg.total_assists, 0) >= 5 as badge_playmaker"),
        knex.raw("COALESCE(agg.total_saves, 0) >= 10 as badge_wall_of_fame"),
        knex.raw("COALESCE(agg.games_played, 0) >= 3 as badge_never_tired")
      )
      .leftJoin(statsAgg.as("agg"), "agg.player_id", "p.id")
      .whereIn("p.id", playerIds)
      .orderBy("points", "desc")
      .orderBy("p.full_name", "asc");

    const normalized = leaderboardRows.map((row) => {
      const totals = {
        goals: Number(row.total_goals) || 0,
        assists: Number(row.total_assists) || 0,
        saves: Number(row.total_saves) || 0,
        tackles: Number(row.total_tackles) || 0,
        interceptions: Number(row.total_interceptions) || 0,
        headersWon: Number(row.total_headers_won) || 0,
        yellowCards: Number(row.total_yellow_cards) || 0,
        redCards: Number(row.total_red_cards) || 0,
        fouls: Number(row.total_fouls) || 0,
        shotsOnTarget: Number(row.total_shots_on_target) || 0,
        offsides: Number(row.total_offsides) || 0,
        gamesPlayed: Number(row.games_played) || 0
      };

      return {
        player: {
          id: row.id,
          username: row.username,
          full_name: row.full_name,
          avatar_url: row.avatar_url,
          position: row.position
        },
        totals,
        points: Number(row.points) || 0,
        badges: {
          hatTrickHero: Boolean(row.badge_hat_trick_hero),
          playmaker: Boolean(row.badge_playmaker),
          wallOfFame: Boolean(row.badge_wall_of_fame),
          neverTired: Boolean(row.badge_never_tired)
        },
        streak: computeStreak(totals)
      };
    });

    setLeaderboardCache(cacheKey, normalized);
    return NextResponse.json({
      cached: false,
      ttlMs: LEADERBOARD_CACHE_TTL_MS,
      data: normalized
    });
  } catch (error) {
    console.error("Error building leaderboard:", error);
    return NextResponse.json({ error: "Unable to fetch leaderboard" }, { status: 500 });
  }
}
