import { NextRequest, NextResponse } from "next/server";
import knex from "../../../lib/db/knex";
import { verifyRequestToken } from "../../../lib/auth/verifyToken";

export async function POST(request: NextRequest) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  try {
    const { name, location } = await request.json();
    const [club] = await knex("clubs")
      .returning(["id", "name"])
      .insert({ name, location });
    return NextResponse.json(club, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
