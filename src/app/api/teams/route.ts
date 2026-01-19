import { NextRequest, NextResponse } from "next/server";
import knex from "../../../lib/db/knex";
import { verifyRequestToken } from "../../../lib/auth/verifyToken";

export async function POST(request: NextRequest) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  try {
    const { name, club_id, age_division, skill_tier } = await request.json();
    const [team] = await knex("teams")
      .returning(["id", "name"])
      .insert({ name, club_id, age_division, skill_tier });
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
