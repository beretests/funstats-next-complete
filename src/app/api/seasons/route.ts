import { NextRequest, NextResponse } from "next/server";
import knex from "../../../lib/db/knex";
import { verifyRequestToken } from "../../../lib/auth/verifyToken";

export async function GET(request: NextRequest) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  try {
    const seasons = await knex.select("id", "name").from("seasons");
    return NextResponse.json(seasons);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  try {
    const { name, start_date, end_date } = await request.json();
    const [season] = await knex("seasons")
      .returning(["id", "name"])
      .insert({ name, start_date, end_date });
    return NextResponse.json(season, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
