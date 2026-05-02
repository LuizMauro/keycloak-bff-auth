import { Router } from "express";
import { sessions } from "../sessions";

const router = Router();

router.post("/logout", (req, res) => {
  const sid = req.signedCookies.session_id;
  if (sid) sessions.delete(sid);
  res.clearCookie("session_id");
  res.json({ ok: true });
});

export default router;
