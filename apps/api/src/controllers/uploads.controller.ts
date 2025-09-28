import type { Request, Response, NextFunction } from "express";
import { presignUpload } from "../services/uploads.service";

export async function presigned(req: Request, res: Response, next: NextFunction){
    try{
        const user = (req as any).user;
        if(!user.id){
           return res.status(401).json("Please sign in to upload")
        }

        const {prefix = "avatars", contentType, ext} = req.body || {};
        if (!contentType) return res.status(422).json({ error: "contentType required" });
        const data = await presignUpload({
            prefix,
            contentType,
            ext,
            userId: user.id
        })
    res.json(data);

    }catch(err){
        next(err)
    }
}