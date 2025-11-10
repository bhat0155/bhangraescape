// apps/api/src/middlewares/auth.ts
import type { Request, Response, NextFunction } from "express";
import { decode } from "@auth/core/jwt";

function getBearer(req: Request): string | null {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

const DEFAULT_COOKIE_NAME = "authjs.session-token";
const SECURE_COOKIE_NAME = "__Secure-authjs.session-token";

const configuredCookieName =
  process.env.AUTH_SESSION_COOKIE ??
  (process.env.NODE_ENV === "production" ? SECURE_COOKIE_NAME : DEFAULT_COOKIE_NAME);

async function decodeAuthToken(token: string) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not defined on the API service");
  }

  const salts = Array.from(
    new Set([configuredCookieName, DEFAULT_COOKIE_NAME, SECURE_COOKIE_NAME]),
  );

  for (const salt of salts) {
    try {
      const payload = await decode({ token, secret, salt });
      if (payload) {
        return payload;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (!message.includes("no matching decryption secret")) {
        throw err;
      }
    }
  }

  return null;
}

export async function authSession(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = getBearer(req);
    if (!token) {
      (req as any).user = null;
      return next();
    }

    const payload = await decodeAuthToken(token);

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
