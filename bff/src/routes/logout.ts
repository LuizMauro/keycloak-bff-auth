import { Router } from "express";
import { deleteSession } from "../sessions";

const router = Router();

router.post("/logout", async (req, res) => {
  const sid = req.signedCookies.session_id;
  if (sid) await deleteSession(sid);
  res.clearCookie("session_id");
  res.json({ ok: true });
});

export default router;
