import { Router } from "express";
import { KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET } from "../config";
import { requestToken, getAdminToken, findUserByUsername, resetUserPassword, clearRequiredActions } from "../keycloak";
import { createSession } from "../sessions";

const router = Router();

router.post("/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  if (!username || !oldPassword || !newPassword) return res.status(400).json({ error: "Missing fields" });

  try {
    const adminToken = await getAdminToken();
    const user = await findUserByUsername(adminToken, username);
    if (!user) return res.status(401).json({ error: "User not found" });

    const { ok, data } = await requestToken({
      grant_type: "password",
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      username,
      password: oldPassword,
      scope: "openid",
    });

    if (!ok && data.error_description !== "Account is not fully set up") {
      return res.status(401).json({ error: "Invalid old password" });
    }

    await resetUserPassword(adminToken, user.id, newPassword);
    await clearRequiredActions(adminToken, user.id);

    const login = await requestToken({
      grant_type: "password",
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      username,
      password: newPassword,
      scope: "openid profile email",
    });

    if (!login.ok) return res.status(500).json({ error: "Failed to login after password change" });

    createSession(res, login.data.access_token, login.data.refresh_token);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Keycloak unreachable" });
  }
});

export default router;
