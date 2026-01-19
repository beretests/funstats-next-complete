import { NextRequest, NextResponse } from "next/server";
import knex from "../../../../../lib/db/knex";
import { verifyRequestToken } from "../../../../../lib/auth/verifyToken";

export async function GET(request: NextRequest) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  try {
    const [seasons, teams, clubs, awards, tournaments] = await Promise.all([
      knex("seasons").select("id", "name", "start_date", "end_date"),
      knex("teams").select("id", "name", "club_id"),
      knex("clubs").select("id", "name", "location"),
      knex("awards").select("id", "name"),
      knex("tournaments").select("id", "name", "start_date", "end_date")
    ]);

    return NextResponse.json({
      seasons,
      clubs,
      home_teams: teams,
      away_teams: teams,
      tournaments,
      awards
    });
  } catch (error) {
    console.error("Error fetching form options:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: process.env.NODE_ENV === "development" ? error : undefined
      },
      { status: 500 }
    );
  }
}
