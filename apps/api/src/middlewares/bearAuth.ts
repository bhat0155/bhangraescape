import jwt, { JwtPayload } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

// Define a type for the user object we attach to the request
interface UserPayload {
  id?: string; // JWT 'sub' is usually the user ID
  email?: string;
  role: "ADMIN" | "MEMBER" | "GUEST";
}

// Augment the Express Request type globally
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export function bearerAuth(req: Request, _res: Response, next: NextFunction) {
    const header = req.headers.authorization ?? "";
    // FIX: Destructure correctly with a space separator
    const [, token] = header.split(" "); 
    
    if (!token) return next();

     try {
        // Assert the payload type to allow property access
        const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as JwtPayload & UserPayload;
        
        // ASSIGNMENT FIX: req.user is now valid due to the 'declare global' block
        req.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role ?? "GUEST",
        };
    } catch (e) {
        // Optionally log the error here: console.error("JWT verification failed:", e);
    }
    next();
}