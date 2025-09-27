// apps/api/src/middlewares/auth.ts
import type { Request, Response, NextFunction } from "express";
import { decode } from "@auth/core/jwt";

function getBearer(req: Request): string | null {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

export async function authSession(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = getBearer(req);
    if (!token) {
      (req as any).user = null;
      return next();
    }

    const payload = await decode({
      token,
      // MUST be exactly the same as in your Next.js app
      secret: process.env.NEXTAUTH_SECRET!,
      salt: "authjs.session-token",           // default Auth.js salt

    });

    if (!payload) {
      (req as any).user = null;
      return next();
    }

    (req as any).user = {
      id: payload.sub ?? "",
      name: (payload as any).name ?? undefined,
      email: (payload as any).email ?? undefined,
      role: (payload as any).role ?? "GUEST",
    };

    return next();
  } catch (err) {
    (req as any).user = null;
    return next(err);
  }
}

export function requiredRole(roles: Array<"MEMBER" | "ADMIN">) {
  return function (req: Request, res: Response, next: NextFunction) {
    const role = (req as any).user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: "Forbidden, insufficient role" });
    }
    return next();
  };
}