import crypto from "crypto";
import type { Response } from "express";
import { redis } from "./redis";

const SESSION_TTL = 1800; // 30 min
const RESET_CODE_TTL = 600; // 10 min

export async function getSession(sessionId: string) {
  if (!sessionId) return null;
  const data = await redis.get(`session:${sessionId}`);
  return data ? (JSON.parse(data) as { accessToken: string; refreshToken: string }) : null;
}

export async function createSession(res: Response, accessToken: string, refreshToken: string) {
  const sessionId = crypto.randomUUID();
  await redis.set(`session:${sessionId}`, JSON.stringify({ accessToken, refreshToken }), "EX", SESSION_TTL);
  res.cookie("session_id", sessionId, { httpOnly: true, signed: true, maxAge: SESSION_TTL * 1000, sameSite: "lax" });
}

export async function deleteSession(sessionId: string) {
  await redis.del(`session:${sessionId}`);
}

export async function setResetCode(code: string, userId: string, username: string) {
  await redis.set(`reset:${code}`, JSON.stringify({ userId, username }), "EX", RESET_CODE_TTL);
}

export async function getResetCode(code: string) {
  const data = await redis.get(`reset:${code}`);
  return data ? (JSON.parse(data) as { userId: string; username: string }) : null;
}

export async function deleteResetCode(code: string) {
  await redis.del(`reset:${code}`);
}
