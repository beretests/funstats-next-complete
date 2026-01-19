import { NextRequest, NextResponse } from "next/server";
import knex from "../../../../lib/db/knex";
import { verifyRequestToken } from "../../../../lib/auth/verifyToken";

export async function GET(
  request: NextRequest,
  {
    params
  }: { params?: Promise<Record<string, string | string[] | undefined>> }
) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  try {
    const userIdParam = (await params)?.userId;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const player = await knex("profiles")
      .where({ id: userId })
      .select(
        "id",
        "email",
        "full_name",
        "username",
        "avatar_url",
        "date_of_birth",
        "favorite_soccer_player",
        "position",
        "created_at",
        "updated_at"
      );

    if (!player.length) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  {
    params
  }: { params?: Promise<Record<string, string | string[] | undefined>> }
) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  const { full_name, date_of_birth, favorite_soccer_player, position } =
    await request.json();

  try {
    const userIdParam = (await params)?.userId;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const updatedProfile = await knex("profiles").where({ id: userId }).update(
      {
        full_name,
        date_of_birth,
        favorite_soccer_player,
        position
      },
      ["full_name", "date_of_birth", "favorite_soccer_player", "position"]
    );

    if (updatedProfile.length === 0) {
      return NextResponse.json(
        { message: "Player profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProfile[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
