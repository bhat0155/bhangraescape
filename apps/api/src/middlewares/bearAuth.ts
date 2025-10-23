import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

export function bearerAuth(req: Request, _res: Response, next: NextFunction){
    const header = req.headers.authorization ?? "";
    const [, token]=header.split("");
    if(!token) return next();

     try {
    const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role ?? "GUEST",
    };
  } catch {

  }
  next();
}