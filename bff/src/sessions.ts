import crypto from "crypto";
import type { Response } from "express";

export const sessions = new Map<string, { accessToken: string; refreshToken: string }>();
export const resetCodes = new Map<string, { userId: string; username: string; expiresAt: number }>();

export function createSession(res: Response, accessToken: string, refreshToken: string) {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, { accessToken, refreshToken });
  res.cookie("session_id", sessionId, { httpOnly: true, signed: true, maxAge: 30 * 60 * 1000, sameSite: "lax" });
}
