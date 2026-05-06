import { Router } from "express";
import { USERINFO_URL } from "../config";
import { getSession } from "../sessions";
import { addClient, sendToUser } from "../sse";

const router = Router();

// SSE stream — requer sessão autenticada
router.get("/notifications", async (req, res) => {
  const session = await getSession(req.signedCookies.session_id);
  if (!session) return res.status(401).json({ error: "unauthorized" });

  // Busca userId do token
  const userResp = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  if (!userResp.ok) return res.status(401).json({ error: "unauthorized" });
  const { sub: userId } = (await userResp.json()) as { sub: string };

  // Headers SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  addClient(userId, res);
});

// Enviar notificação para um userId específico
router.post("/notify", async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: "userId and message required" });
  await sendToUser(userId, { message, timestamp: Date.now() });
  res.json({ sent: true });
});

export default router;
