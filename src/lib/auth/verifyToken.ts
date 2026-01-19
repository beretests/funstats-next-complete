import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const verifyRequestToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Access Denied" }, { status: 401 })
    };
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || "");
    return { ok: true };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 })
    };
  }
};
