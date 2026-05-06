import { Router } from "express";
import { USERINFO_URL } from "../config";
import { getSession } from "../sessions";

const router = Router();

router.get("/me", async (req, res) => {
  const session = await getSession(req.signedCookies.session_id);
  if (!session) return res.status(401).json({ authenticated: false });

  try {
    const resp = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (!resp.ok) return res.status(401).json({ authenticated: false });
    res.json({ authenticated: true, user: await resp.json() });
  } catch {
    res.status(500).json({ error: "Keycloak unreachable" });
  }
});

export default router;
