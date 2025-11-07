import jwt, { JwtPayload } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

// FIX: Make id and email optional (?) in the interface
interface UserPayload {
  id?: string;
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
    // FIX: Correctly split the header to get the token
    const [, token] = header.split(" "); 
    
    if (!token) return next();

     try {
        // Assert the payload type to allow property access
        const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as JwtPayload & UserPayload;
        
        // ASSIGNMENT: Now works because id and email are optional in UserPayload
        req.user = {
            id: payload.sub, // sub is the user id
            email: payload.email,
            role: payload.role ?? "GUEST",
        };
    } catch (e) {
        // Verification failed (invalid token/secret)
    }
    next();
}