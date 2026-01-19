import { NextResponse } from "next/server";
import knex from "../../../lib/db/knex";

export async function POST() {
  try {
    await knex("health_check").insert({});
    return new NextResponse("Healthy");
  } catch (error) {
    console.error("Health check failed:", error);
    return new NextResponse("Supabase is down", { status: 500 });
  }
}
