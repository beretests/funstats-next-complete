import { NextRequest, NextResponse } from "next/server";
import knex from "../../../lib/db/knex";
import { verifyRequestToken } from "../../../lib/auth/verifyToken";

export async function POST(request: NextRequest) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  try {
    const { date, season_id, home_team_id, away_team_id } = await request.json();
    const [game] = await knex("games")
      .returning(["id", "name"])
      .insert({ date, season_id, home_team_id, away_team_id });
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
