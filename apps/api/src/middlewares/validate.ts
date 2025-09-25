import {ZodObject, ZodError} from "zod";
import type {Request, Response, NextFunction} from "express";

// takes zod schema, returns middleware

export const validate = (req: Request, res: Response, next: NextFunction, schema: ZodObject<any>)=>{
    try{
       const parse = schema.parse({
            body: req.body ?? {},
            query: req.query ?? {},
            params: req.params??{}
        });
        (req as any).validated = parse; // attach validated data to req
        next();

    }catch(err){
        if(err instanceof ZodError){
            return res.status(422).json({
                error: "Validation Error",
                details: err.flatten()
            })
        }
        next(err); // pass to general error handler
    }
}
