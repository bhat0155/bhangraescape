import type {Request, Response, NextFunction} from "express";

// pretend everyone is member untill I implement real auth.js

export function authSession(req: Request, res: Response, next: NextFunction){
    (req as any).user = (req as any).user ?? {id: "cmfvpy4vu0000os5ummr2xth7", role: "MEMBER"};
    next();
}

export function requiredRole(roles: Array<"MEMBER" | "ADMIN">){
    return function(req: Request, res: Response, next: NextFunction){
        const role = (req as any).user?.role;
        if(!role || !roles.includes(role)){
            return res.status(403).json({error: "Forbidden, insufficient role"} )
        }
        next();
    }
}