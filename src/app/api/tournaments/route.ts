import { NextRequest, NextResponse } from "next/server";
import knex from "../../../lib/db/knex";
import { verifyRequestToken } from "../../../lib/auth/verifyToken";

export async function POST(request: NextRequest) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  try {
    const { name, start_date, end_date } = await request.json();
    const [tournament] = await knex("tournaments")
      .returning(["id", "name"])
      .insert({ name, start_date, end_date });
    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
