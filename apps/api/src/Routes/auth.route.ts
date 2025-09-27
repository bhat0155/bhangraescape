import { Router } from "express";
import { authSession } from "../middlewares/auth";

export const devRouter = Router();

// GET /api/dev/auth-debug
devRouter.get("/auth/debug", authSession, (req, res) => {
  return res.json({
    ok: true,
    user: (req as any).user ?? null,
  });
});