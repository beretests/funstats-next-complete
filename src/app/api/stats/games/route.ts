import { NextRequest, NextResponse } from "next/server";
import knex from "../../../../lib/db/knex";
import { verifyRequestToken } from "../../../../lib/auth/verifyToken";

const allowedStatTypes = new Set([
  "goals_scored",
  "assists",
  "shots_on_target",
  "tackles",
  "interceptions",
  "saves",
  "yellow_cards",
  "red_cards",
  "fouls",
  "headers_won",
  "offsides"
]);

export async function GET(request: NextRequest) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");
  const seasonId = searchParams.get("seasonId");
  const statType = searchParams.get("statType");

  if (!playerId || !seasonId || !statType) {
    return NextResponse.json(
      { error: "playerId, seasonId, and statType are required" },
      { status: 400 }
    );
  }

  if (!allowedStatTypes.has(statType)) {
    return NextResponse.json({ error: "Invalid statType" }, { status: 400 });
  }

  try {
    const result = await knex.transaction(async (trx) => {
      const games = await trx("games")
        .select(
          "games.id as game_id",
          "games.date",
          "home_team.name as home_team_name",
          "away_team.name as away_team_name",
          "player_stats.position_played",
          knex.raw(`player_stats.${statType} as stat_value`),
          knex.raw(
            `COALESCE(
              json_agg(
                DISTINCT jsonb_build_object(
                  'award_id', player_awards.award_id, 
                  'award_name', awards.name
                )
              ) FILTER (WHERE player_awards.id IS NOT NULL)
               , '[]'
            ) as awards`
          )
        )
        .leftJoin("player_stats", function () {
          this.on("player_stats.game_id", "=", "games.id").andOn(
            "player_stats.player_id",
            "=",
            knex.raw("?", [playerId])
          );
        })
        .leftJoin(
          "player_teams_seasons",
          "player_stats.player_team_season_id",
          "player_teams_seasons.id"
        )
        .leftJoin("player_awards", function () {
          this.on("player_awards.game_id", "=", "games.id").andOn(
            "player_awards.player_id",
            "=",
            knex.raw("?", [playerId])
          );
        })
        .leftJoin("awards", "player_awards.award_id", "awards.id")
        .leftJoin("teams as home_team", "games.home_team_id", "home_team.id")
        .leftJoin("teams as away_team", "games.away_team_id", "away_team.id")
        .where("player_teams_seasons.season_id", seasonId)
        .andWhere(knex.raw("player_stats.?? > ?", [statType, 0]))
        .groupBy(
          "games.id",
          "home_team.name",
          "away_team.name",
          knex.raw(`player_stats.${statType}`),
          "player_stats.position_played"
        )
        .orderBy("games.date", "asc");

      return games;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching games by stat:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
