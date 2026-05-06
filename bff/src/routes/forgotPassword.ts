import { Router } from "express";
import { getAdminToken, findUserByUsername } from "../keycloak";
import { setResetCode } from "../sessions";

const router = Router();

router.post("/forgot-password", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Missing username" });

  try {
    const adminToken = await getAdminToken();
    const user = await findUserByUsername(adminToken, username);
    if (!user) return res.json({ ok: true });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await setResetCode(code, user.id, username);

    console.log(`\n📧 Reset code for ${username}: ${code}\n`);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Keycloak unreachable" });
  }
});

export default router;
