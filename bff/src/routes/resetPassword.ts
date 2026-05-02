import { Router } from "express";
import { KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET } from "../config";
import { requestToken, getAdminToken, resetUserPassword, clearRequiredActions } from "../keycloak";
import { createSession, resetCodes } from "../sessions";

const router = Router();

router.post("/reset-password", async (req, res) => {
  const { code, newPassword } = req.body;
  if (!code || !newPassword) return res.status(400).json({ error: "Missing fields" });

  const entry = resetCodes.get(code);
  if (!entry || entry.expiresAt < Date.now()) {
    resetCodes.delete(code);
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  try {
    const adminToken = await getAdminToken();
    await resetUserPassword(adminToken, entry.userId, newPassword);
    await clearRequiredActions(adminToken, entry.userId);
    resetCodes.delete(code);

    const login = await requestToken({
      grant_type: "password",
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      username: entry.username,
      password: newPassword,
      scope: "openid profile email",
    });

    if (!login.ok) return res.json({ ok: true, autoLogin: false });

    createSession(res, login.data.access_token, login.data.refresh_token);
    res.json({ ok: true, autoLogin: true });
  } catch {
    res.status(500).json({ error: "Keycloak unreachable" });
  }
});

export default router;
