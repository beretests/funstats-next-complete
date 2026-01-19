import { NextResponse } from "next/server";
import knex from "../../../lib/db/knex";

export async function POST(request: Request) {
  const { identifier } = await request.json();

  try {
    const userEmail = await knex
      .select("email")
      .from("profiles")
      .where({ username: identifier });

    if (!userEmail || userEmail.length === 0) {
      return NextResponse.json(
        { error: "No user with given username found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Login successful",
      email: userEmail[0].email
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
