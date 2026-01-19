import { NextRequest, NextResponse } from "next/server";
import knex from "../../../../lib/db/knex";
import { verifyRequestToken } from "../../../../lib/auth/verifyToken";

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

  try {
    const playerFriends = await knex("player_friends as pf")
      .select(
        "p.id",
        "p.full_name",
        "p.username",
        "p.date_of_birth",
        "p.avatar_url",
        "p.position",
        "pf.created_at as friendship_date"
      )
      .where(function () {
        this.where("pf.player_id", userId).orWhere("pf.friend_id", userId);
      })
      .join("profiles as p", function () {
        this.on(
          knex.raw("(pf.friend_id = p.id AND pf.player_id = ?)", [userId])
        ).orOn(
          knex.raw("(pf.player_id = p.id AND pf.friend_id = ?)", [userId])
        );
      })
      .orderBy("pf.created_at", "desc");

    return NextResponse.json(playerFriends, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `Unable to get friends: ${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
  const friendUsername = searchParams.get("friendUsername");

  try {
    const friend = await knex("profiles").where({ username: friendUsername }).first();
    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    await knex("player_friends")
      .where(function () {
        this.where({ player_id: userId, friend_id: friend.id }).orWhere({
          player_id: friend.id,
          friend_id: userId
        });
      })
      .del();

    return NextResponse.json(
      { message: "Friend deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
