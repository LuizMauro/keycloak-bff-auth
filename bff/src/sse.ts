import type { Response } from "express";
import Redis from "ioredis";
import { REDIS_URL } from "./config";

const pub = new Redis(REDIS_URL);
const sub = new Redis(REDIS_URL);
const CHANNEL = "sse:notifications";

const clients = new Map<string, Response[]>();

// Escuta mensagens publicadas por qualquer instância
sub.subscribe(CHANNEL);
sub.on("message", (_ch, raw) => {
  const { userId, data } = JSON.parse(raw) as { userId: string; data: object };
  const arr = clients.get(userId);
  if (arr) arr.forEach((res) => res.write(`data: ${JSON.stringify(data)}\n\n`));
});

export function addClient(userId: string, res: Response) {
  if (!clients.has(userId)) clients.set(userId, []);
  clients.get(userId)!.push(res);
  res.on("close", () => {
    const arr = clients.get(userId);
    if (arr) {
      const idx = arr.indexOf(res);
      if (idx !== -1) arr.splice(idx, 1);
      if (arr.length === 0) clients.delete(userId);
    }
  });
}

export async function sendToUser(userId: string, data: object) {
  await pub.publish(CHANNEL, JSON.stringify({ userId, data }));
}
