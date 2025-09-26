import type { Request, Response, NextFunction } from "express";
import { jwtVerify, JWTPayload } from "jose";

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

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload }: { payload: JWTPayload & { role?: string; name?: string; email?: string } } =
      await jwtVerify(token, secret);

    const user = {
      id: payload.sub ?? "",
      name: payload.name ?? undefined,
      email: payload.email ?? undefined,
      role: payload.role ?? "GUEST",
    };

    (req as any).user = user;
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