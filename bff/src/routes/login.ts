import { Router } from "express";
import { KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET } from "../config";
import { requestToken, getAdminToken, findUserByUsername, getUserRequiredActions } from "../keycloak";
import { createSession } from "../sessions";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing credentials" });

  try {
    const { ok, data } = await requestToken({
      grant_type: "password",
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      username,
      password,
      scope: "openid profile email",
    });

    if (ok) {
      await createSession(res, data.access_token, data.refresh_token);
      return res.json({ ok: true });
    }

    if (data.error === "invalid_grant" && data.error_description === "Account is not fully set up") {
      const adminToken = await getAdminToken();
      const user = await findUserByUsername(adminToken, username);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const actions = await getUserRequiredActions(adminToken, user.id);
      if (actions.includes("UPDATE_PASSWORD")) {
        return res.status(403).json({ error: "password_change_required" });
      }
    }

    res.status(401).json({ error: "Invalid credentials" });
  } catch {
    res.status(500).json({ error: "Keycloak unreachable" });
  }
});

export default router;
