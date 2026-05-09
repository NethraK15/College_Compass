import { NextRequest } from "next/server";
import { verifyToken, type JwtPayload } from "@/lib/jwt";

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }

  const cookieToken = req.cookies.get("token")?.value;
  return cookieToken || null;
}

export function requireAuth(req: NextRequest): JwtPayload {
  const token = getTokenFromRequest(req);
  if (!token) {
    throw new Error("Unauthorized");
  }
  return verifyToken(token);
}
