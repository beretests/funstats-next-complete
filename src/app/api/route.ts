import { NextRequest, NextResponse } from "next/server";
import { verifyRequestToken } from "../../lib/auth/verifyToken";

export async function GET(request: NextRequest) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({ message: "Welcome to your account!" });
}
