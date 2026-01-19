import { NextRequest, NextResponse } from "next/server";
import knex from "../../../lib/db/knex";
import { verifyRequestToken } from "../../../lib/auth/verifyToken";

export async function GET(request: NextRequest) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const playerIds = searchParams.get("playerIds");
  const seasonId = searchParams.get("seasonId");

  if (!playerIds) {
    return NextResponse.json(
      { error: "playerIds is required" },
      { status: 400 }
    );
  }

  const playerIdArray = playerIds.split(",").filter(Boolean);

  try {
    const playerSeasonStats = await knex("player_stats")
      .select("player_id")
      .sum("goals_scored as total_goals")
      .sum("assists as total_assists")
      .sum("shots_on_target as total_shots_on_target")
      .sum("tackles as total_tackles")
      .sum("interceptions as total_interceptions")
      .sum("saves as total_saves")
      .sum("yellow_cards as total_yellow_cards")
      .sum("red_cards as total_red_cards")
      .sum("fouls as total_fouls")
      .sum("headers_won as total_headers_won")
      .sum("offsides as total_offsides")
      .countDistinct("game_id as total_games_played")
      .whereIn("player_id", playerIdArray)
      .whereIn("player_team_season_id", function () {
        this.select("id")
          .from("player_teams_seasons")
          .where("season_id", seasonId);
      })
      .groupBy("player_id");

    return NextResponse.json(playerSeasonStats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
