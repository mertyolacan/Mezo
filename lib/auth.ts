import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  id: number;
  email: string;
  role: "admin" | "user";
  iat?: number;
  exp?: number;
}

export function signToken(
  payload: Omit<JWTPayload, "iat" | "exp">,
  expiresIn = "7d"
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get("mesopro_token")?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);

  return null;
}

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function getAdminFromRequest(req: NextRequest): JWTPayload | null {
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") return null;
  return user;
}

export function getAuthCookieOptions(maxAge = 7 * 24 * 60 * 60) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

export async function setAuthCookie(token: string, maxAge = 7 * 24 * 60 * 60) {
  const cookieStore = await cookies();
  cookieStore.set("mesopro_token", token, getAuthCookieOptions(maxAge));
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("mesopro_token");
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("mesopro_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
