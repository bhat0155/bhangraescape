import jwt, { JwtPayload } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

// The definition of UserPayload must be compatible with the assignment.
interface UserPayload {
  id?: string;
  email?: string;
  role: "ADMIN" | "MEMBER" | "GUEST";
}

// Augment the Express Request type globally
declare global {
  namespace Express {
    // FIX: Redefine Request to match the environment's strict type checking
    interface Request {
      user?: UserPayload;
    }
  }
}

export function bearerAuth(req: Request, _res: Response, next: NextFunction) {
    const header = req.headers.authorization ?? "";
    const [, token] = header.split(" "); 
    
    if (!token) return next();

     try {
        // FIX: Assert the payload type strictly when verifying
        const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as JwtPayload;
        
        // FIX: Assign payload properties using type assertion to handle 'string | undefined' to 'string' mismatch
        (req as any).user = {
            // Use 'as string' to force the type, or 'payload.sub ?? undefined' for strictness
            id: payload.sub as string | undefined, 
            email: payload.email as string | undefined,
            role: (payload as any).role ?? "GUEST",
        };
    } catch (e) {
        // Verification failed
    }
    next();
}