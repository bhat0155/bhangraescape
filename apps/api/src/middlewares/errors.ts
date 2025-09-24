import type { ErrorRequestHandler}from "express";
import { ZodError } from "zod";

// this file is centralised error handling middleware for express
// zod validation errors will throw 422.
// can make custom errors as well

export const errorHandler: ErrorRequestHandler = (err,req,res,next)=>{
    if(err instanceof ZodError){
        return res.status(422).json({
            error: "Validation Error",
            details: err.flatten()
        })
    }

    const status = err.status || 500;
    const payload: {error: string; stack?: string} = {
        error: err.message || "Internal Server Error"
    }
    // hides stack trace in production
    if (process.env.NODE_ENV !== "production") {
  payload.stack = (err as any)?.stack;
}

return res.status(status).json(payload);
    
}