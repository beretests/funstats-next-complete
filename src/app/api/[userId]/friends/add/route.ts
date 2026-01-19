import { NextRequest, NextResponse } from "next/server";
import knex from "../../../../../lib/db/knex";
import { verifyRequestToken } from "../../../../../lib/auth/verifyToken";

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  try {
    const { userId } = await params;
    const { friendUsername } = await request.json();

    if (!userId || !friendUsername) {
      return NextResponse.json(
        { error: "Both playerId and friendUsername are required." },
        { status: 400 }
      );
    }

    const friend = await knex.transaction(async (trx) => {
      const found = await trx("profiles")
        .select("id", "email", "full_name", "username", "avatar_url", "position")
        .where({ username: friendUsername })
        .first();

      if (!found) {
        throw new Error("Friend not found.");
      }

      const friendId = found.id;
      const [smallerId, largerId] =
        userId < friendId ? [userId, friendId] : [friendId, userId];

      const existingFriendship = await trx("player_friends")
        .where({ player_id: smallerId, friend_id: largerId })
        .first();

      if (existingFriendship) {
        throw new Error("Friendship already exists.");
      }

      await trx("player_friends").insert({
        player_id: smallerId,
        friend_id: largerId
      });

      return found;
    });

    return NextResponse.json(
      { friend, message: "Friendship added successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding friend:", error);

    if ((error as Error).message === "Friend not found.") {
      return NextResponse.json({ error: "Friend not found." }, { status: 404 });
    }
    if ((error as Error).message === "Friendship already exists.") {
      return NextResponse.json(
        { message: "Friendship already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
